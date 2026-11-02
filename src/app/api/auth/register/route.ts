import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { validateInvitationCode } from "@/lib/auth/invites";
import { generateShortHash } from "@/lib/auth/workspace-defaults";
import { recordAuditLog } from "@/lib/audit";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const name = String(body.name || "").trim();
    const email = String(body.email || "").trim().toLowerCase();
    const password = String(body.password || "");
    const inviteCode = String(body.inviteCode || "").trim();

    if (!name || !email || password.length < 8) {
      return NextResponse.json(
        {
          error:
            "Full name, email, and a password of at least 8 characters are required.",
        },
        { status: 400 }
      );
    }

    const validation = await validateInvitationCode(inviteCode, email);
    if (!validation.valid) {
      await recordAuditLog({
        actorEmail: email,
        action: "invite.redemption_failed",
        targetType: "invitation_code",
        metadata: {
          code: inviteCode,
          reason: validation.error,
        },
      });
      return NextResponse.json({ error: validation.error }, { status: 403 });
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return NextResponse.json(
        { error: "An account with this email already exists." },
        { status: 409 }
      );
    }

    const { invite } = validation;
    const passwordHash = await bcrypt.hash(password, 10);
    const usernamePrefix = email
      .split("@")[0]
      .replace(/[^a-z0-9]/gi, "")
      .toLowerCase();

    const projectIds = JSON.parse(invite.projectIdsJson || "[]") as string[];

    const user = await prisma.user.create({
      data: {
        name,
        email,
        username: `${usernamePrefix}-${generateShortHash(4).toLowerCase()}`,
        passwordHash,
        activeTeamId: invite.teamId,
      },
    });

    await prisma.teamMembership.create({
      data: {
        teamId: invite.teamId,
        userId: user.id,
        role: invite.role,
        canAccessAllProjects: projectIds.length === 0,
        projectIdsJson: invite.projectIdsJson,
      },
    });

    await prisma.invitationCode.update({
      where: { id: invite.id },
      data: {
        usedCount: { increment: 1 },
        redeemedByUserId: user.id,
        redeemedAt: new Date(),
      },
    });

    await recordAuditLog({
      teamId: invite.teamId,
      actorId: user.id,
      actorEmail: user.email,
      action: "invite.redeemed",
      targetType: "invitation_code",
      targetId: invite.id,
      metadata: {
        code: invite.code,
        role: invite.role,
        usedCount: invite.usedCount + 1,
        maxUses: invite.maxUses,
      },
    });

    return NextResponse.json(
      {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: invite.role,
          teamId: invite.teamId,
        },
      },
      { status: 201 }
    );
  } catch (err) {
    console.error("Registration error:", err);
    return NextResponse.json(
      { error: "Failed to register with invitation code" },
      { status: 500 }
    );
  }
}
