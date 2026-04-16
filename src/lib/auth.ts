import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: { strategy: "database" },
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async signIn({ user }) {
      if (!user.email) return false;

      // Auto-activate users from the allowed domain
      const allowedDomain = process.env.ALLOWED_DOMAIN;
      if (allowedDomain && user.email.endsWith(`@${allowedDomain}`)) {
        await prisma.user.updateMany({
          where: { email: user.email, role: "pending" },
          data: { role: "active" },
        });
        return true;
      }

      // For others, require role to be "active" or "admin"
      const dbUser = await prisma.user.findUnique({
        where: { email: user.email },
        select: { role: true },
      });
      return dbUser?.role === "active" || dbUser?.role === "admin";
    },

    async session({ session, user }) {
      if (session.user) {
        session.user.id = user.id;
        // @ts-expect-error extending default session type
        session.user.role = (user as { role: string }).role;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
});
