import { NextResponse } from "next/server";
import { REGIMES, ZONES } from "@/app/data/zones";
import { getZoneTimeline } from "@/app/lib/timeline";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const forecastDay = Number(searchParams.get("forecast_day") || "4");
  const variable = searchParams.get("variable") || "precipitation";

  const regions = ZONES.map((zone) => {
    const info = getZoneTimeline(zone, REGIMES)[forecastDay - 1];
    const bust = info.hasData ? info.bust / 100 : null;
    return {
      region_id: zone.id,
      bust_probability: bust,
      has_data: info.hasData,
    };
  }).filter(r => r.has_data);

  const total = regions.length || 1;
  const highRisk = regions.filter(r => (r.bust_probability || 0) > 0.6).length;
  
  return NextResponse.json({
    request_id: `req_${Date.now()}`,
    data_mode: "SIMULATED",
    filters: { forecast_day: forecastDay, variable },
    metrics: {
      brier_score: 0.18,
      precision: 0.72,
      recall_pod: 0.68,
      far: 0.28,
      csi: 0.54,
      ets: 0.42,
      roc_auc: 0.81,
      pr_auc: 0.76,
    },
    sample_size: {
      total: total * 10,
      events: Math.round(total * 10 * 0.25),
      missing_coverage: 0.02,
    },
    by_region: regions,
    baseline: { name: "climatology_baseline", brier_score: 0.24 },
    generated_at: new Date().toISOString(),
  });
}
