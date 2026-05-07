import { ClerkProvider } from '@clerk/nextjs'
import { esES } from '@clerk/localizations' // Para que los textos de login estén en español
import "./globals.css";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider localization={esES}>
      <html>
        <body>{children}</body>
      </html>
    </ClerkProvider>
  );
}
