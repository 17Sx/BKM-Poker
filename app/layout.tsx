import type { Metadata } from "next";
import localFont from "next/font/local";
import { Inter } from "next/font/google";
import "./globals.css";
import Providers from "./Providers";

const metrik = localFont({
  src: [
    {
      path: '../public/fonts/MetrikTrial-Regular.otf',
      weight: '400',
      style: 'normal',
    },
    {
      path: '../public/fonts/MetrikTrial-Bold.otf',
      weight: '700',
      style: 'normal',
    }
  ],
  variable: '--font-metrik'
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "BKM - Bankroll Management",
  description: "Professional poker bankroll management system",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body className={`${metrik.variable} ${inter.variable} antialiased bg-background text-foreground min-h-screen`}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
