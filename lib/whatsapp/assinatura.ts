import { createHmac, timingSafeEqual } from "node:crypto";

export function assinaturaWhatsappConfere(
  corpo: string,
  cabecalho: string | null,
  segredo: string | undefined = process.env.WHATSAPP_APP_SECRET,
): boolean {
  if (!segredo || !cabecalho) return false;
  const esperada = `sha256=${createHmac("sha256", segredo).update(corpo).digest("hex")}`;
  const recebida = Buffer.from(cabecalho);
  const calculada = Buffer.from(esperada);
  return recebida.length === calculada.length && timingSafeEqual(recebida, calculada);
}

export function assinaturaWhatsappObrigatoria(): boolean {
  if (process.env.WHATSAPP_APP_SECRET) return true;
  return !(
    process.env.NODE_ENV !== "production" &&
    process.env.WHATSAPP_PERMITIR_SEM_ASSINATURA === "true"
  );
}
