/*
 * Configuração da integração com o WhatsApp Business (Meta Cloud API).
 *
 * Tudo por variáveis de ambiente — segredo nunca no cliente:
 * - WHATSAPP_TOKEN            token de acesso da Graph API
 * - WHATSAPP_PHONE_NUMBER_ID  id do número de negócio (para ENVIAR)
 * - WHATSAPP_VERIFY_TOKEN     segredo do handshake do webhook (GET)
 * - WHATSAPP_APP_SECRET       segredo do app, valida a assinatura (POST)
 * - WHATSAPP_API_VERSION      versão da Graph API (opcional; padrão v21.0)
 *
 * Sem as chaves, o app segue em modo demonstração — nada quebra.
 */

export const VERSAO_API = process.env.WHATSAPP_API_VERSION ?? "v21.0";

/** Dá para ENVIAR mensagens? (precisa de token + id do número) */
export function whatsappConfigurado(): boolean {
  return Boolean(process.env.WHATSAPP_TOKEN && process.env.WHATSAPP_PHONE_NUMBER_ID);
}
