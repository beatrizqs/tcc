export const PALETTE = [
  "var(--color-sky)",    
  "var(--color-green)",  
  "var(--color-yellow)", 
  "var(--color-orange)", 
  "var(--color-red)",    
  "var(--color-purple)"  
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


