export default function MainPageTitle({
  title,
  subtitle,
}: {
  title: string;
  subtitle?: string;
}) {
  return (
    <div className="flex flex-col my-5 md:my-7 gap-1 md:gap-3 md:my-8 2xl:my-10">
      <h1 className="text-blue font-title font-bold text-2xl md:text-4xl w-full text-center">
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
