import type { DesignSystem } from "./types";
import { findBaseUnit } from "./extractor/utils";

/**
 * Derives a clean skill name from the site URL/title.
 * e.g. "stripe.com" → "Stripe Design System"
 *      "Vercel – Develop. Preview. Ship." → "Vercel Design System"
 */
export function deriveSkillName(ds: DesignSystem): string {
  // Try to get a clean brand name from the hostname
  const hostname = new URL(ds.url).hostname.replace(/^www\./, "");
  const domain = hostname.split(".")[0]; // "stripe" from "stripe.com"
  const brandFromDomain = domain.charAt(0).toUpperCase() + domain.slice(1);

  // Try to get a better name from the page title (take first meaningful word/phrase)
  const title = ds.siteName || "";
  const titleBrand = title
    .split(/\s*[|–—:•·]\s*/)[0] // Split on common separators, take first part
    .trim();

  // Use title brand if it's short and meaningful, otherwise use domain
  const brand =
    titleBrand && titleBrand.length <= 30 && titleBrand.length > 1
      ? titleBrand
      : brandFromDomain;

  return `${brand} Design System`;
}

/**
 * Derives a kebab-case filename for the skill.
 * e.g. "Stripe Design System" → "stripe-design-system.md"
 */
export function deriveFileName(skillName: string): string {
  return (
    skillName
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-") + ".md"
  );
}

export function generateClaudeMd(ds: DesignSystem): string {
  const sections: string[] = [];

  // Header
  const skillName = deriveSkillName(ds);
  sections.push(`# ${skillName}`);
  sections.push("");
  sections.push(
    `> Auto-extracted from ${ds.url} on ${new Date(ds.extractedAt).toLocaleDateString()} by designskill AI`
  );
  sections.push("");

  // Colors
  sections.push(generateColorSection(ds));

  // Typography
  sections.push(generateTypographySection(ds));

  // Spacing
  sections.push(generateSpacingSection(ds));

  // Border Radius
  if (ds.borderRadius.length > 0) {
    sections.push(generateBorderRadiusSection(ds));
  }

  // Shadows
  if (ds.shadows.length > 0) {
    sections.push(generateShadowSection(ds));
  }

  // Breakpoints
  if (ds.breakpoints.length > 0) {
    sections.push(generateBreakpointSection(ds));
  }

  // Z-Index
  if (ds.zIndex.length > 0) {
    sections.push(generateZIndexSection(ds));
  }

  // Transitions
  if (ds.transitions.length > 0) {
    sections.push(generateTransitionSection(ds));
  }

  // Rules for Claude
  sections.push(generateRulesSection(ds));

  // Reverse-engineered prompt
  sections.push(generateReversePromptSection(ds));

  return sections.join("\n");
}

function generateColorSection(ds: DesignSystem): string {
  const lines: string[] = [];
  lines.push("## Color Palette");
  lines.push("");

  const groups = groupColors(ds.colors);

  for (const [groupName, colors] of Object.entries(groups)) {
    if (colors.length === 0) continue;
    lines.push(`### ${capitalize(groupName)} Colors`);
    lines.push("");
    lines.push("| Token | Value | CSS Variable |");
    lines.push("|-------|-------|-------------|");
    for (const color of colors) {
      const varCol = color.cssVariable || "—";
      lines.push(`| ${color.name} | \`${color.value}\` | \`${varCol}\` |`);
    }
    lines.push("");
  }

  return lines.join("\n");
}

function groupColors(
  colors: DesignSystem["colors"]
): Record<string, DesignSystem["colors"]> {
  const groups: Record<string, DesignSystem["colors"]> = {
    primary: [],
    accent: [],
    neutral: [],
    semantic: [],
    surface: [],
  };

  for (const color of colors) {
    const group = color.group || "accent";
    if (groups[group]) {
      groups[group].push(color);
    } else {
      groups.accent.push(color);
    }
  }

  return groups;
}

