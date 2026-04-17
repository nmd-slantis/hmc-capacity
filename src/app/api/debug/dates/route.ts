import { NextResponse } from "next/server";
import { fetchOdooSosByNames, fetchOdooProjectDates } from "@/lib/odoo";
import { fetchHubspotDeals } from "@/lib/hubspot";

export const dynamic = "force-dynamic";

export async function GET() {
  const hubspotDeals = await fetchHubspotDeals();

  const soNames = hubspotDeals
    .map((d) => d.properties.sales_order)
    .filter((s): s is string => !!s && s.trim() !== "");

  const hsSoMap = soNames.length > 0 ? await fetchOdooSosByNames(soNames) : new Map();

  const projectIds = new Set<number>();
  for (const so of Array.from(hsSoMap.values())) {
    for (const pid of (so.project_ids ?? [])) projectIds.add(pid);
  }

  const projectDatesMap = projectIds.size > 0
    ? await fetchOdooProjectDates(Array.from(projectIds))
    : new Map();

  // Sample: first 5 deals with a sales_order
  const sample = hubspotDeals
    .filter((d) => d.properties.sales_order)
    .slice(0, 5)
    .map((d) => {
      const soName = d.properties.sales_order!;
      const so = hsSoMap.get(soName);
      const dates = (so?.project_ids ?? []).map((pid: number) => projectDatesMap.get(pid)).filter(Boolean);
      return {
        deal: d.properties.dealname,
        soName,
        soFound: !!so,
        projectIds: so?.project_ids ?? [],
        projectDates: dates,
      };
    });

  return NextResponse.json({
    totalDeals: hubspotDeals.length,
    dealsWithSO: soNames.length,
    soNamesUnique: Array.from(new Set(soNames)).length,
    sosFetchedFromOdoo: hsSoMap.size,
    projectIdsTotal: projectIds.size,
    projectDatesFetched: projectDatesMap.size,
    sample,
  });
}
