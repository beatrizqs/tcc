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
  IMG_REPRESENTATION_LABELS,
  PALETTE,
  Representation,
} from "@/utils/image-compression";
import {
  imageStripes,
  imageLandscape,
  imageSquares,
} from "@/lib/models/image-compression";

type BlockGroupingStepType = "merge" | "reposition";

type BlockGroupingStep = {
  type: BlockGroupingStepType;
  smallerBlock: Block;
  biggerBlock: Block;
  newBlock?: Block; // When merging smaller blocks into new one
  currentBlocks: Block[];
  index: number;
};

type TableStep = {
  block: Block;
  renderTablePixel: boolean;
  renderTableFrequency: boolean;
};

type Block = {
  color: ColorIndex | number | null;
  innerBlocks: Block[]; // Block made up of other blocks, caused by block grouping
  frequency: number;
  pixels: number[]; // Index of this block's pixels on the original image
  code: string;
  id: string;
};

const NULL_BLOCK = {
  color: null,
  innerBlocks: [],
  frequency: 0,
  pixels: [],
  code: "",
  id: "",
};

export default function Huffman() {
  // Table
  const [currentTableStep, setCurrentTableStep] = useState<TableStep>();
  const [highlightedPixels, setHighlightedPixels] = useState(0); // Image pixels that are being counted for the compression
  const [visibleRows, setVisibleRows] = useState(0); // Rows visible in table
  const [highlightedRow, setHighlightedRow] = useState<ColorIndex | number>(); // Highlights row of the pixel that is being compressed into the bit array
  const [visibleCodeDigits, setVisibleCodeDigits] = useState<
    Record<ColorIndex | number, number>
  >({});

  // Block grouping
  const [renderBlockGrouping, setRenderBlockGrouping] = useState(false);
  const [currentBlockGroupingStep, setCurrentBlockGroupingStep] =
    useState<BlockGroupingStep>();
  const [highlightedBlocks, setHighlightedBlocks] = useState<Block[]>([]); // Highlights smallest blocks
  const [showNotUsedRows, setShowNotUsedRows] = useState(false); // Shows "-" as the added code for that pixel in current step
  const [merge, setMerge] = useState(false); // Merges smaller blocks into new one
  const [message, setMessage] = useState(""); // Renders a short explanation below the table

  // Bit array
  const [showCompressedArray, setShowCompressedArray] = useState(0); // Render bit array and show size calculation
  const [highlightedPixelBitArray, setHighlightedPixelBitArray] = useState(-1); // Image pixels that are being counted for the bit array

  // Result
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

  const shouldReorder = (
    prevState: BlockGroupingStep,
    nextState: BlockGroupingStep
  ) => {
    return (
      prevState.currentBlocks.at(-1) !== nextState.currentBlocks.at(-1) &&
      prevState.type === "reposition"
    );
  };

  const insertSorted = <T,>(
    arr: T[],
    item: T,
    getValue: (item: T) => number
  ) => {
    const index = arr.findIndex(
      (current) => getValue(current) < getValue(item)
    );

    arr.splice(index === -1 ? arr.length : index, 0, item);
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

  const {
    table,
    tableSteps,
    blockGroupingSteps,
  }: {
    table: Block[];
    tableSteps: TableStep[];
    blockGroupingSteps: BlockGroupingStep[];
  } = useMemo(() => {
    const table: Block[] = [];
    const blockGroupingSteps: BlockGroupingStep[] = [];

    const blockTypes: (ColorIndex | number)[] = [...new Set(grid)];
    let id = 1;

    // TABLE
    // Creates table rows
    for (const block of blockTypes) {
      let frequency = 0;
      const pixels = [];
      for (let i = 0; i < grid.length; i++) {
        if (grid[i] === block) {
          frequency++;
          pixels.push(i);
        }
      }

      table.push({
        color: block,
        frequency,
        code: "",
        pixels,
        innerBlocks: [],
        id: id.toString(),
      });

      id++;
    }

    // Creates table steps
    const tableSteps: TableStep[] = table.map((row) => {
      return {
        block: row,
        renderTablePixel: false,
        renderTableFrequency: false,
      };
    });

    // BLOCKS
    let blocks = [...table];

    blockGroupingSteps.push({
      type: "reposition",
      smallerBlock: blocks.at(-1)!,
      biggerBlock: blocks.at(-2)!,
      currentBlocks: [...blocks],
      index: -1, // This step will only render blocks in original order, won't group blocks
    });

    // Sorts by frequency, biggest to smallest
    blocks.sort((a, b) => b.frequency - a.frequency);
    let index = 0;

    function updateBlockCode(bit: string, block: Block) {
      if (block.innerBlocks.length > 0) {
        // Updates code of all blocks that make up this one
        for (const innerBlock of block.innerBlocks) {
          innerBlock.code = bit + innerBlock.code;
        }
      } else {
        // Only updates block's code
        block.code = bit + block.code;
      }
    }

    // Creates block grouping step
    while (blocks.length >= 2) {
      const smallerBlock = blocks.at(-1)!;
      const biggerBlock = blocks.at(-2)!;

      // Smaller block on pair receives 0
      updateBlockCode("0", smallerBlock);

      // Bigger block on pair receives 1
      updateBlockCode("1", biggerBlock);

      const newBlock: Block = {
        frequency: smallerBlock.frequency + biggerBlock.frequency,
        innerBlocks: [
          ...(smallerBlock.innerBlocks.length > 0
            ? smallerBlock.innerBlocks
            : [smallerBlock]),
          ...(biggerBlock.innerBlocks.length > 0
            ? biggerBlock.innerBlocks
            : [biggerBlock]),
        ],
        color: null,
        code: "",
        pixels: [],
        id: smallerBlock.id + biggerBlock.id,
      };

      blockGroupingSteps.push({
        type: "merge",
        smallerBlock,
        biggerBlock,
        currentBlocks: [...blocks],
        newBlock,
        index,
      });

      // Removes grouped blocks
      blocks = blocks.filter(
        (block) =>
          block.color !== smallerBlock.color &&
          block.color !== biggerBlock.color
      );

      // Renders after smaller blocks are highlighted, to show what they become next
      blockGroupingSteps.push({
        type: "reposition",
        smallerBlock,
        biggerBlock,
        newBlock,
        currentBlocks: [...blocks, newBlock],
        index,
      });

      // Puts new block in correct position
      insertSorted(blocks, newBlock, (item) => item.frequency);

      index++;
    }

    blockGroupingSteps.push({
      type: "merge",
      smallerBlock: NULL_BLOCK,
      biggerBlock: NULL_BLOCK,
      currentBlocks: blocks,
      index, // This step will only render blocks in original order, won't group blocks
    });

    return { table, tableSteps, blockGroupingSteps };
  }, [grid]);

  const { compressedSize, tableSize } = useMemo(() => {
    const compressedSize = table.reduce((acc, block) => {
      return block.code.length * block.frequency + acc;
      // New size is calculated by how many bits are needed to represent the image
      // Recreating the original bitmap, we swap the block for the new code, where each number is a bit
    }, 0);

    const tableSize = table.reduce((acc, block) => {
      return block.code.length + 8 + acc;
      // Table size is calculated by how many bits are needed to represent each block + its code
    }, 0);

    return { compressedSize, tableSize };
  }, [table]);

  const reset = () => {
    setIsRunning(false);

    setCurrentTableStep(undefined);
    setHighlightedPixels(0);
    setVisibleRows(0);
    setHighlightedRow(undefined);
    setVisibleCodeDigits({});

    setRenderBlockGrouping(false);
    setCurrentBlockGroupingStep(undefined);
    setHighlightedBlocks([]);
    setShowNotUsedRows(false);
    setMerge(false);
    setMessage("");

    setShowCompressedArray(0);
    setHighlightedPixelBitArray(-1);

    setIsPaused(false);

    setShowResult(false);

    runAnimation();
  };

  const finish = () => {
    setIsRunning(false);

    setCurrentTableStep(tableSteps.at(-1));
    setHighlightedPixels(0);
    setVisibleRows(table.length);
    setHighlightedRow(undefined);
    const codes = Object.fromEntries(
      table.map((item) => [item.color, item.code.length])
    );
    setVisibleCodeDigits(codes);

    setRenderBlockGrouping(false);
    setCurrentBlockGroupingStep(blockGroupingSteps.at(-1));
    setHighlightedBlocks([]);
    setShowNotUsedRows(false);
    setMerge(false);
    setMessage("");

    setShowCompressedArray(grid.length + 1);
    setHighlightedPixelBitArray(-1);
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

  useEffect(() => {
    if (table) {
      setVisibleCodeDigits(
        Object.fromEntries(table.map((row) => [row.color, 0]))
      );
    }
  }, [table]);

  async function runAnimation() {
    // Avoid overlap of different renders if animation is restarted before finishing
    const id = ++animationIdRef.current;

    try {
      setIsRunning(true);
      const localVisibleCodeDigits = { ...visibleCodeDigits };

      // Scan image to create table
      for (let i = 0; i < tableSteps.length; i++) {
        setCurrentTableStep(tableSteps[i]);
        await waitStep(50, id);

        for (let j = 0; j < table[i].frequency; j++) {
          await waitStep(200, id);
          setHighlightedPixels(j);
        }

        await waitStep(400, id);
        // Shows table row
        setVisibleRows(i + 1);

        // Shows block
        await waitStep(300, id);
        setCurrentTableStep((prev) => ({ ...prev!, renderTableBlock: true }));

        // Shows frequency
        await waitStep(500, id);
        setCurrentTableStep((prev) => ({
          ...prev!,
          renderTableFrequency: true,
        }));

        await waitStep(300, id);
        setHighlightedPixels(-1);
      }

      setHighlightedPixels(-1);
      setRenderBlockGrouping(true);

      let initialStep = 1;

      // Verifies if it is necessary to reorder blocks or if table order is already sorted
      for (let i = 0; i < blockGroupingSteps[0].currentBlocks.length; i++) {
        if (
          blockGroupingSteps[0].currentBlocks[i].id !==
          blockGroupingSteps[1].currentBlocks[i].id
        ) {
          initialStep = 0;
          break;
        }
      }

      let currentStep = blockGroupingSteps[initialStep];

      for (let i = initialStep; i < blockGroupingSteps.length; i++) {
        await waitStep(50, id);
        setMerge(false);

        // Checks if reordering will be needed
        if (shouldReorder(currentStep, blockGroupingSteps[i]))
          setMessage("Reordena de forma descrescente");

        currentStep = blockGroupingSteps[i];

        setCurrentBlockGroupingStep(currentStep);

        // Skips if it's last step
        if (currentStep.currentBlocks.length === 1) {
          break;
        }

        await waitStep(1300, id);

        setMessage("");

        if (currentStep.index > -1) {
          // Show blocks that will be paired up
          if (currentStep.type === "merge") {
            if (currentStep.currentBlocks.length > 1)
              setMessage("Agrupa os dois blocos menos frequentes");

            // Highlight smallest blocks
            setHighlightedBlocks([currentStep.smallerBlock]);

            await waitStep(1000, id);

            setHighlightedBlocks([
              currentStep.smallerBlock,
              currentStep.biggerBlock,
            ]);
            await waitStep(1000, id);

            setShowNotUsedRows(true);

            await waitStep(700, id);

            // Shows new bits in blocks' codes

            for (const block of [
              currentStep.smallerBlock,
              currentStep.biggerBlock,
            ]) {
              if (block.innerBlocks.length > 0) {
                for (const innerBlock of block.innerBlocks) {
                  localVisibleCodeDigits[innerBlock.color!]++;
                }
              } else {
                localVisibleCodeDigits[block.color!]++;
              }
            }

            setVisibleCodeDigits(localVisibleCodeDigits);

            await waitStep(1200, id);

            setMessage("");

            setHighlightedBlocks([]);

            setShowNotUsedRows(false);

            setMerge(true);

            await waitStep(1000, id);
          } else {
            // Shows new block after merging smaller blocks
            if (shouldReorder(currentStep, blockGroupingSteps[i + 1])) {
              await waitStep(1000, id);
            }
          }
        }
      }

      await waitStep(800, id);

      setMerge(false);

      setRenderBlockGrouping(false);

      await waitStep(1000, id);

      // Scan image to create bit array
      for (let i = 0; i < grid.length; i++) {
        // Highlights pixel
        setHighlightedPixelBitArray(i);
        await waitStep(200, id);

        // Highlights table row
        setHighlightedRow(grid[i]);
        await waitStep(200, id);

        // Renders pixel code
        setShowCompressedArray(i + 1);
        await waitStep(200, id);
      }

      setHighlightedRow(undefined);
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
      <div className="flex flex-col w-full h-[calc(100vh-80px)] text-black">
        <div className="flex flex-col justify-between h-full 2xl:h-[80%]">
          <div>
            <SidePageTitle
              title={"Compressão de imagens"}
              href={"/image-compression/params"}
            />
            <MainPageTitle title="Codificação de Huffman" noMargin />

            <div className="flex flex-row w-full px-8 mt-10 gap-8 2xl:max-w-[60%] 2xl:mx-auto items-start">
              {/* Image */}
              <div className="flex flex-col items-center gap-1 font-title justify-center  w-1/3">
                <div className="text-base font-semibold">
                  Original: {size} x {size} → {size * size} bytes →{" "}
                  {size * size * 8} bits
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
                      <tr key={`bitmap-row-${i}`}>
                        {[...Array(size)].map((_, j) => {
                          const pos = i * size + j;
                          const currPixel: number | ColorIndex = grid[pos];
                          const index =
                            currentTableStep?.block.pixels.findIndex(
                              (item) => item === pos
                            ); // Index of the current pixel on the array of pixels of this color

                          const [r, g, b] = getRGB(currPixel, representation);

                          const highlight =
                            ((currentTableStep &&
                              currentTableStep?.block.color === currPixel &&
                              index !== undefined &&
                              index <= highlightedPixels) ||
                              pos === highlightedPixelBitArray) &&
                            isRunning;

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
                              style={{
                                backgroundColor: `rgb(${r}, ${g}, ${b})`,
                              }}
                              key={`bitmap-cell-${j}`}
                            />
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>

                <p>
                  {IMG_REPRESENTATION_LABELS[representation as Representation]}
                </p>
              </div>

              {/* Huffman table */}
              <div className="flex flex-col mr-10">
                <p className="text-blue text-lg font-semibold mb-2 font-title text-center">
                  Tabela de Huffman
                </p>
                <div className="border-1 border-black rounded-md h-fit">
                  <table className=" text-base 2xl:text-lg font-common ">
                    {/* Headers */}
                    <thead>
                      <tr className="font-title border-b-2">
                        <td
                          key={`header-block`}
                          className={`p-3 border-black border-1 text-blue text-center`}
                        >
                          Pixel
                        </td>
                        <td
                          key={`header-frequency`}
                          className={`p-3 border-black border-1 text-blue text-center`}
                        >
                          Frequência
                        </td>
                        <td
                          key={`header-code`}
                          className={`p-3 border-black border-1 text-blue text-center`}
                        >
                          Código
                        </td>
                      </tr>
                    </thead>

                    <tbody>
                      {/* Rows */}
                      {table.map((row, i) => {
                        const [r, g, b] = getRGB(row.color!, representation);

                        const renderBlock =
                          visibleRows > i ||
                          (currentTableStep &&
                            currentTableStep.block === row &&
                            currentTableStep.renderTablePixel);

                        const renderFrequency =
                          visibleRows > i ||
                          (currentTableStep &&
                            currentTableStep.block === row &&
                            currentTableStep.renderTableFrequency);

                        return (
                          <tr
                            key={`huffman-table-row-${i}`}
                            className={`justify-center transition-colors ease-in-out duration-300 ${
                              highlightedRow === row.color && "bg-blue/25"
                            }`}
                          >
                            <td
                              key={`cell-block-${i}`}
                              className={`border-black border text-blue  `}
                            >
                              <motion.div
                                initial={{ opacity: 0, y: 3 }}
                                animate={
                                  renderBlock
                                    ? { opacity: 1, y: 0 }
                                    : { opacity: 0, y: 3 }
                                }
                                style={{
                                  backgroundColor: `rgb(${r}, ${g}, ${b})`,
                                }}
                                className={`size-4 mx-auto border border-black`}
                              />
                            </td>
                            <td
                              key={`cell-frequency-${i}`}
                              className={`p-3 border-black border text-blue text-center `}
                            >
                              <motion.div
                                initial={{ opacity: 0, y: 3 }}
                                animate={
                                  renderFrequency
                                    ? { opacity: 1, y: 0 }
                                    : { opacity: 0, y: 3 }
                                }
                              >
                                {row.frequency}
                              </motion.div>
                            </td>
                            <td
                              key={`cell-code-${i}`}
                              className={`p-3 border-black border text-blue text-center `}
                            >
                              <motion.div className="flex gap-[2px] justify-center">
                                {row.code.split("").map((char, charIndex) => {
                                  const renderDigit =
                                    visibleCodeDigits &&
                                    row.color! in visibleCodeDigits &&
                                    visibleCodeDigits[row.color!] >=
                                      row.code.length - charIndex;

                                  return (
                                    <motion.div
                                      key={`char-${char}-${charIndex}`}
                                      initial={{ opacity: 0, y: 3 }}
                                      animate={
                                        renderDigit
                                          ? { opacity: 1, y: 0 }
                                          : { opacity: 0, y: 3 }
                                      }
                                    >
                                      {char}
                                    </motion.div>
                                  );
                                })}
                              </motion.div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              <AnimatePresence mode="wait">
                {renderBlockGrouping ? (
                  <motion.div
                    key="block-grouping"
                    initial={{ opacity: 0, y: 3 }}
                    animate={
                      renderBlockGrouping
                        ? { opacity: 1, y: 0 }
                        : { opacity: 0, y: 3 }
                    }
                    exit={{ opacity: 0, y: 3 }}
                    className="font-title overflow-hidden"
                  >
                    <p className="text-blue text-lg font-semibold mb-2 text-center">
                      Agrupamento de pixels
                    </p>

                    <div className=" overflow-hidden">
                      {/* Header */}
                      <div className="grid grid-cols-[200px_200px] border border-b-2 bg-white rounded-t-md">
                        {["Bloco", "Código a receber"].map((header, i) => (
                          <div
                            key={`${header}-${i}`}
                            className="py-2 border-r last:border-r-0 border-black text-blue text-center font-medium text-base"
                          >
                            {header}
                          </div>
                        ))}
                      </div>

                      {/* Rows */}
                      <motion.div layout className="flex flex-col">
                        <AnimatePresence mode="popLayout">
                          {currentBlockGroupingStep &&
                            currentBlockGroupingStep.currentBlocks.map(
                              (block) => {
                                const [r, g, b] =
                                  block.innerBlocks.length > 0
                                    ? [0, 0, 0]
                                    : getRGB(block.color!, representation);

                                const isSmaller =
                                  block.id ===
                                  currentBlockGroupingStep.smallerBlock.id;

                                const isBigger =
                                  block.id ===
                                  currentBlockGroupingStep.biggerBlock.id;

                                const isMergingOut =
                                  currentBlockGroupingStep.type === "merge" &&
                                  merge &&
                                  (isSmaller || isBigger);

                                const roundedBorder =
                                  isSmaller ||
                                  currentBlockGroupingStep.newBlock?.id ===
                                    block.id ||
                                  currentBlockGroupingStep.currentBlocks
                                    .length === 1;

                                const hideBorders = isSmaller && isMergingOut;

                                return (
                                  <motion.div
                                    key={block.id}
                                    layout
                                    initial={false}
                                    animate={{
                                      y: isMergingOut && isSmaller ? -64 : 0,
                                      opacity: isMergingOut ? 0 : 1,
                                    }}
                                    exit={{
                                      opacity: 0,
                                    }}
                                    transition={{
                                      layout: {
                                        duration: isBigger ? 0.1 : 0.8,
                                        ease: "easeInOut",
                                      },
                                      delay: isMergingOut && isBigger ? 0.7 : 0,
                                      duration: 0.8,
                                    }}
                                    className={` grid grid-cols-[200px_200px] border border-b border-black transition-colors duration-300 ${
                                      highlightedBlocks.includes(block)
                                        ? "bg-blue/25"
                                        : "bg-white"
                                    } ${
                                      !(isBigger && isMergingOut) && "z-20"
                                    } ${roundedBorder && "rounded-b-md"} ${
                                      hideBorders && "border-0"
                                    } `}
                                  >
                                    {/* BLOCK */}
                                    <div className="p-3 border-r border-black flex justify-center items-center">
                                      <motion.div
                                        layout
                                        initial={{ opacity: 0, y: 5 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{
                                          duration: 0.4,
                                          ease: "easeInOut",
                                        }}
                                        className={`flex flex-row items-center justify-center border w-fit rounded-sm py-[2px] px-[2px] `}
                                      >
                                        <div className="text-base mx-1">
                                          {block.frequency}
                                        </div>

                                        {block.innerBlocks.length > 0 ? (
                                          block.innerBlocks.map(
                                            (innerBlock, innerIndex) => {
                                              const [r, g, b] = getRGB(
                                                innerBlock.color!,
                                                representation
                                              );

                                              return (
                                                <div
                                                  key={`innerBlock-${innerIndex}`}
                                                  style={{
                                                    backgroundColor: `rgb(${r}, ${g}, ${b})`,
                                                  }}
                                                  className="size-4 mx-1"
                                                />
                                              );
                                            }
                                          )
                                        ) : (
                                          <div
                                            style={{
                                              backgroundColor: `rgb(${r}, ${g}, ${b})`,
                                            }}
                                            className="size-4 mx-1"
                                          />
                                        )}
                                      </motion.div>
                                    </div>

                                    {/* CODE */}
                                    <div className="p-3 flex justify-center items-center">
                                      <motion.div
                                        initial={{ opacity: 0, y: 3 }}
                                        animate={
                                          highlightedBlocks.includes(block) ||
                                          showNotUsedRows
                                            ? { opacity: 1, y: 0 }
                                            : { opacity: 0, y: 3 }
                                        }
                                        transition={{
                                          duration: 0.4,
                                          ease: "easeOut",
                                        }}
                                        className="text-base"
                                      >
                                        {currentBlockGroupingStep.smallerBlock
                                          .id === block.id
                                          ? "+0"
                                          : currentBlockGroupingStep.biggerBlock
                                              .id === block.id
                                          ? "+1"
                                          : "-"}
                                      </motion.div>
                                    </div>
                                  </motion.div>
                                );
                              }
                            )}
                        </AnimatePresence>
                      </motion.div>
                    </div>

                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={
                        message.length > 0
                          ? { opacity: 1, y: 0 }
                          : { opacity: 0, y: 3 }
                      }
                    >
                      <p className="text-blue text-base font-semibold mt-2 text-center">
                        {message}
                      </p>
                    </motion.div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="bit-array"
                    initial={{ opacity: 0, y: 0 }}
                    animate={
                      showCompressedArray > 0
                        ? { opacity: 1, y: 0 }
                        : { opacity: 0, y: 0 }
                    }
                    exit={{ opacity: 0, y: 0 }}
                    className="flex flex-col font-title gap-2 2xl:gap-6"
                  >
                    {/* Bit array */}
                    <motion.div
                      initial={{ opacity: 0, y: 3 }}
                      animate={
                        showCompressedArray
                          ? { opacity: 1, y: 0 }
                          : { opacity: 0, y: 3 }
                      }
                      className="flex flex-col gap-2 w-full"
                    >
                      <p className="text-lg font-title text-blue">
                        <strong>Bit Array</strong> (representação de cada pixel
                        com seu código)
                      </p>

                      <table className="border-collapse 2xl:text-base">
                        <tbody>
                          {[...Array(size)].map((_, i) => (
                            <tr key={`bitmap-row-${i}`}>
                              {[...Array(size)].map((_, j) => {
                                const pos = i * size + j;
                                const currPixel: number | ColorIndex =
                                  grid[pos];

                                const row = table.find(
                                  (item) => item.color === currPixel
                                );

                                const [r, g, b] = getRGB(
                                  currPixel,
                                  representation
                                );

                                let textColor;

                                switch (representation) {
                                  case IMG_REPRESENTATION.BLACK_AND_WHITE:
                                    textColor = currPixel;
                                    break;
                                  case IMG_REPRESENTATION.GRAYSCALE:
                                    textColor = currPixel > 128 ? 0 : 255;
                                    break;
                                  case IMG_REPRESENTATION.COLORS:
                                    const tonality = black_and_white([
                                      currPixel as ColorIndex,
                                    ]);

                                    // If background color goes to white, text should be black and vice versa
                                    textColor = tonality[0] === 255 ? 0 : 255;
                                }

                                return (
                                  <td
                                    key={`bitarray-cell-${j}`}
                                    className={`text-center transition-all ease-in-out duration-100 border-1 border-black ${
                                      size === 4
                                        ? "h-16 w-6"
                                        : size === 8
                                        ? "h-8 w-6"
                                        : "h-6 w-6"
                                    } `}
                                    style={{
                                      backgroundColor: `rgb(${r}, ${g}, ${b})`,
                                    }}
                                  >
                                    <motion.div
                                      initial={{ opacity: 0, y: 0 }}
                                      animate={
                                        showCompressedArray >= pos + 1
                                          ? { opacity: 1, y: 0 }
                                          : { opacity: 0, y: 0 }
                                      }
                                      style={{
                                        color: `rgb(${textColor}, ${textColor}, ${textColor})`,
                                      }}
                                      className={`${
                                        size === 4 ? "text-base" : "text-sm"
                                      }`}
                                    >
                                      {row!.code}
                                    </motion.div>
                                  </td>
                                );
                              })}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </motion.div>

                    {/* Result */}
                    <motion.div
                      initial={{ opacity: 0, x: -10 }}
                      animate={
                        showResult
                          ? { opacity: 1, x: 0 }
                          : { opacity: 0, x: -10 }
                      }
                      transition={{ delay: 0.3, duration: 0.3 }}
                      className="flex flex-col"
                    >
                      <div className="flex flex-row gap-3 text-black text-xl 2xl:text-2xl mx-auto font-title font-bold items-center ">
                        <p>{size * size * 8} bits → </p>
                        <p>
                          {compressedSize} + {tableSize} (tabela) →{" "}
                        </p>
                        <div className="border border-blue rounded-md py-1 px-3 text-blue">
                          {compressedSize + tableSize} bits
                        </div>
                      </div>
                      <p className="text-lg font-title text-center text-blue">
                        {" "}
                        Redução de{" "}
                        {100 -
                          Math.round(
                            ((compressedSize + tableSize) * 100) /
                              (size * size * 8)
                          )}
                        %
                      </p>
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Buttons */}
          <motion.div
            layout
            transition={{
              duration: 0.4,
              ease: "easeOut",
            }}
            className="flex flex-row gap-4 items-center mx-auto "
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
                      text={
                        !currentTableStep && !currentBlockGroupingStep
                          ? "Iniciar"
                          : "Repetir"
                      }
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
          explanation={explanations.imageCompression.huffman}
          onClose={() => {
            setShowExplanation(false);
          }}
          isOpen={showExplanation}
        />
      </div>
  );
}
