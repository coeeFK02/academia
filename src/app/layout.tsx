import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Academia",
  description: "Treinos de musculação: as séries de cada dia e a carga de cada exercício.",
  manifest: "/manifest.webmanifest",
  icons: { icon: "/icone.svg", apple: "/icone.svg" },
  // Instalado na tela de início, o app abre sem a barra do navegador.
  appleWebApp: { capable: true, title: "Academia", statusBarStyle: "black-translucent" },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  // A tela encosta na borda; o CSS usa env(safe-area-inset-*) onde precisa.
  viewportFit: "cover",
  themeColor: "#0e0f12",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
