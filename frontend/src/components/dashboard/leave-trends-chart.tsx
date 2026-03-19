"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { LeaveRequest } from "@/lib/types";
import { useMemo } from "react";
import { format, parseISO } from "date-fns";

interface LeaveTrendsChartProps {
  leaves: LeaveRequest[];
}

export function LeaveTrendsChart({ leaves }: LeaveTrendsChartProps) {
  const data = useMemo(() => {
    // Only count approved leaves for trends
    const approvedLeaves = leaves.filter((l) => l.status === "Approved");

    // Group by month
    const monthlyData: Record<string, number> = {};

    approvedLeaves.forEach((leave) => {
      try {
        const month = format(parseISO(leave.start_date), "MMM");
        monthlyData[month] = (monthlyData[month] || 0) + leave.total_days;
      } catch (e) {
        // Skip invalid dates
      }
    });

    // Create sorted array of last 6 months
    const result = [];
    const today = new Date();

    for (let i = 5; i >= 0; i--) {
      const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
      const monthName = format(d, "MMM");
      result.push({
        name: monthName,
        days: monthlyData[monthName] || 0,
      });
    }

    return result;
  }, [leaves]);

  return (
    <Card className="col-span-2 shadow-sm border-slate-200">
      <CardHeader>
        <CardTitle className="text-sm font-medium text-slate-600">
          Leave Days Taken
        </CardTitle>
        <CardDescription>
          Approved leave days over the last 6 months
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[250px] w-full min-w-0">
          <ResponsiveContainer
            width="100%"
            height="100%"
            minWidth={0}
            minHeight={0}
          >
            <BarChart
              data={data}
              margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="#e2e8f0"
              />
              <XAxis
                dataKey="name"
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#64748b", fontSize: 12 }}
                dy={10}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#64748b", fontSize: 12 }}
              />
              <Tooltip
                cursor={{ fill: "#f1f5f9" }}
                contentStyle={{
                  borderRadius: "8px",
                  border: "none",
                  boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                }}
              />
              <Bar
                dataKey="days"
                fill="#2563eb"
                radius={[4, 4, 0, 0]}
                maxBarSize={40}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
