import type {
  TypographyToken,
  RawComputedElement,
  RawStylesheetData,
} from "../types";
import { normalizeToPx } from "./utils";

export function processTypography(
  computedElements: RawComputedElement[],
  stylesheetData: RawStylesheetData
): { tokens: TypographyToken[]; fonts: string[] } {
  // Collect typography from computed elements
  const seen = new Map<string, TypographyToken>();
  const fontFamilies = new Set<string>();

  for (const el of computedElements) {
    const family = el.styles.fontFamily || "";
    const size = el.styles.fontSize || "";
    const weight = el.styles.fontWeight || "";
    const lineHeight = el.styles.lineHeight || "";
    const letterSpacing = el.styles.letterSpacing || "";

    if (!size) continue;

    if (family) {
      // Clean font family string
      const cleaned = family
        .split(",")
        .map((f) => f.trim().replace(/['"]/g, ""))
        .filter(Boolean);
      if (cleaned.length > 0) {
        fontFamilies.add(cleaned[0]);
      }
    }

    const sizePx = normalizeToPx(size) || parseFloat(size) || 0;
    // Use tag as key to get one entry per semantic element
    const key = el.tag;

    // Prioritize headings and unique elements
    if (!seen.has(key) || isHigherPriority(el.tag, seen.get(key)!.element)) {
      seen.set(key, {
        element: el.tag,
        fontFamily: family,
        fontSize: size,
        fontSizePx: sizePx,
        fontWeight: weight,
        lineHeight: lineHeight,
        letterSpacing: letterSpacing === "normal" ? "0" : letterSpacing,
      });
    }
  }

  // Add fonts from @font-face declarations
  for (const ff of stylesheetData.fontFaces) {
    if (ff.fontFamily) {
      fontFamilies.add(ff.fontFamily.replace(/['"]/g, ""));
    }
  }

  // Add fonts from stylesheet font-family values
  const fontValues = stylesheetData.allPropertyValues["font-family"] || [];
  for (const val of fontValues) {
    if (val.includes("var(")) continue;
    const first = val
      .split(",")[0]
      .trim()
      .replace(/['"]/g, "");
    if (first) fontFamilies.add(first);
  }

  const tokens = [...seen.values()];

  // Sort: headings first (h1-h6), then by font size descending
  tokens.sort((a, b) => {
    const aHeading = getHeadingOrder(a.element);
    const bHeading = getHeadingOrder(b.element);
    if (aHeading !== bHeading) return aHeading - bHeading;
    return b.fontSizePx - a.fontSizePx;
  });

  return {
    tokens,
    fonts: [...fontFamilies].filter(
      (f) =>
        !isGenericFont(f)
    ),
  };
}

function getHeadingOrder(tag: string): number {
  const match = tag.match(/^h(\d)$/);
  if (match) return parseInt(match[1]);
  return 100; // non-headings sort after
}

function isHigherPriority(newTag: string, existingTag: string): boolean {
  return getHeadingOrder(newTag) < getHeadingOrder(existingTag);
}

function isGenericFont(font: string): boolean {
  const generic = [
    "serif",
    "sans-serif",
    "monospace",
    "cursive",
    "fantasy",
    "system-ui",
    "ui-serif",
    "ui-sans-serif",
    "ui-monospace",
    "ui-rounded",
    "math",
    "emoji",
    "fangsong",
  ];
  return generic.includes(font.toLowerCase());
}
