import { useSettings } from "@/contexts/SettingsContext";

export default function TextualExplanation({
  explanation,
}: {
  explanation: string;
}) {
  const { language } = useSettings();

  const titles = {
    pt: { explanation: "Explicação" },
    en: { explanation: "Explanation" },
    es: { explanation: "Explicación" },
  };

  const title = titles[language].explanation;
  return (
    <div className="p-3 rounded-md border">
      <div className="flex flex-col gap-2 overflow-y-auto max-h-24 pr-1">
        <h2 className="font-title text-blue text-base">{title}</h2>
        <p className="font-common text-sm text-justify pb-2">{explanation}</p>
      </div>
    </div>
  );
}
