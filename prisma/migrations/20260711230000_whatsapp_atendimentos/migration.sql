-- CreateEnum
CREATE TYPE "DirecaoMensagem" AS ENUM ('RECEBIDA', 'ENVIADA');

-- CreateTable
CREATE TABLE "conversas_whatsapp" (
    "id" TEXT NOT NULL,
    "telefone" TEXT NOT NULL,
    "nome_contato" TEXT,
    "phone_number_id" TEXT,
    "usuario_id" TEXT,
    "team_id" TEXT,
    "criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizado_em" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "conversas_whatsapp_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "mensagens_whatsapp" (
    "id" TEXT NOT NULL,
    "conversa_id" TEXT NOT NULL,
    "direcao" "DirecaoMensagem" NOT NULL,
    "texto" TEXT NOT NULL,
    "wa_message_id" TEXT,
    "enviado_em" TIMESTAMP(3) NOT NULL,
    "criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "mensagens_whatsapp_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "conversas_whatsapp_team_id_idx" ON "conversas_whatsapp"("team_id");

-- CreateIndex
CREATE INDEX "conversas_whatsapp_usuario_id_idx" ON "conversas_whatsapp"("usuario_id");

-- CreateIndex
CREATE UNIQUE INDEX "conversas_whatsapp_telefone_phone_number_id_key" ON "conversas_whatsapp"("telefone", "phone_number_id");

-- CreateIndex
CREATE UNIQUE INDEX "mensagens_whatsapp_wa_message_id_key" ON "mensagens_whatsapp"("wa_message_id");

-- CreateIndex
CREATE INDEX "mensagens_whatsapp_conversa_id_idx" ON "mensagens_whatsapp"("conversa_id");

-- AddForeignKey
ALTER TABLE "conversas_whatsapp" ADD CONSTRAINT "conversas_whatsapp_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "conversas_whatsapp" ADD CONSTRAINT "conversas_whatsapp_team_id_fkey" FOREIGN KEY ("team_id") REFERENCES "teams"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mensagens_whatsapp" ADD CONSTRAINT "mensagens_whatsapp_conversa_id_fkey" FOREIGN KEY ("conversa_id") REFERENCES "conversas_whatsapp"("id") ON DELETE CASCADE ON UPDATE CASCADE;

