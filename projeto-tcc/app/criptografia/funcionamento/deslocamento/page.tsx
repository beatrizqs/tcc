"use client";

import MainPageTitle from "@/components/MainPageTitle";
import SidePageTitle from "@/components/SidePageTitle";
import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import Button from "@/components/Button";
import { alphabet, ALPHABET_ARRAY } from "@/utils/alfabeto";
import { explanations } from "@/utils/explicacoes";
import TextualExplanation from "@/components/TextualExplanation";

export default function Deslocamento() {
  const [currentStep, setCurrentStep] = useState(-1);
  const [showExplanation, setShowExplanation] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [visibleResult, setVisibleResult] = useState(-1);
  const [rotation, setRotation] = useState(0);
  const [casasDeslocadas, setCasasDeslocadas] = useState(0);

  const searchParams = useSearchParams();
  const mensagem = searchParams.get("mensagem")?.toUpperCase() || "";
  const deslocamento = Number(searchParams.get("deslocamento")) || 0;

  const pauseRef = useRef(false);

  useEffect(() => {
    pauseRef.current = isPaused;
  }, [isPaused]);

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

  async function runAnimation() {
    setIsRunning(true);

    for (let i = 0; i <= deslocamento; i++) {
      await waitIfPaused();

      // Rotação gradual da roda com o alfabeto
      setRotation((360 / 26) * i);
      await delay(300);
      setCasasDeslocadas(i);
      await delay(1000);
    }

    for (let i = 0; i < mensagem.length; i++) {
      await waitIfPaused();

      setCurrentStep(i);

      // Exibe o caracter de saída
      await delay(1000);
      setVisibleResult(i);

      await delay(800);
    }
    setIsRunning(false);
    setShowResult(true);
  }

  const delay = (ms: number) => {
    return new Promise((resolve) => setTimeout(resolve, ms));
  };

  const reset = () => {
    setCurrentStep(-1);
    setShowExplanation(false);
    setIsPaused(false);
    setIsRunning(false);
    setShowResult(false);
    setVisibleResult(-1);
    setRotation(0);
    setCasasDeslocadas(0);
    runAnimation();
  };

  const result = mensagem
    .split("")
    .map((char) => {
      return alphabet.indexToLetter[
        (alphabet.letterToIndex[char] + deslocamento) % 26
      ];
    })
    .join("");

  const step = 360 / 26;

  function getGradient(activeIndex: number) {
    return `conic-gradient(
      ${ALPHABET_ARRAY.map((_, i) => {
        const start = (i * step) - (step / 2);
        const end = start + step;

        return i === activeIndex
          ? `rgba(5, 67, 205, 0.25) ${start}deg ${end}deg`
          : `rgb(255, 255, 255) ${start}deg ${end}deg`;
      }).join(",")}
    )`;
  }

  return (
    <div className="flex flex-col w-full h-[calc(100vh-90px)]">
      <SidePageTitle title={"Criptografia"} href={"/criptografia/parametros"} />
      <MainPageTitle title="Cifra de deslocamento" noMargin />

      <div className="flex flex-row items-center justify-between font-title w-[85%] 2xl:w-[60%] mx-auto h-full">
        {/* Roda externa */}
        <div className="flex flex-col gap-4 items-center">
          <div
            className="relative size-100 2xl:size-140 rounded-full border "
            style={{
              background: getGradient(
                alphabet.letterToIndex[result.toUpperCase()[currentStep]] || -1
              ),
            }}
          >
            {/* Linhas */}
            {ALPHABET_ARRAY.map((_, i) => {
              const angle = step * i;
              const offset = step / 2;
              const finalAngle = angle + offset;

              return (
                <div
                  key={`linha-${i}`}
                  className="absolute top-1/2 left-1/2 w-[1px] h-50 2xl:h-70 bg-black origin-bottom"
                  style={{
                    transform: `translate(-50%, -100%) rotate(${finalAngle}deg)`,
                  }}
                />
              );
            })}

            {/* Letras */}
            {ALPHABET_ARRAY.map((item, i) => {
              const angle = step * i;

              return (
                <div
                  key={`texto-${i}`}
                  className="absolute top-1/2 left-1/2"
                  style={{
                    transform: `
                  translate(-50%, -50%)
                  rotate(${angle}deg)
                  translateY(-27vh)
                `,
                  }}
                >
                  <span className="text-base 2xl:text-lg font-bold">{item}</span>
                </div>
              );
            })}

            {/* Roda interna */}
            <div
              className="absolute top-1/2 left-1/2 size-80 2xl:size-115 rounded-full border transition-transform duration-500 ease-out"
              style={{
                transform: `translate(-50%, -50%) rotate(${rotation}deg)`,
                background: getGradient(
                  alphabet.letterToIndex[mensagem.toUpperCase()[currentStep]] ||
                    -1
                ),
              }}
            >
              {/* Linhas */}
              {ALPHABET_ARRAY.map((_, i) => {
                const angle = (360 / 26) * i;
                const offset = 360 / 26 / 2;
                const finalAngle = angle + offset;

                return (
                  <div
                    key={`linha-${i}`}
                    className="absolute top-1/2 left-1/2 w-[1px] h-40 2xl:h-57 bg-black origin-bottom"
                    style={{
                      transform: `translate(-50%, -100%) rotate(${finalAngle}deg)`,
                    }}
                  />
                );
              })}

              {/* Letras */}
              {ALPHABET_ARRAY.map((item, i) => {
                const angle = (360 / 26) * i;

                return (
                  <div
                    key={`texto-${i}`}
                    className="absolute top-1/2 left-1/2"
                    style={{
                      transform: `
                  translate(-50%, -50%)
                  rotate(${angle}deg)
                  translateY(-21vh)
                `,
                    }}
                  >
                    <span className="text-sm 2xl:text-lg font-bold">{item}</span>
                  </div>
                );
              })}

              {/* Centro */}
              <div
                className="absolute top-1/2 left-1/2 size-60 2xl:size-80 rounded-full border bg-gray-300"
                style={{
                  transform: `translate(-50%, -50%)`,
                }}
              />
            </div>
          </div>
          <div className="flex flex-row gap-2 text-base 2xl:text-lg items-center">
            <p>Casas deslocadas =</p>
            <div className="border border-blue rounded-md py-[2px] px-2">
              {casasDeslocadas}
            </div>
          </div>
        </div>

        {/* Deslocamento, mensagem e resultado */}
        <div className="flex flex-col gap-8 items-center h-full justify-between py-6 2xl:h-[80%]">
          <div className="flex flex-col gap-4 items-center">
            {/* Deslocamento */}
            <div className="flex flex-row gap-3 items-center text-xl 2xl:text-2xl">
              <p>Deslocamento =</p>
              <div className="border border-blue rounded-md py-[2px] px-2">
                {deslocamento}
              </div>
            </div>

            {/* Tabela com mensagem e resultado */}
            <div className="border-1 border-black rounded-md overflow-hidden">
              <table className=" text-2xl 2xl:text-3xl">
                <tbody>
                  {/* Mensagem */}
                  <tr>
                    {mensagem.split("").map((char, i) => {
                      return (
                        <td
                          key={`${char}-${i}`}
                          className={`p-3 2xl:p-5 transition ease-in-out border-black border-1 text-black ${
                            currentStep === i && "bg-blue/25"
                          }`}
                        >
                          {char}
                        </td>
                      );
                    })}
                  </tr>

                  {/* Texto cifrado */}
                  <tr>
                    {result.split("").map((char, i) => {
                      return (
                        <td
                          key={`${char}-${i}`}
                          className={`p-3 2xl:p-5 text-blue transition ease-in-out border-black border-1 border-t-2 ${
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
              className="flex flex-row gap-3 text-black text-2xl mx-auto font-bold items-center "
            >
              <p>{mensagem} → </p>
              <div className="border border-blue rounded-md py-1 px-3 text-blue">
                {result}
              </div>
            </motion.div>
          )}

          {/* Botões */}
          <div
            className={`flex flex-row gap-4 items-center mx-auto mt-8 mb-5 justify-end`}
          >
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
                  text={currentStep == -1 ? "Iniciar" : "Repetir"}
                  onClick={reset}
                />
                <Button
                  text="Explicação"
                  onClick={() => {
                    setShowExplanation(true);
                  }}
                />
              </>
            )}
          </div>
        </div>
      </div>

      <TextualExplanation
        explanation={explanations.criptografia.deslocamento}
        onClose={() => {
          setShowExplanation(false);
        }}
        isOpen={showExplanation}
      />
    </div>
  );
}
