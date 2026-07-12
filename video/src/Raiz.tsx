// Lista as composições disponíveis: o vídeo-demo (screenshots) e o filme animado.
import { Composition } from "remotion";
import { VideoDemo, DURACAO_TOTAL, FPS } from "./VideoDemo";
import { Filme, DURACAO_FILME } from "./Filme";

export const Raiz: React.FC = () => {
  return (
    <>
      <Composition
        id="LexFlowDemo"
        component={VideoDemo}
        durationInFrames={DURACAO_TOTAL}
        fps={FPS}
        width={1920}
        height={1080}
      />
      <Composition
        id="LexFlowFilme"
        component={Filme}
        durationInFrames={DURACAO_FILME}
        fps={FPS}
        width={1920}
        height={1080}
      />
    </>
  );
};
