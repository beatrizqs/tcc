"use client";

import ParamsPage, { Field } from "@/components/ParamsPage";
import { TableRow } from "@/components/Table";
import { model } from "@/lib/models/bases-numericas";
import { useState } from "react";

export default function BasesNumericas() {
  const [values, setValues] = useState<Record<string, number | string>>({});
  const [selectedModel, setSelectedModel] = useState<TableRow>();

  function handleChange(name: string, value: number | string) {
    setValues((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  const options = [
    {
      label: "Decimal",
      value: "decimal",
    },
    {
      label: "Binária",
      value: "binaria",
    },
  ];

  const fields: Field[] = [
    { type: "number", name: "numero", label: "Número" },
    {
      type: "radio",
      name: "base-origem",
      label: "Base numérica de origem",
      options: options,
    },
    {
      type: "radio",
      name: "base-destino",
      label: "Base numérica destino",
      options: options,
    },
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
      />
    </div>
  );
}
