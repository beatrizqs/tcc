export default function Footer() {
  return (
    <footer className="w-full pt-[1.5px] bg-linear-to-r from-blue-strong to-purple-strong">
      <div className="w-full px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-2 bg-white">
        <span className="text-sm text-slate-500">
          © {new Date().getFullYear()} Beatriz Schmitt
        </span>

        <span className="text-sm text-slate-500">
          Desenvolvido por Beatriz Schmitt
        </span>
      </div>
    </footer>
  );
}
