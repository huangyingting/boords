import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthenticatedContext } from "@/lib/auth/session";
import { canPerformAction } from "@/lib/auth/rbac";
import { createInvitationCode } from "@/lib/auth/invites";

export async function GET() {
  const ctx = await getAuthenticatedContext();
  if (!ctx) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const invites = await prisma.invitationCode.findMany({
    where: { teamId: ctx.team.id },
    include: {
      createdBy: { select: { id: true, name: true, email: true } },
      redeemedBy: { select: { id: true, name: true, email: true } },
      revokedBy: { select: { id: true, name: true, email: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ invites });
}

export async function POST(request: Request) {
  const ctx = await getAuthenticatedContext();
  if (!ctx) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!canPerformAction(ctx.role, "team.manage")) {
    return NextResponse.json(
      { error: "Forbidden: Only Team Admins or Owners can create invitations" },
      { status: 403 }
    );
  }

  try {
    const body = await request.json();
    const invite = await createInvitationCode({
      teamId: ctx.team.id,
      createdById: ctx.user.id,
      actorEmail: ctx.user.email,
      email: body.email || null,
      role: body.role || "MEMBER",
      maxUses: body.maxUses ?? 1,
      expiresInHours: body.expiresInHours ?? 168,
      projectIds: Array.isArray(body.projectIds) ? body.projectIds : [],
      note: body.note || null,
    });

    return NextResponse.json({ invite }, { status: 201 });
  } catch (err) {
    console.error("Create invite error:", err);
    return NextResponse.json(
      { error: "Failed to create invitation code" },
      { status: 500 }
    );
  }
}
