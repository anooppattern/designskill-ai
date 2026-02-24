"use client";

import type { ColorToken } from "@/lib/types";

interface ColorPaletteProps {
  colors: ColorToken[];
}

export function ColorPalette({ colors }: ColorPaletteProps) {
  if (colors.length === 0) return null;

  const groups = groupByGroup(colors);

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-white">Colors</h3>
      {Object.entries(groups).map(([groupName, groupColors]) => {
        if (groupColors.length === 0) return null;
        return (
          <div key={groupName}>
            <h4 className="text-sm font-medium text-zinc-400 mb-3 capitalize">
              {groupName}
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {groupColors.map((color, i) => (
                <div
                  key={`${color.value}-${i}`}
                  className="group rounded-lg overflow-hidden border border-zinc-800 hover:border-zinc-600 transition-colors"
                >
                  <div
                    className="h-16 w-full"
                    style={{ backgroundColor: color.value }}
                  />
                  <div className="p-2 bg-zinc-900">
                    <p className="text-xs font-medium text-white truncate">
                      {color.name}
                    </p>
                    <p className="text-xs text-zinc-500 font-mono">
                      {color.value}
                    </p>
                    {color.cssVariable && (
                      <p className="text-xs text-zinc-600 font-mono truncate mt-0.5">
                        {color.cssVariable}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function groupByGroup(colors: ColorToken[]): Record<string, ColorToken[]> {
  const groups: Record<string, ColorToken[]> = {};
  for (const color of colors) {
    const group = color.group || "other";
    if (!groups[group]) groups[group] = [];
    groups[group].push(color);
  }
  return groups;
}
