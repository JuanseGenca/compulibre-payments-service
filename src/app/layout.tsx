import { ClerkProvider } from '@clerk/nextjs'
import { esES } from '@clerk/localizations'
import type { Metadata } from "next"; // Para que los textos de login estén en español
import "./globals.css";

export const metadata: Metadata = {
  title: "CompuLibre Payments", // El nombre de tu app
  description: "Módulo central de pagos y gestión financiera para el ecosistema del marketplace CompuLibre.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider localization={esES}>
      <html lang="es">
        <body>{children}</body>
      </html>
    </ClerkProvider>
  );
}
