"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";

export type ContrastLevel = "low" | "medium" | "high";

type SettingsContextType = {
  contrast: ContrastLevel;
  setContrast: (value: ContrastLevel) => void;
  reset: () => void;
};

const SettingsContext = createContext<SettingsContextType | null>(null);

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [contrast, setContrast] = useState<ContrastLevel>("medium");

  //  Global contrast
  useEffect(() => {
    document.documentElement.dataset.contrast = contrast;
  }, [contrast]);

  function reset() {
    setContrast("medium");
  }

  return (
    <SettingsContext.Provider
      value={{
        contrast,
        setContrast,
        reset,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const ctx = useContext(SettingsContext);
  if (!ctx) {
    throw new Error("useSettings deve ser usado dentro de SettingsProvider");
  }
  return ctx;
}
