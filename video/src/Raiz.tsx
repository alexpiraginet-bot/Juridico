// Lista as composições disponíveis. Temos uma: o vídeo-demo interno do LexFlow.
import { Composition } from "remotion";
import { VideoDemo, DURACAO_TOTAL, FPS } from "./VideoDemo";

export const Raiz: React.FC = () => {
  return (
    <Composition
      id="LexFlowDemo"
      component={VideoDemo}
      durationInFrames={DURACAO_TOTAL}
      fps={FPS}
      width={1920}
      height={1080}
    />
  );
};
