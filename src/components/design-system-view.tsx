"use client";

import type { DesignSystem } from "@/lib/types";
import { ColorPalette } from "./color-palette";
import { TypographyTable } from "./typography-table";
import { TokenTable } from "./token-table";

interface DesignSystemViewProps {
  designSystem: DesignSystem;
}

export function DesignSystemView({ designSystem: ds }: DesignSystemViewProps) {
  return (
    <div className="space-y-10">
      <div className="flex items-center gap-3">
        <h2 className="text-2xl font-bold text-white">
          {ds.siteName}
        </h2>
        <span className="text-sm text-zinc-500">
          {new URL(ds.url).hostname}
        </span>
      </div>

      {/* Colors */}
      <ColorPalette colors={ds.colors} />

      {/* Typography */}
      <TypographyTable typography={ds.typography} fonts={ds.fonts} />

      {/* Spacing */}
      {ds.spacing.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-white">Spacing Scale</h3>
          <div className="flex flex-wrap gap-3">
            {ds.spacing.map((s, i) => (
              <div
                key={i}
                className="flex flex-col items-center gap-1 p-3 bg-zinc-900 rounded-lg border border-zinc-800"
              >
                <div
                  className="bg-blue-500 rounded"
                  style={{
                    width: `${Math.min(s.normalizedPx, 64)}px`,
                    height: `${Math.min(s.normalizedPx, 64)}px`,
                    minWidth: "4px",
                    minHeight: "4px",
                  }}
                />
                <span className="text-xs font-medium text-zinc-300">
                  {s.label}
                </span>
                <span className="text-xs text-zinc-500">{s.normalizedPx}px</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Border Radius */}
      <TokenTable
        title="Border Radius"
        headers={["Token", "Value"]}
        rows={ds.borderRadius.map((br) => [br.label || br.value, br.value])}
      />

      {/* Shadows */}
      <TokenTable
        title="Shadows"
        headers={["Token", "Value"]}
        rows={ds.shadows.map((s) => [s.label || "shadow", s.value])}
      />

      {/* Breakpoints */}
      <TokenTable
        title="Breakpoints"
        headers={["Name", "Value"]}
        rows={ds.breakpoints.map((bp) => [bp.label || bp.value, bp.value])}
      />

      {/* Z-Index */}
      {ds.zIndex.length > 0 && (
        <TokenTable
          title="Z-Index Scale"
          headers={["Value", "Used By"]}
          rows={ds.zIndex.map((z) => [
            String(z.value),
            z.selectors.slice(0, 3).join(", "),
          ])}
        />
      )}

      {/* Transitions */}
      {ds.transitions.length > 0 && (
        <TokenTable
          title="Transitions"
          headers={["Value", "Frequency"]}
          rows={ds.transitions.slice(0, 5).map((t) => [
            t.value,
            `${t.frequency}x`,
          ])}
        />
      )}

      {/* CSS Variables count */}
      <div className="text-sm text-zinc-500">
        {Object.keys(ds.cssVariables).length} CSS custom properties extracted
      </div>
    </div>
  );
}
