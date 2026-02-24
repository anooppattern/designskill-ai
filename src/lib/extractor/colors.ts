import namer from "color-namer";
import type {
  ColorToken,
  RawCSSVariable,
  RawStylesheetData,
  RawComputedElement,
} from "../types";
import { normalizeColor, isColorProperty, isColorValue } from "./utils";

// Common browser default / user-agent stylesheet colors that should be excluded
// These are NOT intentional design tokens — they're browser defaults
const BROWSER_DEFAULT_COLORS = new Set([
  "#0000ee", // Default link color (most browsers)
  "#0000ff", // Blue (alternate link default)
  "#551a8b", // Default visited link color
  "#800080", // Purple (alternate visited)
  "#0066cc", // Common UA link color
  "#000080", // Navy (old browser default)
  "#ff0000", // Red (error state default — too generic)
  "#008000", // Green (default for mark/ins elements)
]);

interface RawColor {
  normalized: string;
  original: string;
  source: ColorToken["source"];
  cssVariable?: string;
  property?: string;
}

function collectFromCSSVariables(
  vars: Record<string, RawCSSVariable>
): RawColor[] {
  const colors: RawColor[] = [];
  for (const [varName, data] of Object.entries(vars)) {
    const value = data.resolvedValue || data.value;
    const normalized = normalizeColor(value);
    if (normalized) {
      colors.push({
        normalized,
        original: value,
        source: "css-variable",
        cssVariable: varName,
      });
    }
  }
  return colors;
}

function collectFromStylesheets(data: RawStylesheetData): RawColor[] {
  const colors: RawColor[] = [];
  const colorProps = [
    "color",
    "background-color",
    "border-color",
    "outline-color",
  ];
  for (const prop of colorProps) {
    const values = data.allPropertyValues[prop] || [];
    for (const val of values) {
      // Skip var() references - they're handled via CSS variables
      if (val.includes("var(")) continue;
      const normalized = normalizeColor(val);
      if (normalized) {
        colors.push({
          normalized,
          original: val,
          source: "stylesheet",
          property: prop,
        });
      }
    }
  }
  return colors;
}

function collectFromComputedStyles(elements: RawComputedElement[]): RawColor[] {
  const colors: RawColor[] = [];
  const propMap: Record<string, string> = {
    color: "color",
    backgroundColor: "background-color",
    borderColor: "border-color",
  };
  for (const el of elements) {
    for (const [jsProp, cssProp] of Object.entries(propMap)) {
      const val = el.styles[jsProp];
      if (val) {
        const normalized = normalizeColor(val);
        if (normalized) {
          colors.push({
            normalized,
            original: val,
            source: "computed-style",
            property: cssProp,
          });
        }
      }
    }
  }
  return colors;
}

function nameColor(hex: string, cssVariable?: string): string {
  // Prefer CSS variable name if available
  if (cssVariable) {
    return cssVariable
      .replace(/^--/, "")
      .replace(/[-_]/g, " ")
      .replace(/\b\w/g, (c) => c.toUpperCase());
  }
  try {
    const names = namer(hex);
    return names.ntc[0]?.name || names.basic[0]?.name || hex;
  } catch {
    return hex;
  }
}

function inferGroup(
  hex: string,
  cssVariable?: string,
  frequency: number = 1
): ColorToken["group"] {
  const lower = (cssVariable || "").toLowerCase();

  // Semantic detection
  if (
    lower.includes("success") ||
    lower.includes("error") ||
    lower.includes("warning") ||
    lower.includes("info") ||
    lower.includes("danger") ||
    lower.includes("alert")
  ) {
    return "semantic";
  }

  // Primary detection
  if (lower.includes("primary") || lower.includes("brand")) {
    return "primary";
  }

  // Accent detection
  if (lower.includes("accent") || lower.includes("secondary")) {
    return "accent";
  }

  // Surface detection
  if (
    lower.includes("surface") ||
    lower.includes("background") ||
    lower.includes("bg")
  ) {
    return "surface";
  }

  // Neutral detection by saturation
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const saturation = max === 0 ? 0 : (max - min) / max;
  if (saturation < 0.1) {
    return "neutral";
  }

  // High frequency non-neutral = primary
  if (frequency > 5) {
    return "primary";
  }

  return "accent";
}

