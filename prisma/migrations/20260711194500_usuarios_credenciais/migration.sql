-- CreateTable
CREATE TABLE "usuarios" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "cargo" TEXT,
    "criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "usuarios_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "credenciais_oab" (
    "id" TEXT NOT NULL,
    "numero" TEXT NOT NULL,
    "uf" TEXT NOT NULL,
    "nome_advogado" TEXT NOT NULL,
    "ativa" BOOLEAN NOT NULL DEFAULT true,
    "usuario_id" TEXT NOT NULL,
    "criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "credenciais_oab_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "usuarios_email_key" ON "usuarios"("email");

-- CreateIndex
CREATE UNIQUE INDEX "credenciais_oab_numero_uf_key" ON "credenciais_oab"("numero", "uf");

-- AddForeignKey
ALTER TABLE "credenciais_oab" ADD CONSTRAINT "credenciais_oab_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

