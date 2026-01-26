import Image from "next/image";
import Link from "next/link";

export default function FeatureCard({
  name,
  imgPath,
  alt,
  href
}: {
  name: string;
  imgPath: string;
  alt: string;
  href: string
}) {
  return (
    <Link href={href} className="flex flex-col gap-2 group cursor-pointer">
      <div className="rounded-md w-64 h-32  sm:h-38 overflow-hidden relative group-hover:border-blue group-hover:border-3 transition-all duration-200 ease-out">
        <Image
          src={imgPath}
          alt={alt}
          className="object-cover "
          fill
        />
      </div>
      <p className="font-common text-base font-medium group-hover:text-blue transition-colors">{name}</p>
    </Link>
  );
}
