"use client";

interface TokenTableProps {
  title: string;
  headers: string[];
  rows: string[][];
}

export function TokenTable({ title, headers, rows }: TokenTableProps) {
  if (rows.length === 0) return null;

  return (
    <div className="space-y-3">
      <h3 className="text-lg font-semibold text-white">{title}</h3>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-zinc-800">
              {headers.map((h) => (
                <th
                  key={h}
                  className="text-left py-2 px-3 text-zinc-400 font-medium"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr key={i} className="border-b border-zinc-800/50">
                {row.map((cell, j) => (
                  <td key={j} className="py-2 px-3 text-zinc-300 font-mono">
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
