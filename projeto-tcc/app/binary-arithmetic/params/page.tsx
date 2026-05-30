"use client";

import ParamsPage, {
  Field,
  Mode,
  ValidationResult,
} from "@/components/ParamsPage";
import { TableRow } from "@/components/Table";
import { model } from "@/lib/models/binary-arithmetic";
import { Operation, OPERATION_LABELS, OPERATIONS } from "@/utils/arithmetic";
import { isBinary } from "@/utils/bases";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function AritmeticaBinaria() {
  const router = useRouter();

  const [values, setValues] = useState<Record<string, number | string>>({}); // Custom values
  const [selectedModel, setSelectedModel] = useState<TableRow>(); // Pre-defined model

  const [mode, setMode] = useState<Mode>("preset");

  const onSave = () => {
    const source = mode === "preset" ? selectedModel : values;

    if (!source) return;

    const { value1, value2, operation } = source;

    const page = operation === OPERATIONS.ADDITION ? "addition" : "subtraction";

    router.push(
      `/binary-arithmetic/animations/${page}?value1=${value1}&value2=${value2}`
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
      // Não permite campos vazios
      for (const field of fields) {
        if (!values[field.name]) {
          errors[field.name] = "Campo obrigatório";
        }
      }

      const maxLength = values.operation && values.operation === OPERATIONS.SUBTRACTION ? 7 : 9

      // Value 1
      if ((values.value1)) {
        // Validate binary digits
        if (!isBinary(values.value1.toString())) {
          errors.value1 =
            "Valor deve ser binário";
        }

        if (values.value1.toString().length > maxLength) {
          errors.value1 = `Insira um valor binário de até ${maxLength} dígitos`;
        }
      }

      // Value 2
      if ((values.value2)) {
        // Validate binary digits
        if (!isBinary(values.value2.toString())) {
          errors.value2 =
            "Valor deve ser binário";
        }

        if (values.value2.toString().length > maxLength) {
          errors.value2 = `Insira um valor binário de até ${maxLength} dígitos`;
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
      label: OPERATION_LABELS[OPERATIONS.ADDITION],
      value: OPERATIONS.ADDITION,
    },
    {
      label: OPERATION_LABELS[OPERATIONS.SUBTRACTION],
      value: OPERATIONS.SUBTRACTION,
    },
  ];

  const fields: Field[] = [
    { type: "input", name: "value1", label: "Valor #1" },
    { type: "input", name: "value2", label: "Valor #2" },

    {
      type: "radio",
      name: "operation",
      label: "Operação",
      options: options,
    },
  ];

  const table = {
    headers: [
      {
        key: "value1",
        label: "Valor #1",
      },
      {
        key: "value2",
        label: "Valor #2",
      },
      {
        key: "operation",
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
