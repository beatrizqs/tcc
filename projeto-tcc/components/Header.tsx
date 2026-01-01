"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Header() {
  const pathname = usePathname();
  return (
    <header className="w-full shadow-md bg-linear-to-r from-blue-strong to-purple-strong">
      <div className="mx-auto max-w-7xl px-6 py-4 flex items-center justify-between">
        <Link href="/" className="text-lg font-semibold text-white font-title">
          Lorem Ipsum
        </Link>

        <nav className="flex items-center gap-6 font-common font-light">
          <Link
            href="/bases-numericas"
            className={`text-sm text-white hover:underline underline-offset-6 transform ${
              pathname === "/bases-numericas" && "underline"
            }`}
          >
            Bases numéricas
          </Link>

          <Link
            href="/aritmetica-binaria"
            className={`text-sm text-white hover:underline underline-offset-6 transform ${
              pathname === "/aritmetica-binaria" && "underline"
            }`}
          >
            Aritmética binária
          </Link>

          <Link
            href="/compressao-imagens"
            className={`text-sm text-white hover:underline underline-offset-6 transform ${
              pathname === "/compressao-imagens" && "underline"
            }`}
          >
            Compressão de imagens
          </Link>

          <Link
            href="/criptografia"
            className={`text-sm text-white hover:underline underline-offset-6 transform ${
              pathname === "/criptografia" && "underline"
            }`}
          >
            Criptografia
          </Link>
        </nav>
      </div>
    </header>
  );
}
