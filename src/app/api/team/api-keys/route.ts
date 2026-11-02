import crypto from "crypto";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthenticatedContext } from "@/lib/auth/session";
import { canPerformAction } from "@/lib/auth/rbac";
import { recordAuditLog } from "@/lib/audit";

export async function GET() {
  const ctx = await getAuthenticatedContext();
  if (!ctx) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const [apiKeys, webhooks] = await Promise.all([
    prisma.apiKey.findMany({
      where: { teamId: ctx.team.id },
      orderBy: { createdAt: "desc" },
    }),
    prisma.webhookEndpoint.findMany({
      where: { teamId: ctx.team.id },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  return NextResponse.json({ apiKeys, webhooks });
}

export async function POST(request: Request) {
  const ctx = await getAuthenticatedContext();
  if (!ctx) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!canPerformAction(ctx.role, "team.manage")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await request.json();

  if (body.type === "webhook") {
    const webhook = await prisma.webhookEndpoint.create({
      data: {
        teamId: ctx.team.id,
        url: String(body.url || "").trim(),
        eventsJson: JSON.stringify(
          body.events || [
            "storyboard.created",
            "storyboard.status_changed",
            "comment.created",
          ]
        ),
        secret: `whsec_${crypto.randomBytes(16).toString("hex")}`,
      },
    });

    await recordAuditLog({
      teamId: ctx.team.id,
      actorId: ctx.user.id,
      actorEmail: ctx.user.email,
      action: "webhook.created",
      targetType: "webhook_endpoint",
      targetId: webhook.id,
      metadata: { url: webhook.url },
    });

    return NextResponse.json({ webhook }, { status: 201 });
  }

  const rawKey = `brd_live_${crypto.randomBytes(20).toString("hex")}`;
  const keyPrefix = rawKey.slice(0, 14) + "...";
  const keyHash = crypto.createHash("sha256").update(rawKey).digest("hex");

  const apiKey = await prisma.apiKey.create({
    data: {
      teamId: ctx.team.id,
      name: String(body.name || "Production API Key").trim(),
      keyPrefix,
      keyHash,
    },
  });

  await recordAuditLog({
    teamId: ctx.team.id,
    actorId: ctx.user.id,
    actorEmail: ctx.user.email,
    action: "api_key.created",
    targetType: "api_key",
    targetId: apiKey.id,
    metadata: { name: apiKey.name, keyPrefix },
  });

  return NextResponse.json({ apiKey, rawKey }, { status: 201 });
}

export async function DELETE(request: Request) {
  const ctx = await getAuthenticatedContext();
  if (!ctx) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!canPerformAction(ctx.role, "team.manage")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  const type = searchParams.get("type");

  if (!id) {
    return NextResponse.json({ error: "Missing id" }, { status: 400 });
  }

  if (type === "webhook") {
    await prisma.webhookEndpoint.deleteMany({
      where: { id, teamId: ctx.team.id },
    });
  } else {
    await prisma.apiKey.updateMany({
      where: { id, teamId: ctx.team.id },
      data: { revokedAt: new Date() },
    });
  }

  return NextResponse.json({ deleted: true });
}
