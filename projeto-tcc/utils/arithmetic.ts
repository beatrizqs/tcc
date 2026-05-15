export type Operation = typeof OPERATIONS[keyof typeof OPERATIONS];

export const OPERATIONS = {
  ADDITION: "addition",
  SUBTRACTION: "subtraction",
} as const;

export const OPERATION_LABELS: Record<Operation, string> = {
  [OPERATIONS.ADDITION]: "Soma",
  [OPERATIONS.SUBTRACTION]: "Subtração",
};
