import type { NextConfig } from "next";

// Al publicar en GitHub Pages la web cuelga de /<repo>, no de la raíz.
// NEXT_PUBLIC_BASE_PATH lo pone el workflow; en local no existe y todo sigue igual.
// Lleva NEXT_PUBLIC_ porque content.ts también la necesita para las imágenes y el vídeo.
const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

const nextConfig: NextConfig = {
  output: basePath ? "export" : "standalone",
  ...(basePath ? { basePath, trailingSlash: true } : {}),
};

export default nextConfig;
