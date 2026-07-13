-- CreateTable
CREATE TABLE "modelos_whatsapp" (
    "id" TEXT NOT NULL,
    "team_id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "idioma" TEXT NOT NULL DEFAULT 'pt_BR',
    "categoria" TEXT,
    "corpo" TEXT NOT NULL,
    "num_params" INTEGER NOT NULL DEFAULT 0,
    "criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "modelos_whatsapp_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "modelos_whatsapp_team_id_idx" ON "modelos_whatsapp"("team_id");

-- CreateIndex
CREATE UNIQUE INDEX "modelos_whatsapp_team_id_nome_idioma_key" ON "modelos_whatsapp"("team_id", "nome", "idioma");

-- AddForeignKey
ALTER TABLE "modelos_whatsapp" ADD CONSTRAINT "modelos_whatsapp_team_id_fkey" FOREIGN KEY ("team_id") REFERENCES "teams"("id") ON DELETE CASCADE ON UPDATE CASCADE;

