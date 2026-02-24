import { extractDesignSystem } from "@/lib/extractor";
import { generateClaudeMd, deriveSkillName, deriveFileName } from "@/lib/generator";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { normalizeUrl } from "@/lib/url";
import type { SSEEvent } from "@/lib/types";

export const maxDuration = 60;
export const dynamic = "force-dynamic";

function encodeSSE(event: SSEEvent): string {
  return `data: ${JSON.stringify(event)}\n\n`;
}

export async function POST(request: Request) {
  let body: { url: string };
  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON body" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const { url } = body;
  if (!url) {
    return new Response(JSON.stringify({ error: "URL is required" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  // Validate URL
  try {
    const parsed = new URL(url);
    if (!["http:", "https:"].includes(parsed.protocol)) {
      return new Response(
        JSON.stringify({ error: "URL must use http or https protocol" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }
  } catch {
    return new Response(JSON.stringify({ error: "Invalid URL format" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  // Get current session (optional — extraction works without auth)
  const session = await auth();
  const userId = session?.user?.id;

  const stream = new ReadableStream({
    start(controller) {
      const encoder = new TextEncoder();

      const sendEvent = (event: SSEEvent) => {
        try {
          controller.enqueue(encoder.encode(encodeSSE(event)));
        } catch {
          // stream may be closed
        }
      };

      // Run extraction in a fire-and-forget async IIFE
      (async () => {
        try {
          const designSystem = await extractDesignSystem(url, sendEvent);

          sendEvent({
            type: "progress",
            phase: "generating",
            message: "Generating CLAUDE.md...",
            percent: 95,
          });

          const claudeMd = generateClaudeMd(designSystem);
          const skillName = deriveSkillName(designSystem);
          const fileName = deriveFileName(skillName);

          // Save to database if user is authenticated
          let extractionId: string | undefined;
          if (userId) {
            try {
              const extraction = await prisma.designSystemExtraction.create({
                data: {
                  url,
                  normalizedUrl: normalizeUrl(url),
                  faviconUrl: designSystem.faviconUrl || null,
                  siteName: designSystem.siteName,
                  screenshotUrl: designSystem.screenshotUrl || null,
                  designSystem: JSON.parse(JSON.stringify(designSystem)),
                  claudeMd,
                  skillName,
                  fileName,
                  visibility: "PUBLIC",
                  userId,
                },
              });
              extractionId = extraction.id;
            } catch (dbError) {
              console.error("Failed to save extraction to DB:", dbError);
              // Don't fail the extraction if DB save fails
            }
          }

          sendEvent({
            type: "result",
            designSystem,
            claudeMd,
            skillName,
            fileName,
            extractionId,
          });
        } catch (err) {
          const message =
            err instanceof Error ? err.message : "An unknown error occurred";
          sendEvent({
            type: "error",
            message: `Extraction failed: ${message}`,
          });
        } finally {
          try {
            controller.close();
          } catch {
            // already closed
          }
        }
      })();
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}
