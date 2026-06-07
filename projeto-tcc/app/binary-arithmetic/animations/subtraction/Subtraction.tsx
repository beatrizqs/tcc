"use client";

import Button from "@/components/Button";
import MainPageTitle from "@/components/MainPageTitle";
import SidePageTitle from "@/components/SidePageTitle";
import TextualExplanation from "@/components/TextualExplanation";
import { explanations } from "@/utils/explanations";
import { AnimatePresence, motion } from "framer-motion";
import { useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { CaretRight } from "phosphor-react";
import { Suspense } from "react";

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

const Complement2 = ({
  show,
  value,
  inverted,
  result,
  title,
  redTitle = false,
  subtitle,
  shouldDelay,
}: {
  show: {
    show: boolean;
    inverted: boolean;
    result: boolean;
  };
  value: string;
  inverted: string;
  result: string;
  title: string;
  redTitle?: boolean;
  subtitle?: string;
  shouldDelay: boolean;
}) => {
  return (
    <motion.div
      layout
      className="flex flex-col gap-1 justify-start"
      initial={{ opacity: 0, y: 0 }}
      animate={show && show.show ? { opacity: 1, y: 0 } : { opacity: 0, y: 3 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
    >
      <h3
        className={`flex text-xl 2xl:text-2xl font-semibold ${
          redTitle ? "text-red" : "text-black"
        }`}
      >
        {title}
      </h3>
      {subtitle && <p className="text-base text-red ">{subtitle}</p>}

      <motion.div layout className="flex flex-row gap-2 items-center mt-3">
        {/* Expanded */}
        <motion.div
          layout
          className="flex p-2 border-1 border-blue rounded-md text-xl 2xl:text-2xl text-blue font-semibold "
        >
          {value}
        </motion.div>

        {/* Arrow */}
        <motion.div
          className={`flex items-center gap-1`}
          animate={
            show && show.inverted ? { opacity: 1, y: 0 } : { opacity: 0, y: 3 }
          }
        >
          <CaretRight className="text-black" size={16} />
          <p className="text-black text-base font-medium">Inverte</p>
          <CaretRight className="text-black" size={16} />
        </motion.div>

        {/* Inverted */}
        <motion.div
          layout
          animate={
            show && show.inverted ? { opacity: 1, y: 0 } : { opacity: 0, y: 3 }
          }
          transition={{ delay: shouldDelay ? 0.7 : 0 }}
          className="flex p-2 border-1 border-blue rounded-md text-xl 2xl:text-2xl text-blue font-semibold"
        >
          {inverted}
        </motion.div>

        {/* Arrow */}
        <motion.div
          className={`flex items-center gap-1`}
          animate={
            show && show.result ? { opacity: 1, y: 0 } : { opacity: 0, y: 3 }
          }
        >
          <CaretRight className="text-black" size={16} />
          <p className="text-black text-base font-medium">Soma 1</p>
          <CaretRight className="text-black" size={16} />
        </motion.div>

        {/* Result */}
        <motion.div
          layout
          animate={
            show && show.result ? { opacity: 1, y: 0 } : { opacity: 0, y: 3 }
          }
          transition={{ delay: shouldDelay ? 0.7 : 0 }}
          className="flex p-2 border-1 border-blue rounded-md text-xl 2xl:text-2xl text-blue font-semibold"
        >
          {result}
        </motion.div>
      </motion.div>
    </motion.div>
  );
};

export default function Subtraction() {
  // Sum
  const [currentStep, setCurrentStep] = useState<Step>();
  const [highlighted, setHighlighted] = useState<{
    upper: boolean;
    lower: boolean;
  }>({ upper: false, lower: false }); // Highlights each step of the operation
  const [showSum, setShowSum] = useState(false); // Shows columns's sum
  const [carry, setCarry] = useState<Carry>(); // Manages carry's animation
  const [discardOverflow, setDiscardOverflow] = useState(false); // Cross the overflow value out of the result

  // Formatting
  const [showNumberExpansion, setShowNumberExpansion] = useState(false); // Render the number transformation from original input to expanded version
  const [showComplement2, setShowComplement2] = useState<{
    show: boolean;
    inverted: boolean;
    result: boolean;
  }>({ show: false, inverted: false, result: false }); // Render calculation of complement of 2
  const [shouldDelay, setShouldDelay] = useState(true); // Defines if the rendering of the items in the Complement of 2 section should have delays or not (used if the user wants to finish the animation early)
  const [showSumOperation, setShowSumOperation] = useState(false); // Render sum

  // Result
  const [highlightSignBit, setHighlightSignBit] = useState(false); // Highlight sign bit if the result is a negative number
  const [showResultComplement2, setShowResultComplement2] = useState<{
    show: boolean;
    inverted: boolean;
    result: boolean;
  }>({ show: false, inverted: false, result: false }); // Render calculation of complement of 2 of the result, if it's a negative value
  const [showResult, setShowResult] = useState(false);

  // Buttons
  const [showExplanation, setShowExplanation] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  // Refs
  const pauseRef = useRef(false);
  const animationIdRef = useRef(0);

  const searchParams = useSearchParams();
  const value1 = searchParams.get("value1") || "";
  const value2 = searchParams.get("value2") || "";

  const formatNumbers = () => {
    const size = Math.max(value1.length, value2.length) + 1; // Adds 1 bit for overflow

    return [value1.padStart(size, "0"), value2.padStart(size, "0")];
  };

  const complement2 = (value: string) => {
    const inverted = [...value]
      .map((bit) => (bit === "0" ? "1" : "0"))
      .join(""); // Invert bits

    const result = (parseInt(inverted, 2) + 1).toString(2); // Add 1

    return {
      inverted,
      result,
    };
  };

  const [value1Expanded, value2Expanded] = formatNumbers();

  const value2Complement2 = complement2(value2Expanded);
  const rawResult = (
    parseInt(value1Expanded, 2) + parseInt(value2Complement2.result, 2)
  ).toString(2);

  const result =
    rawResult.length > value1Expanded.length ? rawResult.slice(1) : rawResult;

  const resultComplement2 = complement2(result);

  const steps: Step[] = (() => {
    const result: Step[] = [];

    let carry = 0;

    for (let i = value1Expanded.length - 1; i >= 0; i--) {
      const sum =
        Number(value1Expanded[i]) + Number(value2Complement2.result[i]) + carry;
      const step = {
        index: i,
        upperValue: value1Expanded[i],
        lowerValue: value2Complement2.result[i],
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

  const isNegativeResult =
    result[0] === "1" &&
    !(result.length > value1Expanded.length && result[1] === "0");

  const reset = () => {
    setShowResult(false);
    setShowSum(false);
    setShowNumberExpansion(false);
    setShowComplement2({ show: false, inverted: false, result: false });
    setShowResultComplement2({ show: false, inverted: false, result: false });
    setShowSumOperation(false);
    setHighlighted({ upper: false, lower: false });
    setCarry(undefined);
    setDiscardOverflow(false);
    setHighlightSignBit(false);
    setIsPaused(false);
    setShouldDelay(true);
    setCurrentStep(undefined);
    runAnimation();
  };

  const finish = () => {
    setShouldDelay(false);
    setCurrentStep(steps.at(-1));
    setShowSum(true);
    setHighlighted({ upper: false, lower: false });
    const lastCarry = steps.findLast((item) => item.receivesCarry);
    setCarry(
      lastCarry ? { originIndex: lastCarry?.index, render: "top" } : undefined
    );
    setDiscardOverflow(result.length > value1Expanded.length);
    setShowNumberExpansion(true);
    setShowComplement2({ show: true, inverted: true, result: true });
    setShowSumOperation(true);
    const negativeResult =
      steps.find((step) => step.index === 0)?.result === "1";
    setHighlightSignBit(negativeResult);
    setShowResultComplement2({
      show: negativeResult,
      inverted: negativeResult,
      result: negativeResult,
    });
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

  const animateComplement2 = async (
    setter: React.Dispatch<
      React.SetStateAction<{
        show: boolean;
        inverted: boolean;
        result: boolean;
      }>
    >,
    id: number
  ) => {
    setter((prev) => ({ ...prev, show: true }));
    await waitStep(1400, id);

    setter((prev) => ({ ...prev, inverted: true }));
    await waitStep(1400, id);

    setter((prev) => ({ ...prev, result: true }));
    await waitStep(1400, id);
  };

  const animateSum = async (step: Step, id: number) => {
    await waitStep(100, id);

    setShowSum(false);

    setCurrentStep(step);

    // Sets extra bit to be shown at the bottom of the current column
    if (step.carry) setCarry({ originIndex: step.index, render: "bottom" });
    await waitStep(600, id);

    if (step.receivesCarry) {
      await waitStep(300, id);
    }

    // If current step is not the overflow column
    if (step.index > -1) {
      setHighlighted((prev) => ({ ...prev, upper: true }));
      await waitStep(500, id);

      setHighlighted((prev) => ({ ...prev, lower: true }));
      await waitStep(1000, id);
    }

    setShowSum(true);
    await waitStep(600, id);

    // Sets extra bit to be shown at the top of the next column
    if (step.carry) {
      setCarry({ originIndex: step.index, render: "top" });
      await waitStep(800, id);
    }

    setHighlighted({ upper: false, lower: false }); // Clears highlights
  };

  async function runAnimation() {
    // Avoid overlap of different renders if animation is restarted before finishing
    const id = ++animationIdRef.current;

    try {
      setIsRunning(true);
      if (id !== animationIdRef.current) return;

      // Part 1: Expand numbers
      await waitStep(600, id);
      setShowNumberExpansion(true);
      await waitStep(1000, id);

      // Part 2: Calculate complement of 2
      await animateComplement2(setShowComplement2, id);

      setShowSumOperation(true);

      // Part 3: Sum
      for (let i = 0; i < steps.length; i++) {
        await animateSum(steps[i], id);
      }
      await waitStep(600, id);

      // Negative value or overflow
      if (result[0] === "1") {
        let negativeValue = true;

        //Overflow
        if (result.length > value1Expanded.length) {
          setDiscardOverflow(true);
          await waitStep(600, id);

          if (result[1] === "0") negativeValue = false;
        }

        if (negativeValue) {
          setHighlightSignBit(true);
          await waitStep(600, id);

          await animateComplement2(setShowResultComplement2, id);
        }
      }

      await waitStep(600, id);

      if (result) setIsRunning(false);
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
    <Suspense fallback={<div>Carregando...</div>}>
      <div className="flex flex-col w-full h-[calc(100vh-100px)]">
        <div className="flex flex-col">
          <SidePageTitle
            title={"Aritmética binária"}
            href={"/binary-arithmetic/params"}
          />
          <MainPageTitle title="Subtração binária" noMargin className="mt-5" />

          <div className="flex flex-col  w-full  flex-1 font-title gap-10 my-10 2xl:my-16 2xl:gap-16 2xl:max-w-[60%] mx-auto items-center">
            <motion.div
              layout
              className={`flex flex-row items-center w-full gap-5 justify-center max-w-[90%]`}
            >
              {/* Number formatting and complement of 2 */}
              <motion.div
                layout
                className={`w-1/2 flex flex-col gap-10 2xl:gap-16 font-title justify-center`}
              >
                {/* Number expansion */}
                <motion.div
                  layout
                  className="flex flex-row gap-3 items-center tracking-widest"
                >
                  <motion.div
                    layout
                    transition={{ duration: 1, ease: "easeOut" }}
                    className="flex p-2 border-1 border-black rounded-md text-xl 2xl:text-2xl text-black font-semibold"
                  >
                    {showNumberExpansion ? value1Expanded : value1}
                  </motion.div>

                  <p className="font-semibold text-black text-3xl">-</p>

                  <motion.div
                    layout
                    className={`flex p-2 border-1 border-black rounded-md text-xl 2xl:text-2xl text-black font-semibold `}
                  >
                    {showNumberExpansion ? value2Expanded : value2}
                  </motion.div>
                </motion.div>

                {/* Complement of 2 */}
                <Complement2
                  title={`Complemento de 2 de ${value2Expanded}`}
                  value={value2Expanded}
                  show={showComplement2}
                  inverted={value2Complement2.inverted}
                  result={value2Complement2.result}
                  shouldDelay={shouldDelay}
                />

                {/* Complement of 2 of the result, if it's a negative value */}
                <Complement2
                  title={`Complemento de 2 do resultado (magnitude)`}
                  subtitle={`Bit de sinal 1 → número negativo `}
                  redTitle={true}
                  value={result}
                  show={showResultComplement2}
                  inverted={resultComplement2.inverted}
                  result={resultComplement2.result}
                  shouldDelay={shouldDelay}
                />
              </motion.div>

              {/* Sum and result */}
              <motion.div layout className="flex flex-col gap-16 w-1/2">
                {/* Sum */}
                <motion.div
                  layout
                  className={`flex flex-row items-center gap-8  justify-center mt-5 mr-10`}
                >
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
                         } `}
                                >
                                  <motion.span
                                    initial={{ opacity: 0, y: 3 }}
                                    animate={
                                      showSumOperation
                                        ? { opacity: 1, y: 0 }
                                        : { opacity: 0, y: 3 }
                                    }
                                    transition={{ delay: isRunning ? 0.5 : 0 }}
                                    layout
                                  >
                                    {step.upperValue}
                                  </motion.span>
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
                                  <motion.span
                                    initial={{ opacity: 0, y: 3 }}
                                    animate={
                                      showSumOperation
                                        ? { opacity: 1, y: 0 }
                                        : { opacity: 0, y: 3 }
                                    }
                                    transition={{ delay: isRunning ? 0.5 : 0 }}
                                    layout
                                  >
                                    {step.lowerValue}
                                  </motion.span>
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
                                  className={`p-3 transition-colors duration-300 ease-in-out border-black border-1 border-t-2 text-black text-center  ${
                                    step.index === 0 &&
                                    highlightSignBit &&
                                    "bg-red-300 text-red transition ease-in-out duratio-300"
                                  } ${
                                    step.index === -1 &&
                                    discardOverflow &&
                                    "text-gray-300"
                                  }
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
                                    transition={{
                                      duration: 0.4,
                                      ease: "easeOut",
                                    }}
                                    className={`flex flex-row items-center justify-center gap-0`}
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
                </motion.div>

                {/* Result */}
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={
                    showResult ? { opacity: 1, x: 0 } : { opacity: 0, x: -10 }
                  }
                  transition={{ duration: 0.3 }}
                  className="flex flex-row gap-3 text-black text-2xl 2xl:text-4xl mx-auto font-title font-bold items-center "
                >
                  <p>
                    {value1} - {value2} ={" "}
                  </p>
                  <div className="border border-blue rounded-md py-1 px-3 text-blue">
                    {result}
                  </div>
                  <p>=</p>
                  <div className="border border-blue rounded-md py-1 px-3 text-blue">
                    {isNegativeResult
                      ? `-${parseInt(resultComplement2.result, 2)}`
                      : parseInt(result, 2)}
                  </div>
                </motion.div>
              </motion.div>
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
            </AnimatePresence>
          </motion.div>
        </div>

        <TextualExplanation
          explanation={explanations.binaryArithmetic.subtraction}
          onClose={() => {
            setShowExplanation(false);
          }}
          isOpen={showExplanation}
        />
      </div>
    </Suspense>
  );
}
