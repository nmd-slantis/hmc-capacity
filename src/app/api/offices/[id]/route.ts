import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const id = parseInt(params.id);
  const { label } = await req.json();
  if (!label?.trim()) return NextResponse.json({ error: "Label required" }, { status: 400 });

  const existing = await prisma.officeOption.findUnique({ where: { id } });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const updated = await prisma.officeOption.update({
    where: { id },
    data: { label: label.trim() },
  });

  // Cascade rename to all ManualData rows that had the old label
  await prisma.manualData.updateMany({
    where: { office: existing.label },
    data: { office: updated.label },
  });

  return NextResponse.json(updated);
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const id = parseInt(params.id);
  const existing = await prisma.officeOption.findUnique({ where: { id } });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await prisma.officeOption.delete({ where: { id } });

  // Clear office from all ManualData rows that had this label
  await prisma.manualData.updateMany({
    where: { office: existing.label },
    data: { office: null },
  });

  return new NextResponse(null, { status: 204 });
}
