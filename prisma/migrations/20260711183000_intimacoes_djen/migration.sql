-- CreateTable
CREATE TABLE "intimacoes" (
    "id" TEXT NOT NULL,
    "djen_id" TEXT NOT NULL,
    "numero_processo" TEXT NOT NULL,
    "tribunal" TEXT,
    "tipo" TEXT,
    "orgao" TEXT,
    "classe" TEXT,
    "resumo" TEXT,
    "data_disponibilizacao" TEXT,
    "oab" TEXT,
    "uf" TEXT,
    "criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "intimacoes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "intimacoes_djen_id_key" ON "intimacoes"("djen_id");

-- CreateIndex
CREATE INDEX "intimacoes_numero_processo_idx" ON "intimacoes"("numero_processo");

