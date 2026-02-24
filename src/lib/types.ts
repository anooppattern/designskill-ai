export interface ColorToken {
  value: string;
  originalValue: string;
  name: string;
  source: "css-variable" | "computed-style" | "stylesheet";
  cssVariable?: string;
  properties: string[];
  frequency: number;
  group?: "primary" | "neutral" | "semantic" | "accent" | "surface";
}

export interface TypographyToken {
  element: string;
  fontFamily: string;
  fontSize: string;
  fontSizePx: number;
  fontWeight: string;
  lineHeight: string;
  letterSpacing: string;
}

export interface SpacingToken {
  value: string;
  normalizedPx: number;
  frequency: number;
  label?: string;
}

export interface BorderRadiusToken {
  value: string;
  normalizedPx: number;
  frequency: number;
  cssVariable?: string;
  label?: string;
}

export interface ShadowToken {
  value: string;
  frequency: number;
  cssVariable?: string;
  label?: string;
}

export interface BreakpointToken {
  query: string;
  value: string;
  normalizedPx: number;
  label?: string;
}

export interface ZIndexToken {
  value: number;
  selectors: string[];
}

export interface TransitionToken {
  value: string;
  frequency: number;
}

export interface DesignSystem {
  url: string;
  siteName: string;
  extractedAt: string;
  faviconUrl?: string;
  screenshotUrl?: string;
  colors: ColorToken[];
  typography: TypographyToken[];
  spacing: SpacingToken[];
  borderRadius: BorderRadiusToken[];
  shadows: ShadowToken[];
  breakpoints: BreakpointToken[];
  zIndex: ZIndexToken[];
  transitions: TransitionToken[];
  cssVariables: Record<string, string>;
  fonts: string[];
}

export interface ExtractionProgress {
  type: "progress";
  phase: string;
  message: string;
  percent: number;
}

export interface ExtractionResult {
  type: "result";
  designSystem: DesignSystem;
  claudeMd: string;
  skillName: string;
  fileName: string;
  extractionId?: string;
}

export interface ExtractionError {
  type: "error";
  message: string;
}

export type SSEEvent = ExtractionProgress | ExtractionResult | ExtractionError;

// Raw data from page.evaluate() calls
export interface RawCSSVariable {
  value: string;
  resolvedValue: string;
  selector: string;
}

export interface RawStylesheetData {
  allPropertyValues: Record<string, string[]>;
  mediaRules: { conditionText: string; rulesCount: number }[];
  fontFaces: {
    fontFamily: string;
    fontWeight: string;
    fontStyle: string;
  }[];
  /** Tracks how many distinct CSS rules use each color value (for confidence scoring) */
  colorValueFrequency?: Record<string, number>;
}

export interface RawComputedElement {
  tag: string;
  classes: string;
  styles: Record<string, string>;
}
