"use client";

import { Suspense } from "react";
import Addition from "./Addition";

export default function AdditionPage() {
  return (
    <Suspense fallback={<div>Carregando...</div>}>
      <Addition />
    </Suspense>
  );
}
