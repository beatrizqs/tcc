/* eslint-disable @typescript-eslint/no-explicit-any */
import SidePageTitle from "./SidePageTitle";
import Tabs from "./Tabs";
import Table, { TableRow } from "./Table";
import Input from "./Input";
import RadioComponent, { Options } from "./RadioGroup";
import Button from "./Button";
import { BASES, binaryRegex, decimalRegex } from "@/utils/bases";
import { useState } from "react";

export type Mode = "preset" | "custom";

export type Field =
  | {
      type: "input";
      name: string;
      label: string;
      placeholder?: string;
      className?: string;
      allow?: RegExp;
    }
  | {
      type: "radio";
      name: string;
      label: string;
      options: { label: string; value: string | number }[];
      className?: string;
    }
  | {
      type: "imageRadio";
      name: string;
      label: string;
      options: Options[];
      className?: string;
    };

type TableProps = {
  headers: { key: keyof TableRow; label: string }[];
  data: TableRow[];
};

export type ValidationResult = {
  isValid: boolean;
  errors: Record<string, string>;
};

type ParamsPageProps = {
  fields: Field[];
  validateFields: () => ValidationResult;
  title: string;
  table: TableProps;
  values: Record<string, any>;
  onChange: (name: string, value: any) => void;
  selectedModel?: TableRow;
  onSelectModel?: (model: TableRow) => void;
  onSave: () => void;
  mode: Mode;
  onModeChange: (mode: Mode) => void;
};

export default function ParamsPage({
  fields,
  title,
  table,
  values,
  onChange,
  selectedModel,
  onSelectModel,
  onSave,
  mode,
  onModeChange,
  validateFields,
}: ParamsPageProps) {
  const [errors, setErrors] = useState<Record<string, string>>({});
  console.log(values, selectedModel)

  return (
    <div className="flex flex-col w-full gap-3">
      <SidePageTitle title={title} />
      <div className="flex w-full justify-center">
        <Tabs
          onChange={(index) => onModeChange(index === 0 ? "preset" : "custom")}
        />
      </div>
      <p className="text-center font-common">
        {mode === "preset"
          ? "Selecione um dos exemplos abaixo para visualizar seu funcionamento"
          : "Informe abaixo os parâmetros para o modelo customizado"}
      </p>

      <div className="flex flex-col mt-4">
        {mode === "preset" ? (
          <Table
            headers={table.headers}
            data={table.data}
            selectedItem={selectedModel}
            onSelect={(item) => onSelectModel?.(item)}
          />
        ) : (
          <div className="grid grid-cols-3 gap-8 w-[70%] place-self-center my-5">
            {fields.map((field) => {
              const value = values[field.name] ?? "";

              switch (field.type) {
                case "input":
                  let allow: RegExp;

                  if (field.name === "numero") {
                    allow = decimalRegex;
                  }

                  return (
                    <Input
                      key={field.name}
                      label={field.label}
                      value={value}
                      onChange={(value) => {
                        if (!allow || allow.test(value)) {
                          onChange(field.name, value);
                        }
                      }}
                      error={errors[field.name]}
                    />
                  );

                case "radio":
                  return (
                    <div key={field.name} className="flex flex-col gap-3 w-full min-w-0">
                      <p className="font-common text-sm font-semibold">{field.label}</p>
                      <RadioComponent
                        type="text"
                        value={value}
                        options={field.options}
                        onChange={(value) => onChange(field.name, value)}
                        error={errors[field.name]}
                      />
                    </div>
                  );

                case "imageRadio":
                  return (
                    <div key={field.name} className="flex flex-col gap-3 w-full min-w-0">
                      <p className="font-common text-sm font-semibold">{field.label}</p>
                      <RadioComponent
                        type="image"
                        value={value}
                        options={field.options}
                        onChange={(value) => onChange(field.name, value)}
                        error={errors[field.name]}
                      />
                    </div>
                  );
              }
            })}
          </div>
        )}
        <div className="place-self-center mt-5">
          <Button
            text={mode === "preset" ? "Selecionar" : "Iniciar"}
            onClick={() => {
              const validation = validateFields();
              if (validation.isValid) {
                onSave();
              } else {
                setErrors(validation.errors);
              }
            }}
          />
        </div>
      </div>
    </div>
  );
}
