import type { Metadata } from "next";
import { Amaranth, Barlow } from "next/font/google";
import Header from "@/components/Header";
import "./globals.css";
import { SettingsProvider } from "@/contexts/SettingsContext";

const amaranth = Amaranth({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-amaranth",
});

const barlow = Barlow({
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700"],
  variable: "--font-barlow",
});

export const metadata: Metadata = {
  title: "Lorem Ipsum",
  description: "Trabalho de Conclusão de Curso de Beatriz de Quadros Schmitt, 2026",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body
        className={`
          min-h-screen
          ${amaranth.variable}
          ${barlow.variable}
        `}
      >
        <SettingsProvider>
          <Header />

          <main className="pt-14 pb-6 px-3 md:px-6 min-h-screen">
            {children}
          </main>

        </SettingsProvider>
      </body>
    </html>
  );
}
