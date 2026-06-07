"use client";

import MainPageTitle from "@/components/MainPageTitle";
import SidePageTitle from "@/components/SidePageTitle";
import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import Button from "@/components/Button";
import { AnimatePresence, motion } from "framer-motion";
import TextualExplanation from "@/components/TextualExplanation";
import { explanations } from "@/utils/explanations";
import {
  ColorIndex,
  getRGB,
  IMG_DESIGN,
  IMG_REPRESENTATION,
  PALETTE,
} from "@/utils/image-compression";
import {
  imageStripes,
  imageLandscape,
  imageSquares,
} from "@/lib/models/image-compression";
import { Suspense } from "react";

type Step = {
  index: number;
  row: TableRow;
  newRow: TableRow;
  pixels: (ColorIndex | number)[];
  pixelsIndex: number[]; // Index of this steps's pixels on the original image
};

type TableRow = {
  input: (ColorIndex | number)[]; // Blocks
  code: number;
};

export default function LZW() {
  // Animation control
  const [currentStep, setCurrentStep] = useState<Step>();
  const [highlightedPixels, setHighlightedPixels] = useState<number[]>([]); // Index of the image pixels that are being scanned
  const [highlightedRow, setHighlightedRow] = useState<TableRow>(); // Highlights the row that already has the current sequence
  const [highlightedCodeRow, setHighlightedCodeRow] = useState<TableRow>(); // Highlights that the current row is the onde that defines the used code
  const [visibleRows, setVisibleRows] = useState(-1); // Index of the last visible row
  const [showCompressedArray, setShowCompressedArray] = useState(-1); // Renders code for each section of the original image
  const [speed, setSpeed] = useState(1); // Manages animation speed

  // Result
  const [showResult, setShowResult] = useState(false);

  // Buttons
  const [showExplanation, setShowExplanation] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  // Refs
  const pauseRef = useRef(false);
  const animationIdRef = useRef(0);
  const speedRef = useRef(speed);

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

  const areSequencesIdentical = (
    sequence1: (ColorIndex | number)[],
    sequence2: (ColorIndex | number)[]
  ) => {
    return (
      sequence1.length === sequence2.length &&
      sequence1.every((valor, i) => valor === sequence2[i])
    );
  };

  const {
    steps,
    table,
    sectionedTable,
    compressedSequence,
    compressedSize,
  }: {
    steps: Step[];
    table: TableRow[];
    sectionedTable: TableRow[][];
    compressedSequence: string[];
    compressedSize: number;
  } = useMemo(() => {
    const steps: Step[] = [];
    const table: TableRow[] = [];
    const compressedSequence = [];
    const sectionedTable: TableRow[][] = [];

    const blockTypes: (ColorIndex | number)[] = [...new Set(grid)];

    // Initial values of the table are the plain blocks
    blockTypes.forEach((block, i) => table.push({ input: [block], code: i }));

    let stepIndex = 0;
    let code = blockTypes.length;
    let currentSequence: (ColorIndex | number)[] = [];
    let currentSequenceIndexes: number[] = [];
    let row: TableRow | undefined;
    let index = 0;

    while (true) {
      currentSequence.push(grid[index]);
      currentSequenceIndexes.push(index);

      const prevRow = row;

      // Checks if current sequence is already on table
      row = table.find((row) =>
        areSequencesIdentical(row.input, currentSequence)
      );

      if (row) {
        if (index === grid.length - 1) {
          break;
        }

        index++;
      } else {
        // Creates new table entry
        const newRow = { input: currentSequence, code };
        table.push(newRow);
        steps.push({
          index: stepIndex,
          row: prevRow!,
          newRow,
          pixels: currentSequence,
          pixelsIndex: currentSequenceIndexes,
        });
        // Considers only biggest sequence that was already on the table
        // New sequence wasn't already registered, so it cannot be used yet
        compressedSequence.push(prevRow!.code.toString());

        code++;
        stepIndex++;
        currentSequence = [];
        currentSequenceIndexes = [];
      }
    }

    steps.push({
      index: stepIndex + 1,
      row: row!,
      newRow: row!,
      pixels: currentSequence,
      pixelsIndex: currentSequenceIndexes,
    });

    const last_code = table.find((row) =>
      areSequencesIdentical(row.input, currentSequence)
    );
    // Adds code of the last symbol
    compressedSequence.push(last_code?.code.toString() || "");

    // Gets the length needed to represent the largest code on the table
    // All other codes will be represented with the same length
    const biggerCodeLength = table.at(-1)?.code.toString(2).length;

    const compressedSize = (biggerCodeLength ?? 0) * compressedSequence.length;

    // Creates sections of the table to help render large number of rows
    for (let i = 0; i < table.length; i += 18) {
      sectionedTable.push(table.slice(i, i + 18));
    }

    return {
      steps,
      table,
      sectionedTable,
      compressedSequence,
      compressedSize,
    };
  }, [grid]);

  useEffect(() => {
    if (grid) setVisibleRows([...new Set(grid)].length - 1);
  }, [grid]);

  const reset = () => {
    setCurrentStep(undefined);
    setHighlightedPixels([]);
    setHighlightedRow(undefined);
    setHighlightedCodeRow(undefined);
    setVisibleRows([...new Set(grid)].length - 1);
    setShowCompressedArray(-1);
    setSpeed(1);
    setIsPaused(false);
    setShowResult(false);
    runAnimation();
  };

  const finish = () => {
    setShowResult(true);
    setCurrentStep(steps.at(-1));
    setHighlightedPixels([]);
    setHighlightedRow(undefined);
    setHighlightedCodeRow(undefined);
    setVisibleRows(table.length);
    setShowCompressedArray(compressedSequence.length + 1);
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
    await delay(ms / speedRef.current);
    await waitIfPaused();

    if (id !== animationIdRef.current) {
      throw new Error("animation-cancelled");
    }
  };

  useEffect(() => {
    pauseRef.current = isPaused;
  }, [isPaused]);

  useEffect(() => {
    speedRef.current = speed;
  }, [speed]);

  async function runAnimation() {
    // Avoid overlap of different renders if animation is restarted before finishing
    const id = ++animationIdRef.current;

    try {
      setIsRunning(true);
      let localHighlightedPixels: number[] = [];

      // Scans image and populates table with sequence codes
      for (let i = 0; i < steps.length; i++) {
        await waitStep(50, id);

        const step = steps[i];

        setHighlightedCodeRow(undefined);

        setCurrentStep(step);

        // Highlights the sequence of blocks of the next row
        for (const j in step.pixels) {
          await waitStep(300, id);
          localHighlightedPixels = [
            ...localHighlightedPixels,
            step.pixelsIndex[j],
          ];
          setHighlightedPixels(localHighlightedPixels);
          await waitStep(300, id);

          // Skips last pixel
          if (Number(j) < step.pixels.length - 1 || i === steps.length - 1) {
            const row = table.find((row) =>
              areSequencesIdentical(
                row.input,
                steps[i].pixels.slice(0, Number(j) + 1)
              )
            );

            setHighlightedRow(row);
            await waitStep(500, id);
          }

          await waitStep(100, id);
        }

        await waitStep(800, id);
        // Shows new row for the current sequence of blocks
        if (i < steps.length - 1) setVisibleRows(step.newRow.code);
        await waitStep(800, id);

        setShowCompressedArray(i);
        await waitStep(200, id);

        setHighlightedCodeRow(step.row);
        await waitStep(800, id);

        localHighlightedPixels = [];
        setHighlightedPixels([localHighlightedPixels.at(-1)!]);

        await waitStep(600, id);
      }

      setIsRunning(false);
      setHighlightedPixels([]);
      setHighlightedRow(undefined);
      setHighlightedCodeRow(undefined);
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
      <div className="flex flex-col w-full h-[calc(100vh-80px)]">
        <div className="flex flex-col h-full justify-between">
          <div className="flex flex-col">
            <SidePageTitle
              title={"Compressão de imagens"}
              href={"/image-compression/params"}
            />
            <MainPageTitle
              title="Codificação Lempel-Ziv-Welch"
              noMargin
              className={`${sectionedTable[0].length > 12 && "-mt-8"} 2xl:m-0`}
              sm
            />

            <div
              className={`flex flex-col w-full 2xl:w-[80%] ${
                sectionedTable[0].length > 12 ? "mt-4" : "mt-6"
              } 2xl:mt-10 mx-auto text-black`}
            >
              <div className="flex flex-row justify-center items-center 2xl:gap-5">
                {/* Image */}
                <div>
                  <div className="text-base 2xl:text-lg font-semibold text-center font-title">
                    Original: {size} x {size} → {size * size} bytes →{" "}
                    {size * size * 8} bits{" "}
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

                            const [r, g, b] = getRGB(currPixel, representation);

                            const highlight = highlightedPixels.includes(pos);

                            return (
                              <td
                                className={`text-center text-black transition-all ease-in-out duration-100 border-1 border-black outline outline-0 outline-blue outline-offset-0 ${
                                  size === 4
                                    ? "size-18 2xl:size-[90px]"
                                    : size === 8
                                    ? "size-9 2xl:size-[50px]"
                                    : "size-6 2xl:size-[36px]"
                                } ${
                                  highlight &&
                                  "outline-2 outline-offset-[-2px] "
                                } ${
                                  pos === currentStep?.pixelsIndex.at(-1) &&
                                  highlight &&
                                  "outline-pink"
                                } `}
                                style={{
                                  backgroundColor: `rgb(${r}, ${g}, ${b})`,
                                }}
                                key={j}
                              />
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Tables and result*/}
                <motion.div
                  transition={{ ease: "easeInOut", duration: 0.5 }}
                  className={`flex flex-row  justify-center 2xl:gap-8 ${
                    sectionedTable.length === 1
                      ? "px-8"
                      : sectionedTable.length === 2
                      ? "px-5"
                      : " px-3"
                  }`}
                >
                  {/* Tables */}
                  <AnimatePresence>
                    {sectionedTable.map((table, i) => {
                      return (
                        <motion.div
                          transition={{ ease: "easeInOut", duration: 0.5 }}
                          initial={{ opacity: 0, y: 0 }}
                          animate={
                            visibleRows >= table[0].code || i === 0
                              ? { opacity: 1, y: 0 }
                              : { opacity: 0, y: 0 }
                          }
                          exit={{ opacity: 0, y: 0 }}
                          key={`table-${i}`}
                          className="border-1 border-black rounded-md h-fit mx-2"
                        >
                          <table className=" text-base 2xl:text-lg font-common ">
                            {/* Headers */}
                            <thead>
                              <tr className="font-title border-b-2  ">
                                <td
                                  key={`header-block`}
                                  className={`py-[2px] border-black border-1 text-blue text-center w-[200px] 2xl:w-[300px]`}
                                >
                                  Sequência
                                </td>
                                <td
                                  key={`header-code`}
                                  className={`py-[2px] border-black border-1 text-blue text-center w-[60px]`}
                                >
                                  Código
                                </td>
                              </tr>
                            </thead>

                            <tbody>
                              {/* Rows */}
                              {table.map((row, i) => {
                                return (
                                  <tr
                                    key={`huffman-table-row-${i}`}
                                    className={`justify-center transition-colors ease-in-out duration-300 text-sm h-5 2xl:h-7 ${
                                      highlightedRow === row && "bg-blue/25"
                                    } ${
                                      highlightedCodeRow === row && "bg-pink/25"
                                    }`}
                                  >
                                    <td
                                      key={`cell-block-${i}`}
                                      className={`border-black border text-blue `}
                                    >
                                      <motion.div
                                        initial={{ opacity: 0, y: 3 }}
                                        animate={
                                          visibleRows >= row.code
                                            ? { opacity: 1, y: 0 }
                                            : { opacity: 0, y: 3 }
                                        }
                                        className="flex flex-row justify-center"
                                      >
                                        {row.input.map((block, blockIndex) => {
                                          const [r, g, b] = getRGB(
                                            block,
                                            representation
                                          );
                                          return (
                                            <motion.div
                                              key={`block-${blockIndex}-row-${i}`}
                                              style={{
                                                backgroundColor: `rgb(${r}, ${g}, ${b})`,
                                              }}
                                              className={`h-3 w-2 2xl:size-4 mx-[2px] border border-black`}
                                            />
                                          );
                                        })}
                                      </motion.div>
                                    </td>
                                    <td
                                      key={`cell-frequency-${i}`}
                                      className={` border-black border text-blue text-center `}
                                    >
                                      <motion.div
                                        initial={{ opacity: 0, y: 3 }}
                                        animate={
                                          visibleRows >= row.code
                                            ? { opacity: 1, y: 0 }
                                            : { opacity: 0, y: 3 }
                                        }
                                      >
                                        {row.code}
                                      </motion.div>
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>
                </motion.div>
              </div>
            </div>
          </div>

          {/* Codes */}
          <motion.div className="flex flex-row items-center w-full gap-x-[2px] justify-center font-title text-lg 2xl:text-xl">
            <motion.div
              initial={{ opacity: 0, y: 3 }}
              animate={
                showCompressedArray >= 0
                  ? { opacity: 1, y: 0 }
                  : { opacity: 0, y: 3 }
              }
              className="mr-2"
            >
              Sequência comprimida:{" "}
            </motion.div>
            {compressedSequence.map((code, i) => {
              return (
                <motion.div
                  initial={{ opacity: 0, y: 3 }}
                  animate={
                    showCompressedArray >= i
                      ? { opacity: 1, scale: 1 }
                      : { opacity: 0, scale: 1.5 }
                  }
                  key={`code-${code}-${i}`}
                  className={`  transform ease-in-out duration-300 mb-1 ${
                    showCompressedArray === i && isRunning && "text-pink"
                  }`}
                >
                  {code}
                </motion.div>
              );
            })}

            {/* Result */}
            <motion.div
              initial={{ opacity: 0, y: 0 }}
              animate={showResult ? { opacity: 1, y: 0 } : { opacity: 0, y: 0 }}
              transition={{ duration: 0.3 }}
              className="flex flex-row items-center justify-center gap-2 mx-2 2xl:my-6"
            >
              <p className="text-lg 2xl:text-xl font-title text-center text-black">
                →
              </p>
              <div className="text-lg 2xl:text-xl border border-blue rounded-md py-1 px-3 text-blue font-title font-semibold">
                {compressedSize} bits (-
                {100 - Math.round((compressedSize * 100) / (size * size * 8))}
                %)
              </div>
            </motion.div>
          </motion.div>

          {/* Buttons */}
          <motion.div
            layout
            transition={{
              duration: 0.4,
              ease: "easeOut",
            }}
            className="flex flex-row gap-4 items-center mx-auto"
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

                  <motion.div
                    layout
                    key="speed"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{
                      duration: 0.3,
                      ease: "easeOut",
                    }}
                  >
                    <Button
                      text={speed === 1 ? "Acelerar" : "Desacelerar"}
                      onClick={() => setSpeed(speed === 1 ? 2 : 1)}
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
          explanation={explanations.imageCompression.lzw}
          onClose={() => {
            setShowExplanation(false);
          }}
          isOpen={showExplanation}
        />
      </div>
    </Suspense>
  );
}
