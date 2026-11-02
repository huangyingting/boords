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
      .replace(/^-|-$/g, "") || "project"
  );
}

export async function GET() {
  const ctx = await getAuthenticatedContext();
  if (!ctx) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const projects = await prisma.project.findMany({
    where: { teamId: ctx.team.id },
    include: {
      storyboards: {
        where: { isArchived: false },
        orderBy: { updatedAt: "desc" },
      },
      scripts: {
        where: { isArchived: false },
        orderBy: { updatedAt: "desc" },
      },
      _count: {
        select: { storyboards: true, scripts: true },
      },
    },
    orderBy: { updatedAt: "desc" },
  });

  return NextResponse.json({ projects });
}

export async function POST(request: Request) {
  const ctx = await getAuthenticatedContext();
  if (!ctx) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!canPerformAction(ctx.role, "project.create")) {
    return NextResponse.json(
      { error: "Forbidden: Reviewer accounts cannot create projects" },
      { status: 403 }
    );
  }

  try {
    const body = await request.json();
    const name = String(body.name || "Untitled Project").trim();
    const hashId = generateShortHash(6).toLowerCase();
    const slug = `${slugify(name)}-${hashId}`;
    const shareSlug = generateShortHash(10);

    const project = await prisma.project.create({
      data: {
        hashId,
        slug,
        name,
        description: body.description ? String(body.description) : null,
        teamId: ctx.team.id,
        createdById: ctx.user.id,
        shareSlug,
        isShared: Boolean(body.isShared ?? false),
      },
      include: {
        _count: { select: { storyboards: true, scripts: true } },
      },
    });

    await recordAuditLog({
      teamId: ctx.team.id,
      actorId: ctx.user.id,
      actorEmail: ctx.user.email,
      projectId: project.id,
      action: "project.created",
      targetType: "project",
      targetId: project.id,
      metadata: { name: project.name, slug: project.slug },
    });

    return NextResponse.json({ project }, { status: 201 });
  } catch (err) {
    console.error("Create project error:", err);
    return NextResponse.json(
      { error: "Failed to create project" },
      { status: 500 }
    );
  }
}
