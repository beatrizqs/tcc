export default function PageTitle({ title }: { title: string }) {
  return (
    <h1 className="my-5 md:my-7 text-blue font-title font-bold text-lg md:text-4xl w-full text-center">
      {title}
    </h1>
  );
}
