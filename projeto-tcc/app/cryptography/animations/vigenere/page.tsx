"use client";

import MainPageTitle from "@/components/MainPageTitle";
import SidePageTitle from "@/components/SidePageTitle";
import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import Button from "@/components/Button";
import { alphabet, ALPHABET_ARRAY } from "@/utils/alphabet";
import { AnimatePresence, motion } from "framer-motion";
import TextualExplanation from "@/components/TextualExplanation";
import { explanations } from "@/utils/explanations";

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
  // Animation control
  const [currentStep, setCurrentStep] = useState<Step>();
  const [visibleResult, setVisibleResult] = useState(-1);
  const [showResult, setShowResult] = useState(false);

  // Buttons
  const [showExplanation, setShowExplanation] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  // Refs
  const pauseRef = useRef(false);
  const animationIdRef = useRef(0);

  const formatKey = (key: string, size: number) => {
    // Repeats key characters until it has the same length as the message
    let result = "";

    for (let i = 0; i < size; i++) {
      result += key[i % key.length];
    }

    return result;
  };

  const searchParams = useSearchParams();
  const message = searchParams.get("message")?.toUpperCase() || "";
  const key = searchParams.get("key")?.toUpperCase() || "";
  const formattedKey = formatKey(key, message.length);

  const steps: Step[] = (() => {
    const result: Step[] = [];

    for (let i = 0; i < message.length; i++) {
      const plaintextChar = message[i];
      const keyChar = formattedKey[i];
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

  const cyphertext = steps.map((s) => s.ciphertext.value).join("");

  const reset = () => {
    setCurrentStep(undefined);
    setIsPaused(false);
    setShowResult(false);
    setVisibleResult(-1);
    runAnimation();
  };

  const finish = () => {
    setVisibleResult(steps.length - 1);
    setIsRunning(false);
    setShowResult(true);
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

  const waitStep = async (ms: number, id: number) => {
    await delay(ms);
    await waitIfPaused();

    if (id !== animationIdRef.current) {
      throw new Error("animation-cancelled");
    }
  };

  useEffect(() => {
    pauseRef.current = isPaused;
  }, [isPaused]);

  async function runAnimation() {
    // Avoid overlap of different renders if animation is restarted before finishing
    const id = ++animationIdRef.current;

    try {
      for (let i = 0; i < steps.length; i++) {
        setIsRunning(true);

        await waitStep(50, id);

        setCurrentStep(steps[i]);

        await waitStep(1000, id);

        // Shows output char
        setVisibleResult(i);

        await waitStep(800, id);
      }
      setIsRunning(false);
      setShowResult(true);
    } catch (error) {
      if ((error as Error).message !== "animation-cancelled") {
        console.error(error);
      }
    }
  }

  const delay = (ms: number) => {
    return new Promise((resolve) => setTimeout(resolve, ms));
  };
  return (
    <div className="flex flex-col w-full h-[calc(100vh-100px)] text-black">
      <div className="grid grid-cols-2">
        <div className="flex flex-col">
          <SidePageTitle title={"Criptografia"} href={"/cryptography/params"} />
          <MainPageTitle title="Cifra de Vigenère" noMargin className="mt-5" />

          <motion.div
            initial={{ opacity: 0 }}
            animate={isRunning || currentStep ? { opacity: 1 } : { opacity: 0 }}
            className="flex flex-col  w-full overflow-y-auto flex-1 font-title"
          >
            {/* Message cryptography */}
            <div className="flex flex-col gap-4 text-2xl mx-auto text-blue font-title font-bold items-center my-10">
              {/* Key */}
              <div className="flex flex-row gap-3 items-center">
                <p>Chave =</p>
                <div className="border border-blue rounded-md py-[2px] px-2">
                  {key}
                </div>
              </div>

              {/* Table containing message, expanded key and result */}
              <div className="border-1 border-black rounded-md overflow-hidden">
                <table className=" text-2xl">
                  <tbody>
                    {/* Message */}
                    <tr>
                      {message.split("").map((char, i) => {
                        return (
                          <td
                            key={`${char}-${i}`}
                            className={`p-3 transition ease-in-out border-black border-1 text-black ${
                              currentStep?.index === i &&
                              isRunning &&
                              "bg-blue/25"
                            }`}
                          >
                            {char}
                          </td>
                        );
                      })}
                    </tr>

                    {/* Key */}
                    <tr>
                      {formattedKey.split("").map((char, i) => {
                        return (
                          <td
                            key={`${char}-${i}`}
                            className={`p-3 transition ease-in-out border-black border-1 text-black ${
                              currentStep?.index === i &&
                              isRunning &&
                              "bg-blue/25"
                            }`}
                          >
                            {char}
                          </td>
                        );
                      })}
                    </tr>

                    {/* Cyphertext */}
                    <tr>
                      {cyphertext.split("").map((char, i) => {
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

            {/* Result */}
            {showResult && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3, duration: 0.3 }}
                className="flex flex-row gap-3 text-black text-2xl mx-auto font-title font-bold items-center "
              >
                <p>{message} → </p>
                <div className="border border-blue rounded-md py-1 px-3 text-blue">
                  {cyphertext}
                </div>
              </motion.div>
            )}
          </motion.div>

          {/* Buttons */}
          <motion.div
            layout
            transition={{
              duration: 0.4,
              ease: "easeOut",
            }}
            className="flex flex-row gap-4 items-center mx-auto mt-8 mb-5"
          >
            <AnimatePresence>
              {isRunning ? (
                <>
                  <motion.div
                    layout
                    key="pause"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{
                      duration: 0.3,
                      ease: "easeOut",
                    }}
                  >
                    <Button
                      text={isPaused ? "Continuar" : "Pausar"}
                      onClick={() => setIsPaused((p) => !p)}
                    />
                  </motion.div>

                  {isPaused && (
                    <motion.div
                      layout
                      key="restart"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{
                        duration: 0.3,
                        ease: "easeOut",
                      }}
                      style={{ overflow: "hidden" }}
                    >
                      <Button text="Reiniciar" onClick={reset} />
                    </motion.div>
                  )}

                  {isPaused && (
                    <motion.div
                      layout
                      key="finish"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{
                        duration: 0.3,
                        ease: "easeOut",
                      }}
                      style={{ overflow: "hidden" }}
                    >
                      <Button text="Finalizar" onClick={finish} />
                    </motion.div>
                  )}
                </>
              ) : (
                <>
                  <motion.div
                    layout
                    key="start"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{
                      duration: 0.3,
                      ease: "easeOut",
                    }}
                  >
                    <Button
                      text={!currentStep ? "Iniciar" : "Repetir"}
                      onClick={reset}
                    />
                  </motion.div>

                  <motion.div
                    layout
                    key="explanation"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{
                      duration: 0.3,
                      ease: "easeOut",
                    }}
                  >
                    <Button
                      text="Explicação"
                      onClick={() => {
                        setShowExplanation(true);
                      }}
                    />
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
        {/* Vigenère table */}
        <div className="flex flex-col items-center gap-1 font-title justify-center mt-2 2xl:mt-10">
          <div className="text-sm font-semibold">MENSAGEM</div>

          <div className="flex items-center gap-1 font-title">
            <div className="-rotate-90 text-sm whitespace-nowrap font-semibold">
              CHAVE
            </div>

            {/* Matrix */}
            <table className="border-collapse text-[12px] 2xl:text-base">
              <thead>
                <tr>
                  <th className="size-[20px] 2xl:size-7"></th>

                  {ALPHABET_ARRAY.map((char, i) => (
                    <th
                      className={`size-[20px] 2xl:size-7 text-center text-black transition ease-in-out delay-100 ${
                        currentStep?.plaintext.index === i &&
                        isRunning &&
                        "text-blue"
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
                      className={`size-[20px] 2xl:size-7 text-center text-black transition ease-in-out delay-100 ${
                        currentStep?.key.index === i && isRunning && "text-blue"
                      }`}
                    >
                      {row}
                    </th>

                    {ALPHABET_ARRAY.map((_, j) => (
                      <td
                        className={`text-center text-black transition ease-in-out delay-100 border-1 border-black ${
                          (currentStep?.key.index === i ||
                            currentStep?.plaintext.index === j) &&
                          isRunning &&
                          "bg-blue/25"
                        } ${
                          currentStep?.key.index === i &&
                          currentStep?.plaintext.index === j &&
                          isRunning &&
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
        explanation={explanations.cryptography.vigenere}
        onClose={() => {
          setShowExplanation(false);
        }}
        isOpen={showExplanation}
      />
    </div>
  );
}
