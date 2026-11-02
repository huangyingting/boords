import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { recordAuditLog } from "@/lib/audit";

export async function GET(
  request: Request,
  context: { params: Promise<{ type: string; slug: string }> }
) {
  const { type, slug } = await context.params;
  const { searchParams } = new URL(request.url);
  const password = searchParams.get("password") || "";

  if (type === "storyboard") {
    const storyboard = await prisma.storyboard.findFirst({
      where: {
        OR: [{ shortSlug: slug }, { slug }],
      },
      include: {
        team: {
          select: {
            name: true,
            logoUrl: true,
            brandDarkMode: true,
            customFooterText: true,
          },
        },
        frames: { orderBy: { position: "asc" } },
        comments: {
          include: {
            author: { select: { id: true, name: true, avatarUrl: true } },
          },
          orderBy: { createdAt: "asc" },
        },
      },
    });

    if (!storyboard || !storyboard.isShared) {
      return NextResponse.json(
        { error: "Shared storyboard not found or sharing is disabled" },
        { status: 404 }
      );
    }

    if (
      storyboard.sharePassword &&
      storyboard.sharePassword !== password
    ) {
      return NextResponse.json(
        { error: "Password required", requiresPassword: true },
        { status: 401 }
      );
    }

    return NextResponse.json({ storyboard });
  }

  if (type === "script") {
    const script = await prisma.script.findFirst({
      where: {
        OR: [{ shortSlug: slug }, { slug }],
      },
      include: {
        team: {
          select: {
            name: true,
            logoUrl: true,
            brandDarkMode: true,
            customFooterText: true,
          },
        },
        scenes: { orderBy: { position: "asc" } },
        comments: {
          include: {
            author: { select: { id: true, name: true, avatarUrl: true } },
          },
          orderBy: { createdAt: "asc" },
        },
      },
    });

    if (!script || !script.isShared) {
      return NextResponse.json(
        { error: "Shared script not found or sharing is disabled" },
        { status: 404 }
      );
    }

    if (script.sharePassword && script.sharePassword !== password) {
      return NextResponse.json(
        { error: "Password required", requiresPassword: true },
        { status: 401 }
      );
    }

    return NextResponse.json({ script });
  }

  if (type === "project") {
    const project = await prisma.project.findFirst({
      where: {
        OR: [{ shareSlug: slug }, { slug }],
      },
      include: {
        team: {
          select: {
            name: true,
            logoUrl: true,
            brandDarkMode: true,
            customFooterText: true,
          },
        },
        storyboards: {
          where: { isArchived: false },
          include: {
            frames: { orderBy: { position: "asc" }, take: 4 },
            _count: { select: { frames: true, comments: true } },
          },
          orderBy: { updatedAt: "desc" },
        },
        scripts: {
          where: { isArchived: false },
          include: {
            _count: { select: { scenes: true, comments: true } },
          },
          orderBy: { updatedAt: "desc" },
        },
      },
    });

    if (!project || !project.isShared) {
      return NextResponse.json(
        { error: "Shared project not found or sharing is disabled" },
        { status: 404 }
      );
    }

    if (project.sharePassword && project.sharePassword !== password) {
      return NextResponse.json(
        { error: "Password required", requiresPassword: true },
        { status: 401 }
      );
    }

    return NextResponse.json({ project });
  }

  return NextResponse.json({ error: "Invalid share type" }, { status: 400 });
}

export async function POST(
  request: Request,
  context: { params: Promise<{ type: string; slug: string }> }
) {
  const { type, slug } = await context.params;
  const body = await request.json();
  const content = String(body.body || "").trim();
  const guestName = String(body.guestName || "Guest Reviewer").trim();

  if (!content) {
    return NextResponse.json(
      { error: "Comment text is required" },
      { status: 400 }
    );
  }

  if (type === "storyboard") {
    const storyboard = await prisma.storyboard.findFirst({
      where: { OR: [{ shortSlug: slug }, { slug }] },
    });
    if (!storyboard || !storyboard.isShared || !storyboard.allowComments) {
      return NextResponse.json(
        { error: "Comments are disabled on this shared storyboard" },
        { status: 403 }
      );
    }

    const comment = await prisma.comment.create({
      data: {
        teamId: storyboard.teamId,
        guestName,
        body: content,
        storyboardId: storyboard.id,
        frameId: body.frameId || null,
      },
    });

    await recordAuditLog({
      teamId: storyboard.teamId,
      actorEmail: `${guestName} (Share Link)`,
      projectId: storyboard.projectId || undefined,
      action: "share.comment_created",
      targetType: "storyboard",
      targetId: storyboard.id,
      metadata: { guestName, excerpt: content.slice(0, 80) },
    });

    return NextResponse.json({ comment }, { status: 201 });
  }

  if (type === "script") {
    const script = await prisma.script.findFirst({
      where: { OR: [{ shortSlug: slug }, { slug }] },
    });
    if (!script || !script.isShared || !script.allowComments) {
      return NextResponse.json(
        { error: "Comments are disabled on this shared script" },
        { status: 403 }
      );
    }

    const comment = await prisma.comment.create({
      data: {
        teamId: script.teamId,
        guestName,
        body: content,
        scriptId: script.id,
        sceneId: body.sceneId || null,
      },
    });

    return NextResponse.json({ comment }, { status: 201 });
  }

  return NextResponse.json({ error: "Invalid share type" }, { status: 400 });
}
