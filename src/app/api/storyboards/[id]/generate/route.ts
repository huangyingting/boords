import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthenticatedContext } from "@/lib/auth/session";
import { canPerformAction } from "@/lib/auth/rbac";
import { generateFrameIllustrationSvg } from "@/lib/svg-generator";
import { recordAuditLog } from "@/lib/audit";

function extractMentions(text: string): string[] {
  const matches = text.match(/@[a-zA-Z0-9_-]+/g) || [];
  return Array.from(new Set(matches.map((m) => m.toLowerCase())));
}

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
  const prompt = String(body.prompt || "Cinematic product commercial").trim();
  const style = (body.style || "sketch") as "sketch" | "color" | "cinematic";
  const shotType = String(body.shotType || "Medium Shot");

  // Single frame image generation mode
  if (body.frameId) {
    const targetFrame = storyboard.frames.find((f) => f.id === body.frameId);
    if (!targetFrame) {
      return NextResponse.json({ error: "Frame not found" }, { status: 404 });
    }

    const mentions = extractMentions(
      `${prompt} ${targetFrame.actionText} ${targetFrame.voiceoverText}`
    );
    const imageUrl = generateFrameIllustrationSvg({
      frameIndex: targetFrame.position + 1,
      prompt,
      shotType: body.shotType || targetFrame.shotType || "Medium Shot",
      style,
      mentions,
    });

    const updatedFrame = await prisma.storyboardFrame.update({
      where: { id: targetFrame.id },
      data: {
        imageUrl,
        imagePrompt: prompt,
        imageStyle: style,
        shotType: body.shotType || targetFrame.shotType || "Medium Shot",
        mentionedAssets: JSON.stringify(mentions),
      },
    });

    await recordAuditLog({
      teamId: ctx.team.id,
      actorId: ctx.user.id,
      actorEmail: ctx.user.email,
      projectId: storyboard.projectId || undefined,
      action: "agent.frame_generated",
      targetType: "storyboard_frame",
      targetId: updatedFrame.id,
      metadata: { prompt, style, mentions },
    });

    return NextResponse.json({ frame: updatedFrame });
  }

  // Multi-frame Boords Agent storyboard generation mode
  const frameCount = Math.min(8, Math.max(1, Number(body.frameCount || 4)));
  const startPos = storyboard.frames.length;
  const mentions = extractMentions(prompt);

  const shotCycle = [
    "Wide Establishing Shot",
    "Medium Shot",
    "Close-Up",
    "Over-the-Shoulder",
    "Tracking Shot",
    "Hero Product Shot",
  ];

  const scenes = Array.from({ length: frameCount }).map((_, idx) => {
    const frameNumber = startPos + idx + 1;
    const currentShot = shotCycle[idx % shotCycle.length];
    const mentionTag =
      mentions.length > 0 ? mentions.join(" ") : "@alex @office";
    const framePrompt = `${prompt} — Beat ${idx + 1} (${currentShot})`;
    const imageUrl = generateFrameIllustrationSvg({
      frameIndex: frameNumber,
      prompt: framePrompt,
      shotType: currentShot,
      style,
      mentions,
    });

    return {
      storyboardId: storyboard.id,
      position: startPos + idx,
      shotType: currentShot,
      aspectRatio: storyboard.aspectRatio,
      imageUrl,
      imagePrompt: framePrompt,
      imageStyle: style,
      voiceoverText:
        idx === 0
          ? `Narrator introduces the story: "${prompt.slice(0, 80)}"`
          : idx === frameCount - 1
          ? "Call to action and closing brand message."
          : `Story beat ${idx + 1} advancing the narrative.`,
      actionText: `${currentShot}: ${mentionTag} in scene — ${prompt.slice(
        0,
        90
      )}`,
      cameraNotes:
        idx === 0
          ? "Slow push-in, 24mm lens"
          : idx === frameCount - 1
          ? "Lock-off hero frame, 50mm lens"
          : "Handheld subtle movement, 35mm lens",
      productionNotes: `Generated with Boords Agent (${style} style)`,
      durationSec: idx === 0 || idx === frameCount - 1 ? 4.0 : 3.0,
      mentionedAssets: JSON.stringify(mentions),
    };
  });

  await prisma.storyboardFrame.createMany({
    data: scenes,
  });

  await prisma.storyboard.update({
    where: { id: storyboard.id },
    data: { updatedAt: new Date() },
  });

  const allFrames = await prisma.storyboardFrame.findMany({
    where: { storyboardId: storyboard.id },
    orderBy: { position: "asc" },
  });

  await recordAuditLog({
    teamId: ctx.team.id,
    actorId: ctx.user.id,
    actorEmail: ctx.user.email,
    projectId: storyboard.projectId || undefined,
    action: "agent.storyboard_generated",
    targetType: "storyboard",
    targetId: storyboard.id,
    metadata: { prompt, frameCount, style, mentions },
  });

  return NextResponse.json({ frames: allFrames }, { status: 201 });
}
