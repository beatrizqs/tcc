"use client";

import { Suspense } from "react";
import Subtraction from "./Subtraction";

export default function SubtractionPage() {
  return (
    <Suspense fallback={<div>Carregando...</div>}>
      <Subtraction />
    </Suspense>
  );
}
