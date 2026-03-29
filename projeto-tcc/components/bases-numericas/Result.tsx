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
  numberOfVisibleDigits,
  refs, // Referências do resultado final para animações
}: {
  orientation: "row" | "column";
  initialValue: Value;
  finalValue: Value;
  showResult?: boolean;
  numberOfVisibleDigits?: number;
  refs?: React.RefObject<(HTMLSpanElement | null)[]>;
}) {
  const resultDigits = String(finalValue.value).split("");

  return (
    <div
      className={`flex items-center ${
        orientation === "row" ? "flex-row" : "flex-col"
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
          orientation === "row" ? "h-[2px] w-12" : "w-[2px] h-12"
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
              className={`font-title font-bold text-blue text-2xl ${
                numberOfVisibleDigits !== undefined &&
                i < resultDigits.length - numberOfVisibleDigits
                  ? "opacity-0"
                  : "opacity-100"
              }`}
            >
              {digit}
            </span>
          ))}
          <p
            className={`font-title font-bold text-blue text-base place-self-end -mb-1 ${
              numberOfVisibleDigits !== undefined &&
              numberOfVisibleDigits < resultDigits.length &&
              "opacity-0"
            }`}
          >
            {finalValue.base}
          </p>
        </div>
      </div>
    </div>
  );
}
