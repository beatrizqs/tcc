export type BasesNumericas = {
  id: string,
  numero: string;
  baseOrigem: string;
  baseDestino: string;
};

export const model: BasesNumericas[] = [
  {
    id: "44-decimal-binario",
    numero: "44",
    baseOrigem: "Decimal",
    baseDestino: "Binária",
  },
  {
    id: "243-decimal-binario",
    numero: "243",
    baseOrigem: "Decimal",
    baseDestino: "Binária",
  },
  {
    id: "87-decimal-binario",
    numero: "87",
    baseOrigem: "Binária",
    baseDestino: "Decimal",
  },
  {
    id: "101001001-binario-decimal",
    numero: "101001001",
    baseOrigem: "Binária",
    baseDestino: "Decimal",
  },
  {
    id: "1000010110-binario-decimal",
    numero: "1000010110",
    baseOrigem: "Binária",
    baseDestino: "Decimal",
  },
  {
    id: "1110010101-binario-decimal",
    numero: "1110010101",
    baseOrigem: "Binária",
    baseDestino: "Decimal",
  },
  {
    id: "1101101101-binario-decimal",
    numero: "1101101101",
    baseOrigem: "Binária",
    baseDestino: "Decimal",
  },
];
