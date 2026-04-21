import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const role = (session.user as { role?: string }).role;
  if (role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const users = await prisma.user.findMany({
    orderBy: [{ createdAt: "asc" }],
    select: { id: true, name: true, email: true, role: true, createdAt: true },
  });
  return NextResponse.json(users.map((u) => ({ ...u, createdAt: u.createdAt.toISOString() })));
}
