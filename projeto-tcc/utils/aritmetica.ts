export type Operation = typeof OPERATIONS[keyof typeof OPERATIONS];

export const OPERATIONS = {
  SUM: "sum",
  SUBTRACTION: "subtraction",
} as const;

export const OPERATION_LABELS: Record<Operation, string> = {
  [OPERATIONS.SUM]: "Soma",
  [OPERATIONS.SUBTRACTION]: "Subtração",
};
