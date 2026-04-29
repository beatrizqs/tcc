"use client";

import Result from "@/components/bases-numericas/Result";
import Button from "@/components/Button";
import MainPageTitle from "@/components/MainPageTitle";
import SidePageTitle from "@/components/SidePageTitle";
import TextualExplanation from "@/components/TextualExplanation";
import { explanations } from "@/utils/explicacoes";
import { motion } from "framer-motion";
import { useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";

type TableStep = {
  binaryDigit: number;
  power: number;
  decimalValue: number;
};

type CalculationStep = {
  value: string | number;
  isExponential: boolean;
  highlightCorrespondentPower?: number;
};

type Step = {
  tableStep: TableStep | null;
  calculationStep: CalculationStep | null;
  index: number;
};

export default function BinarioDecimal() {
  const [currentStep, setCurrentStep] = useState<Step>();
  const [visiblePowers, setVisiblePowers] = useState(0);
  const [showCalculation, setShowCalculation] = useState(false); // Mostra o cálculo de como é formado o número decimal
  const [showResult, setShowResult] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  const pauseRef = useRef(false);
  const animationIdRef = useRef(0);

  const searchParams = useSearchParams();
  const numero = searchParams.get("numero") || "";

  const decimal = parseInt(numero, 2);

  const steps: Step[] = (() => {
    const result: Step[] = [];
    const size = numero.length - 1;
    let firstActiveBit = true;
    let index = 0;

    // Cria os passos da iteração pelos números na tabela e pela apresentação das potências no cálculo
    for (let i = 0; i < numero.length; i++) {
      const power = size - i;
      const binaryDigit = parseInt(numero[i]);

      const stepTable = {
        binaryDigit,
        power,
        decimalValue: 2 ** power,
      };

      result.push({ tableStep: stepTable, calculationStep: null, index });

      index++;

      if (binaryDigit === 1) {
        if (!firstActiveBit) {
          result.push({
            tableStep: null,
            calculationStep: {
              value: "+",
              isExponential: false,
            },
            index,
          });

          index++;
        }
        result.push({
          tableStep: null,
          calculationStep: {
            value: power,
            isExponential: true,
          },
          index,
        });

        firstActiveBit = false;
        index++;
      }
    }

    result.push({
      tableStep: null,
      calculationStep: {
        value: "=",
        isExponential: false,
      },
      index,
    });

    index++;

    const firstHalf = result;
    const exponentials = firstHalf.filter(
      (step) =>
        step.calculationStep !== null && step.calculationStep.isExponential
    );

    // Cria os passos com as potências calculadas
    for (const step of exponentials) {
      result.push({
        tableStep: null,
        calculationStep: {
          value: 2 ** Number(step.calculationStep!.value),
          isExponential: false,
          highlightCorrespondentPower: step.index,
        },
        index,
      });

      index++;

      if (step.index !== exponentials.at(-1)?.index)
        result.push({
          tableStep: null,
          calculationStep: {
            value: "+",
            isExponential: false,
          },
          index,
        });

      index++;
    }

    result.push({
      tableStep: null,
      calculationStep: {
        value: "=",
        isExponential: false,
      },
      index,
    });

    index++;

    result.push({
      tableStep: null,
      calculationStep: {
        value: decimal,
        isExponential: false,
      },
      index,
    });

    return result;
  })();

  const tableSteps = steps.filter((step) => step.tableStep !== null);
  const calculationSteps = steps.filter(
    (step) => step.calculationStep !== null
  );

  const reset = () => {
    setCurrentStep(undefined);
    setVisiblePowers(0);
    setShowCalculation(false);
    setIsPaused(false);
    setShowResult(false);
    runAnimation();
  };

  const finish = () => {
    setVisiblePowers(steps.length - 1);
    setShowCalculation(true)
    setCurrentStep(steps.at(-1))
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
    await delay(400);

    // Mostra as potências
    for (let i = 0; i < numero.length; i++) {
      await waitIfPaused();
      if (id !== animationIdRef.current) return; // Evita sobreposição de animações ao reiniciar
      setVisiblePowers(i + 1);
      await delay(1000);
    }

    if (id !== animationIdRef.current) return;

    setShowCalculation(true);

    // Leitura da tabela (potências) e exibição do cálculo
    for (let i = 0; i < steps.length; i++) {
      await waitIfPaused();
      if (id !== animationIdRef.current) return;

      setCurrentStep(steps[i]);

      await delay(1000);
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
          title={"Bases numéricas"}
          href={"/bases-numericas/parametros"}
        />
        <MainPageTitle title="Binário → Decimal" noMargin className="mt-5" />

        <div className="flex flex-col  w-full  flex-1 font-title gap-10 my-10 2xl:my-16 2xl:gap-16 items-center">
          {/* Tabela com valor binário e correspondentes potências de dois */}
          <div className="border-1 border-black rounded-md overflow-hidden">
            <table className=" text-2xl 2xl:text-4xl">
              <tbody>
                {/* Binário */}
                <tr>
                  {tableSteps.map((step) => {
                    return (
                      <td
                        key={`${step.tableStep!.binaryDigit}-${step.index}`}
                        className={`p-3 transition-colors duration-300 ease-in-out border-black border-1 text-black text-center 
                         ${
                           currentStep && currentStep?.index >= step.index
                             ? step.tableStep!.binaryDigit === 0
                               ? "delay-300 text-gray-300"
                               : "delay-300 bg-blue/25"
                             : ""
                         }`}
                      >
                        {step.tableStep!.binaryDigit}
                      </td>
                    );
                  })}
                </tr>

                {/* Potências */}
                <tr>
                  {tableSteps.map((step) => {
                    return (
                      <td
                        key={`2-${step.tableStep!.power}-${step.index}`}
                        className={`p-3 transition-colors duration-300 ease-in-out border-black border-1 text-black text-center 
                          ${
                            currentStep && currentStep?.index >= step.index
                              ? step.tableStep!.binaryDigit === 0
                                ? "delay-300 text-gray-300"
                                : "delay-300 bg-blue/25"
                              : ""
                          }`}
                      >
                        <motion.div
                          initial={{ opacity: 0, y: 0 }}
                          animate={
                            visiblePowers >= step.tableStep!.power + 1
                              ? { opacity: 1, y: 0 }
                              : { opacity: 0, y: 0 }
                          }
                          transition={{
                            duration: 0.4,
                            ease: "easeOut",
                          }}
                        >
                          2{" "}
                          <sup className="ml-[-4px]">
                            {step.tableStep!.power}
                          </sup>
                        </motion.div>
                      </td>
                    );
                  })}
                </tr>
              </tbody>
            </table>
          </div>

          <div
            className={`flex flex-row gap-4 font-title text-black font-semibol text-2xl 2xl:text-4xl items-start transition ease-in-out duration-300 ${
              showCalculation ? "opacity-100" : "opacity-0"
            }`}
          >
            {calculationSteps.map((step, i) => {
              return (
                <motion.div
                  key={`calculation-${step.index}`}
                  initial={{ opacity: 0, y: 3 }}
                  animate={
                    currentStep && currentStep.index >= step.index
                      ? { opacity: 1, y: 0 }
                      : { opacity: 0, y: 3 }
                  }
                  transition={{ duration: 0.4, ease: "easeOut" }}
                >
                  {step.calculationStep!.isExponential ? (
                    <p
                      className={`${
                        currentStep &&
                        currentStep.calculationStep
                          ?.highlightCorrespondentPower === step.index &&
                        "text-blue"
                      }`}
                    >
                      2{" "}
                      <sup className="ml-[-4px]">
                        {step.calculationStep!.value}
                      </sup>
                    </p>
                  ) : (
                    <p
                      className={`${
                        i === calculationSteps.length - 1 && "text-blue"
                      }`}
                    >
                      {step.calculationStep!.value}
                    </p>
                  )}
                </motion.div>
              );
            })}
          </div>

          {/* Resultado */}
          {showResult && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1, duration: 0.3 }}
              className="flex flex-row gap-3 text-black text-2xl mx-auto font-title font-bold items-center "
            >
              <Result
                orientation="row"
                initialValue={{ value: parseInt(numero), base: "2" }}
                finalValue={{ value: decimal, base: "10" }}
              />
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
        </div>
      </div>

      <TextualExplanation
        explanation={explanations.bases_numericas.binario_decimal}
        onClose={() => {
          setShowExplanation(false);
        }}
        isOpen={showExplanation}
      />
    </div>
  );
}
