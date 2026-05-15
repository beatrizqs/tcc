export type Cypher = typeof CYPHERS[keyof typeof CYPHERS];

export const CYPHERS = {
  SUBSTITUTION: "substitution",
  SHIFT: "shift",
  VIGENERE: "vigenere"
} as const;

export const CYPHER_LABELS: Record<Cypher, string> = {
  [CYPHERS.SUBSTITUTION]: "Substituição",
  [CYPHERS.SHIFT]: "Deslocamento",
  [CYPHERS.VIGENERE]: "Vigenère",
};

