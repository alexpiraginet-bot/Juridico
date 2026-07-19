import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const schema = readFileSync(
  fileURLToPath(new URL("../prisma/schema.prisma", import.meta.url)),
  "utf8",
);

describe("contrato de isolamento multiescritório", () => {
  it("torna CPF/CNPJ e número CNJ únicos somente dentro do escritório", () => {
    expect(schema).toContain("@@unique([teamId, cpfCnpj])");
    expect(schema).toContain("@@unique([teamId, numero])");
    expect(schema).not.toMatch(/cpfCnpj\s+String\s+@unique/);
    expect(schema).not.toMatch(/numero\s+String\s+@unique/);
  });

  it("amarra cliente, processo e prazo ao mesmo tenant no banco", () => {
    expect(schema).toContain(
      "@relation(fields: [clienteId, teamId], references: [id, teamId])",
    );
    expect(schema).toContain(
      "@relation(fields: [processoId, teamId], references: [id, teamId], onDelete: Cascade)",
    );
  });

  it("modela destinatários N:N para publicações DJEN", () => {
    expect(schema).toContain("model DestinatarioIntimacao");
    expect(schema).toContain("@@unique([intimacaoId, usuarioId])");
  });
});