function generateTypographySection(ds: DesignSystem): string {
  const lines: string[] = [];
  lines.push("## Typography");
  lines.push("");

  if (ds.fonts.length > 0) {
    lines.push("### Font Families");
    lines.push("");
    for (const font of ds.fonts) {
      lines.push(`- ${font}`);
    }
    lines.push("");
  }

  if (ds.typography.length > 0) {
    lines.push("### Type Scale");
    lines.push("");
    lines.push("| Element | Size | Weight | Line Height | Letter Spacing |");
    lines.push("|---------|------|--------|-------------|----------------|");
    for (const t of ds.typography) {
      lines.push(
        `| ${t.element} | ${t.fontSize} (${t.fontSizePx}px) | ${t.fontWeight} | ${t.lineHeight} | ${t.letterSpacing} |`
      );
    }
    lines.push("");
  }

  return lines.join("\n");
}

function generateSpacingSection(ds: DesignSystem): string {
  const lines: string[] = [];
  lines.push("## Spacing Scale");
  lines.push("");

  if (ds.spacing.length > 0) {
    const baseUnit = findBaseUnit(ds.spacing.map((s) => s.normalizedPx));
    lines.push(`Base unit: **${baseUnit}px**`);
    lines.push("");
    lines.push("| Token | Value |");
    lines.push("|-------|-------|");
    for (const s of ds.spacing) {
      const rem = (s.normalizedPx / 16).toFixed(s.normalizedPx % 16 === 0 ? 0 : 3);
      lines.push(`| ${s.label || s.value} | ${s.normalizedPx}px (${rem}rem) |`);
    }
    lines.push("");
  }

  return lines.join("\n");
}

function generateBorderRadiusSection(ds: DesignSystem): string {
  const lines: string[] = [];
  lines.push("## Border Radius");
  lines.push("");
  lines.push("| Token | Value |");
  lines.push("|-------|-------|");
  for (const br of ds.borderRadius) {
    lines.push(`| ${br.label || br.value} | ${br.value} |`);
  }
  lines.push("");
  return lines.join("\n");
}

function generateShadowSection(ds: DesignSystem): string {
  const lines: string[] = [];
  lines.push("## Shadows");
  lines.push("");
  lines.push("| Token | Value |");
  lines.push("|-------|-------|");
  for (const s of ds.shadows) {
    lines.push(`| ${s.label || "shadow"} | \`${s.value}\` |`);
  }
  lines.push("");
  return lines.join("\n");
}

function generateBreakpointSection(ds: DesignSystem): string {
  const lines: string[] = [];
  lines.push("## Breakpoints");
  lines.push("");
  lines.push("| Name | Value |");
  lines.push("|------|-------|");
  for (const bp of ds.breakpoints) {
    lines.push(`| ${bp.label || bp.value} | ${bp.value} |`);
  }
  lines.push("");
  return lines.join("\n");
}

function generateZIndexSection(ds: DesignSystem): string {
  const lines: string[] = [];
  lines.push("## Z-Index Scale");
  lines.push("");
  lines.push("| Value | Used By |");
  lines.push("|-------|---------|");
  for (const z of ds.zIndex) {
    lines.push(`| ${z.value} | ${z.selectors.slice(0, 3).join(", ")} |`);
  }
  lines.push("");
  return lines.join("\n");
}

function generateTransitionSection(ds: DesignSystem): string {
  const lines: string[] = [];
  lines.push("## Transitions");
  lines.push("");
  for (const t of ds.transitions.slice(0, 5)) {
    lines.push(`- \`${t.value}\``);
  }
  lines.push("");
  return lines.join("\n");
}

