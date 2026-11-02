import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { recordAuditLog } from "@/lib/audit";
import {
  generateShortHash,
  initializeTeamDefaults,
} from "@/lib/auth/workspace-defaults";

export async function GET() {
  const userCount = await prisma.user.count();
  return NextResponse.json({
    needsBootstrap: userCount === 0,
    userCount,
  });
}

export async function POST(request: Request) {
  try {
    const userCount = await prisma.user.count();
    if (userCount > 0) {
      return NextResponse.json(
        {
          error:
            "Workspace is already initialized. Registration requires a valid invitation code.",
        },
        { status: 403 }
      );
    }

    const body = await request.json();
    const name = String(body.name || "").trim();
    const email = String(body.email || "").trim().toLowerCase();
    const password = String(body.password || "");
    const teamName =
      String(body.teamName || "").trim() || `${name}'s Team`;

    if (!name || !email || password.length < 8) {
      return NextResponse.json(
        {
          error:
            "Full name, valid email, and a password of at least 8 characters are required.",
        },
        { status: 400 }
      );
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const hashId = generateShortHash(7);
    const username = email.split("@")[0].replace(/[^a-z0-9]/gi, "").toLowerCase();

    const team = await prisma.team.create({
      data: {
        hashId,
        name: teamName,
      },
    });

    const user = await prisma.user.create({
      data: {
        name,
        email,
        username: `${username}-${generateShortHash(4).toLowerCase()}`,
        passwordHash,
        activeTeamId: team.id,
      },
    });

    await prisma.teamMembership.create({
      data: {
        teamId: team.id,
        userId: user.id,
        role: "OWNER",
        canAccessAllProjects: true,
      },
    });

    await initializeTeamDefaults(team.id);

    await recordAuditLog({
      teamId: team.id,
      actorId: user.id,
      actorEmail: user.email,
      action: "auth.bootstrap",
      targetType: "team",
      targetId: team.id,
      metadata: {
        teamName: team.name,
        role: "OWNER",
      },
    });

    return NextResponse.json(
      {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
        },
        team: {
          id: team.id,
          hashId: team.hashId,
          name: team.name,
        },
      },
      { status: 201 }
    );
  } catch (err) {
    console.error("Bootstrap error:", err);
    return NextResponse.json(
      { error: "Failed to initialize workspace" },
      { status: 500 }
    );
  }
}
