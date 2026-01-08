export default function PageTitle({ title }: { title: string }) {
  return (
    <h1 className="my-5 md:my-10 text-blue-strong font-title font-bold text-lg md:text-4xl w-full text-center">
      {title}
    </h1>
  );
}
