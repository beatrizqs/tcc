"use client";

import { Suspense } from "react";
import DecimalBinary from "./DecimalBinary";

export default function DecimalBinaryPage() {
  return (
    <Suspense fallback={<div>Carregando...</div>}>
      <DecimalBinary />
    </Suspense>
  );
}
