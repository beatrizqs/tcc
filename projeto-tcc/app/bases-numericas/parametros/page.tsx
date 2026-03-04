"use client";

import ParamsPage, { Field, Mode, ValidationResult } from "@/components/ParamsPage";
import { TableRow } from "@/components/Table";
import { model } from "@/lib/models/bases-numericas";
import { BASE_LABELS, BASES, isBinary } from "@/utils/bases";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function BasesNumericas() {
  const router = useRouter();

  const [values, setValues] = useState<Record<string, number | string>>({}); // Valores customizados
  const [selectedModel, setSelectedModel] = useState<TableRow>(); // Modelo pré-definido

  const [mode, setMode] = useState<Mode>("preset");

  const onSave = () => {
    const source = mode === "preset" ? selectedModel : values;

    if (!source) return;

    const { numero, baseOrigem, baseDestino } = source;

    if (baseOrigem === BASES.DECIMAL && baseDestino === BASES.BINARY) {
      router.push(
        `/bases-numericas/funcionamento/decimal-binario?numero=${numero}`
      );
    } else if (baseOrigem === BASES.BINARY && baseDestino === BASES.DECIMAL) {
      router.push(
        `/bases-numericas/funcionamento/binario-decimal?numero=${numero}`
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

      // Não permite selecionar mesma base para origem e destino
      if (values.baseOrigem && values.baseDestino && values.baseOrigem === values.baseDestino) {
        errors.baseDestino = "Base destino deve ser diferente da base de origem"
      }

      if (values.baseOrigem && values.baseOrigem === BASES.BINARY) {
        // Valida dígitos para número binário
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
      name: "baseOrigem",
      label: "Base numérica de origem",
      options: options,
    },
    {
      type: "radio",
      name: "baseDestino",
      label: "Base numérica destino",
      options: options,
    },
    { type: "input", name: "numero", label: "Número" },
  ];

  const table = {
    headers: [
      {
        key: "numero",
        label: "Número",
      },
      {
        key: "baseOrigem",
        label: "Base de origem",
      },
      {
        key: "baseDestino",
        label: "Base destino",
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
