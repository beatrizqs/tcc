"use client";

import MainPageTitle from "@/components/MainPageTitle";
import SidePageTitle from "@/components/SidePageTitle";
import TextualExplanation from "@/components/TextualExplanation";
import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import Button from "@/components/Button";
import { explanations } from "@/utils/explanations";

type Step = {
  id: number;
  value: number;
  result: number;
  remainder: number;
};

export default function DecimalBinario() {
  const searchParams = useSearchParams();
  const number = searchParams.get("number") || "0";

  // Animation control
  const [currentStep, setCurrentStep] = useState<Step>();
  const [visibleDigits, setVisibleDigits] = useState(0); // Result digits
  const [highlight, setHighlight] = useState<"value" | "result" | undefined>(); // Highlights result -> value of the next calculation
  const [currentValue, setCurrentValue] = useState(parseInt(number)); // Result of the division, will be the dividend on the next
  const [animationSession, setAnimationSession] = useState(0); // Differentiate between sessions to avoid reverse animations (layoutId) when restarting
  const [showCurrentRemainder, setShowCurrentRemainder] = useState(false);

  // Buttons
  const [showExplanation, setShowExplanation] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  // Refs
  const pauseRef = useRef(false);
  const animationIdRef = useRef(0);

  const steps = useMemo(() => {
    const result: Step[] = [];

    let currentValue = parseInt(number);
    let index = 0;

    while (currentValue > 0) {
      const nextValue = Math.floor(currentValue / 2);

      result.push({
        id: index,
        value: currentValue,
        result: nextValue,
        remainder: currentValue % 2,
      });

      currentValue = nextValue;
      index++;
    }

    return result;
  }, [number]);

  const result = useMemo(() => {
    return steps
      .map((step) => step.remainder)
      .reverse()
      .join("");
  }, [steps]);

  const reset = () => {
    setCurrentStep(undefined);
    setCurrentValue(parseInt(number));
    setVisibleDigits(0);
    setHighlight(undefined);
    setIsPaused(false);
    setShowCurrentRemainder(false);
    runAnimation();
  };

  const finish = () => {
    setCurrentStep(steps.at(-1));
    setCurrentValue(0);
    setVisibleDigits(result.length);
    setHighlight(undefined);
    setShowCurrentRemainder(false);
    setIsRunning(false);
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
    setAnimationSession(id);

    try {
      setIsRunning(true);
      if (id !== animationIdRef.current) return;
      await waitStep(300, id);

      for (let i = 0; i < steps.length; i++) {
        setCurrentStep(steps[i]);
        if (i > 0) setHighlight("value");
        await waitStep(1000, id);

        setHighlight(undefined);
        await waitStep(700, id);

        setHighlight("result");
        await waitStep(500, id);

        setShowCurrentRemainder(true);
        await waitStep(500, id);

        setCurrentValue(steps[i].result);
        await waitStep(1000, id);

        setVisibleDigits((prev) => prev + 1);
        setShowCurrentRemainder(false);
        await waitStep(1800, id);
      }

      setIsRunning(false);
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
    <div className="flex flex-col w-full h-[calc(100vh-90px)]">
      <SidePageTitle title={"Bases numéricas"} href={"/number-bases/params"} />
      <MainPageTitle title="Decimal → Binário" noMargin />

      <div className="flex flex-col items-center justify-center  w-full overflow-y-auto flex-1 py-10 2xl:py-20 font-title ">
        {/* Operations */}
        <div className="border-1 border-black rounded-md">
          <table className=" text-xl 2xl:text-2xl w-full">
            <tbody>
              {/* Headers */}
              <tr>
                {["Divisão", "Resto"].map((header, i) => {
                  return (
                    <td
                      key={`${header}-${i}`}
                      className={`p-3 border-black border-1 text-blue text-center font-semibold w-[300px]
                        `}
                    >
                      {header}
                    </td>
                  );
                })}
              </tr>

              {/* Calculation and remainder */}
              <tr>
                {/* Division */}
                <td className="p-3 border-black border-1 border-t-2 text-black text-center">
                  <div className="h-[40px] overflow-hidden flex items-center justify-center">
                    <AnimatePresence mode="wait">
                      {currentStep && (
                        <motion.div
                          key={`division-${currentStep.id}`}
                          initial={{ y: 30, opacity: 0 }}
                          animate={{ y: 0, opacity: 1 }}
                          exit={{ y: -30, opacity: 0 }}
                          transition={{
                            duration: 0.4,
                            ease: "easeInOut",
                          }}
                          className="flex flex-row items-center justify-center gap-2"
                        >
                          <motion.div
                            transition={{
                              duration: 0.4,
                              ease: "easeOut",
                            }}
                            className={`transition-colors duration-300 ${
                              highlight === "value" ? "text-blue" : ""
                            }`}
                          >
                            {currentStep.value}
                          </motion.div>
                          ÷ 2 =
                          <motion.div
                            transition={{
                              duration: 0.4,
                              ease: "easeOut",
                            }}
                            className={`transition-colors duration-300 ${
                              highlight === "result" ? "text-blue" : ""
                            }`}
                          >
                            {currentStep.result}
                          </motion.div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </td>

                {/* Remainder */}
                <td className="p-3 border-black border-1 border-t-2 text-black text-center">
                  <div className="h-[40px] overflow-hidden flex items-center justify-center">
                    <AnimatePresence mode="wait">
                      {currentStep && (
                        <motion.div
                          key={`remainder-${currentStep.id}`}
                          initial={{ opacity: 0, y: 0 }}
                          animate={
                            currentStep && showCurrentRemainder
                              ? { opacity: 1, y: 0 }
                              : { opacity: 0, y: 0 }
                          }
                          transition={{ duration: 1, ease: "easeOut" }}
                          className="flex items-center justify-center"
                        >
                          <motion.div
                            layoutId={`remainder-${currentStep.id}-${animationSession}`}
                            transition={{
                              duration: 0.4,
                              ease: "easeOut",
                            }}
                            className="z-10"
                          >
                            {currentStep.remainder}
                          </motion.div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Current value */}
        <motion.div className="flex flex-row gap-2 text-base 2xl:text-lg items-center mt-5">
          <p>Valor atual =</p>
          <div className="border border-blue rounded-md py-[2px] px-2 min-w-10 text-center">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentValue}
                initial={{ opacity: 0, y: 3 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -3 }}
                transition={{
                  duration: 0.35,
                  ease: "easeOut",
                }}
              >
                {currentValue}
              </motion.div>
            </AnimatePresence>
          </div>
        </motion.div>

        {/* Result */}
        <motion.div
          key="result"
          layout
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="flex items-center justify-center w-full h-full p-10"
        >
          <motion.div
            layout
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="flex items-center flex-row"
          >
            {/* Initial value */}
            <motion.div
              layout
              transition={{ duration: 0.4, ease: "easeOut" }}
              className="flex flex-row"
            >
              <p className="font-title font-bold text-black text-4xl 2xl:text-6xl place-self-start -mt-1">
                {number}
              </p>
              <p className="font-title font-bold text-black text-lg 2xl:text-xl place-self-end -mb-1">
                10
              </p>
            </motion.div>

            <AnimatePresence mode="wait">
              {currentStep && (
                <motion.div
                  key="final-result"
                  initial={{ opacity: 0, x: -10, scale: 0.95 }}
                  animate={{ opacity: 1, x: 0, scale: 1 }}
                  exit={{ opacity: 0, x: -10, scale: 0.95 }}
                  transition={{
                    duration: 0.4,
                    ease: "easeOut",
                  }}
                  className="flex items-center flex-row h-full"
                >
                  <p className="text-2xl font-semibold mx-3">→</p>
                  {/* Final value */}
                  <div className={`flex flex-row`}>
                    {String(result)
                      .split("")
                      .map(
                        (digit, i) =>
                          i >= result.length - visibleDigits && (
                            <motion.span
                              key={i}
                              layoutId={`remainder-${
                                result.length - 1 - i
                              }-${animationSession}`}
                              transition={{
                                duration: 1,
                                ease: "easeOut",
                              }}
                              className={`font-title font-bold text-blue text-4xl 2xl:text-6xl ${
                                i < result.length - visibleDigits
                                  ? "opacity-0"
                                  : "opacity-100"
                              }`}
                            >
                              {digit}
                            </motion.span>
                          )
                      )}
                    {visibleDigits >= result.length && (
                      <motion.p
                        initial={{ opacity: 0, y: 3 }}
                        animate={
                          visibleDigits >= result.length
                            ? { opacity: 1, y: 0 }
                            : { opacity: 0, y: 3 }
                        }
                        transition={{
                          duration: 0.4,
                          ease: "easeOut",
                          delay: 0.8,
                        }}
                        className={`font-title font-bold text-blue text-lg 2xl:text-xl place-self-end -mb-1`}
                      >
                        2
                      </motion.p>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </motion.div>
      </div>

      {/* Buttons */}
      <div className={`flex flex-row gap-4 items-center mx-auto  mb-5`}>
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
              text={!currentStep ? "Iniciar" : "Repetir"}
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

      <TextualExplanation
        explanation={explanations.numberBases.decimalBinary}
        onClose={() => {
          setShowExplanation(false);
        }}
        isOpen={showExplanation}
      />
    </div>
  );
}
