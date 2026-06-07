"use client";

import { Suspense } from "react";
import Substitution from "./Substitution";

export default function SubstitutionPage() {
  return (
    <Suspense fallback={<div>Carregando...</div>}>
      <Substitution />
    </Suspense>
  );
}
