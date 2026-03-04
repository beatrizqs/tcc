export type TableRow = {
  id: string;
  [key: string]: string | number;
};

export default function Table({
  headers,
  data,
  selectedItem,
  onSelect,
}: {
  headers: { key: keyof TableRow; label: string }[];
  data: TableRow[];
  selectedItem?: TableRow;
  onSelect: (selectedItem: TableRow) => void;
}) {
  return (
    <div className="border border-gray-300 rounded-lg place-self-center w-[70%]">
      <table className="overflow-hidden font-common w-full">
        <thead className="border-b border-black">
          <tr>
            <th className="w-8" />
            {headers.map((header) => (
              <th
                key={String(header.key)}
                className="text-left px-4 py-2 font-semibold text-sm"
              >
                {header.label}
              </th>
            ))}
          </tr>
        </thead>

        <tbody>
          {data.map((item, i) => {
            const isSelected = selectedItem?.id === item.id;

            return (
              <tr
                key={item.id}
                className={`cursor-pointer ${i > 0 && "border-t border-gray-400"} ${
                  isSelected ? "bg-blue/25" : "hover:bg-blue/10"
                }`}
                onClick={() => onSelect(item)}
              >
                <td className="text-center">
                  <input
                    type="radio"
                    checked={isSelected}
                    onChange={() => onSelect(item)}
                  />
                </td>

                {headers.map((header) => (
                  <td key={String(header.key)} className="px-4 py-2 text-sm">
                    {String(item[header.key])}
                  </td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
