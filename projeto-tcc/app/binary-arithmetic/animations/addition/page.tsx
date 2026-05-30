"use client";

import Button from "@/components/Button";
import MainPageTitle from "@/components/MainPageTitle";
import SidePageTitle from "@/components/SidePageTitle";
import TextualExplanation from "@/components/TextualExplanation";
import { explanations } from "@/utils/explanations";
import { AnimatePresence, motion } from "framer-motion";
import { useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";

type Step = {
  index: number;
  upperValue: string;
  lowerValue: string;
  result: string;
  carry: boolean;
  receivesCarry: boolean;
};

type Carry = {
  originIndex: number;
  render: "bottom" | "top";
};

const RULES = {
  "0": "0 + 0 = 0",
  "1": "1 + 0 = 1",
  "10": "1 + 1 = 10",
  "11": "1 + 1 + Carry = 11",
};

export default function Addition() {
  // Sum
  const [currentStep, setCurrentStep] = useState<Step>();
  const [highlighted, setHighlighted] = useState<{
    upper: boolean;
    lower: boolean;
  }>({ upper: false, lower: false }); // Highlights each step of the operation
  const [highlightedRule, setHighlightedRule] = useState("-1"); // Highlights which bit addition rule is being applied
  const [showSum, setShowSum] = useState(false); // Shows columns's sum
  const [carry, setCarry] = useState<Carry>(); // Manages carry's animation
  const [showRules, setShowRules] = useState(false);

  // Result
  const [showResult, setShowResult] = useState(false);

  // Buttons
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);

  // Refs
  const pauseRef = useRef(false);
  const animationIdRef = useRef(0);

  const searchParams = useSearchParams();
  const value1 = searchParams.get("value1") || "";
  const value2 = searchParams.get("value2") || "";

  let longerValue, shorterValue;

  if (value1.length >= value2.length) {
    longerValue = value1;
    shorterValue = value2;
  } else {
    longerValue = value2;
    shorterValue = value1;
  }

  const steps: Step[] = (() => {
    const result: Step[] = [];

    // Makes both values have the same length
    shorterValue = shorterValue.padStart(longerValue.length, "0");

    let carry = 0;

    for (let i = longerValue.length - 1; i >= 0; i--) {
      const sum = Number(longerValue[i]) + Number(shorterValue[i]) + carry;
      const step = {
        index: i,
        upperValue: longerValue[i],
        lowerValue: shorterValue[i],
        result: sum.toString(2),
        carry: sum >= 2,
        receivesCarry: !!carry,
      };

      carry = sum >= 2 ? 1 : 0;

      result.push(step);
    }

    if (carry) {
      const step = {
        index: -1,
        upperValue: "",
        lowerValue: "",
        result: "1",
        carry: false,
        receivesCarry: true,
      };

      result.push(step);
    }

    return result;
  })();

  const reversedSteps = [...steps].reverse(); // Steps are ordered chronologically by operations; they are reversed to render correctly in the table

  const reset = () => {
    setCurrentStep(undefined);
    setHighlighted({ upper: false, lower: false });
    setHighlightedRule("-1");
    setShowSum(false);
    setCarry(undefined);
    setIsPaused(false);
    setShowResult(false);
    runAnimation();
  };

  const finish = () => {
    setCurrentStep(steps.at(-1));
    setShowSum(true);
    setHighlighted({ upper: false, lower: false });
    const lastCarry = steps.findLast((item) => item.receivesCarry);
    setCarry(
      lastCarry ? { originIndex: lastCarry?.index, render: "top" } : undefined
    );
    setHighlightedRule("-1");
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
      setIsRunning(true);

      for (let i = 0; i < steps.length; i++) {
        await waitStep(50, id);

        setShowSum(false);

        setCurrentStep(steps[i]);

        // Sets extra bit to be shown at the bottom of the current column
        if (steps[i].carry)
          setCarry({ originIndex: steps[i].index, render: "bottom" });
        await waitStep(600, id);

        if (steps[i].receivesCarry) {
          await waitStep(600, id);
        }

        // Highlights each step of the column's sum
        if (steps[i].index > -1) {
          setHighlighted((prev) => ({ ...prev, upper: true }));
          await waitStep(300, id);

          // Highlights current rule
          setHighlightedRule(steps[i].result);
          await waitStep(600, id);

          setHighlighted((prev) => ({ ...prev, lower: true }));
          await waitStep(1000, id);
        }

        setShowSum(true);
        await waitStep(600, id);

        // Sets extra bit to be shown at the top of the next column
        if (steps[i].carry) {
          setCarry({ originIndex: steps[i].index, render: "top" });
          await waitStep(800, id);
        }

        setHighlighted({ upper: false, lower: false }); // Clears highlights
        setHighlightedRule("");
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
    <div className="flex flex-col w-full h-[calc(100vh-100px)]">
      <div className="flex flex-col">
        <SidePageTitle
          title={"Aritmética binária"}
          href={"/binary-arithmetic/params"}
        />
        <MainPageTitle title="Soma binária" noMargin className="mt-5" />

        <div className="flex flex-col  w-full  flex-1 font-title gap-10 my-10 2xl:my-16 2xl:gap-16 items-center">
          <div className="flex relative items-center w-full gap-5">
            {/* Sum */}
            <div className="flex flex-row items-center gap-8 w-full justify-center mt-5 mr-10">
              <h2 className="mb-10 text-4xl font-bold text-black">+</h2>

              <div className="relative">
                {/* Carry */}
                <div
                  className="absolute -top-10 left-0 w-full grid"
                  style={{
                    gridTemplateColumns: `repeat(${reversedSteps.length}, 1fr)`,
                  }}
                >
                  {reversedSteps.map((step, i) => (
                    <div key={i} className="flex justify-center">
                      {step.receivesCarry &&
                        ((carry &&
                          carry.originIndex === step.index + 1 &&
                          carry.render === "top") ||
                          (carry && carry?.originIndex <= step.index)) && (
                          <motion.div
                            layoutId={`carry-${step.index + 1}`}
                            className={`text-blue text-2xl z-10`}
                          >
                            1
                          </motion.div>
                        )}
                    </div>
                  ))}
                </div>

                {/* Sum table */}
                <div className="border-1 border-black rounded-md ">
                  <table className=" text-2xl 2xl:text-4xl">
                    <tbody>
                      {/* Value #1 */}
                      <tr>
                        {reversedSteps.map((step, i) => {
                          return (
                            <td
                              key={`${step.upperValue}-${i}-upper`}
                              className={`p-3 transition-colors duration-300 ease-in-out border-black border-1 text-black text-center w-16 
                         ${
                           currentStep &&
                           currentStep?.index === step.index &&
                           highlighted.upper &&
                           step.index > -1 &&
                           "delay-300 bg-blue/25"
                         }`}
                            >
                              {step.upperValue}
                            </td>
                          );
                        })}
                      </tr>

                      {/* Value #2 */}
                      <tr>
                        {reversedSteps.map((step, i) => {
                          return (
                            <td
                              key={`${step.lowerValue}-${i}-lower`}
                              className={`p-3 transition-colors duration-300 ease-in-out border-black border-1 text-black text-center 
                          ${
                            currentStep &&
                            currentStep?.index === step.index &&
                            highlighted.lower &&
                            step.index > -1 &&
                            "delay-600 bg-blue/25"
                          }`}
                            >
                              {step.lowerValue}
                            </td>
                          );
                        })}
                      </tr>

                      {/* Sums */}
                      <tr>
                        {reversedSteps.map((step, i) => {
                          return (
                            <td
                              key={`${step.result}-${i}-sum`}
                              className={`p-3 transition-colors duration-300 ease-in-out border-black border-1 border-t-2 text-black text-center 
                         `}
                            >
                              <motion.div
                                layout
                                key={`sum-${step.index}`}
                                initial={{ opacity: 0, y: 3 }}
                                animate={
                                  (showSum &&
                                    currentStep &&
                                    currentStep.index <= step.index) ||
                                  (currentStep &&
                                    currentStep.index < step.index)
                                    ? { opacity: 1, y: 0 }
                                    : { opacity: 0, y: 3 }
                                }
                                transition={{ duration: 0.4, ease: "easeOut" }}
                                className="flex flex-row items-center justify-center gap-0"
                              >
                                {step.result.length === 2 &&
                                  currentStep &&
                                  currentStep.index === step.index &&
                                  (!carry ||
                                    carry.originIndex !== step.index ||
                                    carry.render !== "top") && (
                                    <motion.div
                                      layoutId={`carry-${step.index}`}
                                      transition={{
                                        duration: 0.4,
                                        ease: "easeOut",
                                      }}
                                      className="z-10"
                                    >
                                      {step.result[0]}
                                    </motion.div>
                                  )}
                                <motion.span layout>
                                  {step.result.at(-1)}
                                </motion.span>
                              </motion.div>
                            </td>
                          );
                        })}
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Rules table */}
            <motion.div
              initial={{ opacity: 0, y: 3 }}
              animate={showRules ? { opacity: 1, y: 0 } : { opacity: 0, y: 3 }}
              transition={{ duration: 0.3 }}
              className="lg:flex flex-col hidden border-1 border-blue rounded py-3 px-5 2xl:px-7 2xl:py-5  text-center  w-fit absolute 2xl:right-1/4 md:right-16 top-1/2 -translate-y-1/2"
            >
              <p className="text-xl 2xl:text-2xl text-blue font-semibold mb-5 font-title">
                Regras de cálculo
              </p>
              <div className="flex flex-col gap-3">
                {Object.entries(RULES).map(([key, value]) => (
                  <div
                    key={key}
                    className={`border border-blue rounded-md ${
                      highlightedRule === key && "bg-blue text-white"
                    } transition ease-in-out duration-300 flex flex-row  w-fit px-2 py-1  my-1 text-lg 2xl:text-xl items-center mx-auto tracking-widest`}
                  >
                    {value}
                  </div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Result */}
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={showResult ? { opacity: 1, x: 0 } : { opacity: 0, x: -10 }}
            transition={{ delay: 0.3, duration: 0.3 }}
            className="flex flex-row gap-3 text-black text-2xl 2xl:text-4xl mx-auto font-title font-bold items-center "
          >
            <p>
              {value1} + {value2} ={" "}
            </p>
            <div className="border border-blue rounded-md py-1 px-3 text-blue">
              {(parseInt(value1, 2) + parseInt(value2, 2)).toString(2)}
            </div>
          </motion.div>
        </div>

        {/* Buttons */}
        <motion.div
          layout
          transition={{
            duration: 0.4,
            ease: "easeOut",
          }}
          className="flex flex-row gap-4 items-center mx-auto mb-5"
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
            <motion.div
              layout
              key="rules"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{
                duration: 0.3,
                ease: "easeOut",
              }}
            >
              <Button
                text={
                  showRules
                    ? "Esconder regras de cálculo"
                    : "Mostrar regras de cálculo"
                }
                onClick={() => {
                  setShowRules(!showRules);
                }}
              />
            </motion.div>
          </AnimatePresence>
        </motion.div>
      </div>

      <TextualExplanation
        explanation={explanations.binaryArithmetic.addition}
        onClose={() => {
          setShowExplanation(false);
        }}
        isOpen={showExplanation}
      />
    </div>
  );
}
