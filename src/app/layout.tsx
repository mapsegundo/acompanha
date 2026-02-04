import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL("https://acompanha.online"),
  title: {
    default: "Acompanha - Monitoramento Clínico",
    template: "%s | Acompanha"
  },
  description: "Plataforma de acompanhamento clínico e esportivo longitudinal para alta performance.",
  keywords: ["saúde", "performance", "monitoramento", "clínico", "esporte", "médico"],
  authors: [{ name: "Acompanha" }],
  creator: "Acompanha",
  icons: {
    icon: [
      { url: "/favicon.png", sizes: "32x32", type: "image/png" },
    ],
    apple: "/favicon.png",
  },
  openGraph: {
    type: "website",
    locale: "pt_BR",
    url: "https://acompanha.online",
    title: "Acompanha - Monitoramento Clínico",
    description: "Monitoramento longitudinal de indicadores de saúde e performance.",
    siteName: "Acompanha",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Acompanha Dashboard",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Acompanha - Monitoramento Clínico",
    description: "Monitoramento longitudinal de indicadores de saúde e performance.",
    images: ["/og-image.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body className={`${inter.className} antialiased min-h-screen bg-background text-foreground`}>
        {children}
        <Toaster />
      </body>
    </html>
  );
}
