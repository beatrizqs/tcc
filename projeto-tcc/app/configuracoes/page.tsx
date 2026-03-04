"use client";

import Button from "@/components/Button";
import MainPageTitle from "@/components/MainPageTitle";
import {
  FormControl,
  Radio,
  RadioGroup,
  Slider,
} from "@mui/material";
import { useSettings } from "@/contexts/SettingsContext";

type ContrastLevel = "low" | "medium" | "high";

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
  const { zoom, contrast, setZoom, setContrast, reset } =
    useSettings();

  return (
    <div className="flex flex-col items-center">
      <MainPageTitle title={"Configurações"} />

      <div className="flex flex-col gap-4 2xl:gap-12 w-full items-center">
        {/* Zoom */}
        <div className="flex flex-col w-[80%] max-w-[700px]">
          <p className="font-common font-medium">Zoom</p>

          <Slider
            value={zoom}
            onChange={(_, value) => setZoom(value as number)}
            valueLabelDisplay="auto"
            step={10}
            min={50}
            max={150}
            sx={{ color: "var(--color-blue)" }}
          />
        </div>

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
