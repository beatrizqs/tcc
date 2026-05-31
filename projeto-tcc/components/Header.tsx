"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { SlidersHorizontal } from "phosphor-react";

export default function Header() {
  const pathname = usePathname();

  return (
    <header className="fixed top-0 w-full shadow-md bg-linear-to-r from-blue to-purple hidden md:block z-100">
      <div className="mx-auto px-6 py-3 flex items-center justify-between">
        <Link
          href="/"
          className="text-base font-semibold text-white font-title"
        >
          Insight
        </Link>

        <nav className="flex items-center gap-6 font-common font-light">
          <Link
            href="/number-bases/params"
            className={`text-xs text-white hover:underline underline-offset-6 transform ${
              pathname.includes("/number-bases") && "underline"
            }`}
          >
            Bases numéricas
          </Link>

          <Link
            href="/binary-arithmetic/params"
            className={`text-xs text-white hover:underline underline-offset-6 transform ${
              pathname.includes("/binary-arithmetic") && "underline"
            }`}
          >
            Aritmética binária
          </Link>

          <Link
            href="/image-compression/params"
            className={`text-xs text-white hover:underline underline-offset-6 transform ${
              pathname.includes("/image-compression") && "underline"
            }`}
          >
            Compressão de imagens
          </Link>

          <Link
            href="/cryptography/params"
            className={`text-xs text-white hover:underline underline-offset-6 transform ${
              pathname.includes("/cryptography") && "underline"
            }`}
          >
            Criptografia
          </Link>

          <Link href="/settings">
            <SlidersHorizontal
              size={20}
              weight="fill"
              className="text-white ml-6"
            />
          </Link>
        </nav>
      </div>
    </header>
  );
}
