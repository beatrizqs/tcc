"use client";

import ParamsPage, {
  Field,
  Mode,
  ValidationResult,
} from "@/components/ParamsPage";
import { TableRow } from "@/components/Table";
import {
  ColorIndex,
  Compression,
  COMPRESSION_ALGORITHM,
  COMPRESSION_ALGORITHM_LABELS,
  Design,
  IMG_DESIGN,
  IMG_DESIGN_LABELS,
  IMG_REPRESENTATION,
  IMG_REPRESENTATION_LABELS,
  PALETTE,
  Representation,
} from "@/utils/image-compression";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Options } from "@/components/RadioGroup";
import {
  imageSquares,
  imageStripes,
  imageLandscape,
  model,
} from "@/lib/models/image-compression";

export default function CompressaoImagens() {
  const router = useRouter();

  const [values, setValues] = useState<Record<string, number | string>>({}); // Custom values
  const [selectedModel, setSelectedModel] = useState<TableRow>(); // Pre-defined model

  const [mode, setMode] = useState<Mode>("preset");

  const getValues = () => {
    const source = mode === "preset" ? selectedModel : values;

    if (!source) return;

    return source;
  };

  const RenderImage = (design: Record<number, ColorIndex[]>) => {
    const values = getValues();
    const size: number = values && values.size ? Number(values.size) : 12;
    const grid = design[size];

    return (
      <div className="flex flex-col w-full">
        <div
          className={`grid`}
          style={{
            gridTemplateColumns: `repeat(${size}, minmax(0, 1fr))`,
          }}
        >
          {grid.map((value, index) => {
            const [r, g, b] = PALETTE[value];
            return (
              <div
                key={index}
                className={`${
                  size === 4 ? "size-6" : size === 8 ? "size-3" : "size-2"
                }`}
                style={{ backgroundColor: `rgb(${r}, ${g}, ${b})` }}
              />
            );
          })}
        </div>
      </div>
    );
  };

  const onSave = () => {
    const values = getValues();

    if (!values) return;

    let page;

    switch (values.algorithm) {
      case COMPRESSION_ALGORITHM.HUFFMAN:
        page = "huffman";
        break;
      case COMPRESSION_ALGORITHM.RLE:
        page = "rle";
        break;
      case COMPRESSION_ALGORITHM.LZW:
        page = "lzw";
        break;
      default:
        page = "";
        break;
    }

    router.push(
      `/image-compression/animations/${page}?size=${values.size}&representation=${values.representation}&design=${values.design}`
    );
  };

  const handleChange = (name: string, value: number | string) => {
    setValues((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  function validateFields(): ValidationResult {
    const errors: Record<string, string> = {};

    if (mode === "preset") {
      if (!selectedModel) {
        errors.model = "Selecione um modelo";
      }
    } else {
      // No empty fields allowed
      for (const field of fields) {
        if (!values[field.name]) {
          errors[field.name] = "Campo obrigatório";
        }
      }
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors,
    };
  }

  const optionsAlgorithms = [
    {
      label: COMPRESSION_ALGORITHM_LABELS[COMPRESSION_ALGORITHM.HUFFMAN],
      value: COMPRESSION_ALGORITHM.HUFFMAN,
    },
    {
      label: COMPRESSION_ALGORITHM_LABELS[COMPRESSION_ALGORITHM.RLE],
      value: COMPRESSION_ALGORITHM.RLE,
    },
    {
      label: COMPRESSION_ALGORITHM_LABELS[COMPRESSION_ALGORITHM.LZW],
      value: COMPRESSION_ALGORITHM.LZW,
    },
  ];

  const optionsSize = [
    {
      label: "4x4",
      value: "4",
    },
    {
      label: "8x8",
      value: "8",
    },
    {
      label: "12x12",
      value: "12",
    },
  ];

  const optionsRepresentation = [
    {
      label: IMG_REPRESENTATION_LABELS[IMG_REPRESENTATION.BLACK_AND_WHITE],
      value: IMG_REPRESENTATION.BLACK_AND_WHITE,
    },
    {
      label: IMG_REPRESENTATION_LABELS[IMG_REPRESENTATION.GRAYSCALE],
      value: IMG_REPRESENTATION.GRAYSCALE,
    },
    {
      label: IMG_REPRESENTATION_LABELS[IMG_REPRESENTATION.COLORS],
      value: IMG_REPRESENTATION.COLORS,
    },
  ];

  const optionsDesign: Options[] = [
    {
      value: IMG_DESIGN.LANDSCAPE,
      label: IMG_DESIGN_LABELS[IMG_DESIGN.LANDSCAPE],
      image: RenderImage(imageLandscape),
    },
    {
      value: IMG_DESIGN.STRIPES,
      label: IMG_DESIGN_LABELS[IMG_DESIGN.STRIPES],
      image: RenderImage(imageStripes),
    },
    {
      value: IMG_DESIGN.SQUARE,
      label: IMG_DESIGN_LABELS[IMG_DESIGN.SQUARE],
      image: RenderImage(imageSquares),
    },
  ];

  const fields: Field[] = [
    {
      type: "radio",
      name: "algorithm",
      label: "Algoritmo de compressão",
      options: optionsAlgorithms,
      orientation: "column",
    },
    {
      type: "radio",
      name: "size",
      label: "Tamanho da imagem",
      options: optionsSize,
      orientation: "column",
    },
    {
      type: "radio",
      name: "representation",
      label: "Representação da imagem",
      options: optionsRepresentation,
      orientation: "column",
    },
    {
      type: "imageRadio",
      name: "design",
      label: "Desenho",
      options: optionsDesign,
    },
  ];

  const table = {
    headers: [
      {
        key: "design",
        label: "Desenho",
        render: (value: string) => IMG_DESIGN_LABELS[value as Design],
      },
      {
        key: "size",
        label: "Tamanho",
        render: (value: string) => `${value}x${value}`,
      },
      {
        key: "algorithm",
        label: "Algoritmo",
        render: (value: string) =>
          COMPRESSION_ALGORITHM_LABELS[value as Compression],
      },
      {
        key: "representation",
        label: "Representação",
        render: (value: string) =>
          IMG_REPRESENTATION_LABELS[value as Representation],
      },
    ],
    data: model,
  };

  return (
    <div className="flex flex-col">
      <ParamsPage
        title="Compressão de Imagens"
        fields={fields}
        table={table}
        values={values}
        onChange={handleChange}
        selectedModel={selectedModel}
        onSelectModel={setSelectedModel}
        onSave={onSave}
        mode={mode}
        onModeChange={setMode}
        validateFields={validateFields}
      />
    </div>
  );
}
