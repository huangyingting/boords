import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthenticatedContext } from "@/lib/auth/session";
import { canPerformAction } from "@/lib/auth/rbac";
import { generateShortHash } from "@/lib/auth/workspace-defaults";
import { generateFrameIllustrationSvg } from "@/lib/svg-generator";
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
  const script = await prisma.script.findFirst({
    where: {
      teamId: ctx.team.id,
      OR: [{ id }, { slug: id }, { hashId: id }, { shortSlug: id }],
    },
    include: {
      project: { select: { id: true, name: true, slug: true } },
      scenes: { orderBy: { position: "asc" } },
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

  if (!script) {
    return NextResponse.json({ error: "Script not found" }, { status: 404 });
  }

  return NextResponse.json({ script });
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
  const existing = await prisma.script.findFirst({
    where: {
      teamId: ctx.team.id,
      OR: [{ id }, { slug: id }, { hashId: id }],
    },
    include: { scenes: { orderBy: { position: "asc" } } },
  });

  if (!existing) {
    return NextResponse.json({ error: "Script not found" }, { status: 404 });
  }

  const body = await request.json();

  // Convert Script -> Storyboard ("-> Storyboard" button in Boords Script Editor)
  if (body.convertToStoryboard) {
    if (!canPerformAction(ctx.role, "storyboard.create")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const hashId = generateShortHash(6).toLowerCase();
    const shortSlug = generateShortHash(10);
    const slug = `${existing.slug}-storyboard-${hashId}`;
    const scenesToConvert =
      existing.scenes.length > 0
        ? existing.scenes
        : [
            {
              position: 0,
              sceneTitle: "Scene 1",
              audioText: existing.blankContent.slice(0, 200),
              visualText: "Establishing visual",
            },
          ];

    const storyboard = await prisma.storyboard.create({
      data: {
        hashId,
        slug,
        shortSlug,
        title: `${existing.title} — Storyboard`,
        status: "Draft",
        aspectRatio: "16:9",
        teamId: ctx.team.id,
        projectId: existing.projectId,
        createdById: ctx.user.id,
        isShared: true,
        frames: {
          create: scenesToConvert.map((scene, idx) => {
            const wordCount = (scene.audioText || "")
              .trim()
              .split(/\s+/)
              .filter(Boolean).length;
            const durationSec = Math.max(
              2,
              Math.round((wordCount / (existing.wordsPerMinute || 130)) * 60)
            );
            const promptText =
              scene.visualText || scene.sceneTitle || `Scene ${idx + 1}`;
            return {
              position: idx,
              label: scene.sceneTitle || `Scene ${idx + 1}`,
              shotType: "Medium Shot",
              aspectRatio: "16:9",
              imageUrl: generateFrameIllustrationSvg({
                frameIndex: idx + 1,
                prompt: promptText,
                shotType: "Medium Shot",
                style: "sketch",
              }),
              imagePrompt: promptText,
              imageStyle: "sketch",
              voiceoverText: scene.audioText || "",
              actionText: scene.visualText || "",
              durationSec,
            };
          }),
        },
      },
    });

    await recordAuditLog({
      teamId: ctx.team.id,
      actorId: ctx.user.id,
      actorEmail: ctx.user.email,
      projectId: existing.projectId || undefined,
      action: "script.converted_to_storyboard",
      targetType: "storyboard",
      targetId: storyboard.id,
      metadata: {
        scriptId: existing.id,
        storyboardSlug: storyboard.slug,
      },
    });

    return NextResponse.json({ storyboard });
  }

  if (!canPerformAction(ctx.role, "script.edit")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // Update scenes list if provided
  if (Array.isArray(body.scenes)) {
    await prisma.scriptScene.deleteMany({
      where: { scriptId: existing.id },
    });

    if (body.scenes.length > 0) {
      await prisma.scriptScene.createMany({
        data: body.scenes.map(
          (
            s: {
              sceneTitle?: string;
              audioText?: string;
              visualText?: string;
            },
            idx: number
          ) => ({
            scriptId: existing.id,
            position: idx,
            sceneTitle: String(s.sceneTitle ?? `Scene ${idx + 1}`),
            audioText: String(s.audioText ?? ""),
            visualText: String(s.visualText ?? ""),
          })
        ),
      });
    }
  }

  const updated = await prisma.script.update({
    where: { id: existing.id },
    data: {
      ...(body.title !== undefined ? { title: String(body.title).trim() } : {}),
      ...(body.status !== undefined ? { status: String(body.status) } : {}),
      ...(body.mode !== undefined ? { mode: String(body.mode) } : {}),
      ...(body.blankContent !== undefined
        ? { blankContent: String(body.blankContent) }
        : {}),
      ...(body.wordsPerMinute !== undefined
        ? { wordsPerMinute: Math.max(40, Number(body.wordsPerMinute)) }
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
    projectId: updated.projectId || undefined,
    action: "script.updated",
    targetType: "script",
    targetId: existing.id,
    metadata: {
      title: updated.title,
      mode: updated.mode,
      status: updated.status,
    },
  });

  return NextResponse.json({ script: updated });
}

export async function DELETE(
  _request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const ctx = await getAuthenticatedContext();
  if (!ctx) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!canPerformAction(ctx.role, "script.delete")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await context.params;
  const existing = await prisma.script.findFirst({
    where: {
      teamId: ctx.team.id,
      OR: [{ id }, { slug: id }],
    },
  });

  if (!existing) {
    return NextResponse.json({ error: "Script not found" }, { status: 404 });
  }

  await prisma.script.delete({ where: { id: existing.id } });

  await recordAuditLog({
    teamId: ctx.team.id,
    actorId: ctx.user.id,
    actorEmail: ctx.user.email,
    projectId: existing.projectId || undefined,
    action: "script.deleted",
    targetType: "script",
    targetId: existing.id,
    metadata: { title: existing.title },
  });

  return NextResponse.json({ deleted: true });
}
