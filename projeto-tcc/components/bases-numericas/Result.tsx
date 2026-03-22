import { Base } from "@/utils/bases";

type Value = {
  value: number;
  base: Base;
};

export default function Result({
  orientation,
  initialValue,
  finalValue,
  showResult = true,
  showDigit,
  refs // Referências do resultado final para animações
}: {
  orientation: "horizontal" | "vertical";
  initialValue: Value;
  finalValue: Value;
  showResult?: boolean,
  showDigit?: boolean[],
  refs?: React.RefObject<(HTMLSpanElement | null)[]>;
}) {
  const resultDigits = String(finalValue.value).split("");

  return (
    <div
      className={`flex items-center ${
        orientation === "horizontal" ? "flex-row" : "flex-col"
      }`}
    >
      {/* Valor inicial */}
      <div className="border-2 border-black rounded-lg p-5">
        <div className="flex flex-row">
          <p className="font-title font-bold text-black text-2xl place-self-start -mt-1">
            {initialValue.value}
          </p>
          <p className="font-title font-bold text-black text-base place-self-end -mb-1">
            {initialValue.base}
          </p>
        </div>
      </div>

      <div
        className={`bg-blue ${
          orientation === "horizontal"
            ? "h-[2px] w-12"
            : "w-[2px] h-12"
        }`}
      />

      {/* Valor final */}
      <div className="border-2 border-blue rounded-lg p-5">
        <div className={`flex flex-row ${!showResult && "opacity-0"}`}>
          {resultDigits.map((digit, i) => (
            <span
              key={i}
              ref={(el) => {
                if (refs && el) {
                  refs.current[i] = el;
                }
              }}
              className={`font-title font-bold text-blue text-2xl`}
            >
              {digit}
            </span>
          ))}
          <p className="font-title font-bold text-blue text-base place-self-end -mb-1">
            {finalValue.base}
          </p>
        </div>
      </div>
    </div>
  );
}
