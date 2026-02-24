import type {
  SpacingToken,
  RawStylesheetData,
  RawComputedElement,
} from "../types";
import { normalizeToPx, findBaseUnit } from "./utils";

const SPACING_LABELS = ["4xs", "3xs", "2xs", "xs", "sm", "md", "lg", "xl", "2xl", "3xl", "4xl", "5xl"];

export function processSpacing(
  stylesheetData: RawStylesheetData,
  computedElements: RawComputedElement[]
): SpacingToken[] {
  const valueCount = new Map<number, { count: number; originals: Set<string> }>();

  // From stylesheets
  const spacingProps = [
    "margin", "margin-top", "margin-right", "margin-bottom", "margin-left",
    "padding", "padding-top", "padding-right", "padding-bottom", "padding-left",
    "gap", "row-gap", "column-gap",
  ];

  for (const prop of spacingProps) {
    const values = stylesheetData.allPropertyValues[prop] || [];
    for (const val of values) {
      if (val.includes("var(") || val === "auto") continue;
      // Handle shorthand values like "16px 24px"
      const parts = val.split(/\s+/);
      for (const part of parts) {
        if (part === "auto" || part === "0") continue;
        const px = normalizeToPx(part);
        if (px !== null && px > 0 && px <= 200) {
          const entry = valueCount.get(px);
          if (entry) {
            entry.count++;
            entry.originals.add(part);
          } else {
            valueCount.set(px, { count: 1, originals: new Set([part]) });
          }
        }
      }
    }
  }

  // From computed styles
  const computedSpacingProps = [
    "marginTop", "marginRight", "marginBottom", "marginLeft",
    "paddingTop", "paddingRight", "paddingBottom", "paddingLeft",
  ];

  for (const el of computedElements) {
    for (const prop of computedSpacingProps) {
      const val = el.styles[prop];
      if (!val || val === "0px") continue;
      const px = normalizeToPx(val);
      if (px !== null && px > 0 && px <= 200) {
        const entry = valueCount.get(px);
        if (entry) {
          entry.count++;
        } else {
          valueCount.set(px, { count: 1, originals: new Set([val]) });
        }
      }
    }
  }

  // Convert to tokens, sorted by pixel value
  const allValues = [...valueCount.entries()]
    .map(([px, data]) => ({
      normalizedPx: px,
      frequency: data.count,
      value: `${px}px`,
    }))
    .sort((a, b) => a.normalizedPx - b.normalizedPx);

  // Keep only values that appear at least twice or are common multiples
  const baseUnit = findBaseUnit(allValues.map((v) => v.normalizedPx));
  const filtered = allValues.filter(
    (v) => v.frequency >= 2 || v.normalizedPx % baseUnit === 0
  );

  // Take top values (limit to reasonable scale size)
  const scale = filtered.slice(0, SPACING_LABELS.length);

  // Assign labels starting from a sensible position
  const midIndex = Math.max(0, Math.floor(SPACING_LABELS.length / 2) - Math.floor(scale.length / 2));
  return scale.map((token, i) => ({
    ...token,
    label: SPACING_LABELS[midIndex + i] || `${token.normalizedPx}`,
  }));
}
