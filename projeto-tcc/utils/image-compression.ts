import { ContrastLevel } from "@/contexts/SettingsContext";

export function getCurrentContrast(): ContrastLevel {
  if (typeof document === "undefined") {
    return "medium";
  }

  return (
    (document.documentElement.dataset.contrast as ContrastLevel) ?? "medium"
  );
}

export const PALETTE = [
  [186, 245, 255], // SKY
  [20, 175, 31], // GREEN
  [255, 244, 79], // YELLOW
  [255, 128, 0], // ORANGE
  [255, 87, 51], // RED
  [147, 51, 234], // PURPLE
] as const;

export type ColorIndex = (typeof COLORS)[keyof typeof COLORS];

export const COLORS = {
  SKY: 0,
  GREEN: 1,
  YELLOW: 2,
  ORANGE: 3,
  RED: 4,
  PURPLE: 5,
} as const;

export type Compression =
  (typeof COMPRESSION_ALGORITHM)[keyof typeof COMPRESSION_ALGORITHM];

export const COMPRESSION_ALGORITHM = {
  HUFFMAN: "huffman",
  RLE: "rle",
  LZW: "lzw",
} as const;

export const COMPRESSION_ALGORITHM_LABELS: Record<Compression, string> = {
  [COMPRESSION_ALGORITHM.HUFFMAN]: "Codificação de Huffman",
  [COMPRESSION_ALGORITHM.RLE]: "Run-Length Encoding",
  [COMPRESSION_ALGORITHM.LZW]: "Codificação Lempel-Ziv-Welch",
};

export type Representation =
  (typeof IMG_REPRESENTATION)[keyof typeof IMG_REPRESENTATION];

export const IMG_REPRESENTATION = {
  BLACK_AND_WHITE: "black_white",
  GRAYSCALE: "grayscale",
  COLORS: "colors",
} as const;

export const IMG_REPRESENTATION_LABELS: Record<Representation, string> = {
  [IMG_REPRESENTATION.BLACK_AND_WHITE]: "Preto e branco",
  [IMG_REPRESENTATION.GRAYSCALE]: "Grayscale",
  [IMG_REPRESENTATION.COLORS]: "Colorida",
};

export type Design = (typeof IMG_DESIGN)[keyof typeof IMG_DESIGN];

export const IMG_DESIGN = {
  LANDSCAPE: "landscape",
  STRIPES: "stripes",
  SQUARE: "square",
} as const;

export const IMG_DESIGN_LABELS: Record<Design, string> = {
  [IMG_DESIGN.LANDSCAPE]: "Paisagem",
  [IMG_DESIGN.STRIPES]: "Listras",
  [IMG_DESIGN.SQUARE]: "Quadrados",
};

function adjustContrast(value: number, contrast: ContrastLevel) {
  const factor = contrast === "low" ? 0.8 : contrast === "high" ? 1.25 : 1;

  return Math.max(0, Math.min(255, Math.round((value - 128) * factor + 128)));
}

export const getRGB = (
  color: ColorIndex | number,
  representation: string
): [number, number, number] => {
  const contrast = getCurrentContrast();

  // Colors
  if (representation === IMG_REPRESENTATION.COLORS) {
    const [r, g, b] = PALETTE[color as ColorIndex];

    return [
      adjustContrast(r, contrast),
      adjustContrast(g, contrast),
      adjustContrast(b, contrast),
    ];
  }

  // Black and white
  if (representation === IMG_REPRESENTATION.BLACK_AND_WHITE) {
    if (contrast === "low" && color === 0) {
      return [80, 80, 80]
    }

    return color === 0 ? [0, 0, 0] : [255, 255, 255];
  }

  // Grayscale
  const gray = adjustContrast(color as number, contrast);

  return [gray, gray, gray];
};
