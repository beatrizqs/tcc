export default function MainPageTitle({
  title,
  subtitle,
  noMargin = false,
  className = "",
  sm = false
}: {
  title: string;
  subtitle?: string;
  noMargin?: boolean;
  className?: string;
  sm?: boolean
}) {
  return (
    <div className={`flex flex-col gap-1 md:gap-3 ${!noMargin && "my-5 md:my-7 md:my-8 2xl:my-10" } ${className}`}>
      <h1 className={`text-blue font-title font-bold w-full text-center ${sm ? "text-xl md:text-3xl" : "text-2xl md:text-4xl"}`}>
        {title}
      </h1>
      <p
        className={`font-common text-base md:text-xl w-full text-center ${
          subtitle || "hidden"
        }`}
      >
        {subtitle}
      </p>
    </div>
  );
}
