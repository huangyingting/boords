import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthenticatedContext } from "@/lib/auth/session";
import { recordAuditLog } from "@/lib/audit";

export async function GET(request: Request) {
  const ctx = await getAuthenticatedContext();
  if (!ctx) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const storyboardId = searchParams.get("storyboardId") || undefined;
  const scriptId = searchParams.get("scriptId") || undefined;
  const frameId = searchParams.get("frameId") || undefined;

  const comments = await prisma.comment.findMany({
    where: {
      teamId: ctx.team.id,
      ...(storyboardId ? { storyboardId } : {}),
      ...(scriptId ? { scriptId } : {}),
      ...(frameId ? { frameId } : {}),
    },
    include: {
      author: {
        select: { id: true, name: true, email: true, avatarUrl: true },
      },
    },
    orderBy: { createdAt: "asc" },
  });

  return NextResponse.json({ comments });
}

export async function POST(request: Request) {
  const ctx = await getAuthenticatedContext();
  if (!ctx) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const content = String(body.body || "").trim();
  if (!content) {
    return NextResponse.json(
      { error: "Comment body is required" },
      { status: 400 }
    );
  }

  const comment = await prisma.comment.create({
    data: {
      teamId: ctx.team.id,
      authorId: ctx.user.id,
      guestName: body.guestName || null,
      body: content,
      storyboardId: body.storyboardId || null,
      frameId: body.frameId || null,
      scriptId: body.scriptId || null,
      sceneId: body.sceneId || null,
    },
    include: {
      author: {
        select: { id: true, name: true, email: true, avatarUrl: true },
      },
    },
  });

  // Notify other team members
  const otherMembers = await prisma.teamMembership.findMany({
    where: {
      teamId: ctx.team.id,
      revokedAt: null,
      userId: { not: ctx.user.id },
    },
  });

  if (otherMembers.length > 0) {
    await prisma.notification.createMany({
      data: otherMembers.map((m) => ({
        userId: m.userId,
        teamId: ctx.team.id,
        title: `${ctx.user.name} left a comment`,
        message: content.slice(0, 120),
        linkUrl: body.linkUrl || "/dashboard",
      })),
    });
  }

  await recordAuditLog({
    teamId: ctx.team.id,
    actorId: ctx.user.id,
    actorEmail: ctx.user.email,
    action: "comment.created",
    targetType: body.storyboardId ? "storyboard" : "script",
    targetId: body.storyboardId || body.scriptId || comment.id,
    metadata: {
      commentId: comment.id,
      frameId: body.frameId || null,
      excerpt: content.slice(0, 80),
    },
  });

  return NextResponse.json({ comment }, { status: 201 });
}

export async function PATCH(request: Request) {
  const ctx = await getAuthenticatedContext();
  if (!ctx) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const comment = await prisma.comment.findFirst({
    where: { id: String(body.id), teamId: ctx.team.id },
  });

  if (!comment) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const updated = await prisma.comment.update({
    where: { id: comment.id },
    data: {
      isResolved: Boolean(body.isResolved),
    },
    include: {
      author: {
        select: { id: true, name: true, email: true, avatarUrl: true },
      },
    },
  });

  return NextResponse.json({ comment: updated });
}

export async function DELETE(request: Request) {
  const ctx = await getAuthenticatedContext();
  if (!ctx) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "Missing id" }, { status: 400 });
  }

  await prisma.comment.deleteMany({
    where: { id, teamId: ctx.team.id },
  });

  return NextResponse.json({ deleted: true });
}
