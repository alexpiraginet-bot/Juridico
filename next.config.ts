import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // A proposta comercial é um HTML estático em public/proposta.html (fora do
  // login, para enviar o link ao cliente). O rewrite dá a URL limpa /proposta.
  async rewrites() {
    return [{ source: "/proposta", destination: "/proposta.html" }];
  },
};

export default nextConfig;
