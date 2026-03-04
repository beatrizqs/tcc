import { useState } from "react";

interface TabsProps {
  onChange?: (index: number) => void;
}

export default function Tabs({ onChange }: TabsProps) {
  const [active, setActive] = useState(0); 

  function handleTab(index: number) {
    setActive(index);
    onChange?.(index);
  }


  return (
    <div className="relative inline-flex rounded-lg border border-blue bg-white p-1 w-[350px] md:w-[420px]">
      <div
        className="absolute top-1 bottom-1 left-1 rounded-md bg-blue transition-transform duration-300"
        style={{
          width: `50%`,
          transform: `translateX(${Math.min(active * 100, 95)}%)`,
        }}
      />

      {["Modelos prontos", "Criar modelo"].map((tab, index) => (
        <button
          key={tab}
          onClick={() => handleTab(index)}
          className={`
            relative z-10 px-6 py-1 text-lg font-title font-bold transition-colors w-1/2 cursor-pointer
            ${active === index ? "text-white" : "text-blue hover:text-blue-800"}
          `}
        >
          {tab}
        </button>
      ))}
    </div>
  );
}
