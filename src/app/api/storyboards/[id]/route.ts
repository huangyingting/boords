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
  const storyboard = await prisma.storyboard.findFirst({
    where: {
      teamId: ctx.team.id,
      OR: [{ id }, { slug: id }, { hashId: id }, { shortSlug: id }],
    },
    include: {
      project: { select: { id: true, name: true, slug: true } },
      frames: {
        orderBy: { position: "asc" },
      },
      comments: {
        include: {
          author: {
            select: { id: true, name: true, email: true, avatarUrl: true },
          },
        },
        orderBy: { createdAt: "asc" },
      },
    },
  });

  if (!storyboard) {
    return NextResponse.json(
      { error: "Storyboard not found" },
      { status: 404 }
    );
  }

  return NextResponse.json({ storyboard });
}

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const ctx = await getAuthenticatedContext();
  if (!ctx) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;
  const existing = await prisma.storyboard.findFirst({
    where: {
      teamId: ctx.team.id,
      OR: [{ id }, { slug: id }, { hashId: id }],
    },
  });

  if (!existing) {
    return NextResponse.json(
      { error: "Storyboard not found" },
      { status: 404 }
    );
  }

  const body = await request.json();

  // Reviewers can change status if review/comment is permitted, otherwise require storyboard.edit
  const isStatusOnly =
    Object.keys(body).length === 1 && body.status !== undefined;
  if (
    !isStatusOnly &&
    !canPerformAction(ctx.role, "storyboard.edit")
  ) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const updated = await prisma.storyboard.update({
    where: { id: existing.id },
    data: {
      ...(body.title !== undefined ? { title: String(body.title).trim() } : {}),
      ...(body.status !== undefined ? { status: String(body.status) } : {}),
      ...(body.version !== undefined ? { version: Number(body.version) } : {}),
      ...(body.aspectRatio !== undefined
        ? { aspectRatio: String(body.aspectRatio) }
        : {}),
      ...(body.frameNumberFormat !== undefined
        ? { frameNumberFormat: String(body.frameNumberFormat) }
        : {}),
      ...(body.projectId !== undefined
        ? { projectId: body.projectId || null }
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
      ...(body.allowComments !== undefined
        ? { allowComments: Boolean(body.allowComments) }
        : {}),
      ...(body.showFrameNumbers !== undefined
        ? { showFrameNumbers: Boolean(body.showFrameNumbers) }
        : {}),
      ...(body.showVoiceover !== undefined
        ? { showVoiceover: Boolean(body.showVoiceover) }
        : {}),
      ...(body.showAction !== undefined
        ? { showAction: Boolean(body.showAction) }
        : {}),
      ...(body.showCamera !== undefined
        ? { showCamera: Boolean(body.showCamera) }
        : {}),
      ...(body.showNotes !== undefined
        ? { showNotes: Boolean(body.showNotes) }
        : {}),
    },
    include: {
      project: { select: { id: true, name: true, slug: true } },
      frames: { orderBy: { position: "asc" } },
    },
  });

  await recordAuditLog({
    teamId: ctx.team.id,
    actorId: ctx.user.id,
    actorEmail: ctx.user.email,
    projectId: updated.projectId || undefined,
    action:
      body.status && body.status !== existing.status
        ? "storyboard.status_changed"
        : body.isArchived !== undefined
        ? body.isArchived
          ? "storyboard.archived"
          : "storyboard.restored"
        : "storyboard.updated",
    targetType: "storyboard",
    targetId: existing.id,
    metadata: {
      title: updated.title,
      status: updated.status,
      isArchived: updated.isArchived,
    },
  });

  return NextResponse.json({ storyboard: updated });
}

export async function DELETE(
  _request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const ctx = await getAuthenticatedContext();
  if (!ctx) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!canPerformAction(ctx.role, "storyboard.delete")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await context.params;
  const existing = await prisma.storyboard.findFirst({
    where: {
      teamId: ctx.team.id,
      OR: [{ id }, { slug: id }],
    },
  });

  if (!existing) {
    return NextResponse.json(
      { error: "Storyboard not found" },
      { status: 404 }
    );
  }

  await prisma.storyboard.delete({ where: { id: existing.id } });

  await recordAuditLog({
    teamId: ctx.team.id,
    actorId: ctx.user.id,
    actorEmail: ctx.user.email,
    projectId: existing.projectId || undefined,
    action: "storyboard.deleted",
    targetType: "storyboard",
    targetId: existing.id,
    metadata: { title: existing.title },
  });

  return NextResponse.json({ deleted: true });
}
