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

  const statuses = await prisma.workflowStatus.findMany({
    where: { teamId: ctx.team.id },
    orderBy: { position: "asc" },
  });

  return NextResponse.json({ statuses });
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
  const count = await prisma.workflowStatus.count({
    where: { teamId: ctx.team.id },
  });

  const status = await prisma.workflowStatus.create({
    data: {
      teamId: ctx.team.id,
      name: String(body.name || "New status").trim(),
      description: String(body.description || "").trim(),
      color: String(body.color || "#3B82F6"),
      position: count,
    },
  });

  await recordAuditLog({
    teamId: ctx.team.id,
    actorId: ctx.user.id,
    actorEmail: ctx.user.email,
    action: "workflow_status.created",
    targetType: "workflow_status",
    targetId: status.id,
    metadata: { name: status.name, color: status.color },
  });

  return NextResponse.json({ status }, { status: 201 });
}

export async function PATCH(request: Request) {
  const ctx = await getAuthenticatedContext();
  if (!ctx) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!canPerformAction(ctx.role, "team.manage")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await request.json();
  const existing = await prisma.workflowStatus.findFirst({
    where: { id: String(body.id), teamId: ctx.team.id },
  });

  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const updated = await prisma.workflowStatus.update({
    where: { id: existing.id },
    data: {
      ...(body.name !== undefined ? { name: String(body.name).trim() } : {}),
      ...(body.description !== undefined
        ? { description: String(body.description) }
        : {}),
      ...(body.color !== undefined ? { color: String(body.color) } : {}),
    },
  });

  return NextResponse.json({ status: updated });
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

  await prisma.workflowStatus.deleteMany({
    where: { id, teamId: ctx.team.id },
  });

  return NextResponse.json({ deleted: true });
}
