-- LexFlow: isolamento multiescritório e destinatários N:N do DJEN.
-- Estratégia expand/backfill/constraint: as colunas nascem opcionais, os
-- dados existentes são atribuídos com segurança e só então viram NOT NULL.

ALTER TABLE "clientes" ADD COLUMN "team_id" TEXT;
ALTER TABLE "processos" ADD COLUMN "team_id" TEXT;
ALTER TABLE "prazos" ADD COLUMN "team_id" TEXT;

DO $$
DECLARE
  equipe_destino TEXT;
  quantidade_equipes BIGINT;
BEGIN
  SELECT COUNT(*), MIN("id") INTO quantidade_equipes, equipe_destino FROM "teams";

  -- Com exatamente um escritório, os dados históricos inequivocamente são
  -- dele. Com zero ou vários, ficam em quarentena para revisão administrativa,
  -- sem serem expostos a qualquer usuário por engano.
  IF quantidade_equipes <> 1 THEN
    equipe_destino := 'legacy_team_quarantine';
    INSERT INTO "teams" ("id", "nome", "criado_em")
    VALUES (equipe_destino, 'Dados legados — revisão necessária', CURRENT_TIMESTAMP)
    ON CONFLICT ("id") DO NOTHING;
  END IF;

  UPDATE "clientes"
  SET "team_id" = equipe_destino
  WHERE "team_id" IS NULL;

  UPDATE "processos" AS p
  SET "team_id" = c."team_id"
  FROM "clientes" AS c
  WHERE p."cliente_id" = c."id" AND p."team_id" IS NULL;

  UPDATE "prazos" AS z
  SET "team_id" = p."team_id"
  FROM "processos" AS p
  WHERE z."processo_id" = p."id" AND z."team_id" IS NULL;
END $$;

ALTER TABLE "clientes" ALTER COLUMN "team_id" SET NOT NULL;
ALTER TABLE "processos" ALTER COLUMN "team_id" SET NOT NULL;
ALTER TABLE "prazos" ALTER COLUMN "team_id" SET NOT NULL;

DROP INDEX "clientes_cpf_cnpj_key";
DROP INDEX "processos_numero_key";
ALTER TABLE "processos" DROP CONSTRAINT "processos_cliente_id_fkey";
ALTER TABLE "prazos" DROP CONSTRAINT "prazos_processo_id_fkey";

CREATE UNIQUE INDEX "clientes_id_team_id_key" ON "clientes"("id", "team_id");
CREATE UNIQUE INDEX "clientes_team_id_cpf_cnpj_key" ON "clientes"("team_id", "cpf_cnpj");
CREATE INDEX "clientes_team_id_nome_idx" ON "clientes"("team_id", "nome");
CREATE UNIQUE INDEX "processos_id_team_id_key" ON "processos"("id", "team_id");
CREATE UNIQUE INDEX "processos_team_id_numero_key" ON "processos"("team_id", "numero");
CREATE INDEX "processos_team_id_area_idx" ON "processos"("team_id", "area");
CREATE INDEX "prazos_team_id_vencimento_idx" ON "prazos"("team_id", "vencimento");

ALTER TABLE "clientes"
  ADD CONSTRAINT "clientes_team_id_fkey"
  FOREIGN KEY ("team_id") REFERENCES "teams"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "processos"
  ADD CONSTRAINT "processos_team_id_fkey"
  FOREIGN KEY ("team_id") REFERENCES "teams"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "processos"
  ADD CONSTRAINT "processos_cliente_id_team_id_fkey"
  FOREIGN KEY ("cliente_id", "team_id") REFERENCES "clientes"("id", "team_id")
  ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "prazos"
  ADD CONSTRAINT "prazos_team_id_fkey"
  FOREIGN KEY ("team_id") REFERENCES "teams"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "prazos"
  ADD CONSTRAINT "prazos_processo_id_team_id_fkey"
  FOREIGN KEY ("processo_id", "team_id") REFERENCES "processos"("id", "team_id")
  ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "destinatarios_intimacao" (
  "id" TEXT NOT NULL,
  "intimacao_id" TEXT NOT NULL,
  "usuario_id" TEXT NOT NULL,
  "oab" TEXT,
  "uf" TEXT,
  "criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "destinatarios_intimacao_pkey" PRIMARY KEY ("id")
);

-- IDs determinísticos bastam para o backfill; novos vínculos usam CUID pelo
-- Prisma. Mantemos usuario_id legado por compatibilidade durante o rollout.
INSERT INTO "destinatarios_intimacao" (
  "id", "intimacao_id", "usuario_id", "oab", "uf", "criado_em"
)
SELECT
  'legacy_' || md5(i."id" || ':' || i."usuario_id"),
  i."id",
  i."usuario_id",
  i."oab",
  i."uf",
  i."criado_em"
FROM "intimacoes" AS i
WHERE i."usuario_id" IS NOT NULL
ON CONFLICT DO NOTHING;

CREATE UNIQUE INDEX "destinatarios_intimacao_intimacao_id_usuario_id_key"
  ON "destinatarios_intimacao"("intimacao_id", "usuario_id");
CREATE INDEX "destinatarios_intimacao_usuario_id_criado_em_idx"
  ON "destinatarios_intimacao"("usuario_id", "criado_em");
ALTER TABLE "destinatarios_intimacao"
  ADD CONSTRAINT "destinatarios_intimacao_intimacao_id_fkey"
  FOREIGN KEY ("intimacao_id") REFERENCES "intimacoes"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "destinatarios_intimacao"
  ADD CONSTRAINT "destinatarios_intimacao_usuario_id_fkey"
  FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Defesa em profundidade para instalações Supabase: o LexFlow usa somente o
-- backend Prisma (role proprietária/bypass RLS); anon/authenticated não ganham
-- acesso direto pelo Data API sem políticas explícitas.
ALTER TABLE "clientes" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "processos" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "prazos" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "intimacoes" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "destinatarios_intimacao" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "compartilhamentos_intimacao" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "teams" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "usuarios" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "sessoes" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "credenciais_oab" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "registros_auditoria" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "conversas_whatsapp" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "mensagens_whatsapp" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "modelos_whatsapp" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "tarefas" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "minutas" ENABLE ROW LEVEL SECURITY;
