"use client";

import { Suspense } from "react";
import Vigenere from "./Vigenere";

export default function VigenerePage() {
  return (
    <Suspense fallback={<div>Carregando...</div>}>
      <Vigenere />
    </Suspense>
  );
}
