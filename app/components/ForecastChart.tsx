"use client";

import {
  Bar,
  ComposedChart,
  Line,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { DayInfo } from "@/app/lib/timeline";

type Props = {
  data: DayInfo[];
  variant?: "modern" | "retro";
  height?: number;
};

/**
 * Forecast-vs-observation waveform.
 *
 * The "obs" series is only populated for the first five lead days, mirroring
 * the fact that a real system can only verify lead times that have elapsed.
 */
export default function ForecastChart({ data, variant = "modern", height }: Props) {
  const retro = variant === "retro";

  const axis = retro ? "#4fbf93" : "#6e7a71";
  const rawFill = retro ? "rgba(125,252,191,.16)" : "#ded2b8";
  const rawStroke = retro ? "#2b4a45" : "#6b6152";
  const obsStroke = retro ? "#ff6b6b" : "#a9221d";
  const corrStroke = retro ? "#7dfcbf" : "#0c6b5c";
  const gridline = retro ? "rgba(125,252,191,.12)" : "rgba(23,32,29,.1)";

  return (
    <div style={{ width: "100%", height: height ?? (retro ? 190 : 240) }}>
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={data} margin={{ top: 12, right: 8, left: -20, bottom: 0 }}>
          <XAxis
            dataKey="day"
            tickFormatter={(d) => `D${d}`}
            stroke={axis}
            fontSize={retro ? 10 : 10}
            tickLine={false}
            fontFamily="var(--font-plex-mono), monospace"
          />
          <YAxis
            stroke={axis}
            fontSize={retro ? 10 : 10}
            tickLine={false}
            axisLine={false}
            width={42}
            fontFamily="var(--font-plex-mono), monospace"
          />
          <Tooltip
            cursor={{ fill: gridline }}
            contentStyle={
              retro
                ? {
                    backgroundColor: "#081311",
                    borderColor: "#2b4a45",
                    borderRadius: 0,
                    fontSize: 11,
                    color: "#7dfcbf",
                    fontFamily: "var(--font-plex-mono), monospace",
                  }
                : {
                    backgroundColor: "#fbf6e9",
                    borderColor: "#17201d",
                    borderRadius: 0,
                    fontSize: 11,
                    color: "#17201d",
                    boxShadow: "2px 2px 0 #17201d",
                    fontFamily: "var(--font-plex-mono), monospace",
                  }
            }
            labelStyle={{ color: retro ? "#ffc857" : "#33403a", fontSize: 10 }}
            itemStyle={{ color: retro ? "#7dfcbf" : "#17201d" }}
            formatter={(value, name) => [`${value ?? "—"} mm`, name]}
            labelFormatter={(l) => `Day ${l}`}
          />
          <ReferenceLine y={115.5} stroke={obsStroke} strokeDasharray="3 3" strokeOpacity={0.55} />
          <Bar
            dataKey="raw"
            name="Raw model"
            fill={rawFill}
            stroke={rawStroke}
            strokeWidth={1}
            barSize={retro ? 10 : 13}
            isAnimationActive={false}
          />
          <Line
            type="stepAfter"
            dataKey="corr"
            name="Bias-corrected"
            stroke={corrStroke}
            strokeWidth={2}
            dot={false}
            isAnimationActive={false}
          />
          <Line
            type="stepAfter"
            dataKey="obs"
            name="Verifying obs"
            stroke={obsStroke}
            strokeWidth={1.75}
            strokeDasharray="3 3"
            dot={false}
            connectNulls
            isAnimationActive={false}
          />
        </ComposedChart>
      </ResponsiveContainer>

      {retro ? null : (
        <div className="mt-2 flex flex-wrap items-center gap-x-5 gap-y-1.5 font-mono-code text-[10px] text-[var(--muted)]">
          <span className="flex items-center gap-1.5">
            <span
              className="inline-block h-2.5 w-3"
              style={{ background: rawFill, border: `1px solid ${rawStroke}` }}
            />
            Raw model
          </span>
          <span className="flex items-center gap-1.5">
            <span className="inline-block h-[2px] w-4" style={{ background: corrStroke }} />
            Bias-corrected
          </span>
          <span className="flex items-center gap-1.5">
            <span
              className="inline-block h-[2px] w-4"
              style={{
                backgroundImage: `repeating-linear-gradient(to right, ${obsStroke} 0 3px, transparent 3px 6px)`,
              }}
            />
            Verifying obs (D1–D5)
          </span>
          <span className="ml-auto text-[var(--muted-dim)]">Dashed rule = 115.5 mm</span>
        </div>
      )}
    </div>
  );
}
