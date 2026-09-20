import type { Metadata } from "next";
import "./globals.css";

const TITLE = "TEXTOneitor — Textos que no huelan a IA";
const DESCRIPTION =
  "Le das un texto y te dice qué suena a máquina y por qué. Sin IA por dentro y sin salir a internet.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
