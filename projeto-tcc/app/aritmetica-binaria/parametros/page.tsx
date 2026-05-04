"use client";

import ParamsPage, { Field, Mode, ValidationResult } from "@/components/ParamsPage";
import { TableRow } from "@/components/Table";
import { model } from "@/lib/models/aritmetica-binaria";
import { Operation, OPERATION_LABELS, OPERATIONS } from "@/utils/aritmetica";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function AritmeticaBinaria() {
  const router = useRouter();

  const [values, setValues] = useState<Record<string, number | string>>({}); // Valores customizados
  const [selectedModel, setSelectedModel] = useState<TableRow>(); // Modelo pré-definido

  const [mode, setMode] = useState<Mode>("preset");

  const onSave = () => {
    const source = mode === "preset" ? selectedModel : values;

    if (!source) return;

    const { valor1, valor2, operacao } = source;

    if (operacao === OPERATIONS.SUM) {
      router.push(
        `/aritmetica-binaria/funcionamento/soma?valor1=${valor1}&valor2=${valor2}`
      );
    } else if (operacao === OPERATIONS.SUBTRACTION) {
      router.push(
        `/aritmetica-binaria/funcionamento/subtracao?valor1=${valor1}&valor2=${valor2}`
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

  const options = [
    {
      label: OPERATION_LABELS[OPERATIONS.SUM],
      value: OPERATIONS.SUM,
    },
    {
      label: OPERATION_LABELS[OPERATIONS.SUBTRACTION],
      value: OPERATIONS.SUBTRACTION,
    },
  ];

  const fields: Field[] = [
    { type: "input", name: "valor1", label: "Valor #1" },
    { type: "input", name: "valor2", label: "Valor #2" },

    {
      type: "radio",
      name: "operacao",
      label: "Operação",
      options: options,
    },
  ];

  const table = {
    headers: [
      {
        key: "valor1",
        label: "Valor #1",
      },
      {
        key: "valor2",
        label: "Valor #2",
      },
      {
        key: "operacao",
        label: "Operação",
        render: (value: string) => OPERATION_LABELS[value as Operation],
      },
    ],
    data: model,
  };

  return (
    <div className="flex flex-col">
      <ParamsPage
        title="Aritmética binária"
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
 