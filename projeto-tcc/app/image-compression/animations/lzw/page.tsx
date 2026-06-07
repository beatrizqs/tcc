"use client";

import { Suspense } from "react";
import LZW from "./LZW";

export default function LZWPage() {
  return (
    <Suspense fallback={<div>Carregando...</div>}>
      <LZW />
    </Suspense>
  );
}
