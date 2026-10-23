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

  const axis = retro ? "#333333" : "#8a929a";
  const rawFill = retro ? "#a8a8a8" : "#d5cfc0";
  const rawStroke = retro ? "#7a7a7a" : "#c2bba9";
  const obsStroke = retro ? "#962a26" : "#962a26";
  const corrStroke = retro ? "#243a63" : "#1b4f72";
  const gridline = retro ? "rgba(0,0,0,.14)" : "#e5e1d6";

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
                    backgroundColor: "#ffffe1",
                    borderColor: "#7a7a7a",
                    borderRadius: 0,
                    fontSize: 11,
                    fontFamily: "var(--font-plex-mono), monospace",
                  }
                : {
                    backgroundColor: "#ffffff",
                    borderColor: "#d6d1c4",
                    borderRadius: 0,
                    fontSize: 11,
                    color: "#14171a",
                    boxShadow: "0 4px 16px rgba(20,23,26,.08)",
                    fontFamily: "var(--font-plex-mono), monospace",
                  }
            }
            labelStyle={{ color: retro ? "#000" : "#3d444b", fontSize: 10 }}
            itemStyle={{ color: retro ? "#000" : "#14171a" }}
            formatter={(value, name) => [`${value ?? "—"} mm`, name]}
            labelFormatter={(l) => `Day ${l}`}
          />
          <ReferenceLine y={115.5} stroke={obsStroke} strokeDasharray="3 3" strokeOpacity={0.55} />
          <Bar
            dataKey="raw"
            name="Raw model"
            fill={rawFill}
            stroke={rawStroke}
            strokeWidth={retro ? 0 : 1}
            barSize={retro ? 10 : 13}
            isAnimationActive={false}
          />
          <Line
            type="monotone"
            dataKey="corr"
            name="Bias-corrected"
            stroke={corrStroke}
            strokeWidth={2}
            dot={false}
            isAnimationActive={false}
          />
          <Line
            type="monotone"
            dataKey="obs"
            name="Verifying obs"
            stroke={obsStroke}
            strokeWidth={1.75}
            strokeDasharray="4 3"
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
