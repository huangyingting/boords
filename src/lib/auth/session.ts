import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";
import { prisma } from "@/lib/prisma";

export async function getAuthenticatedContext() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return null;
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      memberships: {
        where: { revokedAt: null },
        include: { team: true },
      },
    },
  });

  if (!user || user.memberships.length === 0) {
    return null;
  }

  const activeMembership =
    user.memberships.find((m) => m.teamId === user.activeTeamId) ||
    user.memberships[0];

  return {
    user,
    team: activeMembership.team,
    membership: activeMembership,
    role: activeMembership.role,
  };
}
