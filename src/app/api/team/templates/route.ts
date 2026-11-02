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

  const templates = await prisma.storyboardTemplate.findMany({
    where: { teamId: ctx.team.id },
    orderBy: { createdAt: "asc" },
  });

  return NextResponse.json({ templates });
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
  const template = await prisma.storyboardTemplate.create({
    data: {
      teamId: ctx.team.id,
      name: String(body.name || "Custom Template").trim(),
      aspectRatio: String(body.aspectRatio || "16:9"),
      frameNumberFormat: String(body.frameNumberFormat || "1, 2, 3"),
      fieldsJson: JSON.stringify(
        body.fields || {
          voiceover: true,
          action: true,
          camera: true,
          notes: true,
        }
      ),
    },
  });

  await recordAuditLog({
    teamId: ctx.team.id,
    actorId: ctx.user.id,
    actorEmail: ctx.user.email,
    action: "template.created",
    targetType: "storyboard_template",
    targetId: template.id,
    metadata: { name: template.name, aspectRatio: template.aspectRatio },
  });

  return NextResponse.json({ template }, { status: 201 });
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
  if (!id) {
    return NextResponse.json({ error: "Missing id" }, { status: 400 });
  }

  await prisma.storyboardTemplate.deleteMany({
    where: { id, teamId: ctx.team.id },
  });

  return NextResponse.json({ deleted: true });
}
