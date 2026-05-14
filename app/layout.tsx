import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Kırmızı Tabela",
  description: "Eczane yönetme simülasyonu"
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr">
      <body>{children}</body>
    </html>
  );
}
