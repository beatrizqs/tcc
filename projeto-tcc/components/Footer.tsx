"use client";

import Link from "next/link";
import { Gear } from "phosphor-react";

export default function Footer() {
  return (
    <footer className="fixed bottom-0 w-full pt-[1.5px] bg-linear-to-r from-blue to-purple hidden md:flex">
      <div className="relative w-full px-6 py-3 flex items-center bg-white">
        <Link href="/configuracoes">
          <Gear size={32} weight="fill" className="text-blue" />
        </Link>

        <span className="absolute left-1/2 -translate-x-1/2 text-base font-semibold text-blue font-title">
          Lorem Ipsum
        </span>

        <span className="ml-auto text-sm text-blue font-subtitle">
          © {new Date().getFullYear()} Beatriz Schmitt
        </span>
      </div>
    </footer>
  );
}