function generateRulesSection(ds: DesignSystem): string {
  const lines: string[] = [];
  lines.push("---");
  lines.push("");
  lines.push("## Rules for Claude");
  lines.push("");
  lines.push(
    "When generating code for this design system, follow these rules:"
  );
  lines.push("");

  lines.push(
    "1. **Always use the design tokens defined above** rather than hardcoded values."
  );

  // CSS variable usage
  const hasCSSVars = Object.keys(ds.cssVariables).length > 10;
  if (hasCSSVars) {
    lines.push(
      "   This site uses CSS custom properties extensively — prefer `var(--token-name)` syntax."
    );
  }
  lines.push("");

  lines.push("2. **Color usage:**");
  lines.push(
    "   - Use primary colors for interactive elements (buttons, links, focus rings)"
  );
  lines.push("   - Use neutral colors for text, backgrounds, and borders");
  lines.push(
    "   - Use semantic colors only for their intended purpose (success, error, warning)"
  );
  lines.push("   - Never introduce colors outside the defined palette");
  lines.push("");

  lines.push("3. **Typography:**");
  if (ds.fonts.length > 0) {
    lines.push(`   - Primary font: ${ds.fonts[0]}`);
  }
  lines.push("   - Follow the type scale exactly — do not invent intermediate sizes");
  lines.push(
    "   - Heading hierarchy must be preserved (h1 > h2 > h3 in size and weight)"
  );
  lines.push("");

  lines.push("4. **Spacing:**");
  if (ds.spacing.length > 0) {
    const baseUnit = findBaseUnit(ds.spacing.map((s) => s.normalizedPx));
    lines.push(`   - Base unit: ${baseUnit}px`);
  }
  lines.push("   - Use only values from the spacing scale");
  lines.push("   - Maintain consistent spacing rhythm throughout");
  lines.push("");

  lines.push("5. **Border radius:**");
  lines.push("   - Use the defined radius tokens consistently");
  lines.push("   - Use full radius (9999px) for pills and badges");
  lines.push("");

  lines.push("6. **Responsive design:**");
  if (ds.breakpoints.length > 0) {
    lines.push(
      `   - Breakpoints: ${ds.breakpoints.map((bp) => `${bp.label}=${bp.value}`).join(", ")}`
    );
  }
  lines.push("   - Mobile-first approach: base styles + larger breakpoint overrides");
  lines.push("");

  lines.push("7. **Shadows & Elevation:**");
  lines.push("   - Use shadows from the defined scale sparingly");
  lines.push("   - Follow the elevation hierarchy consistently");
  lines.push("");

  lines.push("8. **Transitions:**");
  lines.push(
    "   - Apply transitions to interactive state changes (hover, focus, active)"
  );
  if (ds.transitions.length > 0) {
    lines.push(`   - Default: \`${ds.transitions[0].value}\``);
  }
  lines.push("");

  return lines.join("\n");
}

