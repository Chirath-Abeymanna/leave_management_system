"use client";

import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LeaveRequest } from "@/lib/types";
import { useMemo } from "react";

interface LeaveStatusChartProps {
  leaves: LeaveRequest[];
}

export function LeaveStatusChart({ leaves }: LeaveStatusChartProps) {
  const data = useMemo(() => {
    const counts = {
      Approved: 0,
      Pending: 0,
      Rejected: 0,
      Cancelled: 0,
    };

    leaves.forEach((l) => {
      counts[l.status]++;
    });

    return [
      { name: "Approved", value: counts.Approved, color: "#10b981" }, // Emerald 500
      { name: "Pending", value: counts.Pending, color: "#f59e0b" }, // Amber 500
      { name: "Rejected", value: counts.Rejected, color: "#ef4444" }, // Red 500
      { name: "Cancelled", value: counts.Cancelled, color: "#64748b" }, // Slate 500
    ].filter((i) => i.value > 0);
  }, [leaves]);

  return (
    <Card className="col-span-1 shadow-sm border-slate-200">
      <CardHeader>
        <CardTitle className="text-sm font-medium text-slate-600">
          Leave Status Distribution
        </CardTitle>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <div className="h-[250px] flex items-center justify-center text-slate-400 text-sm">
            No data available
          </div>
        ) : (
          <div className="h-[250px] w-full min-w-0">
            <ResponsiveContainer
              width="100%"
              height="100%"
              minWidth={0}
              minHeight={0}
            >
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    borderRadius: "8px",
                    border: "none",
                    boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                  }}
                  itemStyle={{ fontWeight: 500 }}
                />
                <Legend verticalAlign="bottom" height={36} iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
