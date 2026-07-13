-- CreateEnum
CREATE TYPE "ColunaTarefa" AS ENUM ('A_FAZER', 'EM_ANDAMENTO', 'EM_REVISAO', 'CONCLUIDA');

-- CreateEnum
CREATE TYPE "PrioridadeTarefa" AS ENUM ('ALTA', 'MEDIA', 'BAIXA');

-- CreateTable
CREATE TABLE "tarefas" (
    "id" TEXT NOT NULL,
    "titulo" TEXT NOT NULL,
    "detalhe" TEXT,
    "coluna" "ColunaTarefa" NOT NULL DEFAULT 'A_FAZER',
    "prioridade" "PrioridadeTarefa",
    "ordem" INTEGER NOT NULL DEFAULT 0,
    "team_id" TEXT NOT NULL,
    "responsavel_id" TEXT,
    "processo_id" TEXT,
    "criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizado_em" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tarefas_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "tarefas_team_id_coluna_ordem_idx" ON "tarefas"("team_id", "coluna", "ordem");

-- AddForeignKey
ALTER TABLE "tarefas" ADD CONSTRAINT "tarefas_team_id_fkey" FOREIGN KEY ("team_id") REFERENCES "teams"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tarefas" ADD CONSTRAINT "tarefas_responsavel_id_fkey" FOREIGN KEY ("responsavel_id") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tarefas" ADD CONSTRAINT "tarefas_processo_id_fkey" FOREIGN KEY ("processo_id") REFERENCES "processos"("id") ON DELETE SET NULL ON UPDATE CASCADE;

