export const decimalRegex = /^[0-9]*$/;
export const binaryRegex = /^[01]*$/;

export type Base = typeof BASES[keyof typeof BASES];

export const BASES = {
  BINARY: "2",
  DECIMAL: "10",
} as const;

export const BASE_LABELS: Record<Base, string> = {
  [BASES.BINARY]: "Binário",
  [BASES.DECIMAL]: "Decimal",
};

export function isBinary(value: string) {
  return binaryRegex.test(value);
}
