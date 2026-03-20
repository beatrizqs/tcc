"use client";

import Result from "@/components/bases-numericas/Result";
import MainPageTitle from "@/components/MainPageTitle";
import SidePageTitle from "@/components/SidePageTitle";
import TextualExplanation from "@/components/TextualExplanation";
import { BASES } from "@/utils/bases";
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import Button from "@/components/Button";

type Step = {
  value: number;
  result: number;
  rest: number;
};

export default function DecimalBinario() {
  const [currentStep, setCurrentStep] = useState(0); // Cálculo atual
  const [visibleTokens, setVisibleTokens] = useState(1); // Elementos já renderizados da linha atual
  const [isRunning, setIsRunning] = useState(false);
  const [waitingRest, setWaitingRest] = useState(false); // Aguarda o resto ser exibido na tela para poder renderizar a próxima linha

  const searchParams = useSearchParams();
  const numero = searchParams.get("numero") || "0";

  const steps = useMemo(() => {
    const result: Step[] = [];

    let currentValue = parseInt(numero);

    while (currentValue > 0) {
      const nextValue = Math.floor(currentValue / 2);

      result.push({
        value: currentValue,
        result: nextValue,
        rest: currentValue % 2,
      });

      currentValue = nextValue;
    }

    return result;
  }, [numero]);

  const reset = () => {
    setCurrentStep(0);
    setVisibleTokens(1);
    setWaitingRest(false);
    setIsRunning(true);
  };

  useEffect(() => {
    if (!isRunning) return;

    const timer = setTimeout(() => {
      const tokensPerLine = 5;

      if (visibleTokens < tokensPerLine) {
        setVisibleTokens((t) => t + 1);
      } else if (!waitingRest) {
        setWaitingRest(true);
      } else {
        if (currentStep < steps.length - 1) {
          setCurrentStep((s) => s + 1);
          setVisibleTokens(1);
          setWaitingRest(false);
        } else {
          setIsRunning(false);
        }
      }
    }, 600);

    return () => clearTimeout(timer);
  }, [visibleTokens, currentStep, steps.length, isRunning, waitingRest]);
  return (
    <div className="flex flex-col w-full h-[calc(100vh-90px)]">
      <SidePageTitle
        title={"Bases numéricas"}
        href={"/bases-numericas/parametros"}
      />
      <MainPageTitle title="Decimal → Binário" noMargin />

      <div className="flex flex-row w-full overflow-y-auto">
        {/* Operações */}
        <div className="flex flex-col gap-6 text-2xl p-10 font-semibold text-xl font-title">
          {(isRunning || currentStep > 0) &&
            steps.slice(0, currentStep + 1).map((step, index) => {
              const tokens = [step.value, "÷", 2, "=", step.result];

              const tokensToShow =
                index === currentStep ? visibleTokens : tokens.length;

              const resultAlreadyVisible = tokensToShow >= tokens.length;

              return (
                <div
                  className="grid grid-cols-2 w-[350px] gap-4"
                  key={`divisions-${index}`}
                >
                  <div key={index} className="flex gap-4 items-center">
                    {/* Operação */}
                    {tokens.slice(0, tokensToShow).map((token, i) => {
                      const isResult = i === 4;
                      const dividendIsHighlighted =
                        index === currentStep && i === 0 && visibleTokens === 1;

                      return (
                        <motion.span
                          key={i}
                          initial={{ opacity: 0, y: -6 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3 }}
                          className={`${
                            isResult || dividendIsHighlighted
                              ? "text-blue"
                              : "text-black"
                          }`}
                        >
                          {token}
                        </motion.span>
                      );
                    })}
                  </div>

                  <div>
                    {/* Resto */}
                    {resultAlreadyVisible && (
                      <motion.div
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.6, duration: 0.3 }}
                      >
                        Resto = <span>{step.rest}</span>
                      </motion.div>
                    )}
                  </div>
                </div>
              );
            })}
        </div>

        {/* Resultado */}
      </div>

      {!isRunning && (
        <div className="flex flex-row gap-4 items-center mx-auto mt-8">
          <Button
            text={currentStep === 0 ? "Iniciar" : "Repetir"}
            onClick={reset}
          />
          <Button text="Explicação" onClick={() => {}} />
        </div>
      )}
      {/* <Result
        orientation="vertical"
        initialValue={{ value: 44, base: BASES.DECIMAL }}
        finalValue={{ value: 100100, base: BASES.BINARY }}
      /> */}
      {/* <div className="mt-auto">
        <TextualExplanation explanation="Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo. Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt. Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet, consectetur, adipisci velit, sed quia non numquam eius modi tempora incidunt ut labore et dolore magnam aliquam quaerat voluptatem. Ut enim ad minima veniam, quis nostrum exercitationem ullam corporis suscipit laboriosam, nisi ut aliquid ex ea commodi consequatur? Quis autem vel eum iure reprehenderit qui in ea voluptate velit esse quam nihil molestiae consequatur, vel illum qui dolorem eum fugiat quo voluptas nulla pariatur" />
      </div> */}
    </div>
  );
}
