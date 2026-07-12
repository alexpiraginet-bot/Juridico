-- AlterTable
ALTER TABLE "teams" ADD COLUMN     "whatsapp_phone_number_id" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "teams_whatsapp_phone_number_id_key" ON "teams"("whatsapp_phone_number_id");

