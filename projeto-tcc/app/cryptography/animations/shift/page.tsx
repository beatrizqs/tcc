"use client";

import { Suspense } from "react";
import Shift from "./Shift";

export default function ShiftPage() {
  return (
    <Suspense fallback={<div>Carregando...</div>}>
      <Shift />
    </Suspense>
  );
}
