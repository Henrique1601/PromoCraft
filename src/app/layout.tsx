import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://promocraft.netlify.app";

export const metadata: Metadata = {
  metadataBase: new URL(APP_URL),
  title: {
    default: "PromoCraft | As Melhores Promoções e Menores Preços de Jogos de PC",
    template: "%s | PromoCraft",
  },
  description: "Compare preços de jogos em tempo real entre Steam, Green Man Gaming, Nuuvem, GOG, Epic Games e Fanatical. Alertas de desconto, conversão BRL e histórico de menor preço.",
  keywords: [
    "promoções jogos pc",
    "menor preço steam",
    "comparador jogos",
    "descontos pc",
    "nuuvem",
    "epic games",
    "gog",
    "green man gaming",
    "steam deck jogos",
    "promocraft"
  ],
  authors: [{ name: "Henrique Bezerra Dos Santos" }],
  manifest: "/manifest.json",
  icons: {
    icon: "/logo-mark.png",
    apple: "/logo-mark.png",
  },
  openGraph: {
    title: "PromoCraft | Agregador & Comparador de Promoções de Jogos PC",
    description: "Compare preços em tempo real em mais de 30 lojas digitais autorizadas. Conversão em Reais e histórico do menor preço já registrado.",
    url: APP_URL,
    siteName: "PromoCraft",
    images: [
      {
        url: "/logo.png",
        width: 1200,
        height: 630,
        alt: "PromoCraft Preview",
      },
    ],
    locale: "pt_BR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "PromoCraft | Promoções de Jogos para PC em Tempo Real",
    description: "Compare ofertas entre Steam, Nuuvem, Epic e GMG com menor preço histórico e conversão BRL.",
    images: ["/logo.png"],
  },
};

export const viewport: Viewport = {
  themeColor: "#10b981",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="pt-BR"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased dark`}
    >
      <body className="min-h-full flex flex-col bg-zinc-950 text-zinc-100 selection:bg-emerald-500 selection:text-black">
        {children}
      </body>
    </html>
  );
}
