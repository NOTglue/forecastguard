import { NextResponse } from "next/server";
import { RUN_META } from "@/app/data/zones";

export async function GET() {
  return NextResponse.json({
    runs: [
      {
        run_id: RUN_META.runId,
        init_time: RUN_META.initTime,
        model_version: RUN_META.modelVersion,
        data_mode: "SIMULATED",
        threshold_definition: RUN_META.thresholdDefinition,
        data_source: RUN_META.dataSource,
      },
    ],
  });
}
