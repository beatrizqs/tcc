"use client";

import MainPageTitle from "@/components/MainPageTitle";
import SidePageTitle from "@/components/SidePageTitle";
import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import Button from "@/components/Button";
import { alphabet, ALPHABET_ARRAY } from "@/utils/alphabet";
import { explanations } from "@/utils/explanations";
import TextualExplanation from "@/components/TextualExplanation";

export default function Shift() {
  // Animation control
  const [currentStep, setCurrentStep] = useState(-1);

  // Wheel
  const [rotation, setRotation] = useState(0);
  const [shiftedPositions, setShiftedPositions] = useState(0);

  // Result
  const [showResult, setShowResult] = useState(false);
  const [visibleResult, setVisibleResult] = useState(-1);

  // Buttons
  const [showExplanation, setShowExplanation] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  const searchParams = useSearchParams();
  const message = searchParams.get("message")?.toUpperCase() || "";
  const shift = Number(searchParams.get("shift")) || 0;

  // Refs
  const pauseRef = useRef(false);
  const animationIdRef = useRef(0);

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

  const waitStep = async (ms: number, id: number) => {
    await delay(ms);
    await waitIfPaused();

    if (id !== animationIdRef.current) {
      throw new Error("animation-cancelled");
    }
  };

  async function runAnimation() {
    // Avoid overlap of different renders if animation is restarted before finishing
    const id = ++animationIdRef.current;

    try {
      setIsRunning(true);

      for (let i = 0; i <= shift; i++) {
        await waitStep(50, id);

        // Gradative rotation of the alphabet wheel
        setRotation((360 / 26) * i);
        await waitStep(300, id);

        setShiftedPositions(i);
        await waitStep(1000, id);
      }

      for (let i = 0; i < message.length; i++) {
        await waitStep(50, id);

        setCurrentStep(i);

        // Shows output character
        await waitStep(1000, id);
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

  const reset = () => {
    setCurrentStep(-1);
    setShowExplanation(false);
    setIsPaused(false);
    setIsRunning(false);
    setShowResult(false);
    setVisibleResult(-1);
    setRotation(0);
    setShiftedPositions(0);
    runAnimation();
  };

  const finish = () => {
    setVisibleResult(message.length);
    setIsRunning(false);
    setShowResult(true);
    setRotation((360 / 26) * shift);
    setShiftedPositions(shift);
    setCurrentStep(message.length - 1);
  };

  const result = message
    .split("")
    .map((char) => {
      return alphabet.indexToLetter[
        (alphabet.letterToIndex[char] + shift) % 26
      ];
    })
    .join("");

  const step = 360 / 26;

  function getGradient(activeIndex: number) {
    return `conic-gradient(
      ${ALPHABET_ARRAY.map((_, i) => {
        const start = i * step - step / 2;
        const end = start + step;

        return i === activeIndex
          ? `rgba(5, 67, 205, 0.25) ${start}deg ${end}deg`
          : `rgb(255, 255, 255) ${start}deg ${end}deg`;
      }).join(",")}
    )`;
  }

  return (
    <div className="flex flex-col w-full h-[calc(100vh-90px)]">
      <SidePageTitle title={"Criptografia"} href={"/cryptography/params"} />
      <MainPageTitle title="Cifra de deslocamento" noMargin />

      <div className="flex flex-row items-center justify-between font-title w-[85%] 2xl:w-[60%] mx-auto h-full">
        {/* Outter wheel */}
        <div className="flex flex-col gap-4 items-center">
          <div
            className="relative size-100 2xl:size-140 rounded-full border "
            style={{
              background: getGradient(
                alphabet.letterToIndex[result.toUpperCase()[currentStep]] || -1
              ),
            }}
          >
            {/* Lines */}
            {ALPHABET_ARRAY.map((_, i) => {
              const angle = step * i;
              const offset = step / 2;
              const finalAngle = angle + offset;

              return (
                <div
                  key={`line-${i}`}
                  className="absolute top-1/2 left-1/2 w-[1px] h-50 2xl:h-70 bg-black origin-bottom"
                  style={{
                    transform: `translate(-50%, -100%) rotate(${finalAngle}deg)`,
                  }}
                />
              );
            })}

            {/* Letters */}
            {ALPHABET_ARRAY.map((item, i) => {
              const angle = step * i;

              return (
                <div
                  key={`text-${i}`}
                  className="absolute top-1/2 left-1/2"
                  style={{
                    transform: `
                  translate(-50%, -50%)
                  rotate(${angle}deg)
                  translateY(-27vh)
                `,
                  }}
                >
                  <span className="text-base 2xl:text-lg font-bold">
                    {item}
                  </span>
                </div>
              );
            })}

            {/* Inner wheel */}
            <div
              className="absolute top-1/2 left-1/2 size-80 2xl:size-115 rounded-full border transition-transform duration-500 ease-out"
              style={{
                transform: `translate(-50%, -50%) rotate(${rotation}deg)`,
                background: getGradient(
                  alphabet.letterToIndex[message.toUpperCase()[currentStep]] ||
                    -1
                ),
              }}
            >
              {/* Lines */}
              {ALPHABET_ARRAY.map((_, i) => {
                const angle = (360 / 26) * i;
                const offset = 360 / 26 / 2;
                const finalAngle = angle + offset;

                return (
                  <div
                    key={`inner-line-${i}`}
                    className="absolute top-1/2 left-1/2 w-[1px] h-40 2xl:h-57 bg-black origin-bottom"
                    style={{
                      transform: `translate(-50%, -100%) rotate(${finalAngle}deg)`,
                    }}
                  />
                );
              })}

              {/* Letters */}
              {ALPHABET_ARRAY.map((item, i) => {
                const angle = (360 / 26) * i;

                return (
                  <div
                    key={`inner-text-${i}`}
                    className="absolute top-1/2 left-1/2"
                    style={{
                      transform: `
                  translate(-50%, -50%)
                  rotate(${angle}deg)
                  translateY(-21vh)
                `,
                    }}
                  >
                    <span className="text-sm 2xl:text-lg font-bold">
                      {item}
                    </span>
                  </div>
                );
              })}

              {/* Center */}
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
              {shiftedPositions}
            </div>
          </div>
        </div>

        {/* Shift, message and result */}
        <div className="flex flex-col gap-8 items-center h-full justify-between py-6 2xl:h-[80%]">
          <div className="flex flex-col gap-4 items-center">
            {/* Shift */}
            <div className="flex flex-row gap-3 items-center text-xl 2xl:text-2xl">
              <p>Deslocamento =</p>
              <div className="border border-blue rounded-md py-[2px] px-2">
                {shift}
              </div>
            </div>

            {/* Table */}
            <div className="border-1 border-black rounded-md overflow-hidden">
              <table className=" text-2xl 2xl:text-3xl">
                <tbody>
                  {/* Message */}
                  <tr>
                    {message.split("").map((char, i) => {
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

                  {/* Cyphertext */}
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

          {/* Result */}
          {showResult && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3, duration: 0.3 }}
              className="flex flex-row gap-3 text-black text-2xl mx-auto font-bold items-center "
            >
              <p>{message} → </p>
              <div className="border border-blue rounded-md py-1 px-3 text-blue">
                {result}
              </div>
            </motion.div>
          )}

          {/* Buttons */}
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
                {isPaused && <Button text={"Finalizar"} onClick={finish} />}
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
        explanation={explanations.cryptography.shift}
        onClose={() => {
          setShowExplanation(false);
        }}
        isOpen={showExplanation}
      />
    </div>
  );
}
