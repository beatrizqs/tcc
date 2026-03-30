"use client";

import MainPageTitle from "@/components/MainPageTitle";
import SidePageTitle from "@/components/SidePageTitle";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import Button from "@/components/Button";
import { alphabet, ALPHABET_ARRAY } from "@/utils/alfabeto";
import { ArrowsCounterClockwise } from "phosphor-react";
import { explanations } from "@/utils/explicacoes";
import TextualExplanation from "@/components/TextualExplanation";

type Character = {
  value: string;
  id: string;
};

export default function Substituicao() {
  const [shuffledAlphabet, setShuffledAlphabet] = useState<Character[]>([]);
  const [highlightedPositions, setHighlightedPositions] = useState<number[]>(
    []
  ); // Índices das letras no alfabeto comum que estão na mensagem
  const [showExplanation, setShowExplanation] = useState(false);

  const searchParams = useSearchParams();
  const mensagem = searchParams.get("mensagem")?.toUpperCase() || "";

  const shuffle = (alphabet: Character[]) => {
    const newAlphabet = [...alphabet];

    for (let i = newAlphabet.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newAlphabet[i], newAlphabet[j]] = [newAlphabet[j], newAlphabet[i]];
    }

    setShuffledAlphabet(newAlphabet);
  };

  useEffect(() => {
    // Gera o alfabeto embaralhado
    const alphabet: Character[] = ALPHABET_ARRAY.map((char) => {
      return { value: char, id: char };
    });
    shuffle(alphabet);

    //Define os índices dos caracteres no alfabeto comum que estão presentes na mensagem
    const indexes: number[] = [];
    for (let i = 0; i < ALPHABET_ARRAY.length; i++) {
      if (mensagem.includes(ALPHABET_ARRAY[i])) {
        indexes.push(i);
      }
    }

    setHighlightedPositions(indexes);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getResult = () => {
    // Validação para erros de index
    if (shuffledAlphabet.length === ALPHABET_ARRAY.length) {
      let result = "";
      for (const char of mensagem) {
        const index = alphabet.letterToIndex[char];
        const newChar = shuffledAlphabet[index].value;

        result += newChar;
      }

      return result;
    }
    return;
  };

  return (
    <div className="flex flex-col w-full h-[calc(100vh-90px)]">
      <SidePageTitle title={"Criptografia"} href={"/criptografia/parametros"} />
      <MainPageTitle title="Cifra de substituição" noMargin />

      <div className="flex flex-col gap-10 font-title items-center my-10">
        <h2 className="font-bold text-2xl font-stretch-extra-expanded">
          {mensagem}
        </h2>

        {/* Tabela com alfabeto normal e embaralhado */}
        <div className="border-1 border-black rounded-md overflow-hidden">
          <table className=" text-xl">
            <tbody>
              {/* Alfabeto padrão */}
              <tr>
                {ALPHABET_ARRAY.map((char, i) => {
                  return (
                    <td
                      key={`${char}-${i}`}
                      className={`p-3 transition ease-in-out border-black border-1 text-black w-10 items-center ${
                        highlightedPositions.includes(i) && "bg-blue/25"
                      }`}
                    >
                      {char}
                    </td>
                  );
                })}
              </tr>

              {/* Alfabeto embaralhado */}
              <tr>
                {shuffledAlphabet.map((char, i) => {
                  return (
                    <motion.td
                      key={char.id}
                      layout
                      transition={{
                        type: "spring",
                        stiffness: 150,
                        damping: 25,
                      }}
                      className={`p-3 border-black border text-black w-10 ${
                        highlightedPositions.includes(i) && "bg-blue/25"
                      }`}
                    >
                      {char.value}
                    </motion.td>
                  );
                })}
              </tr>
            </tbody>
          </table>
        </div>

        <Button
          icon={<ArrowsCounterClockwise size={16} className="text-white" />}
          text={"Regenerar permutação"}
          onClick={() => {
            shuffle(shuffledAlphabet);
          }}
        />

        <div className="flex flex-row gap-3 text-black text-2xl mx-auto font-title font-bold items-center ">
          <p>Texto cifrado = </p>
          <div className="border border-blue rounded-md py-1 px-3 text-blue">
            {getResult()}
          </div>
        </div>

        <Button text="Explicação" onClick={() => {setShowExplanation(true)}} />
      </div>

      <TextualExplanation
        explanation={explanations.criptografia.substituicao}
        onClose={() => {
          setShowExplanation(false);
        }}
        isOpen={showExplanation}
      />
    </div>
  );
}
