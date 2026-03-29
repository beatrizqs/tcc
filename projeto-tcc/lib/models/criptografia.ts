import { CYPHERS } from "@/utils/cifras";

export const model = [
  {
    id: "universidade-substituicao",
    mensagem: "UNIVERSIDADE",
    cifra: CYPHERS.SUBSTITUTION,
    params: "",
    paramsLabel: "-"
  },
  {
    id: "computador-substituicao",
    mensagem: "COMPUTADOR",
    cifra: CYPHERS.SUBSTITUTION,
    params: "",
    paramsLabel: "-"
  },
  {
    id: "internet-deslocamento",
    mensagem: "INTERNET",
    cifra: CYPHERS.SHIFT,
    params: "4",
    paramsLabel: "Deslocamento = 4"
  },
  {
    id: "pendrive-deslocamento",
    mensagem: "PENDRIVE",
    cifra: CYPHERS.SHIFT,
    params: "6",
    paramsLabel: "Deslocamento = 6"
  },
  {
    id: "hardware-deslocamento",
    mensagem: "HARDWARE",
    cifra: CYPHERS.SHIFT,
    params: "3",
    paramsLabel: "Deslocamento = 3"
  },
  {
    id: "criptografia-vigenere",
    mensagem: "CRIPTOGRAFIA",
    cifra: CYPHERS.VIGENERE,
    params: "SEGREDO",
    paramsLabel: "Chave = SEGREDO"
  },
  {
    id: "script-vigenere",
    mensagem: "SCRIPT",
    cifra: CYPHERS.VIGENERE,
    params: "SENHA",
    paramsLabel: "Chave = SENHA"
  },
];
