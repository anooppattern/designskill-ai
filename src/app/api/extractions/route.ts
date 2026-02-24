import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import type { DesignSystem } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get("limit") || "20")));
    const search = searchParams.get("search") || "";
    const skip = (page - 1) * limit;

    const where = {
      visibility: "PUBLIC" as const,
      ...(search
        ? {
            OR: [
              { siteName: { contains: search, mode: "insensitive" as const } },
              { skillName: { contains: search, mode: "insensitive" as const } },
              { url: { contains: search, mode: "insensitive" as const } },
            ],
          }
        : {}),
    };

    const [extractions, total] = await Promise.all([
      prisma.designSystemExtraction.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
        select: {
          id: true,
          url: true,
          faviconUrl: true,
          siteName: true,
          skillName: true,
          designSystem: true,
          createdAt: true,
          user: {
            select: {
              name: true,
              image: true,
            },
          },
        },
      }),
      prisma.designSystemExtraction.count({ where }),
    ]);

    // Extract first 6 colors for card preview
    const results = extractions.map((e) => {
      const ds = e.designSystem as unknown as DesignSystem;
      const previewColors = (ds?.colors || []).slice(0, 6).map((c) => ({
        value: c.value,
        name: c.name,
      }));

      return {
        id: e.id,
        url: e.url,
        faviconUrl: e.faviconUrl,
        siteName: e.siteName,
        skillName: e.skillName,
        previewColors,
        createdAt: e.createdAt.toISOString(),
        user: {
          name: e.user.name,
          image: e.user.image,
        },
      };
    });

    return NextResponse.json({
      extractions: results,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error("Gallery fetch error:", error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}
