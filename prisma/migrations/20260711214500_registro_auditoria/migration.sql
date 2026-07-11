-- CreateTable
CREATE TABLE "registros_auditoria" (
    "id" TEXT NOT NULL,
    "usuario_id" TEXT,
    "usuario_nome" TEXT NOT NULL,
    "team_id" TEXT,
    "acao" TEXT NOT NULL,
    "detalhe" TEXT,
    "criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "registros_auditoria_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "registros_auditoria_team_id_criado_em_idx" ON "registros_auditoria"("team_id", "criado_em");

-- CreateIndex
CREATE INDEX "registros_auditoria_usuario_id_idx" ON "registros_auditoria"("usuario_id");

-- AddForeignKey
ALTER TABLE "registros_auditoria" ADD CONSTRAINT "registros_auditoria_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "registros_auditoria" ADD CONSTRAINT "registros_auditoria_team_id_fkey" FOREIGN KEY ("team_id") REFERENCES "teams"("id") ON DELETE CASCADE ON UPDATE CASCADE;

