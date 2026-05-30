"use client";

import Button from "@/components/Button";
import MainPageTitle from "@/components/MainPageTitle";
import { FormControl, Radio, RadioGroup } from "@mui/material";
import { ContrastLevel, useSettings } from "@/contexts/SettingsContext";

function ContrastCard({
  contrast,
  selected,
}: {
  contrast: ContrastLevel;
  selected: boolean;
}) {
  const styles = {
    low: {
      blue: "bg-preview-blue-pastel",
      purple: "bg-preview-purple-pastel",
      red: "bg-preview-red-pastel",
      label: "Baixo",
    },
    medium: {
      blue: "bg-blue",
      purple: "bg-purple",
      red: "bg-red",
      label: "Médio",
    },
    high: {
      blue: "bg-preview-blue-strong",
      purple: "bg-preview-purple-strong",
      red: "bg-preview-red-strong",
      label: "Alto",
    },
  }[contrast];

  return (
    <div className="flex flex-col gap-2 items-center">
      <div
        className={`
          cursor-pointer rounded-md border border-gray-300 h-35 w-50
          flex items-center justify-center
          transition-all duration-200 ease-out
          ${selected && "ring-2 ring-blue"}
        `}
      >
        <div className="relative w-22 h-27">
          <div
            className={`${styles.blue} absolute top-0 left-2 z-10 rounded-lg size-12`}
          />
          <div
            className={`${styles.purple} absolute top-8 left-10 z-20 rounded-lg size-12`}
          />
          <div
            className={`${styles.red} absolute top-15 left-5 z-30 rounded-lg size-12`}
          />
        </div>
      </div>

      <p className="font-common text-sm">{styles.label}</p>
    </div>
  );
}

export default function Configuracoes() {
  const { contrast, setContrast, reset } = useSettings();

  return (
    <div className="flex flex-col items-center">
      <MainPageTitle title={"Configurações"} />

      <div className="flex flex-col gap-12 2xl:gap-16 w-full items-center">
        

        {/* Contraste */}
        <div className="flex flex-col gap-3 w-[80%] max-w-[700px]">
          <p className="font-common font-medium">Contraste</p>

          <FormControl>
            <RadioGroup
              row
              value={contrast}
              onChange={(e) => setContrast(e.target.value as ContrastLevel)}
              className="flex flex-row justify-between w-full"
            >
              {(["low", "medium", "high"] as ContrastLevel[]).map((level) => (
                <div key={level} className="flex flex-col items-center">
                  <div onClick={() => setContrast(level)}>
                    <ContrastCard
                      contrast={level}
                      selected={contrast === level}
                    />
                  </div>

                  <Radio
                    value={level}
                    checked={contrast === level}
                    sx={{
                      padding: 0.5,
                      color: "var(--color-blue)",
                      "&.Mui-checked": {
                        color: "var(--color-blue)",
                      },
                    }}
                  />
                </div>
              ))}
            </RadioGroup>
          </FormControl>
        </div>

        <Button text="Redefinir" onClick={reset} />
      </div>
    </div>
  );
}
