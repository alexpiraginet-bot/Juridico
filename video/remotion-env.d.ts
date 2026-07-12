// Permite importar as capturas de tela (.png) como URL dentro do Remotion.
declare module "*.png" {
  const src: string;
  export default src;
}
