import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

// PATCH body variants (can combine):
//   { name?: string, serviceOrderNo?: string | null }   — scalar field update
//   { addPlanningId: string }                           — link a project
//   { removePlanningId: string }                        — unlink a project
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { id } = params;

  // Scalar updates
  const updateData: { name?: string; serviceOrderNo?: string | null } = {};
  if (body.name !== undefined) updateData.name = body.name;
  if (body.serviceOrderNo !== undefined) updateData.serviceOrderNo = body.serviceOrderNo || null;

  // Link / unlink project
  if (body.addPlanningId) {
    await prisma.serviceOrderProject.upsert({
      where: { serviceOrderId_planningId: { serviceOrderId: id, planningId: body.addPlanningId } },
      create: { serviceOrderId: id, planningId: body.addPlanningId },
      update: {},
    });
  }
  if (body.removePlanningId) {
    await prisma.serviceOrderProject.deleteMany({
      where: { serviceOrderId: id, planningId: body.removePlanningId },
    });
  }

  const so = await prisma.serviceOrder.update({
    where: { id },
    data: updateData,
    include: { projects: true },
  });

  return NextResponse.json({
    id: so.id,
    serviceOrderNo: so.serviceOrderNo,
    name: so.name,
    projectIds: so.projects.map((p) => p.planningId),
    createdAt: so.createdAt.toISOString(),
    updatedAt: so.updatedAt.toISOString(),
  });
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await prisma.serviceOrder.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
