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

type VisualNode = {
  node: Node;
  x: number;
  y: number;
};

type VisualNodePair = {
  parentFrequency: number;
  pair: VisualNode[];
};

type Layout = Record<number, VisualNodePair[]>; // Key represents current depth in tree

type TreeStep = {
  biggerNode: Node; // Bigger node that will be paired up
  smallerNode: Node; // Smaller node that will be paired up
  parentNode: Node;
  index: number;
  layout: Layout;
};

type TableStep = {
  block: Block;
  renderTableBlock: boolean;
  renderTableFrequency: boolean;
};

type Block = {
  color: ColorIndex | number;
  frequency: number;
  pixels: number[]; // Index of this block's pixels on the original image
  code: string;
};

type Node = {
  id: number;
  frequency: number;
  block: ColorIndex | number | undefined;
  parent: Node | undefined;
  children: Node[];
  parentEdge: number; // Branch that links current node to parent node, either 0 or 1
};

const NULL_NODE = {
  id: -1,
  frequency: 0,
  block: undefined,
  parent: undefined,
  children: [],
  parentEdge: -1,
};

export default function Huffman() {
  // Table
  const [currentTableStep, setCurrentTableStep] = useState<TableStep>();
  const [highlightedPixels, setHighlightedPixels] = useState(0); // Image pixels that are being counted for the compression
  const [visibleRows, setVisibleRows] = useState(0); // Rows visible in table
  const [visibleCodes, setVisibleCodes] = useState<string[]>([]); // Codes visible (only visible after path is highlighted)

  // Tree
  const [renderTree, setRenderTree] = useState(false);
  const [currentTreeStep, setCurrentTreeStep] = useState<TreeStep>();
  const [showEdgeValues, setShowEdgeValues] = useState(false); // Shows edge values after Huffman tree is done
  const [generateTableCodes, setGenerateTableCodes] = useState(false); // Initiates code generating step
  const [highlightedEdgePath, setHighlightedEdgePath] = useState(""); // Highlights path to the current node

  // Bit array
  const [showCompressedArray, setShowCompressedArray] = useState(false); // Render bit array and show size calculation

  // Result
  const [visibleResult, setVisibleResult] = useState(-1); // ?
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

  const HORIZONTAL_SPACING = 210;
  const VERTICAL_SPACING = 110;

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

  const getNodeDepth = (node: Node): number => {
    if (!node.parent) return 0;
    return getNodeDepth(node.parent) + 1;
  };

  const positionLayout = (layout: Layout): Layout => {
    const positionedLayout: Layout = {};

    for (const [depthStr, row] of Object.entries(layout)) {
      const depth = Number(depthStr);

      const pairSpacing = 140; // Space between pairs
      const nodeSpacing = 40; // Space between siblings

      const totalWidth = (row.length - 1) * pairSpacing;
      const startX = -totalWidth / 2;

      positionedLayout[depth] = row.map((pairData, pairIndex) => {
        const pairCenterX = startX + pairIndex * pairSpacing;

        const positionedPair = pairData.pair.map((visualNode, nodeIndex) => {
          const offset =
            pairData.pair.length === 1
              ? 0
              : nodeIndex === 0
              ? -nodeSpacing / 2
              : nodeSpacing / 2;

          return {
            ...visualNode,
            x: pairCenterX + offset,
            y: depth * VERTICAL_SPACING,
          };
        });

        return {
          ...pairData,
          pair: positionedPair,
        };
      });
    }

    return positionedLayout;
  };

  const createLayout = (
    currentLayout: Layout,
    activeNodes: Node[],
    biggerNode: Node,
    smallerNode: Node,
    parentNode: Node
  ) => {
    const topRow: VisualNode[] = activeNodes.map((node) => ({
      node,
      x: 0,
      y: 0,
    }));

    const childDepth = getNodeDepth(biggerNode);

    const childNodes: VisualNode[] = [
      {
        node: biggerNode,
        x: 0,
        y: 0,
      },
      {
        node: smallerNode,
        x: 0,
        y: 0,
      },
    ];

    const newLayout: Layout = {
      0: topRow.map((node) => {
        return { parentFrequency: 0, pair: [node] };
      }),
    };

    for (const key of Object.keys(currentLayout)) {
      const rowDepth = Number(key);
      const currentRow = currentLayout[rowDepth];

      // Reorganizes tree into new depths
      if (rowDepth !== 0) {
        const depth = getNodeDepth(currentRow[0].pair[0].node); // New depth of the row

        if (childDepth === depth) {
          // Inserts new children in level of tree
          newLayout[depth] = [...currentRow];
          insertSorted(
            newLayout[depth],
            { parentFrequency: parentNode.frequency, pair: childNodes },
            (item) => item.parentFrequency
          );
        } else {
          newLayout[depth] = currentRow;
        }
      }
    }

    // If new level has to be created for the new children
    if (!Object.keys(currentLayout).includes(childDepth.toString())) {
      newLayout[childDepth] = [
        { parentFrequency: parentNode.frequency, pair: childNodes },
      ];
    }

    return positionLayout(newLayout);
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
    tree,
    tableSteps,
    treeSteps,
    originalNodeOrder,
  }: {
    table: Block[];
    tree: Node[];
    tableSteps: TableStep[];
    treeSteps: TreeStep[];
    originalNodeOrder: Node[];
  } = useMemo(() => {
    const table: Block[] = [];
    let tree: Node[] = [];
    const treeSteps: TreeStep[] = [];

    const blockTypes: (ColorIndex | number)[] = [...new Set(grid)];

    for (const block of blockTypes) {
      let frequency = 0;
      const pixels = [];
      for (let i = 0; i < grid.length; i++) {
        if (grid[i] === block) {
          frequency++;
          pixels.push(i);
        }
      }

      table.push({ color: block, frequency, code: "", pixels });
    }

    const tableSteps: TableStep[] = table.map((row) => {
      return {
        block: row,
        renderTableBlock: false,
        renderTableFrequency: false,
      };
    });

    function createNodes(blocks: Block[]): Node[] {
      return blocks.map((block, index) => ({
        id: index,
        frequency: block.frequency,
        block: block.color,
        parent: undefined,
        children: [],
        parentEdge: -1,
      }));
    }

    const originalOrder = [...table];
    const originalNodeOrder = createNodes(originalOrder);

    // Sorts by frequency, biggest to smallest
    table.sort((a, b) => b.frequency - a.frequency);

    const nodes = createNodes(table);

    let nodeIndex = nodes.length;
    let stepIndex = 0;

    // Nodes that need to be paired up
    const activeNodes = [...nodes];

    let currentLayout: Layout = {
      0: activeNodes.map((node) => ({
        parentFrequency: 0,
        pair: [
          {
            node,
            x: 0,
            y: 0,
          },
        ],
      })),
    };

    currentLayout = positionLayout(currentLayout);

    // Creates Huffman tree
    while (activeNodes.length > 1) {
      const smallerNode = activeNodes.at(-1)!;
      const biggerNode = activeNodes.at(-2)!;

      const parentNode: Node = {
        id: nodeIndex,
        frequency: smallerNode.frequency + biggerNode.frequency,
        block: undefined,
        parent: undefined,
        children: [biggerNode, smallerNode],
        parentEdge: -1,
      };

      biggerNode.parent = parentNode;
      biggerNode.parentEdge = 0;

      smallerNode.parent = parentNode;
      smallerNode.parentEdge = 1;

      treeSteps.push({
        biggerNode,
        smallerNode,
        parentNode,
        index: stepIndex,
        layout: structuredClone(currentLayout),
      });

      // Remove paired nodes
      const filteredNodes = activeNodes.filter(
        (node) => node !== smallerNode && node !== biggerNode
      );

      // Define new top layer
      insertSorted(filteredNodes, parentNode, (item) => item.frequency);

      activeNodes.length = 0;
      activeNodes.push(...filteredNodes);

      currentLayout = createLayout(
        currentLayout,
        activeNodes,
        biggerNode,
        smallerNode,
        parentNode
      );

      nodes.push(parentNode);

      nodeIndex++;
      stepIndex++;
    }

    treeSteps.push({
      biggerNode: NULL_NODE,
      smallerNode: NULL_NODE,
      parentNode: NULL_NODE,
      index: stepIndex,
      layout: structuredClone(currentLayout),
    });

    tree = nodes;

    // Creates block codes
    const createBlockCodes = (currentPath: string, currentNode: Node) => {
      // Not leaf
      if (currentNode.children.length > 0) {
        // Left (0)
        createBlockCodes(`${currentPath}${0}`, currentNode.children[0]);

        // Right (1)
        createBlockCodes(`${currentPath}${1}`, currentNode.children[1]);
      } else {
        // Leaf (image pixels)
        const block = table.find((item) => item.color === currentNode.block);
        block!.code = currentPath;
        return;
      }

      return;
    };

    const currentNode = nodes.at(-1); // Root
    const currentPath = "";

    createBlockCodes(currentPath, currentNode!);

    return { table, tree, tableSteps, treeSteps, originalNodeOrder };
  }, [grid]);

  const compressed_size = useMemo(() => {
    const size = table.reduce((acc, block) => {
      return block.code.length * block.frequency + acc;
      // New size is calculated by how many bits are needed to represent the image
      // Recreating the original bitmap, we swap the block for the new code, where each number is a bit
    }, 0);

    return size;
  }, [table]);

  const getRGB = (color: ColorIndex | number) => {
    const [r, g, b] =
      representation === IMG_REPRESENTATION.COLORS
        ? PALETTE[color as ColorIndex]
        : [color, color, color];

    return [r, g, b];
  };

  const reset = () => {
    setCurrentTreeStep(undefined);
    setVisibleResult(-1);
    setHighlightedPixels(0);
    setIsPaused(false);
    setShowResult(false);

    runAnimation();
  };

  const finish = () => {
    setShowResult(true);
    //setVisibleResult(steps.length);
    setHighlightedPixels(0);
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

      // Scan image to create table
      // for (let i = 0; i < tableSteps.length; i++) {
      //   setCurrentTableStep(tableSteps[i]);
      //   await waitStep(50, id);

      //   for (let j = 0; j < table[i].frequency; j++) {
      //     await waitStep(200, id);
      //     setHighlightedPixels(j);
      //   }

      //   await waitStep(400, id);
      //   // Shows table row
      //   setVisibleRows(i + 1);

      //   // Shows block
      //   await waitStep(300, id);
      //   setCurrentTableStep((prev) => ({ ...prev!, renderTableBlock: true }));

      //   // Shows frequency
      //   await waitStep(500, id);
      //   setCurrentTableStep((prev) => ({
      //     ...prev!,
      //     renderTableFrequency: true,
      //   }));

      //   await waitStep(300, id);
      //   setHighlightedPixels(-1);
      // }

      setHighlightedPixels(-1);
      setRenderTree(true);
      setCurrentTreeStep({
        biggerNode: treeSteps[0].biggerNode,
        smallerNode: treeSteps[0].smallerNode,
        parentNode: treeSteps[0].parentNode,
        index: -1,
        layout: positionLayout({
          0: originalNodeOrder.map((node) => ({
            parentFrequency: 0,
            pair: [
              {
                node,
                x: 0,
                y: 0,
              },
            ],
          })),
        }),
      });

      for (let i = 0; i < treeSteps.length; i++) {
        // Creates Huffman tree
        setCurrentTreeStep(treeSteps[i]);
        await waitStep(3600, id);

        // Reorder nodes

        // Highlight smallest nodes

        // Link nodes in new node, create new frequency
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
  console.log(treeSteps);
  return (
    <div className="flex flex-col w-full h-[calc(100vh-100px)]">
      <div className="flex flex-col">
        <SidePageTitle
          title={"Compressão de imagens"}
          href={"/image-compression/params"}
        />
        <MainPageTitle title="Codificação de Huffman" noMargin />

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
                  <tr key={`bitmap-row-${i}`}>
                    {[...Array(size)].map((_, j) => {
                      const pos = i * size + j;
                      const currPixel: number | ColorIndex = grid[pos];
                      const index = currentTableStep?.block.pixels.findIndex(
                        (item) => item === pos
                      ); // Index of the current pixel on the array of pixels of this color

                      const [r, g, b] = getRGB(currPixel);

                      const highlight =
                        currentTableStep &&
                        currentTableStep?.block.color === currPixel &&
                        index !== undefined &&
                        index <= highlightedPixels;

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
                          key={`bitmap-cell-${j}`}
                        />
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>

            <p>{IMG_REPRESENTATION_LABELS[representation as Representation]}</p>
          </div>

          {/* Huffman table */}
          <div className="border-1 border-black rounded-md h-fit">
            <table className=" text-base 2xl:text-lg font-common">
              {/* Headers */}
              <thead>
                <tr className="font-title">
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
                  const [r, g, b] = getRGB(row.color);

                  const renderBlock =
                    visibleRows > i ||
                    (currentTableStep &&
                      currentTableStep.block === row &&
                      currentTableStep.renderTableBlock);

                  const renderFrequency =
                    visibleRows > i ||
                    (currentTableStep &&
                      currentTableStep.block === row &&
                      currentTableStep.renderTableFrequency);

                  return (
                    <tr
                      key={`huffman-table-row-${i}`}
                      className="justify-center"
                    >
                      <td
                        key={`cell-block-${i}`}
                        className={`border-black border-1 text-blue  ${
                          renderBlock ? "opacity-100" : "opacity-0"
                        }`}
                      >
                        <div
                          style={{ backgroundColor: `rgb(${r}, ${g}, ${b})` }}
                          className={`size-4 mx-auto`}
                        />
                      </td>
                      <td
                        key={`cell-frequency-${i}`}
                        className={`p-3 border-black border-1 text-blue text-center ${
                          renderFrequency ? "opacity-100" : "opacity-0"
                        }`}
                      >
                        {row.frequency}
                      </td>
                      <td
                        key={`cell-code-${i}`}
                        className={`p-3 border-black border-1 text-blue text-center ${
                          visibleCodes.includes(row.code)
                            ? "opacity-100"
                            : "opacity-0"
                        }`}
                      >
                        {row.code}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Tree */}
          <div className="relative w-2/3  border rounded-xl overflow-hidden">
            <div className="absolute left-1/2 top-8">
              {renderTree &&
                currentTreeStep &&
                Object.values(currentTreeStep.layout).map((row, rowIndex) =>
                  row.map((pairData, pairIndex) =>
                    pairData.pair.map(({ node, x, y }, nodeIndex) => {
                      const [r, g, b] =
                        node.block !== undefined
                          ? getRGB(node.block)
                          : [undefined, undefined, undefined];

                      return (
                        <motion.div
                          key={`${node.id}-${rowIndex}-${pairIndex}-${nodeIndex}`}
                          animate={{ x, y }}
                          transition={{ duration: 0.6 }}
                          className="absolute"
                        >
                          <div
                            className={`
                    size-14 rounded-full border-2 flex items-center justify-center
                    font-semibold bg-white
                    ${
                      node === currentTreeStep.biggerNode ||
                      node === currentTreeStep.smallerNode
                        ? "border-blue"
                        : "border-black"
                    }
                  `}
                          >
                            <div className="flex flex-row items-center gap-1">
                              {node.frequency}

                              {node.block !== undefined && (
                                <div
                                  style={{
                                    backgroundColor: `rgb(${r}, ${g}, ${b})`,
                                  }}
                                  className="size-4 rounded-xs"
                                />
                              )}
                            </div>
                          </div>
                        </motion.div>
                      );
                    })
                  )
                )}
            </div>
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
              {/* TODO */}
              <Button
                text={!currentTreeStep ? "Iniciar" : "Repetir"}
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
