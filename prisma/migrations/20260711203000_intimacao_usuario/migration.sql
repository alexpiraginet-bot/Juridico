-- AlterTable
ALTER TABLE "intimacoes" ADD COLUMN     "usuario_id" TEXT;

-- CreateIndex
CREATE INDEX "intimacoes_usuario_id_idx" ON "intimacoes"("usuario_id");

-- AddForeignKey
ALTER TABLE "intimacoes" ADD CONSTRAINT "intimacoes_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;

