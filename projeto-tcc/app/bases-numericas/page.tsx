'use client'

import TextualExplanation from "@/components/TextualExplanation";
import { useSettings } from "@/contexts/SettingsContext";

export default function BasesNumericas() {
  const { language } = useSettings();

  const titles = {
    pt: {
      explanation:
        "Lorem ipsum é um texto utilizado como espaço reservado em layouts e projetos. Ele ajuda a visualizar a estrutura do conteúdo antes da versão final. Este texto não possui significado real, servindo apenas para preenchimento. É amplamente usado em design gráfico e desenvolvimento web. Permite focar no estilo e na organização visual. Posteriormente, será substituído pelo conteúdo definitivo. Lorem ipsum é um texto utilizado como espaço reservado em layouts e projetos. Ele ajuda a visualizar a estrutura do conteúdo antes da versão final. Este texto não possui significado real, servindo apenas para preenchimento. É amplamente usado em design gráfico e desenvolvimento web. Permite focar no estilo e na organização visual. Posteriormente, será substituído pelo conteúdo definitivo.",
    },
    en: {
      explanation:
        "Lorem ipsum is a placeholder text used in layouts and design projects. It helps visualize content structure before the final version. This text has no real meaning and serves only as temporary filling. It is widely used in graphic design and web development. It allows focus on visual style and layout organization. Later, it will be replaced with the final content.",
    },
    es: {
      explanation:
        "Lorem ipsum es un texto de relleno utilizado en diseños y proyectos. Ayuda a visualizar la estructura del contenido antes de la versión final. Este texto no tiene significado real y sirve solo como relleno temporal. Es ampliamente utilizado en diseño gráfico y desarrollo web. Permite centrarse en el estilo y la organización visual. Posteriormente será reemplazado por el contenido definitivo.",
    },
  };

  const title = titles[language].explanation;
  return (
    <div className="flex flex-col">
      Bases numéricas
      <TextualExplanation explanation={title}/>
    </div>
  );
}
