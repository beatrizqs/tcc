"use client";

import MainPageTitle from "@/components/MainPageTitle";
import SidePageTitle from "@/components/SidePageTitle";
import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import Button from "@/components/Button";
import { alphabet, ALPHABET_ARRAY } from "@/utils/alfabeto";
import { motion } from "framer-motion";
import TextualExplanation from "@/components/TextualExplanation";
import { explanations } from "@/utils/explicacoes";

type Character = {
  index: number;
  value: string;
};

type Step = {
  index: number;
  plaintext: Character;
  key: Character;
  ciphertext: Character;
};

export default function Vigenere() {
  const [currentStep, setCurrentStep] = useState<Step>();
  const [visibleResult, setVisibleResult] = useState(-1);
  const [showResult, setShowResult] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  const pauseRef = useRef(false);

  const formatKey = (key: string, size: number) => {
    // Deixa a chave no tamanho da mensagem a ser criptografada
    let result = "";

    for (let i = 0; i < size; i++) {
      result += key[i % key.length];
    }

    return result;
  };

  const searchParams = useSearchParams();
  const mensagem = searchParams.get("mensagem")?.toUpperCase() || "";
  const chave = searchParams.get("chave")?.toUpperCase() || "";
  const chaveFormatada = formatKey(chave, mensagem.length);

  const steps: Step[] = (() => {
    const result: Step[] = [];

    for (let i = 0; i < mensagem.length; i++) {
      const plaintextChar = mensagem[i];
      const keyChar = chaveFormatada[i];
      const ciphertextIndex =
        (alphabet.letterToIndex[plaintextChar] +
          alphabet.letterToIndex[keyChar]) %
        26;
      const ciphertextChar = alphabet.indexToLetter[ciphertextIndex];

      const step = {
        index: i,
        plaintext: {
          value: plaintextChar,
          index: alphabet.letterToIndex[plaintextChar],
        },
        key: {
          value: keyChar,
          index: alphabet.letterToIndex[keyChar],
        },
        ciphertext: {
          value: ciphertextChar,
          index: ciphertextIndex,
        },
      };

      result.push(step);
    }

    return result;
  })();

  const textoCifrado = steps.map((s) => s.ciphertext.value).join("");

  const reset = () => {
    setCurrentStep(undefined);
    setIsPaused(false);
    setShowResult(false);
    setVisibleResult(-1);
    runAnimation();
  };

  const waitIfPaused = () => {
    return new Promise<void>((resolve) => {
      const check = () => {
        if (!pauseRef.current) {
          resolve();
        } else {
          requestAnimationFrame(check);
        }
      };

      check();
    });
  };

  useEffect(() => {
    pauseRef.current = isPaused;
  }, [isPaused]);

  async function runAnimation() {
    setIsRunning(true);

    for (let i = 0; i < steps.length; i++) {
      await waitIfPaused();

      setCurrentStep(steps[i]);

      // Exibe o caracter de saída
      await delay(1000);
      setVisibleResult(i);

      await delay(800);
    }
    setIsRunning(false);
    setShowResult(true);
  }

  function delay(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  return (
    <div className="flex flex-col w-full h-[calc(100vh-100px)]">
      <div className="grid grid-cols-2">
        <div className="flex flex-col">
          <SidePageTitle
            title={"Criptografia"}
            href={"/criptografia/parametros"}
          />
          <MainPageTitle title="Cifra de Vigenère" noMargin className="mt-5"/>

          {(isRunning || currentStep) && (
            <div className="flex flex-col  w-full overflow-y-auto flex-1 font-title">
              {/* Criptografia da mensagem */}
              <div className="flex flex-col gap-4 text-xl mx-auto text-blue font-title font-bold items-center my-10">
                {/* Chave */}
                <div className="flex flex-row gap-3">
                  <p>Chave =</p>
                  <div className="border border-blue rounded-md py-[2px] px-2">
                    {chave}
                  </div>
                </div>

                {/* Tabela com mensagem, chave expandida e resultado */}
                <div className="border-1 border-black rounded-md overflow-hidden">
                  <table className=" text-xl">
                    <tbody>
                      {/* Mensagem */}
                      <tr>
                        {mensagem.split("").map((char, i) => {
                          return (
                            <td
                              key={`${char}-${i}`}
                              className={`p-3 transition ease-in-out border-black border-1 text-black ${
                                currentStep?.index === i && "bg-blue/25"
                              }`}
                            >
                              {char}
                            </td>
                          );
                        })}
                      </tr>

                      {/* Chave */}
                      <tr>
                        {formatKey(chave, mensagem.length)
                          .split("")
                          .map((char, i) => {
                            return (
                              <td
                                key={`${char}-${i}`}
                                className={`p-3 transition ease-in-out border-black border-1 text-black ${
                                  currentStep?.index === i && "bg-blue/25"
                                }`}
                              >
                                {char}
                              </td>
                            );
                          })}
                      </tr>

                      {/* Texto cifrado */}
                      <tr>
                        {textoCifrado.split("").map((char, i) => {
                          return (
                            <td
                              key={`${char}-${i}`}
                              className={`p-3 text-blue transition ease-in-out border-black border-1 border-t-2 ${
                                visibleResult < i ? "opacity-0" : "opacity-100"
                              }`}
                            >
                              {char}
                            </td>
                          );
                        })}
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Resultado */}
              {showResult && (
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3, duration: 0.3 }}
                  className="flex flex-row gap-3 text-black text-2xl mx-auto font-title font-bold items-center "
                >
                  <p>{mensagem} → </p>
                  <div className="border border-blue rounded-md py-1 px-3 text-blue">
                    {textoCifrado}
                  </div>
                </motion.div>
              )}
            </div>
          )}

          {/* Botões */}
          <div className={`flex flex-row gap-4 items-center mx-auto mt-8 mb-5`}>
            {isRunning ? (
              <>
                <Button
                  text={isPaused ? "Continuar" : "Pausar"}
                  onClick={() => setIsPaused((p) => !p)}
                />
                {isPaused && <Button text={"Reiniciar"} onClick={reset} />}
              </>
            ) : (
              <>
                <Button
                  text={!currentStep ? "Iniciar" : "Repetir"}
                  onClick={reset}
                />
                <Button text="Explicação" onClick={() => {setShowExplanation(true)}} />
              </>
            )}
          </div>
        </div>
        {/* Tabela de Vigenère */}
        <div className="flex flex-col items-center gap-1 font-title justify-center mt-2">
          <div className="text-sm font-semibold">MENSAGEM</div>

          <div className="flex items-center gap-1 font-title">
            <div className="-rotate-90 text-sm whitespace-nowrap font-semibold">
              CHAVE
            </div>

            {/* Matriz */}
            <table className="border-collapse text-[12px]">
              <thead>
                <tr>
                  <th className="size-[20px]"></th>

                  {ALPHABET_ARRAY.map((char, i) => (
                    <th
                      className={`size-[20px] text-center text-black transition ease-in-out delay-100 ${
                        currentStep?.plaintext.index === i && "text-blue"
                      }`}
                      key={char}
                    >
                      {char}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {ALPHABET_ARRAY.map((row, i) => (
                  <tr key={row}>
                    <th
                      className={`size-[20px]  text-center text-black transition ease-in-out delay-100 ${
                        currentStep?.key.index === i && "text-blue"
                      }`}
                    >
                      {row}
                    </th>

                    {ALPHABET_ARRAY.map((_, j) => (
                      <td
                        className={`text-center text-black transition ease-in-out delay-100 border-1 border-black ${
                          (currentStep?.key.index === i ||
                            currentStep?.plaintext.index === j) &&
                          "bg-blue/25"
                        } ${
                          currentStep?.key.index === i &&
                          currentStep?.plaintext.index === j &&
                          "bg-blue/75 text-white"
                        }`}
                        key={j}
                      >
                        {ALPHABET_ARRAY[(i + j) % 26]}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <TextualExplanation
        explanation={explanations.criptografia.vigenere}
        onClose={() => {
          setShowExplanation(false);
        }}
        isOpen={showExplanation}
      />
      
    </div>
  );
}
