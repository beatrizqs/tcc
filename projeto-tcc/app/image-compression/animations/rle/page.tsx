"use client";

import { Suspense } from "react";
import RLE from "./RLE";

export default function RLEPage() {
  return (
    <Suspense fallback={<div>Carregando...</div>}>
      <RLE />
    </Suspense>
  );
}
