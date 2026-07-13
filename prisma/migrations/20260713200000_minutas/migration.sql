-- CreateEnum
CREATE TYPE "StatusMinuta" AS ENUM ('RASCUNHO_IA', 'EDITADA', 'APROVADA');

-- CreateTable
CREATE TABLE "minutas" (
    "id" TEXT NOT NULL,
    "team_id" TEXT NOT NULL,
    "processo_id" TEXT,
    "titulo" TEXT NOT NULL,
    "teor" TEXT NOT NULL,
    "teor_ia" TEXT NOT NULL,
    "status" "StatusMinuta" NOT NULL DEFAULT 'RASCUNHO_IA',
    "autor_nome" TEXT,
    "criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizado_em" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "minutas_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "minutas_team_id_atualizado_em_idx" ON "minutas"("team_id", "atualizado_em");

-- AddForeignKey
ALTER TABLE "minutas" ADD CONSTRAINT "minutas_team_id_fkey" FOREIGN KEY ("team_id") REFERENCES "teams"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "minutas" ADD CONSTRAINT "minutas_processo_id_fkey" FOREIGN KEY ("processo_id") REFERENCES "processos"("id") ON DELETE SET NULL ON UPDATE CASCADE;

