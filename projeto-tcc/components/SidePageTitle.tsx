import Link from "next/link";
import { CaretLeft } from "phosphor-react";

export default function SidePageTitle({
  title,
  href,
}: {
  title: string;
  href?: string;
}) {
  return (
    <Link
      href={href ?? "/"}
      className="flex flex-row my-3 gap-3 md:my-5 2xl:my-8 items-center"
    >
      <CaretLeft size={24} />
      <h1 className="text-blue font-title font-bold text-xl md:text-2xl w-full">
        {title}
      </h1>
    </Link>
  );
}
