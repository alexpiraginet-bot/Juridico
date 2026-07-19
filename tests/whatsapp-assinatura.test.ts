import { afterEach, describe, expect, it, vi } from "vitest";
import {
  assinaturaWhatsappConfere,
  assinaturaWhatsappObrigatoria,
} from "../lib/whatsapp/assinatura";

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("assinatura do webhook do WhatsApp", () => {
  it("aceita uma assinatura HMAC-SHA256 válida", () => {
    expect(
      assinaturaWhatsappConfere(
        '{"evento":"mensagem"}',
        "sha256=9a3dbd93dd828fe7076c99ff6c2a139986d6aa9ae13d4524c54597d6c067951b",
        "segredo-de-teste",
      ),
    ).toBe(true);
  });

  it("rejeita assinatura ausente ou adulterada", () => {
    expect(assinaturaWhatsappConfere("{}", null, "segredo")).toBe(false);
    expect(assinaturaWhatsappConfere("{}", "sha256=invalida", "segredo")).toBe(false);
    expect(assinaturaWhatsappConfere("{}", "sha256=00", undefined)).toBe(false);
  });

  it("falha fechada em produção quando o segredo não existe", () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("WHATSAPP_APP_SECRET", "");
    vi.stubEnv("WHATSAPP_PERMITIR_SEM_ASSINATURA", "true");
    expect(assinaturaWhatsappObrigatoria()).toBe(true);
  });

  it("permite modo aberto apenas quando explicitamente habilitado fora de produção", () => {
    vi.stubEnv("NODE_ENV", "test");
    vi.stubEnv("WHATSAPP_APP_SECRET", "");
    vi.stubEnv("WHATSAPP_PERMITIR_SEM_ASSINATURA", "true");
    expect(assinaturaWhatsappObrigatoria()).toBe(false);
  });
});
