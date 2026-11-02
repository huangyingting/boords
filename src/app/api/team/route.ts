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

  return NextResponse.json({
    team: ctx.team,
    role: ctx.role,
  });
}

export async function PATCH(request: Request) {
  const ctx = await getAuthenticatedContext();
  if (!ctx) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!canPerformAction(ctx.role, "team.manage")) {
    return NextResponse.json(
      { error: "Forbidden: Only Team Admins or Owners can update team settings" },
      { status: 403 }
    );
  }

  try {
    const body = await request.json();
    const updated = await prisma.team.update({
      where: { id: ctx.team.id },
      data: {
        ...(body.name !== undefined ? { name: String(body.name).trim() } : {}),
        ...(body.logoUrl !== undefined ? { logoUrl: body.logoUrl } : {}),
        ...(body.brandDarkMode !== undefined
          ? { brandDarkMode: Boolean(body.brandDarkMode) }
          : {}),
        ...(body.customFooterText !== undefined
          ? { customFooterText: String(body.customFooterText) }
          : {}),
        ...(body.billingEmail !== undefined
          ? { billingEmail: body.billingEmail }
          : {}),
        ...(body.billingDetails !== undefined
          ? { billingDetails: body.billingDetails }
          : {}),
      },
    });

    await recordAuditLog({
      teamId: ctx.team.id,
      actorId: ctx.user.id,
      actorEmail: ctx.user.email,
      action: "team.updated",
      targetType: "team",
      targetId: ctx.team.id,
      metadata: body,
    });

    return NextResponse.json({ team: updated });
  } catch (err) {
    console.error("Update team error:", err);
    return NextResponse.json(
      { error: "Failed to update team settings" },
      { status: 500 }
    );
  }
}