export function processColors(
  cssVars: Record<string, RawCSSVariable>,
  stylesheetData: RawStylesheetData,
  computedElements: RawComputedElement[]
): ColorToken[] {
  const rawColors = [
    ...collectFromCSSVariables(cssVars),
    ...collectFromStylesheets(stylesheetData),
    ...collectFromComputedStyles(computedElements),
  ];

  // Build a set of colors that actually appear in computed styles on the page
  // This is our "ground truth" — these colors are actually visible to users
  const computedColorSet = new Set<string>();
  for (const raw of rawColors) {
    if (raw.source === "computed-style") {
      computedColorSet.add(raw.normalized);
    }
  }

  // Also build a set of colors backed by CSS variables
  const cssVarColorSet = new Set<string>();
  for (const raw of rawColors) {
    if (raw.source === "css-variable") {
      cssVarColorSet.add(raw.normalized);
    }
  }

  // Aggregate by normalized hex
  const colorMap = new Map<
    string,
    {
      normalized: string;
      originals: Set<string>;
      sources: Set<ColorToken["source"]>;
      cssVariables: Set<string>;
      properties: Set<string>;
      count: number;
    }
  >();

  for (const raw of rawColors) {
    const existing = colorMap.get(raw.normalized);
    if (existing) {
      existing.originals.add(raw.original);
      existing.sources.add(raw.source);
      if (raw.cssVariable) existing.cssVariables.add(raw.cssVariable);
      if (raw.property) existing.properties.add(raw.property);
      existing.count++;
    } else {
      colorMap.set(raw.normalized, {
        normalized: raw.normalized,
        originals: new Set([raw.original]),
        sources: new Set([raw.source]),
        cssVariables: new Set(raw.cssVariable ? [raw.cssVariable] : []),
        properties: new Set(raw.property ? [raw.property] : []),
        count: 1,
      });
    }
  }

  // Convert to ColorToken array
  const tokens: ColorToken[] = [];
  for (const [hex, data] of colorMap) {
    const cssVar = [...data.cssVariables][0]; // primary CSS variable
    tokens.push({
      value: hex,
      originalValue: [...data.originals][0],
      name: nameColor(hex, cssVar),
      source: data.sources.has("css-variable")
        ? "css-variable"
        : data.sources.has("stylesheet")
          ? "stylesheet"
          : "computed-style",
      cssVariable: cssVar,
      properties: [...data.properties],
      frequency: data.count,
      group: inferGroup(hex, cssVar, data.count),
    });
  }

  // Multi-layered filtering for high-confidence design tokens
  const filtered = tokens.filter((token) => {
    const hex = token.value.toLowerCase();

    // Layer 1: Always exclude known browser default colors
    // Unless they're explicitly defined as CSS variables (site intentionally chose this color)
    if (BROWSER_DEFAULT_COLORS.has(hex) && !token.cssVariable) {
      return false;
    }

    // Layer 2: Always keep CSS variable colors — these are intentional design tokens
    if (token.cssVariable) return true;

    // Layer 3: For stylesheet-only colors (not in computed styles and not a CSS variable),
    // they exist in CSS but aren't actually rendered on the page — likely from:
    // - Third-party CSS (analytics, widgets, ads)
    // - CSS rules targeting elements that don't exist on the current page
    // - Unused CSS from shared stylesheets
    // Require cross-validation: the color must also appear in computed styles
    if (token.source === "stylesheet") {
      // If this stylesheet color also appears in computed styles, it's actively used
      if (computedColorSet.has(hex)) return true;
      // If it also matches a CSS variable color, it's backed by design tokens
      if (cssVarColorSet.has(hex)) return true;
      // Stylesheet-only color not visible on the page — check frequency
      // Colors used in many CSS rules are more likely to be intentional
      const stylesheetFreq = stylesheetData.colorValueFrequency?.[token.originalValue?.toLowerCase()] || 0;
      if (stylesheetFreq >= 3) return true; // Used in 3+ CSS rules — likely intentional
      // Low-frequency stylesheet-only colors not visible on page — exclude
      return false;
    }

    // Layer 4: For computed-style-only colors, require frequency >= 2
    if (token.source === "computed-style" && token.frequency < 2) return false;

    return true;
  });

  // Sort: CSS variable colors first, then by frequency
  filtered.sort((a, b) => {
    if (a.cssVariable && !b.cssVariable) return -1;
    if (!a.cssVariable && b.cssVariable) return 1;
    return b.frequency - a.frequency;
  });

  // Limit to top 50 to keep output focused on key design tokens
  return filtered.slice(0, 50);
}
