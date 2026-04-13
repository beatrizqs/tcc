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
} from "@/utils/compressao-imagens";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Options } from "@/components/RadioGroup";
import {
  imageQuadrados,
  imageListras,
  imagePaisagem,
  model,
} from "@/lib/models/compressao-imagens";

export default function CompressaoImagens() {
  const router = useRouter();

  const [values, setValues] = useState<Record<string, number | string>>({}); // Valores customizados
  const [selectedModel, setSelectedModel] = useState<TableRow>(); // Modelo pré-definido

  const [mode, setMode] = useState<Mode>("preset");

  const getValues = () => {
    const source = mode === "preset" ? selectedModel : values;

    if (!source) return;

    return source;
  };

  const RenderImage = (design: Record<number, ColorIndex[]>) => {
    const values = getValues();
    const size: number = values && values.tamanho ? Number(values.tamanho) : 12;
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

    if (values.algoritmo === COMPRESSION_ALGORITHM.HUFFMAN) {
      router.push(
        `/compressao-imagens/funcionamento/huffman?tamanho=${values.tamanho}&representacao=${values.representacao}&desenho=${values.desenho}`
      );
    } else if (values.algoritmo === COMPRESSION_ALGORITHM.RLE) {
      router.push(
        `/compressao-imagens/funcionamento/rle?tamanho=${values.tamanho}&representacao=${values.representacao}&desenho=${values.desenho}`
      );
    } else if (values.algoritmo === COMPRESSION_ALGORITHM.LZW) {
      router.push(
        `/compressao-imagens/funcionamento/lzw?tamanho=${values.tamanho}&representacao=${values.representacao}&desenho=${values.desenho}`
      );
    }
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
      // Não permite campos vazios
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
      value: IMG_DESIGN.PAISAGEM,
      label: IMG_DESIGN_LABELS[IMG_DESIGN.PAISAGEM],
      image: RenderImage(imagePaisagem),
    },
    {
      value: IMG_DESIGN.LISTRAS,
      label: IMG_DESIGN_LABELS[IMG_DESIGN.LISTRAS],
      image: RenderImage(imageListras),
    },
    {
      value: IMG_DESIGN.QUADRADO,
      label: IMG_DESIGN_LABELS[IMG_DESIGN.QUADRADO],
      image: RenderImage(imageQuadrados),
    },
  ];

  const fields: Field[] = [
    {
      type: "radio",
      name: "algoritmo",
      label: "Algoritmo de compressão",
      options: optionsAlgorithms,
      orientation: "column",
    },
    {
      type: "radio",
      name: "tamanho",
      label: "Tamanho da imagem",
      options: optionsSize,
      orientation: "column",
    },
    {
      type: "radio",
      name: "representacao",
      label: "Representação da imagem",
      options: optionsRepresentation,
      orientation: "column",
    },
    {
      type: "imageRadio",
      name: "desenho",
      label: "Desenho",
      options: optionsDesign,
    },
  ];

  const table = {
    headers: [
      {
        key: "desenho",
        label: "Desenho",
        render: (value: string) =>
          IMG_DESIGN_LABELS[value as Design],
      },
      {
        key: "tamanho",
        label: "Tamanho",
        render: (value: string) => `${value}x${value}`,
      },
      {
        key: "algoritmo",
        label: "Algoritmo",
        render: (value: string) =>
          COMPRESSION_ALGORITHM_LABELS[value as Compression],
      },
      {
        key: "representacao",
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
