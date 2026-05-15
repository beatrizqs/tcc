"use client";

import ParamsPage, { Field, Mode, ValidationResult } from "@/components/ParamsPage";
import { TableRow } from "@/components/Table";
import { model } from "@/lib/models/number-bases";
import { Base, BASE_LABELS, BASES, isBinary } from "@/utils/bases";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function BasesNumericas() {
  const router = useRouter();

  const [values, setValues] = useState<Record<string, number | string>>({}); // Custom values
  const [selectedModel, setSelectedModel] = useState<TableRow>(); // Pre-defined model

  const [mode, setMode] = useState<Mode>("preset");

  const onSave = () => {
    const source = mode === "preset" ? selectedModel : values;

    if (!source) return;

    const { number, sourceBase } = source;

    const page = sourceBase === BASES.DECIMAL ? "decimal-binary" : "binary-decimal"

    router.push(
      `/number-bases/animation/${page}?number=${number}`
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

      // Source and target bases must be different
      if (values.baseOrigem && values.baseDestino && values.baseOrigem === values.baseDestino) {
        errors.baseDestino = "Base destino deve ser diferente da base de origem"
      }

      if (values.baseOrigem && values.baseOrigem === BASES.BINARY) {
        // Validate binary digits
        if (!isBinary(values.numero.toString())) {
          errors.numero = "Valor deve ser compatível com a base de origem selecionada"
        }
      } 
    }
  
    return {
      isValid: Object.keys(errors).length === 0,
      errors,
    };
  }

  const options = [
    {
      label: BASE_LABELS[BASES.DECIMAL],
      value: BASES.DECIMAL,
    },
    {
      label: BASE_LABELS[BASES.BINARY],
      value: BASES.BINARY,
    },
  ];

  const fields: Field[] = [
    {
      type: "radio",
      name: "sourceBase",
      label: "Base numérica de origem",
      options: options,
    },
    {
      type: "radio",
      name: "targetBase",
      label: "Base numérica destino",
      options: options,
    },
    { type: "input", name: "number", label: "Número" },
  ];

  const table = {
    headers: [
      {
        key: "number",
        label: "Número",
      },
      {
        key: "sourceBase",
        label: "Base de origem",
        render: (value: string) => BASE_LABELS[value as Base],
      },
      {
        key: "targetBase",
        label: "Base destino",
        render: (value: string) => BASE_LABELS[value as Base],
      },
    ],
    data: model,
  };

  return (
    <div className="flex flex-col">
      <ParamsPage
        title="Bases numéricas"
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
