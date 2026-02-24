import type {
  BorderRadiusToken,
  ShadowToken,
  BreakpointToken,
  ZIndexToken,
  TransitionToken,
  RawStylesheetData,
  RawComputedElement,
} from "../types";
import { normalizeToPx, normalizeWhitespace } from "./utils";

// ---- Border Radius ----

export function processBorderRadius(
  stylesheetData: RawStylesheetData,
  computedElements: RawComputedElement[]
): BorderRadiusToken[] {
  const countMap = new Map<number, { count: number; original: string }>();

  const radiusProps = [
    "border-radius",
    "border-top-left-radius",
    "border-top-right-radius",
    "border-bottom-left-radius",
    "border-bottom-right-radius",
  ];

  for (const prop of radiusProps) {
    const values = stylesheetData.allPropertyValues[prop] || [];
    for (const val of values) {
      if (val.includes("var(")) continue;
      const parts = val.split(/\s+/);
      for (const part of parts) {
        const px = normalizeToPx(part);
        if (px !== null && px >= 0) {
          const entry = countMap.get(px);
          if (entry) {
            entry.count++;
          } else {
            countMap.set(px, { count: 1, original: part });
          }
        }
        // Handle large values like 9999px, 50%, etc.
        if (part === "50%" || parseInt(part) >= 9999) {
          const key = 9999;
          const entry = countMap.get(key);
          if (entry) {
            entry.count++;
          } else {
            countMap.set(key, { count: 1, original: part });
          }
        }
      }
    }
  }

  // From computed styles
  const computedRadiusProps = [
    "borderRadius",
    "borderTopLeftRadius",
    "borderTopRightRadius",
    "borderBottomLeftRadius",
    "borderBottomRightRadius",
  ];

  for (const el of computedElements) {
    for (const prop of computedRadiusProps) {
      const val = el.styles[prop];
      if (!val || val === "0px") continue;
      const px = normalizeToPx(val);
      if (px !== null && px > 0) {
        const entry = countMap.get(px);
        if (entry) {
          entry.count++;
        } else {
          countMap.set(px, { count: 1, original: val });
        }
      }
    }
  }

  const RADIUS_LABELS: Record<string, string> = {};
  const sorted = [...countMap.entries()]
    .map(([px, data]) => ({ normalizedPx: px, frequency: data.count, value: data.original }))
    .sort((a, b) => a.normalizedPx - b.normalizedPx)
    .filter((v) => v.frequency >= 2);

  // Assign labels
  const labels = ["none", "sm", "md", "lg", "xl", "2xl", "full"];
  return sorted.slice(0, 7).map((token, i) => ({
    ...token,
    value: token.normalizedPx >= 9999 ? "9999px" : `${token.normalizedPx}px`,
    label: token.normalizedPx === 0
      ? "none"
      : token.normalizedPx >= 9999
        ? "full"
        : labels[Math.min(i + 1, labels.length - 2)] || `${token.normalizedPx}px`,
  }));
}

// ---- Shadows ----

export function processShadows(
  stylesheetData: RawStylesheetData,
  computedElements: RawComputedElement[]
): ShadowToken[] {
  const countMap = new Map<string, number>();

  const shadowValues = stylesheetData.allPropertyValues["box-shadow"] || [];
  for (const val of shadowValues) {
    if (val === "none" || val.includes("var(")) continue;
    const normalized = normalizeWhitespace(val);
    countMap.set(normalized, (countMap.get(normalized) || 0) + 1);
  }

  for (const el of computedElements) {
    const val = el.styles.boxShadow;
    if (!val || val === "none") continue;
    const normalized = normalizeWhitespace(val);
    countMap.set(normalized, (countMap.get(normalized) || 0) + 1);
  }

  const tokens = [...countMap.entries()]
    .map(([value, frequency]) => ({ value, frequency }))
    .filter((t) => t.frequency >= 1)
    .sort((a, b) => b.frequency - a.frequency)
    .slice(0, 10);

  // Assign labels based on blur radius (rough categorization)
  const labels = ["xs", "sm", "md", "lg", "xl"];
  return tokens.map((token, i) => ({
    ...token,
    label: labels[Math.min(i, labels.length - 1)],
  }));
}

// ---- Breakpoints ----

export function processBreakpoints(
  stylesheetData: RawStylesheetData
): BreakpointToken[] {
  const seen = new Map<number, string>();
  const widthRegex = /\(\s*(?:min|max)-width:\s*(\d+(?:\.\d+)?)\s*(px|em|rem)\s*\)/g;

  for (const rule of stylesheetData.mediaRules) {
    let match;
    while ((match = widthRegex.exec(rule.conditionText)) !== null) {
      let px = parseFloat(match[1]);
      if (match[2] === "em" || match[2] === "rem") {
        px = px * 16;
      }
      px = Math.round(px);
      if (!seen.has(px)) {
        seen.set(px, rule.conditionText);
      }
    }
  }

  const sorted = [...seen.entries()]
    .map(([px, query]) => ({
      query,
      value: `${px}px`,
      normalizedPx: px,
    }))
    .sort((a, b) => a.normalizedPx - b.normalizedPx);

  // Assign common labels
  const labelMap: [number, string][] = [
    [480, "xs"],
    [640, "sm"],
    [768, "md"],
    [1024, "lg"],
    [1280, "xl"],
    [1536, "2xl"],
  ];

  return sorted.map((bp) => {
    // Find closest conventional label
    let label = `${bp.normalizedPx}`;
    let minDist = Infinity;
    for (const [target, name] of labelMap) {
      const dist = Math.abs(bp.normalizedPx - target);
      if (dist < minDist && dist <= 64) {
        minDist = dist;
        label = name;
      }
    }
    return { ...bp, label };
  });
}

// ---- Z-Index ----

export function processZIndex(
  stylesheetData: RawStylesheetData,
  computedElements: RawComputedElement[]
): ZIndexToken[] {
  const indexMap = new Map<number, Set<string>>();

  const values = stylesheetData.allPropertyValues["z-index"] || [];
  for (const val of values) {
    const num = parseInt(val, 10);
    if (!isNaN(num) && num !== 0) {
      if (!indexMap.has(num)) indexMap.set(num, new Set());
      indexMap.get(num)!.add("stylesheet");
    }
  }

  for (const el of computedElements) {
    const val = el.styles.zIndex;
    if (!val || val === "auto") continue;
    const num = parseInt(val, 10);
    if (!isNaN(num) && num !== 0) {
      if (!indexMap.has(num)) indexMap.set(num, new Set());
      indexMap.get(num)!.add(`${el.tag}.${el.classes.split(" ")[0] || ""}`);
    }
  }

  return [...indexMap.entries()]
    .map(([value, selectors]) => ({ value, selectors: [...selectors] }))
    .sort((a, b) => a.value - b.value);
}

// ---- Transitions ----

export function processTransitions(
  stylesheetData: RawStylesheetData
): TransitionToken[] {
  const countMap = new Map<string, number>();

  const values = stylesheetData.allPropertyValues["transition"] || [];
  for (const val of values) {
    if (val === "none" || val.includes("var(")) continue;
    const normalized = normalizeWhitespace(val);
    countMap.set(normalized, (countMap.get(normalized) || 0) + 1);
  }

  return [...countMap.entries()]
    .map(([value, frequency]) => ({ value, frequency }))
    .sort((a, b) => b.frequency - a.frequency)
    .slice(0, 10);
}
