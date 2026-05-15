import { OPERATIONS } from "@/utils/arithmetic";

export const model = [
  {
    id: "110000-110000-soma",
    value1: "110000",
    value2: "110000",
    operation: OPERATIONS.ADDITION,
  },
  {
    id: "110110-100110-soma",
    value1: "110110",
    value2: "100110",
    operation: OPERATIONS.ADDITION,
  },
  {
    id: "110010-110110-soma",
    value1: "110010",
    value2: "110110",
    operation: OPERATIONS.ADDITION,
  },
  {
    id: "110110-100100-soma",
    value1: "110110",
    value2: "100100",
    operation: OPERATIONS.ADDITION,
  },
  {
    id: "100100-111110-subtracao",
    value1: "100100",
    value2: "111110",
    operation: OPERATIONS.SUBTRACTION,
  },
  {
    id: "100110-110001-subtracao",
    value1: "100110",
    value2: "110001",
    operation: OPERATIONS.SUBTRACTION,
  },
  {
    id: "111110-100000-subtracao",
    value1: "111110",
    value2: "100000",
    operation: OPERATIONS.SUBTRACTION,
  },
];
