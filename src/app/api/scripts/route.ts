import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthenticatedContext } from "@/lib/auth/session";
import { canPerformAction } from "@/lib/auth/rbac";
import { generateShortHash } from "@/lib/auth/workspace-defaults";
import { recordAuditLog } from "@/lib/audit";

function slugify(input: string): string {
  return (
    input
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "") || "script"
  );
}

export async function GET(request: Request) {
  const ctx = await getAuthenticatedContext();
  if (!ctx) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const projectId = searchParams.get("projectId") || undefined;
  const archived = searchParams.get("archived") === "true";

  const scripts = await prisma.script.findMany({
    where: {
      teamId: ctx.team.id,
      ...(projectId ? { projectId } : {}),
      isArchived: archived,
    },
    include: {
      project: { select: { id: true, name: true, slug: true } },
      scenes: { orderBy: { position: "asc" } },
      _count: { select: { scenes: true, comments: true } },
    },
    orderBy: { updatedAt: "desc" },
  });

  return NextResponse.json({ scripts });
}

export async function POST(request: Request) {
  const ctx = await getAuthenticatedContext();
  if (!ctx) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!canPerformAction(ctx.role, "script.create")) {
    return NextResponse.json(
      { error: "Forbidden: Reviewer accounts cannot create scripts" },
      { status: 403 }
    );
  }

  try {
    const body = await request.json();
    const title = String(body.title || "Untitled Script").trim();
    const mode = body.mode ? String(body.mode) : "UNSELECTED";
    const hashId = generateShortHash(6).toLowerCase();
    const slug = `${slugify(title)}-${hashId}`;
    const shortSlug = generateShortHash(10);

    const script = await prisma.script.create({
      data: {
        hashId,
        slug,
        shortSlug,
        title,
        status: String(body.status || "Draft"),
        mode,
        wordsPerMinute: Number(body.wordsPerMinute || 130),
        teamId: ctx.team.id,
        projectId: body.projectId || null,
        createdById: ctx.user.id,
        isShared: true,
        ...(mode === "AV_TABLE"
          ? {
              scenes: {
                create: [
                  {
                    position: 0,
                    sceneTitle: "Scene 1",
                    audioText: "",
                    visualText: "",
                  },
                ],
              },
            }
          : {}),
      },
      include: {
        project: { select: { id: true, name: true, slug: true } },
        scenes: { orderBy: { position: "asc" } },
      },
    });

    await recordAuditLog({
      teamId: ctx.team.id,
      actorId: ctx.user.id,
      actorEmail: ctx.user.email,
      projectId: script.projectId || undefined,
      action: "script.created",
      targetType: "script",
      targetId: script.id,
      metadata: { title: script.title, slug: script.slug, mode: script.mode },
    });

    return NextResponse.json({ script }, { status: 201 });
  } catch (err) {
    console.error("Create script error:", err);
    return NextResponse.json(
      { error: "Failed to create script" },
      { status: 500 }
    );
  }
}
