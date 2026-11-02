import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { getAuthenticatedContext } from "@/lib/auth/session";
import { recordAuditLog } from "@/lib/audit";

export async function GET() {
  const ctx = await getAuthenticatedContext();
  if (!ctx) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return NextResponse.json({
    user: {
      id: ctx.user.id,
      name: ctx.user.name,
      email: ctx.user.email,
      username: ctx.user.username,
      avatarUrl: ctx.user.avatarUrl,
      twoFactorEnabled: ctx.user.twoFactorEnabled,
      notifyEmailComments: ctx.user.notifyEmailComments,
      notifyEmailMentions: ctx.user.notifyEmailMentions,
      notifyEmailStatusChanges: ctx.user.notifyEmailStatusChanges,
      notifyInAppAll: ctx.user.notifyInAppAll,
    },
  });
}

export async function PATCH(request: Request) {
  const ctx = await getAuthenticatedContext();
  if (!ctx) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const updateData: Record<string, unknown> = {};

    if (body.name !== undefined) updateData.name = String(body.name).trim();
    if (body.username !== undefined)
      updateData.username = String(body.username).trim();
    if (body.avatarUrl !== undefined) updateData.avatarUrl = body.avatarUrl;
    if (body.twoFactorEnabled !== undefined)
      updateData.twoFactorEnabled = Boolean(body.twoFactorEnabled);
    if (body.notifyEmailComments !== undefined)
      updateData.notifyEmailComments = Boolean(body.notifyEmailComments);
    if (body.notifyEmailMentions !== undefined)
      updateData.notifyEmailMentions = Boolean(body.notifyEmailMentions);
    if (body.notifyEmailStatusChanges !== undefined)
      updateData.notifyEmailStatusChanges = Boolean(
        body.notifyEmailStatusChanges
      );
    if (body.notifyInAppAll !== undefined)
      updateData.notifyInAppAll = Boolean(body.notifyInAppAll);

    if (body.newPassword) {
      if (String(body.newPassword).length < 8) {
        return NextResponse.json(
          { error: "New password must be at least 8 characters" },
          { status: 400 }
        );
      }
      updateData.passwordHash = await bcrypt.hash(String(body.newPassword), 10);
    }

    const updated = await prisma.user.update({
      where: { id: ctx.user.id },
      data: updateData,
    });

    await recordAuditLog({
      teamId: ctx.team.id,
      actorId: ctx.user.id,
      actorEmail: ctx.user.email,
      action: "account.updated",
      targetType: "user",
      targetId: ctx.user.id,
      metadata: {
        updatedFields: Object.keys(updateData).filter(
          (k) => k !== "passwordHash"
        ),
      },
    });

    return NextResponse.json({
      user: {
        id: updated.id,
        name: updated.name,
        email: updated.email,
        username: updated.username,
        avatarUrl: updated.avatarUrl,
        twoFactorEnabled: updated.twoFactorEnabled,
        notifyEmailComments: updated.notifyEmailComments,
        notifyEmailMentions: updated.notifyEmailMentions,
        notifyEmailStatusChanges: updated.notifyEmailStatusChanges,
        notifyInAppAll: updated.notifyInAppAll,
      },
    });
  } catch (err) {
    console.error("Account update error:", err);
    return NextResponse.json(
      { error: "Failed to update account settings" },
      { status: 500 }
    );
  }
}
