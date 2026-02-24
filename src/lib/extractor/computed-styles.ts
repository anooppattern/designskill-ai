import type { Page } from "puppeteer";
import type { RawComputedElement } from "../types";

const SELECTORS = [
  "h1", "h2", "h3", "h4", "h5", "h6",
  "p", "span", "a", "li",
  "button", "input", "select", "textarea",
  "nav", "header", "footer", "main", "section",
  "code", "pre", "blockquote",
];

const STYLE_PROPERTIES = [
  "color",
  "backgroundColor",
  "borderColor",
  "fontFamily",
  "fontSize",
  "fontWeight",
  "lineHeight",
  "letterSpacing",
  "marginTop",
  "marginRight",
  "marginBottom",
  "marginLeft",
  "paddingTop",
  "paddingRight",
  "paddingBottom",
  "paddingLeft",
  "borderRadius",
  "borderTopLeftRadius",
  "borderTopRightRadius",
  "borderBottomLeftRadius",
  "borderBottomRightRadius",
  "boxShadow",
  "zIndex",
  "transition",
];

export async function extractComputedStyles(
  page: Page
): Promise<RawComputedElement[]> {
  return await page.evaluate(
    (selectors: string[], properties: string[]) => {
      const results: {
        tag: string;
        classes: string;
        styles: Record<string, string>;
      }[] = [];

      // Tags to skip — these are image/media containers, not UI components
      const skipTags = new Set([
        "IMG", "SVG", "CANVAS", "VIDEO", "PICTURE", "SOURCE", "IFRAME",
      ]);

      const isInsideImage = (el: Element): boolean => {
        let parent: Element | null = el;
        while (parent) {
          if (skipTags.has(parent.tagName)) return true;
          // Skip elements whose background is an image (not a solid color)
          if (parent instanceof HTMLElement) {
            const bg = getComputedStyle(parent).backgroundImage;
            if (bg && bg !== "none" && !bg.startsWith("linear-gradient") && !bg.startsWith("radial-gradient")) {
              // Has a background-image (url(...)) — colors from children may be image-influenced
              return true;
            }
          }
          parent = parent.parentElement;
        }
        return false;
      };

      for (const selector of selectors) {
        const elements = document.querySelectorAll(selector);
        const limit = Math.min(elements.length, 5);
        for (let i = 0; i < limit; i++) {
          const el = elements[i] as HTMLElement;

          // Skip image/media elements and their children
          if (skipTags.has(el.tagName) || isInsideImage(el)) continue;

          const computed = getComputedStyle(el);

          // Skip elements that have a background-image (not gradient) — color is from image, not design system
          const bgImage = computed.backgroundImage;
          if (bgImage && bgImage !== "none" && bgImage.includes("url(")) continue;

          const styles: Record<string, string> = {};
          for (const prop of properties) {
            const val = computed[prop as keyof CSSStyleDeclaration] as string;
            if (val && val !== "none" && val !== "normal" && val !== "auto") {
              styles[prop] = val;
            }
          }
          results.push({
            tag: el.tagName.toLowerCase(),
            classes: el.className?.toString() || "",
            styles,
          });
        }
      }

      return results;
    },
    SELECTORS,
    STYLE_PROPERTIES
  );
}
