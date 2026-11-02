import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthenticatedContext } from "@/lib/auth/session";
import { canPerformAction } from "@/lib/auth/rbac";
import { recordAuditLog } from "@/lib/audit";

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const ctx = await getAuthenticatedContext();
  if (!ctx) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!canPerformAction(ctx.role, "storyboard.edit")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await context.params;
  const storyboard = await prisma.storyboard.findFirst({
    where: {
      teamId: ctx.team.id,
      OR: [{ id }, { slug: id }],
    },
    include: { frames: { orderBy: { position: "asc" } } },
  });

  if (!storyboard) {
    return NextResponse.json(
      { error: "Storyboard not found" },
      { status: 404 }
    );
  }

  const body = await request.json();

  // Reorder frames
  if (Array.isArray(body.orderedFrameIds)) {
    const orderedIds = body.orderedFrameIds as string[];
    await Promise.all(
      orderedIds.map((frameId, idx) =>
        prisma.storyboardFrame.updateMany({
          where: { id: frameId, storyboardId: storyboard.id },
          data: { position: idx },
        })
      )
    );

    const updatedFrames = await prisma.storyboardFrame.findMany({
      where: { storyboardId: storyboard.id },
      orderBy: { position: "asc" },
    });

    return NextResponse.json({ frames: updatedFrames });
  }

  // Bulk delete frames
  if (Array.isArray(body.deleteFrameIds)) {
    const deleteIds = body.deleteFrameIds as string[];
    await prisma.storyboardFrame.deleteMany({
      where: {
        storyboardId: storyboard.id,
        id: { in: deleteIds },
      },
    });

    const remaining = await prisma.storyboardFrame.findMany({
      where: { storyboardId: storyboard.id },
      orderBy: { position: "asc" },
    });

    await Promise.all(
      remaining.map((f, idx) =>
        prisma.storyboardFrame.update({
          where: { id: f.id },
          data: { position: idx },
        })
      )
    );

    const updatedFrames = await prisma.storyboardFrame.findMany({
      where: { storyboardId: storyboard.id },
      orderBy: { position: "asc" },
    });

    return NextResponse.json({ frames: updatedFrames });
  }

  const count = storyboard.frames.length;
  const newFrame = await prisma.storyboardFrame.create({
    data: {
      storyboardId: storyboard.id,
      position: body.position !== undefined ? Number(body.position) : count,
      label: body.label || null,
      shotType: body.shotType || "Medium Shot",
      aspectRatio: body.aspectRatio || storyboard.aspectRatio,
      imageUrl: body.imageUrl || null,
      imagePrompt: body.imagePrompt || null,
      imageStyle: body.imageStyle || "sketch",
      voiceoverText: body.voiceoverText ? String(body.voiceoverText) : "",
      actionText: body.actionText ? String(body.actionText) : "",
      cameraNotes: body.cameraNotes ? String(body.cameraNotes) : "",
      productionNotes: body.productionNotes ? String(body.productionNotes) : "",
      durationSec: body.durationSec ? Number(body.durationSec) : 3.0,
      mentionedAssets: JSON.stringify(body.mentionedAssets || []),
    },
  });

  await prisma.storyboard.update({
    where: { id: storyboard.id },
    data: { updatedAt: new Date() },
  });

  await recordAuditLog({
    teamId: ctx.team.id,
    actorId: ctx.user.id,
    actorEmail: ctx.user.email,
    projectId: storyboard.projectId || undefined,
    action: "frame.created",
    targetType: "storyboard_frame",
    targetId: newFrame.id,
    metadata: { storyboardId: storyboard.id, position: newFrame.position },
  });

  return NextResponse.json({ frame: newFrame }, { status: 201 });
}

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const ctx = await getAuthenticatedContext();
  if (!ctx) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!canPerformAction(ctx.role, "storyboard.edit")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await context.params;
  const storyboard = await prisma.storyboard.findFirst({
    where: {
      teamId: ctx.team.id,
      OR: [{ id }, { slug: id }],
    },
  });

  if (!storyboard) {
    return NextResponse.json(
      { error: "Storyboard not found" },
      { status: 404 }
    );
  }

  const body = await request.json();
  const frameId = String(body.frameId || "");

  const existing = await prisma.storyboardFrame.findFirst({
    where: { id: frameId, storyboardId: storyboard.id },
  });

  if (!existing) {
    return NextResponse.json({ error: "Frame not found" }, { status: 404 });
  }

  const updated = await prisma.storyboardFrame.update({
    where: { id: existing.id },
    data: {
      ...(body.label !== undefined ? { label: body.label } : {}),
      ...(body.shotType !== undefined ? { shotType: body.shotType } : {}),
      ...(body.aspectRatio !== undefined
        ? { aspectRatio: body.aspectRatio }
        : {}),
      ...(body.imageUrl !== undefined ? { imageUrl: body.imageUrl } : {}),
      ...(body.imagePrompt !== undefined
        ? { imagePrompt: body.imagePrompt }
        : {}),
      ...(body.imageStyle !== undefined ? { imageStyle: body.imageStyle } : {}),
      ...(body.voiceoverText !== undefined
        ? { voiceoverText: String(body.voiceoverText) }
        : {}),
      ...(body.actionText !== undefined
        ? { actionText: String(body.actionText) }
        : {}),
      ...(body.cameraNotes !== undefined
        ? { cameraNotes: String(body.cameraNotes) }
        : {}),
      ...(body.productionNotes !== undefined
        ? { productionNotes: String(body.productionNotes) }
        : {}),
      ...(body.durationSec !== undefined
        ? { durationSec: Math.max(0.5, Number(body.durationSec)) }
        : {}),
      ...(body.audioUrl !== undefined ? { audioUrl: body.audioUrl } : {}),
      ...(body.annotationsJson !== undefined
        ? {
            annotationsJson:
              typeof body.annotationsJson === "string"
                ? body.annotationsJson
                : JSON.stringify(body.annotationsJson),
          }
        : {}),
      ...(body.cropJson !== undefined
        ? {
            cropJson:
              typeof body.cropJson === "string"
                ? body.cropJson
                : JSON.stringify(body.cropJson),
          }
        : {}),
      ...(body.mentionedAssets !== undefined
        ? {
            mentionedAssets:
              typeof body.mentionedAssets === "string"
                ? body.mentionedAssets
                : JSON.stringify(body.mentionedAssets),
          }
        : {}),
    },
  });

  await prisma.storyboard.update({
    where: { id: storyboard.id },
    data: { updatedAt: new Date() },
  });

  return NextResponse.json({ frame: updated });
}

export async function DELETE(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const ctx = await getAuthenticatedContext();
  if (!ctx) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!canPerformAction(ctx.role, "storyboard.edit")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await context.params;
  const { searchParams } = new URL(request.url);
  const frameId = searchParams.get("frameId");

  if (!frameId) {
    return NextResponse.json({ error: "Missing frameId" }, { status: 400 });
  }

  await prisma.storyboardFrame.deleteMany({
    where: { id: frameId, storyboard: { teamId: ctx.team.id, OR: [{ id }, { slug: id }] } },
  });

  return NextResponse.json({ deleted: true });
}
