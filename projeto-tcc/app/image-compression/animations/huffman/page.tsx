"use client";

import { Suspense } from "react";
import Huffman from "./Huffman";

export default function HuffmanPage() {
  return (
    <Suspense fallback={<div>Carregando...</div>}>
      <Huffman />
    </Suspense>
  );
}
