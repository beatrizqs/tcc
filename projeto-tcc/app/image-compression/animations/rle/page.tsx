"use client";

import MainPageTitle from "@/components/MainPageTitle";
import SidePageTitle from "@/components/SidePageTitle";
import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import Button from "@/components/Button";
import { motion } from "framer-motion";
import TextualExplanation from "@/components/TextualExplanation";
import { explanations } from "@/utils/explanations";
import {
  ColorIndex,
  IMG_DESIGN,
  IMG_REPRESENTATION,
  IMG_REPRESENTATION_LABELS,
  PALETTE,
  Representation,
} from "@/utils/image-compression";
import {
  imageStripes,
  imageLandscape,
  imageSquares,
} from "@/lib/models/image-compression";

type Step = {
  id: number;
  offset: number;
  amount: number;
  color: number | ColorIndex;
};

export default function RLE() {
  // Animation control
  const [currentStep, setCurrentStep] = useState<Step>();
  const [highlightedPixels, setHighlightedPixels] = useState(0); // Image pixels that are being counted for the compression
  const [bytesSum, setBytesSum] = useState<{
    sum: number;
    step?: Step;
    highlightAmount: boolean;
    highlightPixel: boolean;
    show: boolean;
  }>({
    sum: 0,
    step: undefined,
    highlightAmount: false,
    highlightPixel: false,
    show: false,
  }); // Sum of the bytes necessary to represent the image after compression

  // Result
  const [visibleResult, setVisibleResult] = useState(-1);
  const [showResult, setShowResult] = useState(false);

  // Buttons
  const [showExplanation, setShowExplanation] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  // Refs
  const pauseRef = useRef(false);
  const animationIdRef = useRef(0);

  const searchParams = useSearchParams();
  const size = Number(searchParams.get("size")) || 0;
  const representation = searchParams.get("representation") || "";
  const design = searchParams.get("design") || "";

  const grayscale = (pixels: ColorIndex[]) => {
    const grayscale = [];
    for (const pixel of pixels) {
      const [r, g, b] = PALETTE[pixel];
      const gray = Math.round(0.299 * r + 0.587 * g + 0.114 * b);
      grayscale.push(gray);
    }

    return grayscale;
  };

  const black_and_white = (pixels: ColorIndex[]) => {
    const gray = grayscale(pixels);
    const black_white = [];
    for (const pixel of gray) {
      const bw = pixel > 128 ? 255 : 0;
      black_white.push(bw);
    }

    return black_white;
  };

  const grid = useMemo(() => {
    const imageDesign: Record<number, ColorIndex[]> =
      design === IMG_DESIGN.LANDSCAPE
        ? imageLandscape
        : design === IMG_DESIGN.SQUARE
        ? imageSquares
        : imageStripes;

    let computedGrid: ColorIndex[] | number[] = imageDesign[size];

    if (representation === IMG_REPRESENTATION.GRAYSCALE) {
      computedGrid = grayscale(computedGrid as ColorIndex[]);
    } else if (representation === IMG_REPRESENTATION.BLACK_AND_WHITE) {
      computedGrid = black_and_white(computedGrid as ColorIndex[]);
    }

    return computedGrid;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [design, size, representation]);

  const steps: Step[] = useMemo(() => {
    const result: Step[] = [];

    let index = 0;
    let amount = 0;
    let offset = 0;
    let color = grid[0];
    let id = 0;

    while (index < grid.length) {
      if (grid[index] === color) {
        index++;
        amount++;
      } else {
        result.push({ offset, amount, color, id });

        amount = 1;
        color = grid[index];
        offset = index;
        index++;
        id++;
      }
    }

    result.push({ offset, amount, color, id });

    return result;
  }, [grid]);

  const compressed_size = useMemo(() => {
    return steps.length * 2; // For each block of identical pixels, 2 bytes are used for representation (ammount + repeated block)
  }, [steps]);

  const reset = () => {
    setCurrentStep(undefined);
    setVisibleResult(-1);
    setHighlightedPixels(0);
    setIsPaused(false);
    setShowResult(false);
    setBytesSum({
      sum: 0,
      step: undefined,
      highlightAmount: false,
      highlightPixel: false,
      show: false,
    });
    runAnimation();
  };

  const finish = () => {
    setShowResult(true);
    setVisibleResult(steps.length);
    setHighlightedPixels(0);
    setBytesSum({
      sum: compressed_size,
      step: undefined,
      highlightAmount: false,
      highlightPixel: false,
      show: true,
    });
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

    try {
      setIsRunning(true);

      for (let i = 0; i < steps.length; i++) {
        await waitStep(50, id);

        setCurrentStep(steps[i]);
        setHighlightedPixels(0);

        for (let j = 1; j <= steps[i].amount; j++) {
          await waitStep(50, id);
          setHighlightedPixels(j);
        }

        await waitStep(400, id);
        // Shows compressed section
        setVisibleResult(i);

        await waitStep(400, id);
      }

      setHighlightedPixels(0);
      setBytesSum((prev) => ({
        ...prev,
        show: true,
      }));

      for (let i = 0; i < steps.length; i++) {
        // Iterates through all pixel tokens to illustrate how many
        // bytes are needed to represent compressed version of the image

        await waitStep(600, id);
        setBytesSum((prev) => ({
          ...prev,
          step: steps[i],
          highlightAmount: false,
          highlightPixel: false,
        }));

        // Highlights number
        await waitStep(600, id);
        setBytesSum((prev) => ({
          ...prev,
          highlightAmount: true,
        }));

        // +1 byte (number)
        await waitStep(100, id);
        setBytesSum((prev) => ({
          ...prev,
          sum: prev.sum + 1,
        }));

        // Highlights block
        await waitStep(600, id);
        setBytesSum((prev) => ({
          ...prev,
          highlightPixel: true,
        }));

        // +1 byte (block)
        await waitStep(100, id);
        setBytesSum((prev) => ({
          ...prev,
          sum: prev.sum + 1,
        }));
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
          title={"Compressão de imagens"}
          href={"/image-compression/params"}
        />
        <MainPageTitle title="Run-Length Encoding" noMargin />

        <div className="flex flex-row w-full px-8 mt-10 gap-8">
          {/* Image */}
          <div className="flex flex-col items-center gap-1 font-title justify-center  w-1/3">
            <div className="text-base font-semibold">
              Original: {size} x {size} → {size * size} bytes{" "}
            </div>

            <table className="border-collapse 2xl:text-base">
              <thead>
                <tr>
                  {[...Array(size)].map((_, i) => (
                    <th
                      className={` 2xl:size-7 text-center text-black transition ease-in-out delay-100`}
                      key={i}
                    >
                      1
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {[...Array(size)].map((_, i) => (
                  <tr key={i}>
                    {[...Array(size)].map((_, j) => {
                      const pos = i * size + j;
                      const currPixel: number | ColorIndex = grid[pos];

                      const [r, g, b] =
                        representation === IMG_REPRESENTATION.COLORS
                          ? PALETTE[currPixel as ColorIndex]
                          : [currPixel, currPixel, currPixel];

                      const highlight =
                        currentStep &&
                        currentStep?.offset + highlightedPixels >= pos + 1 &&
                        pos >= currentStep.offset;

                      return (
                        <td
                          className={`text-center text-black transition-all ease-in-out duration-100 border-1 border-black outline outline-0 outline-blue outline-offset-0 ${
                            size === 4
                              ? "size-18"
                              : size === 8
                              ? "size-9"
                              : "size-6"
                          } ${
                            highlight && "outline-2 outline-offset-[-2px] "
                          } `}
                          style={{ backgroundColor: `rgb(${r}, ${g}, ${b})` }}
                          key={j}
                        />
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>

            <p>{IMG_REPRESENTATION_LABELS[representation as Representation]}</p>
          </div>

          {/* Compression and result */}
          <div className="flex flex-col gap-6 items-center w-2/3 mt-3">
            {/* Pixels compression */}
            <div className=" w-full flex flex-col gap-2 ">
              <p className="text-xl text-blue font-title font-semibold">
                Compressão dos pixels
              </p>
              <div className="flex flex-row flex-wrap gap-3 border rounded-lg border-blue p-3 overflow-y-auto font-common items-center">
                {steps.map((step, i) => {
                  const [r, g, b] =
                    representation === IMG_REPRESENTATION.COLORS
                      ? PALETTE[step.color as ColorIndex]
                      : [step.color, step.color, step.color];

                  const activeStep = bytesSum.step
                    ? step.id === bytesSum.step!.id
                    : false;

                  return (
                    <div
                      key={i}
                      className={`${
                        visibleResult < i ? "opacity-0" : "opacity-100"
                      } transition ease-in-out flex flex-row gap-1 items-center py-1 px-1.5 border-1 border-black rounded-md w-13 justify-center ${
                        activeStep && "outline outline-2 outline-blue"
                      }`}
                    >
                      <p
                        className={`text-black font-medium transition ease-in-out ${
                          activeStep && bytesSum.highlightAmount && "text-blue "
                        }`}
                      >
                        {step.amount}
                      </p>
                      <div
                        style={{ backgroundColor: `rgb(${r}, ${g}, ${b})` }}
                        className={`size-4 transition ease-in-out border ${
                          activeStep &&
                          bytesSum.highlightPixel &&
                          "outline outline-2 outline-blue"
                        }`}
                      />
                    </div>
                  );
                })}
              </div>
              {bytesSum.show && (
                <div className="text-lg text-black font-title font-medium transition ease-in-out flex flex-row gap-2 items-center">
                  Bytes necessários para representação:{" "}
                  <div className="border text-blue px-2 py-0.5 rounded-md font-semibold w-10 text-center">
                    {bytesSum.sum}
                  </div>
                </div>
              )}
            </div>

            {/* Result */}
            {showResult && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3, duration: 0.3 }}
                className="flex flex-col gap-2"
              >
                <div className="flex flex-row gap-3 text-black text-2xl mx-auto font-title font-bold items-center ">
                  <p>{size * size} bytes → </p>
                  <div className="border border-blue rounded-md py-1 px-3 text-blue">
                    {compressed_size} bytes
                  </div>
                </div>
                <p className="text-lg font-title text-center text-blue">
                  {" "}
                  Redução de{" "}
                  {100 -
                    Math.round((compressed_size * 100) / (size * size))}
                  %
                </p>
              </motion.div>
            )}
          </div>
        </div>

        {/* Buttons */}
        <div className={`flex flex-row gap-4 items-center mx-auto mt-8 mb-5`}>
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
        explanation={explanations.imageCompression.rle}
        onClose={() => {
          setShowExplanation(false);
        }}
        isOpen={showExplanation}
      />
    </div>
  );
}
