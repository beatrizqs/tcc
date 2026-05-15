import { CYPHERS } from "@/utils/cyphers";

export const model = [
  {
    id: "universidade-substituicao",
    message: "UNIVERSIDADE",
    cypher: CYPHERS.SUBSTITUTION,
    params: "",
    paramsLabel: "-"
  },
  {
    id: "computador-substituicao",
    message: "COMPUTADOR",
    cypher: CYPHERS.SUBSTITUTION,
    params: "",
    paramsLabel: "-"
  },
  {
    id: "internet-deslocamento",
    message: "INTERNET",
    cypher: CYPHERS.SHIFT,
    params: "4",
    paramsLabel: "Deslocamento = 4"
  },
  {
    id: "pendrive-deslocamento",
    message: "PENDRIVE",
    cypher: CYPHERS.SHIFT,
    params: "6",
    paramsLabel: "Deslocamento = 6"
  },
  {
    id: "hardware-deslocamento",
    message: "HARDWARE",
    cypher: CYPHERS.SHIFT,
    params: "3",
    paramsLabel: "Deslocamento = 3"
  },
  {
    id: "criptografia-vigenere",
    message: "CRIPTOGRAFIA",
    cypher: CYPHERS.VIGENERE,
    params: "SEGREDO",
    paramsLabel: "Chave = SEGREDO"
  },
  {
    id: "script-vigenere",
    message: "SCRIPT",
    cypher: CYPHERS.VIGENERE,
    params: "SENHA",
    paramsLabel: "Chave = SENHA"
  },
];
