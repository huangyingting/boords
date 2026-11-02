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
      .replace(/^-|-$/g, "") || "storyboard"
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

  const storyboards = await prisma.storyboard.findMany({
    where: {
      teamId: ctx.team.id,
      ...(projectId ? { projectId } : {}),
      isArchived: archived,
    },
    include: {
      project: { select: { id: true, name: true, slug: true } },
      frames: {
        orderBy: { position: "asc" },
      },
      _count: {
        select: { frames: true, comments: true },
      },
    },
    orderBy: { updatedAt: "desc" },
  });

  return NextResponse.json({ storyboards });
}

export async function POST(request: Request) {
  const ctx = await getAuthenticatedContext();
  if (!ctx) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!canPerformAction(ctx.role, "storyboard.create")) {
    return NextResponse.json(
      { error: "Forbidden: Reviewer accounts cannot create storyboards" },
      { status: 403 }
    );
  }

  try {
    const body = await request.json();

    // Support duplicating / creating a new version of an existing storyboard
    if (body.duplicateFromId) {
      const source = await prisma.storyboard.findFirst({
        where: { id: String(body.duplicateFromId), teamId: ctx.team.id },
        include: { frames: { orderBy: { position: "asc" } } },
      });

      if (!source) {
        return NextResponse.json(
          { error: "Source storyboard not found" },
          { status: 404 }
        );
      }

      const isNewVersion = Boolean(body.asNewVersion);
      const nextVersion = isNewVersion ? source.version + 1 : 1;
      const hashId = generateShortHash(6).toLowerCase();
      const shortSlug = generateShortHash(10);
      const title = isNewVersion
        ? source.title
        : `${source.title} (Copy)`;
      const slug = `${slugify(title)}-${hashId}`;

      const copy = await prisma.storyboard.create({
        data: {
          hashId,
          slug,
          shortSlug,
          title,
          version: nextVersion,
          status: source.status,
          aspectRatio: source.aspectRatio,
          frameNumberFormat: source.frameNumberFormat,
          teamId: ctx.team.id,
          projectId: body.projectId !== undefined ? body.projectId : source.projectId,
          createdById: ctx.user.id,
          frames: {
            create: source.frames.map((f) => ({
              position: f.position,
              label: f.label,
              shotType: f.shotType,
              aspectRatio: f.aspectRatio,
              imageUrl: f.imageUrl,
              imagePrompt: f.imagePrompt,
              imageStyle: f.imageStyle,
              voiceoverText: f.voiceoverText,
              actionText: f.actionText,
              cameraNotes: f.cameraNotes,
              productionNotes: f.productionNotes,
              durationSec: f.durationSec,
              audioUrl: f.audioUrl,
              annotationsJson: f.annotationsJson,
              cropJson: f.cropJson,
              mentionedAssets: f.mentionedAssets,
            })),
          },
        },
        include: {
          frames: { orderBy: { position: "asc" } },
          project: { select: { id: true, name: true, slug: true } },
        },
      });

      await recordAuditLog({
        teamId: ctx.team.id,
        actorId: ctx.user.id,
        actorEmail: ctx.user.email,
        projectId: copy.projectId || undefined,
        action: isNewVersion
          ? "storyboard.version_created"
          : "storyboard.duplicated",
        targetType: "storyboard",
        targetId: copy.id,
        metadata: {
          title: copy.title,
          version: copy.version,
          sourceId: source.id,
        },
      });

      return NextResponse.json({ storyboard: copy }, { status: 201 });
    }

    const title = String(body.title || "Untitled Storyboard").trim();
    const hashId = generateShortHash(6).toLowerCase();
    const slug = `${slugify(title)}-${hashId}`;
    const shortSlug = generateShortHash(10);

    const storyboard = await prisma.storyboard.create({
      data: {
        hashId,
        slug,
        shortSlug,
        title,
        status: String(body.status || "Draft"),
        aspectRatio: String(body.aspectRatio || "16:9"),
        frameNumberFormat: String(body.frameNumberFormat || "1, 2, 3"),
        teamId: ctx.team.id,
        projectId: body.projectId || null,
        createdById: ctx.user.id,
        isShared: true,
      },
      include: {
        frames: { orderBy: { position: "asc" } },
        project: { select: { id: true, name: true, slug: true } },
      },
    });

    await recordAuditLog({
      teamId: ctx.team.id,
      actorId: ctx.user.id,
      actorEmail: ctx.user.email,
      projectId: storyboard.projectId || undefined,
      action: "storyboard.created",
      targetType: "storyboard",
      targetId: storyboard.id,
      metadata: {
        title: storyboard.title,
        slug: storyboard.slug,
        aspectRatio: storyboard.aspectRatio,
      },
    });

    return NextResponse.json({ storyboard }, { status: 201 });
  } catch (err) {
    console.error("Create storyboard error:", err);
    return NextResponse.json(
      { error: "Failed to create storyboard" },
      { status: 500 }
    );
  }
}
