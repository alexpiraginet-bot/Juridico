/*
 * Modelo de domínio do Juridico.
 *
 * Nesta Fase 1 os dados vivem em memória (lib/dados.ts).
 * Na Fase 2, estas mesmas interfaces viram tabelas do banco de dados —
 * por isso vale a pena caprichar nelas desde já.
 */

export type AreaDireito =
  | "Cível"
  | "Trabalhista"
  | "Tributário"
  | "Família"
  | "Criminal";

export type StatusProcesso = "ativo" | "suspenso" | "arquivado" | "encerrado";

export interface Cliente {
  id: string;
  nome: string;
  cpfCnpj: string;
  email: string;
  telefone: string;
  cidade: string;
}

export interface Processo {
  id: string;
  /** Numeração única do CNJ: NNNNNNN-DD.AAAA.J.TR.OOOO */
  numero: string;
  titulo: string;
  clienteId: string;
  area: AreaDireito;
  vara: string;
  status: StatusProcesso;
  /** Valor da causa em reais (0 quando não se aplica) */
  valorCausa: number;
  /** Data de abertura no formato ISO (AAAA-MM-DD) */
  aberturaEm: string;
}

export interface Prazo {
  id: string;
  processoId: string;
  descricao: string;
  /** Data-limite no formato ISO (AAAA-MM-DD) */
  data: string;
  concluido: boolean;
}
