import puppeteer from "puppeteer";
import type { DesignSystem, ExtractionProgress } from "../types";
import { extractCSSVariables } from "./css-variables";
import { extractStylesheetData } from "./stylesheets";
import { extractComputedStyles } from "./computed-styles";
import { processColors } from "./colors";
import { processTypography } from "./typography";
import { processSpacing } from "./spacing";
import {
  processBorderRadius,
  processShadows,
  processBreakpoints,
  processZIndex,
  processTransitions,
} from "./misc";

type ProgressCallback = (progress: ExtractionProgress) => void;

export async function extractDesignSystem(
  url: string,
  onProgress: ProgressCallback
): Promise<DesignSystem> {
  onProgress({
    type: "progress",
    phase: "launching-browser",
    message: "Launching browser...",
    percent: 5,
  });

  const browser = await puppeteer.launch({
    headless: true,
    executablePath: process.env.CHROMIUM_EXECUTABLE_PATH || undefined,
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-dev-shm-usage",
      "--disable-gpu",
    ],
  });

  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1440, height: 900 });

    // Set a realistic user agent
    await page.setUserAgent(
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
    );

    onProgress({
      type: "progress",
      phase: "navigating",
      message: `Navigating to ${url}...`,
      percent: 10,
    });

    await page.goto(url, {
      waitUntil: "networkidle2",
      timeout: 30000,
    });

    // Get page title for site name
    const siteName = await page.title();

    // Capture favicon URL
    let faviconUrl: string | null = null;
    try {
      faviconUrl = await page.$eval(
        'link[rel="icon"], link[rel="shortcut icon"], link[rel="apple-touch-icon"]',
        (el) => (el as HTMLLinkElement).href
      );
    } catch {
      // Fallback to Google's favicon service
      try {
        const hostname = new URL(url).hostname;
        faviconUrl = `https://www.google.com/s2/favicons?domain=${hostname}&sz=64`;
      } catch {
        faviconUrl = null;
      }
    }

    // Phase 1: CSS Variables
    onProgress({
      type: "progress",
      phase: "css-variables",
      message: "Extracting CSS variables...",
      percent: 20,
    });
    const cssVars = await extractCSSVariables(page);

    // Phase 2: Stylesheets
    onProgress({
      type: "progress",
      phase: "stylesheets",
      message: "Parsing stylesheets...",
      percent: 35,
    });
    const stylesheetData = await extractStylesheetData(page);

    // Phase 3: Computed Styles
    onProgress({
      type: "progress",
      phase: "computed-styles",
      message: "Analyzing computed styles...",
      percent: 50,
    });
    const computedElements = await extractComputedStyles(page);

    // Phase 4: Process Colors
    onProgress({
      type: "progress",
      phase: "colors",
      message: "Processing colors...",
      percent: 60,
    });
    const colors = processColors(cssVars, stylesheetData, computedElements);

    // Phase 5: Process Typography
    onProgress({
      type: "progress",
      phase: "typography",
      message: "Analyzing typography...",
      percent: 70,
    });
    const { tokens: typography, fonts } = processTypography(
      computedElements,
      stylesheetData
    );

    // Phase 6: Process Spacing & Layout
    onProgress({
      type: "progress",
      phase: "spacing",
      message: "Extracting spacing & layout...",
      percent: 80,
    });
    const spacing = processSpacing(stylesheetData, computedElements);
    const borderRadius = processBorderRadius(stylesheetData, computedElements);
    const shadows = processShadows(stylesheetData, computedElements);
    const zIndex = processZIndex(stylesheetData, computedElements);
    const transitions = processTransitions(stylesheetData);

    // Phase 7: Breakpoints
    onProgress({
      type: "progress",
      phase: "breakpoints",
      message: "Extracting breakpoints...",
      percent: 90,
    });
    const breakpoints = processBreakpoints(stylesheetData);

    // Capture screenshot (compressed JPEG, base64)
    let screenshotUrl: string | null = null;
    try {
      const screenshotBuffer = await page.screenshot({
        type: "jpeg",
        quality: 60,
        encoding: "base64",
      });
      screenshotUrl = `data:image/jpeg;base64,${screenshotBuffer}`;
    } catch {
      screenshotUrl = null;
    }

    // Build CSS variables map (resolved values)
    const cssVariablesMap: Record<string, string> = {};
    for (const [name, data] of Object.entries(cssVars)) {
      cssVariablesMap[name] = data.resolvedValue || data.value;
    }

    const designSystem: DesignSystem = {
      url,
      siteName: siteName || new URL(url).hostname,
      extractedAt: new Date().toISOString(),
      faviconUrl: faviconUrl || undefined,
      screenshotUrl: screenshotUrl || undefined,
      colors,
      typography,
      spacing,
      borderRadius,
      shadows,
      breakpoints,
      zIndex,
      transitions,
      cssVariables: cssVariablesMap,
      fonts,
    };

    return designSystem;
  } finally {
    await browser.close();
  }
}
