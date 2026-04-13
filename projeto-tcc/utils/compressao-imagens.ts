export const PALETTE = [
  [186, 245, 255], // SKY
  [20, 175, 31],   // GREEN
  [255, 244, 79],  // YELLOW
  [255, 128, 0],   // ORANGE
  [255, 87, 51],   // RED
  [147, 51, 234],  // PURPLE
] as const;

export type ColorIndex = (typeof COLORS)[keyof typeof COLORS];

export const COLORS = {
  SKY: 0,
  GREEN: 1,
  YELLOW: 2,
  ORANGE: 3,
  RED: 4,
  PURPLE: 5
} as const;

export type Compression = typeof COMPRESSION_ALGORITHM[keyof typeof COMPRESSION_ALGORITHM];

export const COMPRESSION_ALGORITHM = {
  HUFFMAN: "huffman",
  RLE: "rle",
  LZW: "lzw"
} as const;

export const COMPRESSION_ALGORITHM_LABELS: Record<Compression, string> = {
  [COMPRESSION_ALGORITHM.HUFFMAN]: "Codificação de Huffman",
  [COMPRESSION_ALGORITHM.RLE]: "Run-Length Encoding",
  [COMPRESSION_ALGORITHM.LZW]: "Codificação Lempel-Ziv-Welch",
};

export type Representation = typeof IMG_REPRESENTATION[keyof typeof IMG_REPRESENTATION];

export const IMG_REPRESENTATION = {
  BLACK_AND_WHITE: "black_white",
  GRAYSCALE: "grayscale",
  COLORS: "colors"
} as const;

export const IMG_REPRESENTATION_LABELS: Record<Representation, string> = {
  [IMG_REPRESENTATION.BLACK_AND_WHITE]: "Preto e branco",
  [IMG_REPRESENTATION.GRAYSCALE]: "Grayscale",
  [IMG_REPRESENTATION.COLORS]: "Colorida",
};

export type Design = typeof IMG_DESIGN[keyof typeof IMG_DESIGN];

export const IMG_DESIGN = {
  PAISAGEM: "paisagem",
  LISTRAS: "listras",
  QUADRADO: "quadrado"
} as const;

export const IMG_DESIGN_LABELS: Record<Design, string> = {
  [IMG_DESIGN.PAISAGEM]: "Paisagem",
  [IMG_DESIGN.LISTRAS]: "Listras",
  [IMG_DESIGN.QUADRADO]: "Quadrados",
};



