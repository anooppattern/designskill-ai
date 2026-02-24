import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { normalizeUrl } from "@/lib/url";

export async function POST(request: Request) {
  try {
    const { url } = await request.json();

    if (!url) {
      return NextResponse.json({ error: "URL is required" }, { status: 400 });
    }

    const normalized = normalizeUrl(url);
    const session = await auth();
    const userId = session?.user?.id;

    // Find existing extraction: public ones or user's own private ones
    const extraction = await prisma.designSystemExtraction.findFirst({
      where: {
        normalizedUrl: normalized,
        OR: [
          { visibility: "PUBLIC" },
          ...(userId ? [{ userId, visibility: "PRIVATE" as const }] : []),
        ],
      },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        siteName: true,
        skillName: true,
        faviconUrl: true,
        createdAt: true,
      },
    });

    if (extraction) {
      return NextResponse.json({
        exists: true,
        extraction: {
          id: extraction.id,
          siteName: extraction.siteName,
          skillName: extraction.skillName,
          faviconUrl: extraction.faviconUrl,
          createdAt: extraction.createdAt.toISOString(),
        },
      });
    }

    return NextResponse.json({ exists: false });
  } catch (error) {
    console.error("Check extraction error:", error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}
