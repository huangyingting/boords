import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthenticatedContext } from "@/lib/auth/session";
import { canPerformAction, normalizeRole } from "@/lib/auth/rbac";
import { recordAuditLog } from "@/lib/audit";

export async function GET() {
  const ctx = await getAuthenticatedContext();
  if (!ctx) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const memberships = await prisma.teamMembership.findMany({
    where: { teamId: ctx.team.id },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          username: true,
          avatarUrl: true,
          createdAt: true,
        },
      },
    },
    orderBy: { createdAt: "asc" },
  });

  return NextResponse.json({ memberships });
}

export async function PATCH(request: Request) {
  const ctx = await getAuthenticatedContext();
  if (!ctx) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!canPerformAction(ctx.role, "team.manage")) {
    return NextResponse.json(
      { error: "Forbidden: Only Team Admins or Owners can manage members" },
      { status: 403 }
    );
  }

  try {
    const body = await request.json();
    const membershipId = String(body.membershipId || "");
    const target = await prisma.teamMembership.findFirst({
      where: { id: membershipId, teamId: ctx.team.id },
      include: { user: true },
    });

    if (!target) {
      return NextResponse.json(
        { error: "Team member not found" },
        { status: 404 }
      );
    }

    if (target.role === "OWNER" && body.revoke) {
      return NextResponse.json(
        { error: "Cannot revoke the workspace Owner" },
        { status: 400 }
      );
    }

    const updated = await prisma.teamMembership.update({
      where: { id: target.id },
      data: {
        ...(body.role ? { role: normalizeRole(body.role) } : {}),
        ...(body.revoke === true ? { revokedAt: new Date() } : {}),
        ...(body.revoke === false ? { revokedAt: null } : {}),
        ...(body.canAccessAllProjects !== undefined
          ? { canAccessAllProjects: Boolean(body.canAccessAllProjects) }
          : {}),
        ...(Array.isArray(body.projectIds)
          ? { projectIdsJson: JSON.stringify(body.projectIds) }
          : {}),
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            username: true,
            avatarUrl: true,
          },
        },
      },
    });

    await recordAuditLog({
      teamId: ctx.team.id,
      actorId: ctx.user.id,
      actorEmail: ctx.user.email,
      action: body.revoke
        ? "member.revoked"
        : body.role
        ? "member.role_updated"
        : "member.updated",
      targetType: "team_membership",
      targetId: target.id,
      metadata: {
        targetUserEmail: target.user.email,
        previousRole: target.role,
        newRole: updated.role,
        revokedAt: updated.revokedAt,
      },
    });

    return NextResponse.json({ membership: updated });
  } catch (err) {
    console.error("Update member error:", err);
    return NextResponse.json(
      { error: "Failed to update team member" },
      { status: 500 }
    );
  }
}
