"use client";

import { useMemo } from "react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import { FiUsers } from "react-icons/fi";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { DashboardStats } from "@/types";

// ── Types ─────────────────────────────────────────────────────────────────────

interface PieDataItem {
  name: string;
  value: number;
  color: string;
}

// ── Custom Tooltip ────────────────────────────────────────────────────────────

type PiePayloadEntry = { name: string; value: number; color: string };

const PieTooltip = ({ active, payload }: { active?: boolean; payload?: PiePayloadEntry[] }) => {
  if (!active || !payload?.length) return null;
  const entry = payload[0];
  return (
    <div className="bg-popover border border-border px-3 py-2 rounded-lg shadow-xl text-[11px]">
      <div className="flex items-center gap-2">
        <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: entry.color }} />
        <span className="font-bold text-foreground">{entry.name}</span>
        <span className="font-mono font-bold ml-1">{entry.value?.toLocaleString()}</span>
      </div>
    </div>
  );
};

// ── Segment Pie Chart ─────────────────────────────────────────────────────────

export function SegmentPieChart({ stats }: { stats: DashboardStats }) {
  const { totalUsers, activeSubscriptions, monthlySubscriptions, yearlySubscriptions } = stats.stats;

  const pieData = useMemo<PieDataItem[]>(() => {
    const freeCount = Math.max(0, totalUsers - activeSubscriptions);
    return [
      { name: "Monthly Pro",   value: monthlySubscriptions, color: "#4ade80" },
      { name: "Annual Elite",  value: yearlySubscriptions,  color: "#c084fc" },
      { name: "Free Tier",     value: freeCount,            color: "#94a3b8" },
    ].filter((d) => d.value > 0);
  }, [totalUsers, activeSubscriptions, monthlySubscriptions, yearlySubscriptions]);

  const total = useMemo(() => pieData.reduce((a, b) => a + b.value, 0), [pieData]);

  return (
    <Card className="border-border/40 shadow-sm">
      <CardHeader className="bg-muted/5 py-4 border-b">
        <CardTitle className="text-sm font-bold flex items-center gap-2">
          <FiUsers className="text-primary" /> Segment Analysis
        </CardTitle>
      </CardHeader>
      <CardContent className="py-6">
        {pieData.length === 0 ? (
          <div className="h-48 flex items-center justify-center text-xs text-muted-foreground">
            No subscription data yet
          </div>
        ) : (
          <>
            <div className="h-48 relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    innerRadius={55}
                    outerRadius={75}
                    paddingAngle={4}
                    dataKey="value"
                    strokeWidth={0}
                  >
                    {pieData.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip content={<PieTooltip />} />
                </PieChart>
              </ResponsiveContainer>
              {/* Centre label */}
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-xl font-black font-mono">{total.toLocaleString()}</span>
                <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Users</span>
              </div>
            </div>

            <div className="mt-4 space-y-2.5">
              {pieData.map((item) => (
                <div key={item.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                    <span className="text-[11px] font-semibold text-muted-foreground">{item.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-mono font-bold">{item.value.toLocaleString()}</span>
                    <span className="text-[10px] text-muted-foreground w-8 text-right">
                      {total > 0 ? `${((item.value / total) * 100).toFixed(0)}%` : "—"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
