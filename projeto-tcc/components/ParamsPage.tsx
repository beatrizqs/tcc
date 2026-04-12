/* eslint-disable @typescript-eslint/no-explicit-any */
import SidePageTitle from "./SidePageTitle";
import Tabs from "./Tabs";
import Table, { TableHeader, TableRow } from "./Table";
import Input from "./Input";
import RadioComponent, { Options } from "./RadioGroup";
import Button from "./Button";
import { decimalRegex } from "@/utils/bases";
import { useState } from "react";

export type Mode = "preset" | "custom";

// Permite adicionar condicionais na renderização do campo
type Dynamic<T> = T | ((values: Record<string, any>) => T);

export type Field =
  | {
      type: "input";
      name: string;
      label: Dynamic<string>;
      placeholder?: string;
      className?: string;
      allow?: RegExp;
      disabled?: Dynamic<boolean>;
    }
  | {
      type: "radio";
      name: string;
      label: Dynamic<string>;
      options: { label: string; value: string | number }[];
      className?: string;
      orientation?: "row" | "column";
    }
  | {
      type: "imageRadio";
      name: string;
      label: Dynamic<string>;
      options: Options[];
      className?: string;
    };

type TableProps = {
  headers: TableHeader[];
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

  // Customização de campos
  const resolve = <T,>(prop: Dynamic<T> | undefined): T | undefined =>
    typeof prop === "function"
      ? (prop as (values: Record<string, any>) => T)(values)
      : prop;

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

      <div className={`flex flex-col ${fields.length <= 3 && "mt-4"}`}>
        {mode === "preset" ? (
          <Table
            headers={table.headers}
            data={table.data}
            selectedItem={selectedModel}
            onSelect={(item) => onSelectModel?.(item)}
          />
        ) : (
          <div className="grid grid-cols-[auto_auto_auto] gap-x-32 gap-y-8 w-fit place-self-center my-5">
            {fields.map((field, index) => {
              const value = values[field.name] ?? "";

              const label = resolve(field.label) ?? "";

              switch (field.type) {
                case "input":
                  let allow: RegExp;

                  if (field.name === "numero") {
                    allow = decimalRegex;
                  }

                  const disabled = resolve(field.disabled);

                  return (
                    <Input
                      key={field.name}
                      label={label}
                      disabled={disabled}
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
                    <div
                      key={field.name}
                      className="flex flex-col gap-3 w-full min-w-0"
                    >
                      <p className="font-common text-sm font-semibold">
                        {label}
                      </p>
                      <RadioComponent
                        type="text"
                        value={value}
                        options={field.options}
                        onChange={(value) => onChange(field.name, value)}
                        error={errors[field.name]}
                        orientation={field.orientation ?? "row"}
                      />
                    </div>
                  );

                case "imageRadio":
                  return (
                    <div
                      key={field.name}
                      className={`flex flex-col gap-3 w-full min-w-0 ${
                        fields.length === 4 && index === 3 && "col-span-3"
                      }`}
                    >
                      <p className="font-common text-sm font-semibold">
                        {label}
                      </p>
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
