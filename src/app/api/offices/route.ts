import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const options = await prisma.officeOption.findMany({ orderBy: { label: "asc" } });
  return NextResponse.json(options);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { label } = await req.json();
  if (!label?.trim()) return NextResponse.json({ error: "Label required" }, { status: 400 });
  const option = await prisma.officeOption.create({ data: { label: label.trim() } });
  return NextResponse.json(option, { status: 201 });
}
