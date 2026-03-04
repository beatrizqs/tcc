/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from "react";
import SidePageTitle from "./SidePageTitle";
import Tabs from "./Tabs";
import Table, { TableRow } from "./Table";
import Input from "./Input";
import RadioComponent from "./RadioGroup";
import Button from "./Button";

export type Field =
  | {
      type: "text" | "number";
      name: string;
      label: string;
      placeholder?: string;
      className?: string;
    }
  | {
      type: "radio";
      name: string;
      label: string;
      options: { label: string; value: string }[];
      className?: string;
    }
  | {
      type: "imageRadio";
      name: string;
      label: string;
      options: {
        label: string;
        value: string;
        image: React.ReactNode;
      }[];
      className?: string;
    };

type TableProps = {
  headers: { key: keyof TableRow; label: string }[];
  data: TableRow[];
};

type ParamsPageProps = {
  fields: Field[];
  title: string;
  table: TableProps;
  values: Record<string, any>;
  onChange: (name: string, value: any) => void;
  selectedModel?: TableRow;
  onSelectModel?: (model: TableRow) => void;
};

export default function ParamsPage({
  fields,
  title,
  table,
  values,
  onChange,
  selectedModel,
  onSelectModel,
}: ParamsPageProps) {
  const [activeTab, setActiveTab] = useState(0);

  return (
    <div className="flex flex-col w-full gap-3">
      <SidePageTitle title={title} />
      <div className="flex w-full justify-center">
        <Tabs onChange={setActiveTab} />
      </div>
      <p className="text-center font-common">
        {activeTab === 0
          ? "Selecione um dos exemplos abaixo para visualizar seu funcionamento"
          : "Informe abaixo os parâmetros para o modelo customizado"}
      </p>

      <div className="flex flex-col mt-4">
        {activeTab === 0 ? (
          <Table
            headers={table.headers}
            data={table.data}
            selectedItem={selectedModel}
            onSelect={(item) => onSelectModel?.(item)}
          />
        ) : (
          <div className="grid grid-cols-3 justify-items-center gap-8 w-[70%] place-self-center my-5">
            {fields.map((field) => {
              const value = values[field.name] ?? "";

              switch (field.type) {
                case "text":
                case "number":
                  return (
                    <Input
                      key={field.name}
                      label={field.label}
                      type={field.type}
                      value={value}
                      placeholder={field.placeholder}
                      onChange={(value) => onChange(field.name, value)}
                    />
                  );

                case "radio":
                  return (
                    <div key={field.name} className="flex flex-col gap-2">
                      <p className="font-common text-sm">{field.label}</p>
                      <RadioComponent
                        type="text"
                        value={value}
                        options={field.options}
                        onChange={(value) => onChange(field.name, value)}
                      />
                    </div>
                  );

                case "imageRadio":
                  return (
                    <div key={field.name} className="flex flex-col gap-2">
                      <p className="font-common text-sm">{field.label}</p>
                      <RadioComponent
                        type="image"
                        value={value}
                        options={field.options}
                        onChange={(value) => onChange(field.name, value)}
                      />
                    </div>
                  );
              }
            })}
          </div>
        )}
        <div className="place-self-center mt-5">
          <Button
            text={activeTab === 0 ? "Selecionar" : "Iniciar"}
            onClick={() => {}}
          />
        </div>
      </div>
    </div>
  );
}
