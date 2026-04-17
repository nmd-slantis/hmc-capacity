import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { fetchOdooProjects } from "@/lib/odoo";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const projects = await fetchOdooProjects();
    return NextResponse.json(projects);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("Odoo fetch error:", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
