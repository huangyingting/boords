import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { recordAuditLog } from "@/lib/audit";

export const authOptions: NextAuthOptions = {
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60,
  },
  pages: {
    signIn: "/login",
  },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email and password are required");
        }

        const email = credentials.email.trim().toLowerCase();
        const user = await prisma.user.findUnique({
          where: { email },
          include: {
            memberships: {
              where: { revokedAt: null },
              include: { team: true },
            },
          },
        });

        if (!user) {
          throw new Error("Invalid email or password");
        }

        const valid = await bcrypt.compare(credentials.password, user.passwordHash);
        if (!valid) {
          await recordAuditLog({
            teamId: user.activeTeamId,
            actorId: user.id,
            actorEmail: user.email,
            action: "auth.login_failed",
            targetType: "user",
            targetId: user.id,
          });
          throw new Error("Invalid email or password");
        }

        if (user.memberships.length === 0) {
          throw new Error("Your workspace membership has been revoked");
        }

        const activeMembership =
          user.memberships.find((m) => m.teamId === user.activeTeamId) ||
          user.memberships[0];

        await recordAuditLog({
          teamId: activeMembership.teamId,
          actorId: user.id,
          actorEmail: user.email,
          action: "auth.login",
          targetType: "user",
          targetId: user.id,
        });

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          teamId: activeMembership.teamId,
          teamHashId: activeMembership.team.hashId,
          role: activeMembership.role,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id;
        token.teamId = (user as { teamId?: string }).teamId;
        token.teamHashId = (user as { teamHashId?: string }).teamHashId;
        token.role = (user as { role?: string }).role;
      }
      if (trigger === "update" && session?.teamId) {
        token.teamId = session.teamId;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && token.id) {
        session.user.id = token.id as string;
        session.user.teamId = (token.teamId as string) || "";
        session.user.teamHashId = (token.teamHashId as string) || "";
        session.user.role = (token.role as string) || "MEMBER";
      }
      return session;
    },
  },
};
