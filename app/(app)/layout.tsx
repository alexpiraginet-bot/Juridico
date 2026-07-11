import { BarraLateral } from "@/components/BarraLateral";
import { BarraSuperior } from "@/components/BarraSuperior";
import { exigirUsuario } from "@/lib/auth";

/*
 * Layout de tudo que exige login. `exigirUsuario()` roda uma vez aqui e
 * protege o app inteiro — quem não estiver logado vai para /entrar. A tela
 * de login mora fora deste grupo, por isso não tem barra lateral.
 */
export default async function LayoutApp({ children }: { children: React.ReactNode }) {
  const usuario = await exigirUsuario();

  return (
    <div className="flex h-screen overflow-hidden">
      <BarraLateral papel={usuario.papel} nome={usuario.nome} subtitulo={usuario.team?.nome ?? "Plataforma"} />
      <div className="flex min-w-0 flex-1 flex-col">
        <BarraSuperior nome={usuario.nome} teamNome={usuario.team?.nome ?? null} teamLogo={usuario.team?.logoUrl ?? null} />
        <main className="flex-1 overflow-y-auto p-5 md:p-6">{children}</main>
      </div>
    </div>
  );
}
