import Link from "next/link";

export default function Header() {
  return (
    <header className="w-full shadow-md bg-linear-to-r from-blue-strong to-purple-strong">
      <div className="mx-auto max-w-7xl px-6 py-4 flex items-center justify-between">
        <Link href="/" className="text-lg font-semibold text-white font-title">
          Lorem Ipsum
        </Link>

        <nav className="flex items-center gap-6 font-common font-light">
          <Link
            href="/bases-numericas"
            className="text-sm text-white hover:underline underline-offset-4 transform"
          >
            Bases numéricas
          </Link>

          <Link
            href="/aritmetica-binaria"
            className="text-sm text-white hover:underline underline-offset-4 transform"
          >
            Aritmética binária
          </Link>

          <Link
            href="/compressao-imagens"
            className="text-sm text-white hover:underline underline-offset-4 transform"
          >
            Compressão de imagens
          </Link>

          <Link
            href="/criptografia"
            className="text-sm text-white hover:underline underline-offset-4 transform"
          >
            Criptografia
          </Link>
        </nav>
      </div>
    </header>
  );
}
