"use client";

import { useSettings } from "@/contexts/SettingsContext";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Gear, List, X } from "phosphor-react";
import { useState } from "react";

function HeaderDesktop() {
  const pathname = usePathname();

  const { language } = useSettings();

  const translations = {
    pt: {
      title: "Lorem Ipsum",
      numericalBases: "Bases numéricas",
      binaryArithmetic: "Aritmética binária",
      imageCompression: "Compressão de imagens",
      cryptography: "Criptografia",
    },
    en: {
      title: "Lorem Ipsum",
      numericalBases: "Numerical bases",
      binaryArithmetic: "Binary arithmetic",
      imageCompression: "Image compression",
      cryptography: "Cryptography",
    },
    es: {
      title: "Lorem Ipsum",
      numericalBases: "Bases numéricas",
      binaryArithmetic: "Aritmética binaria",
      imageCompression: "Compresión de imágenes",
      cryptography: "Criptografía",
    },
  } as const;

  const titulo = translations[language].title;
  const basesNumericas = translations[language].numericalBases;
  const aritmeticaBinaria = translations[language].binaryArithmetic;
  const compressaoImagens = translations[language].imageCompression;
  const criptografia = translations[language].cryptography;

  return (
    <header className="fixed w-full shadow-md bg-linear-to-r from-blue to-purple hidden md:block z-100">
      <div className="mx-auto max-w-7xl px-6 py-4 flex items-center justify-between">
        <Link href="/" className="text-lg font-semibold text-white font-title">
          {titulo}
        </Link>

        <nav className="flex items-center gap-6 font-common font-light">
          <Link
            href="/bases-numericas"
            className={`text-sm text-white hover:underline underline-offset-6 transform ${
              pathname === "/bases-numericas" && "underline"
            }`}
          >
            {basesNumericas}
          </Link>

          <Link
            href="/aritmetica-binaria"
            className={`text-sm text-white hover:underline underline-offset-6 transform ${
              pathname === "/aritmetica-binaria" && "underline"
            }`}
          >
            {aritmeticaBinaria}
          </Link>

          <Link
            href="/compressao-imagens"
            className={`text-sm text-white hover:underline underline-offset-6 transform ${
              pathname === "/compressao-imagens" && "underline"
            }`}
          >
            {compressaoImagens}
          </Link>

          <Link
            href="/criptografia"
            className={`text-sm text-white hover:underline underline-offset-6 transform ${
              pathname === "/criptografia" && "underline"
            }`}
          >
            {criptografia}
          </Link>
        </nav>
      </div>
    </header>
  );
}

function HeaderMobile() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <div className="md:hidden flex flex-col fixed z-100">
      {/* Header */}
      <header className="fixed top-0 left-0 w-full h-12 shadow-md bg-linear-to-r from-blue to-purple z-50 flex items-center justify-between px-4">
        <Link href="/configuracoes">
          <Gear size={24} weight="fill" className="text-white" />
        </Link>

        <Link
          href="/"
          className="absolute left-1/2 -translate-x-1/2 text-base font-semibold text-white font-title"
        >
          Lorem Ipsum
        </Link>

        <button onClick={() => setOpen(true)} className="hover:cursor-pointer">
          <List size={24} className="text-white" />
        </button>
      </header>

      {/* Menu suspenso */}
      {open && (
        <div className="fixed top-12 left-0 w-full z-40">
          {/* Backdrop abaixo do header */}
          <div
            className="fixed top-12 left-0 w-full h-[calc(100vh-3rem)] bg-black/40"
            onClick={() => setOpen(false)}
          />

          {/* Menu */}
          <nav className="relative bg-white w-full py-6 px-4 flex flex-row justify-between gap-4 shadow-lg">
            <div className="flex flex-col gap-3 font-common">
              <Link
                href="/bases-numericas"
                onClick={() => setOpen(false)}
                className={`text-sm hover:underline underline-offset-6 transform ${
                  pathname === "/bases-numericas" && "underline"
                }`}
              >
                Bases numéricas
              </Link>

              <Link
                href="/aritmetica-binaria"
                onClick={() => setOpen(false)}
                className={`text-sm hover:underline underline-offset-6 transform ${
                  pathname === "/aritmetica-binaria" && "underline"
                }`}
              >
                Aritmética binária
              </Link>

              <Link
                href="/compressao-imagens"
                onClick={() => setOpen(false)}
                className={`text-sm hover:underline underline-offset-6 transform ${
                  pathname === "/compressao-imagens" && "underline"
                }`}
              >
                Compressão de imagens
              </Link>

              <Link
                href="/criptografia"
                onClick={() => setOpen(false)}
                className={`text-sm hover:underline underline-offset-6 transform ${
                  pathname === "/criptografia" && "underline"
                }`}
              >
                Criptografia
              </Link>
            </div>

            <button
              className="self-start hover:cursor-pointer"
              onClick={() => setOpen(false)}
            >
              <X size={18} />
            </button>
          </nav>
        </div>
      )}
    </div>
  );
}

export default function Header() {
  return (
    <>
      <HeaderDesktop />
      <HeaderMobile />
    </>
  );
}
