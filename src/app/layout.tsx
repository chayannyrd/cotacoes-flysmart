import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Software - Gerador de Cotações — Flysmart",
  description: "Sistema interno de geração de cotações de voo em PDF",
  icons: {
    icon: "/logos/logo-flysmart-azulescuro.png",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="pt-BR" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
