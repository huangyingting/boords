import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthenticatedContext } from "@/lib/auth/session";
import { canPerformAction } from "@/lib/auth/rbac";
import { recordAuditLog } from "@/lib/audit";

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const ctx = await getAuthenticatedContext();
  if (!ctx) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;
  const project = await prisma.project.findFirst({
    where: {
      teamId: ctx.team.id,
      OR: [{ id }, { slug: id }, { hashId: id }],
    },
    include: {
      storyboards: {
        include: {
          frames: {
            orderBy: { position: "asc" },
            take: 4,
          },
          _count: { select: { frames: true, comments: true } },
        },
        orderBy: { updatedAt: "desc" },
      },
      scripts: {
        include: {
          scenes: { orderBy: { position: "asc" } },
          _count: { select: { scenes: true, comments: true } },
        },
        orderBy: { updatedAt: "desc" },
      },
    },
  });

  if (!project) {
    return NextResponse.json({ error: "Project not found" }, { status: 404 });
  }

  return NextResponse.json({ project });
}

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const ctx = await getAuthenticatedContext();
  if (!ctx) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!canPerformAction(ctx.role, "project.edit")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await context.params;
  const existing = await prisma.project.findFirst({
    where: {
      teamId: ctx.team.id,
      OR: [{ id }, { slug: id }],
    },
  });

  if (!existing) {
    return NextResponse.json({ error: "Project not found" }, { status: 404 });
  }

  const body = await request.json();
  const updated = await prisma.project.update({
    where: { id: existing.id },
    data: {
      ...(body.name !== undefined ? { name: String(body.name).trim() } : {}),
      ...(body.description !== undefined
        ? { description: body.description }
        : {}),
      ...(body.isArchived !== undefined
        ? { isArchived: Boolean(body.isArchived) }
        : {}),
      ...(body.isShared !== undefined
        ? { isShared: Boolean(body.isShared) }
        : {}),
      ...(body.sharePassword !== undefined
        ? { sharePassword: body.sharePassword || null }
        : {}),
    },
  });

  await recordAuditLog({
    teamId: ctx.team.id,
    actorId: ctx.user.id,
    actorEmail: ctx.user.email,
    projectId: existing.id,
    action:
      body.isArchived === true
        ? "project.archived"
        : body.isArchived === false
        ? "project.restored"
        : "project.updated",
    targetType: "project",
    targetId: existing.id,
    metadata: { name: updated.name, isArchived: updated.isArchived },
  });

  return NextResponse.json({ project: updated });
}

export async function DELETE(
  _request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const ctx = await getAuthenticatedContext();
  if (!ctx) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!canPerformAction(ctx.role, "project.delete")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await context.params;
  const existing = await prisma.project.findFirst({
    where: {
      teamId: ctx.team.id,
      OR: [{ id }, { slug: id }],
    },
  });

  if (!existing) {
    return NextResponse.json({ error: "Project not found" }, { status: 404 });
  }

  await prisma.project.delete({ where: { id: existing.id } });

  await recordAuditLog({
    teamId: ctx.team.id,
    actorId: ctx.user.id,
    actorEmail: ctx.user.email,
    action: "project.deleted",
    targetType: "project",
    targetId: existing.id,
    metadata: { name: existing.name },
  });

  return NextResponse.json({ deleted: true });
}
