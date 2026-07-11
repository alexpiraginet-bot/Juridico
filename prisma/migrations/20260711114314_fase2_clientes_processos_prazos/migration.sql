-- CreateEnum
CREATE TYPE "AreaProcesso" AS ENUM ('TRABALHISTA', 'CIVEL', 'FAMILIA', 'TRIBUTARIO', 'CRIMINAL', 'CONSUMIDOR', 'OUTRA');

-- CreateEnum
CREATE TYPE "FaseProcesso" AS ENUM ('CONHECIMENTO', 'INSTRUCAO', 'SENTENCA', 'RECURSAL', 'EXECUCAO', 'ARQUIVADO');

-- CreateTable
CREATE TABLE "clientes" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "cpf_cnpj" TEXT NOT NULL,
    "email" TEXT,
    "telefone" TEXT,
    "cidade" TEXT,
    "criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "clientes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "processos" (
    "id" TEXT NOT NULL,
    "numero" TEXT NOT NULL,
    "titulo" TEXT NOT NULL,
    "area" "AreaProcesso" NOT NULL,
    "tribunal" TEXT,
    "fase" "FaseProcesso" NOT NULL DEFAULT 'CONHECIMENTO',
    "ultimo_evento" TEXT,
    "valor_causa" DECIMAL(14,2),
    "cliente_id" TEXT NOT NULL,
    "criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "processos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "prazos" (
    "id" TEXT NOT NULL,
    "descricao" TEXT NOT NULL,
    "vencimento" DATE NOT NULL,
    "responsavel" TEXT,
    "validado" BOOLEAN NOT NULL DEFAULT false,
    "concluido" BOOLEAN NOT NULL DEFAULT false,
    "processo_id" TEXT NOT NULL,
    "criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "prazos_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "clientes_cpf_cnpj_key" ON "clientes"("cpf_cnpj");

-- CreateIndex
CREATE UNIQUE INDEX "processos_numero_key" ON "processos"("numero");

-- AddForeignKey
ALTER TABLE "processos" ADD CONSTRAINT "processos_cliente_id_fkey" FOREIGN KEY ("cliente_id") REFERENCES "clientes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "prazos" ADD CONSTRAINT "prazos_processo_id_fkey" FOREIGN KEY ("processo_id") REFERENCES "processos"("id") ON DELETE CASCADE ON UPDATE CASCADE;
