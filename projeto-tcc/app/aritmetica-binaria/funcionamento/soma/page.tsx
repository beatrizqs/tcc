"use client";

import Button from "@/components/Button";
import MainPageTitle from "@/components/MainPageTitle";
import SidePageTitle from "@/components/SidePageTitle";
import TextualExplanation from "@/components/TextualExplanation";
import { explanations } from "@/utils/explicacoes";
import { motion } from "framer-motion";
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

export default function Soma() {
  const [currentStep, setCurrentStep] = useState<Step>();
  const [highlighted, setHighlighted] = useState<{
    upper: boolean;
    lower: boolean;
  }>({ upper: false, lower: false }); // Destaca cada componente da soma
  const [highlightedRule, setHighlightedRule] = useState("-1"); // Destaca qual regra de soma de bits se aplica para o step atual
  const [showSum, setShowSum] = useState(false); // Exibe a soma da coluna
  const [carry, setCarry] = useState<Carry>(); // Gerencia a animação do carry
  const [showResult, setShowResult] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);
  const [showRules, setShowRules] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  const pauseRef = useRef(false);
  const animationIdRef = useRef(0);

  const searchParams = useSearchParams();
  const valor1 = searchParams.get("valor1") || "";
  const valor2 = searchParams.get("valor2") || "";

  let longerValue, shorterValue;
  if (valor1.length >= valor2.length) {
    longerValue = valor1;
    shorterValue = valor2;
  } else {
    longerValue = valor2;
    shorterValue = valor1;
  }

  const steps: Step[] = (() => {
    const result: Step[] = [];

    // Deixa os dois valores com o mesmo comprimento
    const diff = longerValue.length - shorterValue.length;
    shorterValue = "0".repeat(diff) + shorterValue;

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

  const reversedSteps = [...steps].reverse(); // Steps está ordenado de forma cronológica de operações; inverte-se para poder renderizar corretamente na tabela

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

  useEffect(() => {
    pauseRef.current = isPaused;
  }, [isPaused]);

  async function runAnimation() {
    const id = ++animationIdRef.current;

    setIsRunning(true);

    for (let i = 0; i < steps.length; i++) {
      await waitIfPaused();
      if (id !== animationIdRef.current) return;

      setShowSum(false);

      setCurrentStep(steps[i]);

      if (steps[i].carry)
        setCarry({ originIndex: steps[i].index, render: "bottom" });
      await delay(600);

      if (steps[i].receivesCarry) {
        await delay(600);
      }
      await waitIfPaused();

      if (steps[i].index > -1) {
        setHighlighted((prev) => ({ ...prev, upper: true }));
        await delay(300);
        setHighlightedRule(steps[i].result);
        await delay(600);
        await waitIfPaused();

        setHighlighted((prev) => ({ ...prev, lower: true }));
        await delay(1000);
        await waitIfPaused();
      }

      setShowSum(true);
      await delay(600);
      await waitIfPaused();

      if (steps[i].carry) {
        setCarry({ originIndex: steps[i].index, render: "top" });
        await delay(800);
      }

      setHighlighted({ upper: false, lower: false }); // Limpa os destaques
      setHighlightedRule("");
    }

    if (id !== animationIdRef.current) return;

    setIsRunning(false);
    setShowResult(true);
  }

  const delay = (ms: number) => {
    return new Promise((resolve) => setTimeout(resolve, ms));
  };

  return (
    <div className="flex flex-col w-full h-[calc(100vh-100px)]">
      <div className="flex flex-col">
        <SidePageTitle
          title={"Aritmética binária"}
          href={"/aritmetica-binaria/parametros"}
        />
        <MainPageTitle title="Soma binária" noMargin className="mt-5" />

        <div className="flex flex-col  w-full  flex-1 font-title gap-10 my-10 2xl:my-16 2xl:gap-16 items-center">
          <div className="flex relative items-center w-full gap-5">
            {/* Soma */}
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
                {/* Tabela de soma */}
                <div className="border-1 border-black rounded-md ">
                  <table className=" text-2xl 2xl:text-4xl">
                    <tbody>
                      {/* Valor #1 */}
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

                      {/* Valor #2 */}
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

                      {/* Somas */}
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
                                  currentStep.index === step.index && (
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

            {/* Tabela de regras */}
            {showRules && (
              <div className="lg:flex flex-col hidden border-1 border-blue rounded py-3 px-5 2xl:px-7 2xl:py-5  text-center  w-fit absolute 2xl:right-1/4 md:right-16 top-1/2 -translate-y-1/2">
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
              </div>
            )}
          </div>

          {/* Resultado */}
          {showResult && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3, duration: 0.3 }}
              className="flex flex-row gap-3 text-black text-2xl 2xl:text-4xl mx-auto font-title font-bold items-center "
            >
              <p>
                {valor1} + {valor2} ={" "}
              </p>
              <div className="border border-blue rounded-md py-1 px-3 text-blue">
                {(parseInt(valor1, 2) + parseInt(valor2, 2)).toString(2)}
              </div>
            </motion.div>
          )}
        </div>

        {/* Botões */}
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
          <Button
            text={`${showRules ? "Esconder" : "Mostrar"} regras de cálculo`}
            onClick={() => {
              setShowRules(!showRules);
            }}
          />
        </div>
      </div>

      <TextualExplanation
        explanation={explanations.aritmeticaBinaria.soma}
        onClose={() => {
          setShowExplanation(false);
        }}
        isOpen={showExplanation}
      />
    </div>
  );
}
