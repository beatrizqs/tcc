"use client";

import ParamsPage, {
  Field,
  Mode,
  ValidationResult,
} from "@/components/ParamsPage";
import { TableRow } from "@/components/Table";
import { model } from "@/lib/models/cryptography";
import { CYPHER_LABELS, CYPHERS, Cypher } from "@/utils/cyphers";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function Criptografia() {
  const router = useRouter();

  const [values, setValues] = useState<Record<string, number | string>>({}); // Custom values
  const [selectedModel, setSelectedModel] = useState<TableRow>(); // Pre-defined model

  const [mode, setMode] = useState<Mode>("preset");

  const onSave = () => {
    const source = mode === "preset" ? selectedModel : values;

    if (!source) return;

    const { message, cypher, params } = source;

    if (cypher === CYPHERS.SUBSTITUTION) {
      router.push(
        `/cryptography/animations/substitution?message=${message}`
      );
    } else if (cypher === CYPHERS.SHIFT) {
      router.push(
        `/cryptography/animations/shift?message=${message}&shift=${params}`
      );
    } else if (cypher === CYPHERS.VIGENERE) {
      router.push(
        `/cryptography/animations/vigenere?message=${message}&key=${params}`
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

  const options = [
    {
      label: CYPHER_LABELS[CYPHERS.SUBSTITUTION],
      value: CYPHERS.SUBSTITUTION,
    },
    {
      label: CYPHER_LABELS[CYPHERS.SHIFT],
      value: CYPHERS.SHIFT,
    },
    {
      label: CYPHER_LABELS[CYPHERS.VIGENERE],
      value: CYPHERS.VIGENERE,
    },
  ];

  const fields: Field[] = [
    {
      type: "radio",
      name: "cypher",
      label: "Cifra",
      options: options,
      orientation: "column"
    },
    { type: "input", name: "message", label: "Mensagem" },
    {
      type: "input",
      name: "params",
      label: (values) => {
        switch (values.cypher) {
          case CYPHERS.SHIFT:
            return "Deslocamento";
          case CYPHERS.VIGENERE:
            return "Senha";
          default:
            return "Parâmetros";
        }
      },
      disabled: (values) => values.cypher === CYPHERS.SUBSTITUTION,
    },
  ];

  const table = {
    headers: [
      {
        key: "message",
        label: "Mensagem",
      },
      {
        key: "cypher",
        label: "Cifra",
        render: (value: string) => CYPHER_LABELS[value as Cypher],
      },
      {
        key: "paramsLabel",
        label: "Parâmetro",
      },
    ],
    data: model,
  };

  return (
    <div className="flex flex-col">
      <ParamsPage
        title="Criptografia"
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
