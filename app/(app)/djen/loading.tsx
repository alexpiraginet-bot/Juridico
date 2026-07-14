import { EsqueletoPagina } from "@/components/Esqueleto";

// A busca no DJEN/CNJ pode fazer várias páginas de consulta; o esqueleto
// aparece na hora enquanto isso roda.
export default function Carregando() {
  return <EsqueletoPagina titulo="40%" cartoes={4} />;
}
