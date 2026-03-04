type InputProps = {
  value: string;
  label: string;
  type: "number" | "text";
  onChange: (value: string) => void;
  allow?: RegExp;
};

export default function Input({
  value,
  onChange,
  allow,
  label,
  type = "text",
  ...props
}: InputProps & React.InputHTMLAttributes<HTMLInputElement>) {
  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const next = e.target.value;

    if (allow && !allow.test(next)) return;

    onChange(next);
  }

  return (
    <div className="flex flex-col gap-2">
      <p className="font-common text-sm font-semibold">{label}</p>
      <input {...props} value={value} onChange={handleChange} type={type} className="border border-gray-300 rounded-sm py-1 px-1.5 font-common"/>
    </div>
  );
}
