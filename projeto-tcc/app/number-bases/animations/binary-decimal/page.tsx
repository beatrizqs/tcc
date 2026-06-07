"use client";

import { Suspense } from "react";
import BinaryDecimal from "./BinaryDecimal";

export default function BinaryDecimalPage() {
  return (
    <Suspense fallback={<div>Carregando...</div>}>
      <BinaryDecimal />
    </Suspense>
  );
}
