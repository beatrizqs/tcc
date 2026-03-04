type InputProps = {
  value: string;
  label: string;
  onChange: (value: string) => void;
  error?: string;
} & Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange" | "value">;

export default function Input({
  value,
  onChange,
  label,
  error,
  ...props
}: InputProps) {

  return (
    <div className="flex flex-col w-full">
      <p className="font-common text-sm font-semibold mb-2">{label}</p>
      <input
        {...props}
        value={value}
        onChange={(e) => {onChange(e.target.value)}}
        className={`border ${
          error ? "border-red-500 border-2" : "border-gray-300"
        } rounded-sm py-1 px-1.5 font-common`}
      />
      {error && (
        <p className="text-red-500 font-common text-xs mt-1 break-words w-full">{error}</p>
      )}
    </div>
  );
}
