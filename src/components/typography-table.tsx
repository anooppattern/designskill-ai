"use client";

import type { TypographyToken } from "@/lib/types";

interface TypographyTableProps {
  typography: TypographyToken[];
  fonts: string[];
}

export function TypographyTable({ typography, fonts }: TypographyTableProps) {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-white">Typography</h3>

      {fonts.length > 0 && (
        <div className="mb-4">
          <h4 className="text-sm font-medium text-zinc-400 mb-2">
            Font Families
          </h4>
          <div className="flex flex-wrap gap-2">
            {fonts.map((font) => (
              <span
                key={font}
                className="px-3 py-1 bg-zinc-800 rounded-md text-sm text-zinc-300 font-mono"
              >
                {font}
              </span>
            ))}
          </div>
        </div>
      )}

      {typography.length > 0 && (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-800">
                <th className="text-left py-2 px-3 text-zinc-400 font-medium">
                  Element
                </th>
                <th className="text-left py-2 px-3 text-zinc-400 font-medium">
                  Size
                </th>
                <th className="text-left py-2 px-3 text-zinc-400 font-medium">
                  Weight
                </th>
                <th className="text-left py-2 px-3 text-zinc-400 font-medium">
                  Line Height
                </th>
                <th className="text-left py-2 px-3 text-zinc-400 font-medium">
                  Preview
                </th>
              </tr>
            </thead>
            <tbody>
              {typography.map((t, i) => (
                <tr
                  key={`${t.element}-${i}`}
                  className="border-b border-zinc-800/50"
                >
                  <td className="py-2 px-3 text-zinc-300 font-mono">
                    {t.element}
                  </td>
                  <td className="py-2 px-3 text-zinc-300">
                    {t.fontSize}{" "}
                    <span className="text-zinc-500">({t.fontSizePx}px)</span>
                  </td>
                  <td className="py-2 px-3 text-zinc-300">{t.fontWeight}</td>
                  <td className="py-2 px-3 text-zinc-300">{t.lineHeight}</td>
                  <td className="py-2 px-3">
                    <span
                      style={{
                        fontSize: `${Math.min(t.fontSizePx, 32)}px`,
                        fontWeight: parseInt(t.fontWeight) || 400,
                      }}
                      className="text-white"
                    >
                      Aa
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
