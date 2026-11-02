import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthenticatedContext } from "@/lib/auth/session";
import { canPerformAction } from "@/lib/auth/rbac";
import {
  generateAssetIllustrationSvg,
  generateFrameIllustrationSvg,
} from "@/lib/svg-generator";
import { recordAuditLog } from "@/lib/audit";

export async function GET() {
  const ctx = await getAuthenticatedContext();
  if (!ctx) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const [folders, assets] = await Promise.all([
    prisma.assetFolder.findMany({
      where: { teamId: ctx.team.id },
      orderBy: { position: "asc" },
    }),
    prisma.libraryAsset.findMany({
      where: { teamId: ctx.team.id },
      include: { folder: true },
      orderBy: { createdAt: "asc" },
    }),
  ]);

  return NextResponse.json({ folders, assets });
}

export async function POST(request: Request) {
  const ctx = await getAuthenticatedContext();
  if (!ctx) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!canPerformAction(ctx.role, "asset.manage")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await request.json();

  if (body.type === "folder") {
    const count = await prisma.assetFolder.count({
      where: { teamId: ctx.team.id },
    });
    const folder = await prisma.assetFolder.create({
      data: {
        teamId: ctx.team.id,
        name: String(body.name || "New Folder").trim(),
        position: count,
      },
    });
    return NextResponse.json({ folder }, { status: 201 });
  }

  const name = String(body.name || "New Asset").trim();
  const rawMention = String(
    body.mentionName ||
      `@${name.toLowerCase().replace(/[^a-z0-9]/g, "") || "asset"}`
  );
  const mentionName = rawMention.startsWith("@")
    ? rawMention
    : `@${rawMention}`;
  const category = String(body.category || "character") as
    | "character"
    | "location"
    | "prop"
    | "generated";

  const imageUrl =
    body.imageUrl ||
    (body.playground
      ? generateFrameIllustrationSvg({
          frameIndex: 1,
          prompt: String(body.prompt || name),
          shotType: String(body.shotType || "Concept Art"),
          style: (body.style || "color") as "sketch" | "color" | "cinematic",
        })
      : generateAssetIllustrationSvg(name, category, "#F4BD64"));

  const asset = await prisma.libraryAsset.create({
    data: {
      teamId: ctx.team.id,
      folderId: body.folderId || null,
      name,
      mentionName,
      category,
      imageUrl,
      prompt: body.prompt ? String(body.prompt) : null,
      isStarter: false,
    },
    include: { folder: true },
  });

  await recordAuditLog({
    teamId: ctx.team.id,
    actorId: ctx.user.id,
    actorEmail: ctx.user.email,
    action: body.playground
      ? "asset.playground_generated"
      : "asset.created",
    targetType: "library_asset",
    targetId: asset.id,
    metadata: {
      name: asset.name,
      mentionName: asset.mentionName,
      category: asset.category,
    },
  });

  return NextResponse.json({ asset }, { status: 201 });
}

export async function DELETE(request: Request) {
  const ctx = await getAuthenticatedContext();
  if (!ctx) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!canPerformAction(ctx.role, "asset.manage")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "Missing id" }, { status: 400 });
  }

  await prisma.libraryAsset.deleteMany({
    where: { id, teamId: ctx.team.id },
  });

  return NextResponse.json({ deleted: true });
}
