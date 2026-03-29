"use client";

import ParamsPage, {
  Field,
  Mode,
  ValidationResult,
} from "@/components/ParamsPage";
import { TableRow } from "@/components/Table";
import { model } from "@/lib/models/criptografia";
import { CYPHER_LABELS, CYPHERS, Cypher } from "@/utils/cifras";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function Criptografia() {
  const router = useRouter();

  const [values, setValues] = useState<Record<string, number | string>>({}); // Valores customizados
  const [selectedModel, setSelectedModel] = useState<TableRow>(); // Modelo pré-definido

  const [mode, setMode] = useState<Mode>("preset");

  const onSave = () => {
    const source = mode === "preset" ? selectedModel : values;

    if (!source) return;

    const { mensagem, cifra, params } = source;

    if (cifra === CYPHERS.SUBSTITUTION) {
      router.push(
        `/criptografia/funcionamento/substituicao?mensagem=${mensagem}`
      );
    } else if (cifra === CYPHERS.SHIFT) {
      router.push(
        `/criptografia/funcionamento/deslocamento?mensagem=${mensagem}&deslocamento=${params}`
      );
    } else if (cifra === CYPHERS.VIGENERE) {
      router.push(
        `/criptografia/funcionamento/vigenere?mensagem=${mensagem}&chave=${params}`
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
      name: "cifra",
      label: "Cifra",
      options: options,
      orientation: "column"
    },
    { type: "input", name: "mensagem", label: "Mensagem" },
    {
      type: "input",
      name: "params",
      label: (values) => {
        switch (values.cifra) {
          case CYPHERS.SHIFT:
            return "Deslocamento";
          case CYPHERS.VIGENERE:
            return "Senha";
          default:
            return "Parâmetros";
        }
      },
      disabled: (values) => values.cifra === CYPHERS.SUBSTITUTION,
    },
  ];

  const table = {
    headers: [
      {
        key: "mensagem",
        label: "Mensagem",
      },
      {
        key: "cifra",
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
