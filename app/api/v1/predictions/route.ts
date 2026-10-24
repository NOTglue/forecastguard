import { NextResponse } from "next/server";
import { REGIMES, ZONES, RUN_META } from "@/app/data/zones";
import { getZoneTimeline } from "@/app/lib/timeline";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const runId = searchParams.get("run_id") || RUN_META.runId;
  const forecastDay = Number(searchParams.get("forecast_day") || "4");
  const variable = searchParams.get("variable") || "precipitation";
  const metric = searchParams.get("metric") || "bust_probability";

  const features = ZONES.map((zone) => {
    const timeline = getZoneTimeline(zone, REGIMES);
    const info = timeline[forecastDay - 1] || timeline[0];
    return {
      region_id: zone.id,
      region_name: zone.name,
      bust_probability: info.bust / 100,
      bust_percent: info.bust,
      confidence_label: info.bust > 60 ? "Low confidence / high bust risk" : info.bust > 40 ? "Reduced confidence" : info.bust > 20 ? "Moderate confidence" : "Higher confidence",
      raw: info.raw,
      corr: info.corr,
      regime: info.regime,
      has_data: info.hasData,
      data_quality: info.hasData ? ["VERIFIED_SYNTHETIC"] : ["NO_DATA"],
      prediction_id: `pred_${runId}_${zone.id}_d${forecastDay}`,
    };
  });

  return NextResponse.json({
    request_id: `req_${Date.now()}`,
    run_id: runId,
    model_version: RUN_META.modelVersion,
    data_mode: "SIMULATED",
    init_time: RUN_META.initTime,
    forecast_day: forecastDay,
    variable,
    metric,
    threshold_definition: "DEMO ONLY: absolute error exceeds configured threshold",
    features,
    generated_at: new Date().toISOString(),
  });
}
