"use client";

import Result from "@/components/bases-numericas/Result";
import MainPageTitle from "@/components/MainPageTitle";
import SidePageTitle from "@/components/SidePageTitle";
import TextualExplanation from "@/components/TextualExplanation";
import { BASES } from "@/utils/bases";
import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import Button from "@/components/Button";

type Step = {
  value: number;
  result: number;
  remainder: number;
};

type Clone = {
  id: number;
  value: number | string;
  fromX: number;
  fromY: number;
  toX: number;
  toY: number;
  delay: number;
};

export default function DecimalBinario() {
  const [currentStep, setCurrentStep] = useState(0); // Cálculo atual
  const [visibleTokens, setVisibleTokens] = useState(1); // Elementos já renderizados da linha atual
  const [isRunning, setIsRunning] = useState(false);
  //const [waitingRemainder, setWaitingRemainder] = useState(false); // Aguarda o resto ser exibido na tela para poder renderizar a próxima linha
  const [showResultDigits, setShowResultDigits] = useState<boolean[]>([]); // Exibir os dígitos do resultado após cada animação
  const resultRefs = useRef<(HTMLSpanElement | null)[]>([]); // Referências para os dígitos do resultado final
  const remainderRefs = useRef<(HTMLSpanElement | null)[]>([]); // Referências para os restos de cada linha do cálculo
  const [clone, setClone] = useState<Clone | null>(null); // Clone do dígito do resto que será animado até a posição do resultado

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
        remainder: currentValue % 2,
      });

      currentValue = nextValue;
    }

    return result;
  }, [numero]);

  const result = useMemo(() => {
    return steps
      .map((step) => step.remainder)
      .reverse()
      .join("");
  }, [steps]);

  const reset = () => {
    setCurrentStep(0);
    setVisibleTokens(1);
    runAnimation();
  };

  async function animate(index: number) {
    const remainderEl = remainderRefs.current[index];

    // Índice invertido pois vai montando o binário de trás para frente
    const targetIndex = result.length - 1 - index;
    const resultEl = resultRefs.current[targetIndex];

    if (!remainderEl || !resultEl) return;

    const from = remainderEl.getBoundingClientRect();
    const to = resultEl.getBoundingClientRect();

    // Calcula posição central das origens
    const fromX = from.left - 18;
    const fromY = from.top - 46;

    // Calcula posição central dos destinos
    const toX = to.left - 18;
    const toY = to.top - 46;

    return new Promise<void>((resolve) => {
      setClone({
        id: index,
        value: steps[index].remainder,
        fromX,
        fromY,
        toX,
        toY,
        delay: 0,
      });

      // resolve quando animação acabar
      setTimeout(resolve, 1600);
    });
  }

  async function runAnimation() {
    setIsRunning(true);
    setShowResultDigits(Array(result.length).fill(false));

    for (let i = 0; i < steps.length; i++) {
      setCurrentStep(i);
      setVisibleTokens(1);

      // Passo a passo do cálculo da linha
      for (let t = 1; t < 5; t++) {
        await delay(600);
        setVisibleTokens((v) => v + 1);
      }

      // Espera o resto aparecer
      await delay(900);

      // Animação que leva o valor do resto até o resultado
      await animate(i);

      // Permite visualização do item no resultado
      setShowResultDigits((prev) =>
        prev.map((item, index) => (result.length - 1 - i === index ? true : item))
      );
      await delay(200);

    }

    setIsRunning(false);
  }

  function delay(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  return (
    <div className="flex flex-col w-full h-[calc(100vh-90px)]">
      <SidePageTitle
        title={"Bases numéricas"}
        href={"/bases-numericas/parametros"}
      />
      <MainPageTitle title="Decimal → Binário" noMargin />

      <div className="grid grid-cols-2 w-full overflow-y-auto flex-1">
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
                        Resto ={" "}
                        <span
                          ref={(el) => {
                            remainderRefs.current[index] = el!;
                          }}
                        >
                          {step.remainder}
                        </span>
                      </motion.div>
                    )}
                  </div>
                </div>
              );
            })}
        </div>

        {/* Resultado */}
        {(isRunning || currentStep > 0) && (
          <motion.div
            key="result"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="flex items-center w-full h-full p-10"
          >
            <Result
              orientation="vertical"
              initialValue={{ value: parseInt(numero), base: "10" }}
              finalValue={{ value: parseInt(result), base: "2" }}
              // showDigit={showResultDigits}
              refs={resultRefs}
            />
          </motion.div>
        )}
      </div>

      {/* Clone (Resto -> Resultado) */}
      {clone && (
        <motion.div
          key={clone.id}
          initial={{
            x: clone.fromX,
            y: clone.fromY,
            translateX: "-50%",
            translateY: "-50%",
          }}
          animate={{
            x: clone.toX,
            y: clone.toY,
          }}
          transition={{
            duration: 2,
            ease: "easeOut",
          }}
          onAnimationComplete={() => {
            setClone(null);
          }}
          className="fixed font-bold text-blue pointer-events-none text-xl"
        >
          {clone.value}
        </motion.div>
      )}

      <div
        className={`flex flex-row gap-4 items-center mx-auto mt-8 ${
          isRunning && "opacity-0"
        }`}
      >
        <Button
          text={currentStep === 0 ? "Iniciar" : "Repetir"}
          onClick={reset}
        />
        <Button text="Explicação" onClick={() => {}} />
      </div>

      {/* <div className="mt-auto">
        <TextualExplanation explanation="Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo. Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt. Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet, consectetur, adipisci velit, sed quia non numquam eius modi tempora incidunt ut labore et dolore magnam aliquam quaerat voluptatem. Ut enim ad minima veniam, quis nostrum exercitationem ullam corporis suscipit laboriosam, nisi ut aliquid ex ea commodi consequatur? Quis autem vel eum iure reprehenderit qui in ea voluptate velit esse quam nihil molestiae consequatur, vel illum qui dolorem eum fugiat quo voluptas nulla pariatur" />
      </div> */}
    </div>
  );
}
