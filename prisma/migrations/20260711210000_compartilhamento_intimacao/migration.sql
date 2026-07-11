-- CreateTable
CREATE TABLE "compartilhamentos_intimacao" (
    "id" TEXT NOT NULL,
    "intimacao_id" TEXT NOT NULL,
    "usuario_id" TEXT NOT NULL,
    "criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "compartilhamentos_intimacao_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "compartilhamentos_intimacao_usuario_id_idx" ON "compartilhamentos_intimacao"("usuario_id");

-- CreateIndex
CREATE UNIQUE INDEX "compartilhamentos_intimacao_intimacao_id_usuario_id_key" ON "compartilhamentos_intimacao"("intimacao_id", "usuario_id");

-- AddForeignKey
ALTER TABLE "compartilhamentos_intimacao" ADD CONSTRAINT "compartilhamentos_intimacao_intimacao_id_fkey" FOREIGN KEY ("intimacao_id") REFERENCES "intimacoes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "compartilhamentos_intimacao" ADD CONSTRAINT "compartilhamentos_intimacao_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

