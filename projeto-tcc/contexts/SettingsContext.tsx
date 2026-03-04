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
  zoom: number;
  contrast: ContrastLevel;
  setZoom: (value: number) => void;
  setContrast: (value: ContrastLevel) => void;
  reset: () => void;
};

const SettingsContext = createContext<SettingsContextType | null>(null);

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [zoom, setZoom] = useState(100);
  const [contrast, setContrast] = useState<ContrastLevel>("medium");

  // Zoom global
  useEffect(() => {
    document.documentElement.style.fontSize = `${zoom}%`;
  }, [zoom]);

  // Contraste global
  useEffect(() => {
    document.documentElement.dataset.contrast = contrast;
  }, [contrast]);

  function reset() {
    setZoom(100);
    setContrast("medium");
  }

  return (
    <SettingsContext.Provider
      value={{
        zoom,
        contrast,
        setZoom,
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
