"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";

export type ContrastLevel = "low" | "medium" | "high";

export type Language = "pt" | "en" | "es";

type SettingsContextType = {
  zoom: number;
  contrast: ContrastLevel;
  language: Language;
  setZoom: (value: number) => void;
  setContrast: (value: ContrastLevel) => void;
  setLanguage: (value: Language) => void;
  reset: () => void;
};

const SettingsContext = createContext<SettingsContextType | null>(null);

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [zoom, setZoom] = useState(100);
  const [contrast, setContrast] = useState<ContrastLevel>("medium");
  const [language, setLanguage] = useState<Language>("pt");

  // Zoom global
  useEffect(() => {
    document.documentElement.style.fontSize = `${zoom}%`;
  }, [zoom]);

  // Contraste global
  useEffect(() => {
    document.documentElement.dataset.contrast = contrast;
  }, [contrast]);

  // Idioma
  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  function reset() {
    setZoom(100);
    setContrast("medium");
    setLanguage("pt");
  }

  return (
    <SettingsContext.Provider
      value={{
        zoom,
        contrast,
        language,
        setZoom,
        setContrast,
        setLanguage,
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
