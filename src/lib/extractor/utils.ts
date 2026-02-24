import { parse, formatHex, formatHex8 } from "culori";

export function normalizeColor(value: string): string | null {
  if (!value || value === "transparent" || value === "currentColor" || value === "currentcolor") {
    return null;
  }
  const trimmed = value.trim();
  if (trimmed === "none" || trimmed === "initial" || trimmed === "inherit" || trimmed === "unset") {
    return null;
  }
  try {
    const parsed = parse(trimmed);
    if (!parsed) return null;
    const alpha = parsed.alpha ?? 1;
    if (alpha === 0) return null;
    if (alpha < 1) {
      return formatHex8(parsed);
    }
    return formatHex(parsed);
  } catch {
    return null;
  }
}

export function parseCSSValue(value: string): { number: number; unit: string } | null {
  const match = value.trim().match(/^(-?\d+(?:\.\d+)?)\s*(px|rem|em|%|vw|vh|pt|cm|mm|in)?$/);
  if (!match) return null;
  return { number: parseFloat(match[1]), unit: match[2] || "" };
}

export function remToPx(rem: number, rootFontSize: number = 16): number {
  return rem * rootFontSize;
}

export function normalizeToPx(value: string, rootFontSize: number = 16): number | null {
  const parsed = parseCSSValue(value);
  if (!parsed) return null;
  switch (parsed.unit) {
    case "px":
    case "":
      return Math.round(parsed.number);
    case "rem":
    case "em":
      return Math.round(remToPx(parsed.number, rootFontSize));
    case "pt":
      return Math.round(parsed.number * (4 / 3));
    default:
      return null;
  }
}

export function deduplicateByKey<T>(items: T[], keyFn: (item: T) => string): T[] {
  const seen = new Set<string>();
  return items.filter((item) => {
    const key = keyFn(item);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export function normalizeWhitespace(str: string): string {
  return str.replace(/\s+/g, " ").trim();
}

export function isColorProperty(prop: string): boolean {
  return [
    "color",
    "background-color",
    "border-color",
    "border-top-color",
    "border-right-color",
    "border-bottom-color",
    "border-left-color",
    "outline-color",
    "text-decoration-color",
    "fill",
    "stroke",
  ].includes(prop);
}

export function isColorValue(value: string): boolean {
  return normalizeColor(value) !== null;
}

export function gcd(a: number, b: number): number {
  a = Math.abs(Math.round(a));
  b = Math.abs(Math.round(b));
  while (b) {
    [a, b] = [b, a % b];
  }
  return a;
}

export function findBaseUnit(values: number[]): number {
  const filtered = values.filter((v) => v > 0);
  if (filtered.length === 0) return 4;
  let result = filtered[0];
  for (let i = 1; i < filtered.length; i++) {
    result = gcd(result, filtered[i]);
  }
  return result || 4;
}
