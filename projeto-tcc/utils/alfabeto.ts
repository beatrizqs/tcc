export const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
export const ALPHABET_ARRAY = ALPHABET.split("");


export const alphabet = {
  letterToIndex: Object.fromEntries(
    ALPHABET.split("").map((l, i) => [l, i])
  ) as Record<string, number>,

  indexToLetter: ALPHABET.split(""),
};