function generateReversePromptSection(ds: DesignSystem): string {
  const lines: string[] = [];
  lines.push("---");
  lines.push("");
  lines.push("## Reverse-Engineered Prompt");
  lines.push("");
  lines.push(
    "*If this website were built from scratch using Claude, the prompt would be:*"
  );
  lines.push("");
  lines.push("```");

  const brand = deriveSkillName(ds).replace(" Design System", "");
  const hostname = new URL(ds.url).hostname;

  // Build the prompt dynamically from extracted data
  const promptParts: string[] = [];

  promptParts.push(
    `Build a modern, production-quality website for "${brand}" (${hostname}).`
  );
  promptParts.push("");

  // Theme & Color direction
  const primaryColors = ds.colors.filter((c) => c.group === "primary");
  const neutralColors = ds.colors.filter((c) => c.group === "neutral");
  const accentColors = ds.colors.filter((c) => c.group === "accent");
  const semanticColors = ds.colors.filter((c) => c.group === "semantic");

  const isDark =
    neutralColors.some(
      (c) =>
        c.properties.includes("background-color") &&
        parseInt(c.value.slice(1, 3), 16) < 40
    ) ||
    ds.cssVariables["--background"]?.match(/^#[0-3]/);

  promptParts.push("## Design Direction");
  promptParts.push("");
  promptParts.push(
    `Use a ${isDark ? "dark" : "light"} theme as the base.`
  );

  if (primaryColors.length > 0) {
    const topPrimary = primaryColors.slice(0, 3).map((c) => c.value).join(", ");
    promptParts.push(
      `Primary brand colors: ${topPrimary}.`
    );
  }
  if (accentColors.length > 0) {
    const topAccent = accentColors.slice(0, 3).map((c) => c.value).join(", ");
    promptParts.push(`Accent colors: ${topAccent}.`);
  }
  if (neutralColors.length > 0) {
    const topNeutral = neutralColors.slice(0, 4).map((c) => c.value).join(", ");
    promptParts.push(`Neutral palette: ${topNeutral}.`);
  }
  if (semanticColors.length > 0) {
    promptParts.push(
      `Include semantic colors for success, error, and warning states.`
    );
  }

  const hasCSSVars = Object.keys(ds.cssVariables).length > 10;
  if (hasCSSVars) {
    promptParts.push(
      `Define all colors as CSS custom properties on :root for easy theming.`
    );
  }
  promptParts.push("");

  // Typography
  promptParts.push("## Typography");
  promptParts.push("");
  if (ds.fonts.length > 0) {
    promptParts.push(`Use "${ds.fonts[0]}" as the primary font family.`);
    if (ds.fonts.length > 1) {
      promptParts.push(
        `Use "${ds.fonts.slice(1).join('", "')}" as secondary/monospace fonts.`
      );
    }
  }

  const headings = ds.typography.filter((t) => t.element.match(/^h\d$/));
  if (headings.length > 0) {
    const h1 = headings.find((t) => t.element === "h1");
    const body = ds.typography.find(
      (t) => t.element === "p" || t.element === "span"
    );
    if (h1) {
      promptParts.push(
        `Heading h1 should be ${h1.fontSizePx}px at weight ${h1.fontWeight}.`
      );
    }
    if (body) {
      promptParts.push(
        `Body text should be ${body.fontSizePx}px at weight ${body.fontWeight}.`
      );
    }
  }
  promptParts.push("");

  // Spacing & Layout
  promptParts.push("## Spacing & Layout");
  promptParts.push("");
  if (ds.spacing.length > 0) {
    const baseUnit = findBaseUnit(ds.spacing.map((s) => s.normalizedPx));
    promptParts.push(
      `Use a ${baseUnit}px base spacing unit. Spacing scale: ${ds.spacing.map((s) => s.normalizedPx + "px").join(", ")}.`
    );
  }
  if (ds.breakpoints.length > 0) {
    promptParts.push(
      `Responsive breakpoints at: ${ds.breakpoints.map((bp) => bp.value).join(", ")}. Use mobile-first approach.`
    );
  }
  promptParts.push("");

  // Visual Style
  promptParts.push("## Visual Style");
  promptParts.push("");
  if (ds.borderRadius.length > 0) {
    const radii = ds.borderRadius.map((br) => br.value).join(", ");
    promptParts.push(`Border radius scale: ${radii}.`);
  }
  if (ds.shadows.length > 0) {
    promptParts.push(
      `Use ${ds.shadows.length} elevation levels with box-shadows for depth.`
    );
  }
  if (ds.transitions.length > 0) {
    promptParts.push(
      `Add smooth transitions on interactive elements: \`${ds.transitions[0].value}\`.`
    );
  }
  promptParts.push("");

  // Component hints from typography elements found
  promptParts.push("## Components");
  promptParts.push("");
  const hasButtons = ds.typography.some((t) => t.element === "button");
  const hasInputs = ds.typography.some((t) =>
    ["input", "select", "textarea"].includes(t.element)
  );
  const hasNav = ds.typography.some((t) => t.element === "nav");
  const hasFooter = ds.typography.some((t) => t.element === "footer");
  const hasCode = ds.typography.some((t) =>
    ["code", "pre"].includes(t.element)
  );

  const components: string[] = [];
  if (hasNav) components.push("a navigation bar with links");
  components.push("heading sections with the type hierarchy");
  if (hasButtons) components.push("styled buttons (primary and secondary variants)");
  if (hasInputs) components.push("form inputs with consistent styling");
  if (hasCode) components.push("code blocks with monospace styling");
  if (hasFooter) components.push("a footer section");

  promptParts.push(
    `Include: ${components.join(", ")}.`
  );
  promptParts.push("");

  promptParts.push(
    `Ensure the design feels cohesive, polished, and production-ready. All spacing, colors, and typography should be consistent throughout.`
  );

  lines.push(promptParts.join("\n"));
  lines.push("```");
  lines.push("");

  return lines.join("\n");
}

function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}
