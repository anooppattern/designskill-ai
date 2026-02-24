import type { Page } from "puppeteer";
import type { RawStylesheetData } from "../types";

export async function extractStylesheetData(
  page: Page
): Promise<RawStylesheetData> {
  return await page.evaluate(() => {
    const targetProperties = [
      "color",
      "background-color",
      "border-color",
      "outline-color",
      "font-family",
      "font-size",
      "font-weight",
      "line-height",
      "letter-spacing",
      "margin",
      "margin-top",
      "margin-right",
      "margin-bottom",
      "margin-left",
      "padding",
      "padding-top",
      "padding-right",
      "padding-bottom",
      "padding-left",
      "gap",
      "row-gap",
      "column-gap",
      "border-radius",
      "border-top-left-radius",
      "border-top-right-radius",
      "border-bottom-left-radius",
      "border-bottom-right-radius",
      "box-shadow",
      "text-shadow",
      "z-index",
      "transition",
    ];

    const colorProperties = new Set([
      "color",
      "background-color",
      "border-color",
      "outline-color",
    ]);

    const result: {
      allPropertyValues: Record<string, string[]>;
      mediaRules: { conditionText: string; rulesCount: number }[];
      fontFaces: {
        fontFamily: string;
        fontWeight: string;
        fontStyle: string;
      }[];
      colorValueFrequency: Record<string, number>;
    } = {
      allPropertyValues: {},
      mediaRules: [],
      fontFaces: [],
      colorValueFrequency: {},
    };

    const processRule = (rule: CSSRule) => {
      if (rule instanceof CSSMediaRule) {
        const conditionText =
          rule.conditionText || (rule.media && rule.media.mediaText) || "";
        if (conditionText) {
          result.mediaRules.push({
            conditionText,
            rulesCount: rule.cssRules.length,
          });
        }
        for (let i = 0; i < rule.cssRules.length; i++) {
          processRule(rule.cssRules[i]);
        }
      } else if (rule instanceof CSSFontFaceRule) {
        result.fontFaces.push({
          fontFamily: rule.style.getPropertyValue("font-family").trim(),
          fontWeight: rule.style.getPropertyValue("font-weight").trim(),
          fontStyle: rule.style.getPropertyValue("font-style").trim(),
        });
      } else if (rule instanceof CSSStyleRule && rule.style) {
        const selector = rule.selectorText || "";
        // Skip rules that only apply to pseudo-states (:hover, :focus, :active, :visited, :focus-visible, :focus-within)
        // These colors are transient and not part of the resting visual design
        const isPseudoStateOnly =
          selector &&
          !selector.split(",").some((part: string) => {
            const cleaned = part.trim();
            // Remove all pseudo-state selectors and check if anything meaningful remains
            const withoutPseudo = cleaned
              .replace(/:hover/g, "")
              .replace(/:focus/g, "")
              .replace(/:active/g, "")
              .replace(/:visited/g, "")
              .replace(/:focus-visible/g, "")
              .replace(/:focus-within/g, "")
              .trim();
            // If removing pseudo-states leaves the original selector unchanged, it's not pseudo-state-only
            return withoutPseudo === cleaned;
          });

        for (const prop of targetProperties) {
          const val = rule.style.getPropertyValue(prop).trim();
          if (
            val &&
            val !== "initial" &&
            val !== "inherit" &&
            val !== "unset" &&
            val !== "revert"
          ) {
            if (!result.allPropertyValues[prop]) {
              result.allPropertyValues[prop] = [];
            }
            // Only add non-pseudo-state-only color values (still add all non-color properties)
            if (colorProperties.has(prop) && isPseudoStateOnly) {
              continue; // Skip colors from :hover/:focus/:visited only selectors
            }
            result.allPropertyValues[prop].push(val);

            // Track color value frequency across rules
            if (colorProperties.has(prop)) {
              const normalizedVal = val.toLowerCase().trim();
              result.colorValueFrequency[normalizedVal] =
                (result.colorValueFrequency[normalizedVal] || 0) + 1;
            }
          }
        }
      }
      // Recurse into other grouping rules (@layer, @supports)
      if (
        "cssRules" in rule &&
        !(rule instanceof CSSMediaRule) &&
        !(rule instanceof CSSStyleRule)
      ) {
        try {
          const groupRule = rule as CSSGroupingRule;
          for (let i = 0; i < groupRule.cssRules.length; i++) {
            processRule(groupRule.cssRules[i]);
          }
        } catch {
          // skip
        }
      }
    };

    for (let s = 0; s < document.styleSheets.length; s++) {
      try {
        const sheet = document.styleSheets[s];
        for (let r = 0; r < sheet.cssRules.length; r++) {
          processRule(sheet.cssRules[r]);
        }
      } catch {
        // cross-origin
      }
    }

    return result;
  });
}
