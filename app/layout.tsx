import type { Metadata } from "next";
import localFont from "next/font/local";
import { Inter } from "next/font/google";
import "./globals.css";

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
      <body className={`${metrik.variable} ${inter.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
