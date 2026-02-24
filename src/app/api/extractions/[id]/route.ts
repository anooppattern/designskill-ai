import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await auth();
    const userId = session?.user?.id;

    const extraction = await prisma.designSystemExtraction.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
    });

    if (!extraction) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    // Check visibility — private extractions only visible to owner
    if (extraction.visibility === "PRIVATE" && extraction.userId !== userId) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return NextResponse.json({
      id: extraction.id,
      url: extraction.url,
      faviconUrl: extraction.faviconUrl,
      siteName: extraction.siteName,
      screenshotUrl: extraction.screenshotUrl,
      designSystem: extraction.designSystem,
      claudeMd: extraction.claudeMd,
      skillName: extraction.skillName,
      fileName: extraction.fileName,
      visibility: extraction.visibility,
      createdAt: extraction.createdAt.toISOString(),
      isOwner: extraction.userId === userId,
      user: {
        name: extraction.user.name,
        image: extraction.user.image,
      },
    });
  } catch (error) {
    console.error("Extraction fetch error:", error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await auth();
    const userId = session?.user?.id;

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const extraction = await prisma.designSystemExtraction.findUnique({
      where: { id },
      select: { userId: true },
    });

    if (!extraction) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    if (extraction.userId !== userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { visibility } = await request.json();

    if (!["PUBLIC", "PRIVATE"].includes(visibility)) {
      return NextResponse.json(
        { error: "Visibility must be PUBLIC or PRIVATE" },
        { status: 400 }
      );
    }

    const updated = await prisma.designSystemExtraction.update({
      where: { id },
      data: { visibility },
      select: { id: true, visibility: true },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Visibility toggle error:", error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}
