export default function TextualExplanation({
  explanation,
}: {
  explanation: string;
}) {
  return (
    <div className="p-3 rounded-md border">
      <div className="flex flex-col gap-2 overflow-y-auto max-h-24 pr-1">
        <h2 className="font-title text-blue text-base">Explicação</h2>
        <p className="font-common text-sm text-justify pb-2">{explanation}</p>
      </div>
    </div>
  );
}
