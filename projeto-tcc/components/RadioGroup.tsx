import { FormControl, Radio, RadioGroup } from "@mui/material";

export type Options = {
  value: string | number;
  label: string;
  image?: React.ReactNode;
};

export default function RadioComponent({
  type,
  value,
  onChange,
  options,
  error,
  orientation = "row",
}: {
  type: "text" | "image";
  value: string | number;
  onChange: (value: string | number) => void;
  options: Options[];
  error?: string;
  orientation?: "row" | "column";
}) {
  return (
    <FormControl className="w-full min-w-0">
      <RadioGroup
        row={orientation === "row"}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`flex w-full ${
          orientation === "column" ? "flex-col items-start gap-2" : "flex-row gap-8"
        }`}
      >
        {options.map((option) => {
          const selected = value === option.value;

          return (
            <div
              key={option.value}
              className={`flex ${
                type == "image" ? "flex-col" : "flex-row flex-row-reverse"
              } items-center `}
              onClick={() => onChange(option.value)}
            >
              {type === "image" && option.image && (
                <div
                  className={`
                    cursor-pointer transition-all
                    ${selected ? "ring-2 ring-blue" : ""}
                  `}
                >
                  {option.image}
                </div>
              )}

              {type === "text" && (
                <span className="font-common">{option.label}</span>
              )}

              <Radio
                value={option.value}
                checked={selected}
                size="small"
                sx={{
                  padding: 0.5,

                  color: "black",

                  "& .MuiSvgIcon-root": {
                    fontSize: 18,
                  },

                  "&.Mui-checked": {
                    color: "var(--color-blue)",
                  },
                }}
              />
            </div>
          );
        })}
      </RadioGroup>
      {error && (
        <p className="text-red-500 font-common text-xs mt-1 break-words w-full min-w-0">
          {error}
        </p>
      )}
    </FormControl>
  );
}
