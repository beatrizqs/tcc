import { FormControl, Radio, RadioGroup } from "@mui/material";

export type Options = {
  value: string;
  label: string;
  image?: React.ReactNode;
};

export default function RadioComponent({
  type,
  value,
  onChange,
  options,
}: {
  type: "text" | "image";
  value: string;
  onChange: (value: string) => void;
  options: Options[];
}) {
  return (
    <FormControl>
      <RadioGroup
        row
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="flex w-full gap-8"
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

                  color: "black", // cor quando não selecionado

                  "& .MuiSvgIcon-root": {
                    fontSize: 18, // tamanho do círculo (menor)
                  },

                  "&.Mui-checked": {
                    color: "var(--color-blue)", // azul só quando selecionado
                  },
                }}
              />
            </div>
          );
        })}
      </RadioGroup>
    </FormControl>
  );
}
