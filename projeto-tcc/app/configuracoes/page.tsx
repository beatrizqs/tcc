"use client";

import PageTitle from "@/components/PageTitle";
import {
  FormControl,
  FormControlLabel,
  Radio,
  RadioGroup,
  Slider,
} from "@mui/material";
import { useState } from "react";

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
      blue: "bg-blue-pastel",
      purple: "bg-purple-pastel",
      red: "bg-red-pastel",
      label: "Baixo",
    },
    medium: {
      blue: "bg-blue-light",
      purple: "bg-purple-light",
      red: "bg-red-light",
      label: "Médio",
    },
    high: {
      blue: "bg-blue-strong",
      purple: "bg-purple-strong",
      red: "bg-red-strong",
      label: "Alto",
    },
  }[contrast];

  return (
    <div className="flex flex-col gap-2 items-center">
      <div
        className={`
          cursor-pointer rounded-md border border-gray-300 size-30 md:size-50
          flex items-center justify-center
          transition-all duration-200 ease-out
          ${selected && "ring-2 ring-blue-strong"}
        `}
      >
        <div className="relative w:w-20 md:w-26 h-20 md:h-34">
          <div
            className={`${styles.blue} absolute top-0 left-2 z-10 rounded-lg size-10 md:size-16`}
          />
          <div
            className={`${styles.purple} absolute top-10 left-10 z-20 rounded-lg size-10 md:size-16`}
          />
          <div
            className={`${styles.red} absolute top-18 left-4 z-30 rounded-lg size-10 md:size-16`}
          />
        </div>
      </div>

      <p className="font-common text-sm">{styles.label}</p>
    </div>
  );
}

export default function Configuracoes() {
  const [contrast, setContrast] = useState<ContrastLevel>("medium");
  const [zoom, setZoom] = useState(100);

  return (
    <div className="flex flex-col items-center gap-10">
      <PageTitle title="Configurações" />

      {/* Zoom */}
      <div className="flex flex-col w-[80%] max-w-[700px] gap-2">
        <p className="font-common font-medium">Zoom</p>

        <Slider
          value={zoom}
          onChange={(_, value) => setZoom(value as number)}
          step={10}
          min={50}
          max={150}
          marks={[
            { value: 50, label: "50%" },
            { value: 100, label: "100%" },
            { value: 150, label: "150%" },
          ]}
          sx={{ color: "var(--color-blue-strong)" }}
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
              <div key={level} className="flex flex-col items-center gap-2">
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
                    color: "var(--color-blue-strong)",
                    "&.Mui-checked": {
                      color: "var(--color-blue-strong)",
                    },
                  }}
                />
              </div>
            ))}
          </RadioGroup>
        </FormControl>
      </div>
    </div>
  );
}
