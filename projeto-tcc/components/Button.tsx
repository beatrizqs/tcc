export default function Button({
  text,
  onClick,
  type = "filled",
}: {
  text: string;
  onClick: () => void;
  type?: "filled" | "void";
}) {
  return (
    <button
      onClick={onClick}
      className={`${
        type === "filled"
          ? "bg-blue text-white hover:bg-blue/80 "
          : "bg-white text-blue hover:bg-blue hover:text-white"
      } border border-blue border-2 transition-all duration-200 ease-out rounded-md px-4 py-2 font-title font-semibold text-sm cursor-pointer`}
    >
      {text}
    </button>
  );
}
