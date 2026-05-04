import { OPERATIONS } from "@/utils/aritmetica";

export const model = [
  {
    id: "110000-110000-soma",
    valor1: "110000",
    valor2: "110000",
    operacao: OPERATIONS.SUM,
  },
  {
    id: "110110-100110-soma",
    valor1: "110110",
    valor2: "100110",
    operacao: OPERATIONS.SUM,
  },
  {
    id: "110010-110110-soma",
    valor1: "110010",
    valor2: "110110",
    operacao: OPERATIONS.SUM,
  },
  {
    id: "110110-100100-soma",
    valor1: "110110",
    valor2: "100100",
    operacao: OPERATIONS.SUM,
  },
  {
    id: "100100-111110-subtracao",
    valor1: "100100",
    valor2: "111110",
    operacao: OPERATIONS.SUBTRACTION,
  },
  {
    id: "100110-110001-subtracao",
    valor1: "100110",
    valor2: "110001",
    operacao: OPERATIONS.SUBTRACTION,
  },
  {
    id: "111110-100000-subtracao",
    valor1: "111110",
    valor2: "100000",
    operacao: OPERATIONS.SUBTRACTION,
  },
];
