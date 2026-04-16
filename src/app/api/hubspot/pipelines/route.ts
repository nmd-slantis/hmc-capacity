import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";

export const dynamic = "force-dynamic";

interface HsPipeline {
  id: string;
  label: string;
  displayOrder: number;
  stages: {
    id: string;
    label: string;
    displayOrder: number;
    metadata: { isClosed: string; probability: string };
  }[];
}

async function fetchPipelines(): Promise<HsPipeline[]> {
  const res = await fetch("https://api.hubapi.com/crm/v3/pipelines/deals", {
    headers: {
      Authorization: `Bearer ${process.env.HUBSPOT_ACCESS_TOKEN}`,
    },
    cache: "no-store",
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`HubSpot ${res.status}: ${text}`);
  }
  const data = await res.json();
  return data.results ?? [];
}

export async function GET() {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const pipelines = await fetchPipelines();

    // Return a clean map: pipeline id + label, each stage id + label + probability
    const summary = pipelines.map((p) => ({
      pipelineId: p.id,
      pipelineLabel: p.label,
      stages: p.stages
        .sort((a, b) => a.displayOrder - b.displayOrder)
        .map((s) => ({
          stageId: s.id,
          stageLabel: s.label,
          probability: s.metadata?.probability,
          isClosed: s.metadata?.isClosed === "true",
        })),
    }));

    return NextResponse.json(summary, { status: 200 });
  } catch (err) {
    console.error("HubSpot pipelines error:", err);
    return NextResponse.json(
      { error: "Failed to fetch HubSpot pipelines", detail: String(err) },
      { status: 500 }
    );
  }
}
