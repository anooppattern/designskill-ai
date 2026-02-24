import type { Page } from "puppeteer";
import type { RawCSSVariable } from "../types";

export async function extractCSSVariables(
  page: Page
): Promise<Record<string, RawCSSVariable>> {
  return await page.evaluate(() => {
    const variables: Record<
      string,
      { value: string; resolvedValue: string; selector: string }
    > = {};

    const processRule = (rule: CSSRule) => {
      if (rule instanceof CSSStyleRule && rule.style) {
        for (let i = 0; i < rule.style.length; i++) {
          const prop = rule.style[i];
          if (prop.startsWith("--")) {
            const value = rule.style.getPropertyValue(prop).trim();
            if (!variables[prop]) {
              variables[prop] = {
                value,
                resolvedValue: "",
                selector: rule.selectorText,
              };
            }
          }
        }
      }
      // Recurse into nested rules (@media, @layer, @supports, etc.)
      if ("cssRules" in rule) {
        try {
          const groupRule = rule as CSSGroupingRule;
          for (let i = 0; i < groupRule.cssRules.length; i++) {
            processRule(groupRule.cssRules[i]);
          }
        } catch {
          // cross-origin or security error
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
        // cross-origin stylesheet
      }
    }

    // Resolve computed values from :root
    const rootStyles = getComputedStyle(document.documentElement);
    for (const varName of Object.keys(variables)) {
      const resolved = rootStyles.getPropertyValue(varName).trim();
      if (resolved) {
        variables[varName].resolvedValue = resolved;
      }
    }

    return variables;
  });
}
