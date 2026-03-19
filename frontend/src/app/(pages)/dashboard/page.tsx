"use client";

import { useAuth } from "@/lib/auth-context";
import { BodyLayout } from "@/components/layout/Body";
import { MetricCard } from "@/components/dashboard/metric-card";
import { LeaveStatusChart } from "@/components/dashboard/leave-status-chart";
import { LeaveTrendsChart } from "@/components/dashboard/leave-trends-chart";
import {
  CalendarDays,
  Clock,
  Activity,
  Users,
  CheckCircle2,
  XCircle,
  Clock4,
} from "lucide-react";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { LeaveRequest } from "@/lib/types";
import { format, parseISO } from "date-fns";
import { Badge } from "@/components/ui/badge";

export default function DashboardPage() {
  const { user } = useAuth();
  const [leaves, setLeaves] = useState<LeaveRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!user) return;

      try {
        setIsLoading(true);
        let data;

        if (user.role === "Employee") {
          data = await api.getMyLeaves();
        } else {
          // Managers and Admins see team/all leaves
          data = await api.getAllLeaves();
        }

        setLeaves(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, [user]);

  if (!user) return null;

  const isEmployee = user.role === "Employee";

  // Shared calculations
  const pendingRequestsCount = leaves.filter(
    (l) => l.status === "Pending",
  ).length;

  // Quick status badge helper
  const renderStatusBadge = (status: string) => {
    switch (status) {
      case "Approved":
        return (
          <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-200 shadow-none font-medium">
            <CheckCircle2 className="w-3 h-3 mr-1" /> Approved
          </Badge>
        );
      case "Pending":
        return (
          <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-200 shadow-none font-medium">
            <Clock4 className="w-3 h-3 mr-1" /> Pending
          </Badge>
        );
      case "Rejected":
        return (
          <Badge className="bg-red-100 text-red-800 hover:bg-red-200 shadow-none font-medium">
            <XCircle className="w-3 h-3 mr-1" /> Rejected
          </Badge>
        );
      default:
        return (
          <Badge variant="secondary" className="shadow-none font-medium">
            {status}
          </Badge>
        );
    }
  };

  // Employee upcoming leaves
  const upcomingLeaves = leaves
    .filter((l) => l.status === "Approved")
    .sort(
      (a, b) =>
        new Date(a.start_date).getTime() - new Date(b.start_date).getTime(),
    )
    .slice(0, 5);

  // Admin/Manager stats
  const today = new Date().toISOString().split("T")[0];
  const onLeaveTodayCount = leaves.filter(
    (l) =>
      l.status === "Approved" &&
      l.start_date.split("T")[0] <= today &&
      l.end_date.split("T")[0] >= today,
  ).length;

  return (
    <BodyLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Dashboard
          </h1>
        </div>

        {isLoading ? (
          <div className="h-64 flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : isEmployee ? (
          // --- EMPLOYEE VIEW ---
          <>
            <div className="grid gap-4 md:grid-cols-3">
              <MetricCard
                title="Annual Leave Balance"
                value={user.annual_leave_balance}
                subtitle="Days remaining"
                icon={CalendarDays}
                iconColor="text-blue-500"
              />
              <MetricCard
                title="Sick Leave Balance"
                value={user.sick_leave_balance}
                subtitle="Days remaining"
                icon={Activity}
                iconColor="text-rose-500"
              />
              <MetricCard
                title="Pending Requests"
                value={pendingRequestsCount}
                subtitle="Awaiting approval"
                icon={Clock}
                iconColor="text-amber-500"
              />
            </div>

            <div className="mt-8">
              <h2 className="text-lg font-semibold text-slate-800 mb-4">
                Upcoming Leaves
              </h2>
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                {upcomingLeaves.length > 0 ? (
                  <ul className="divide-y divide-slate-100">
                    {upcomingLeaves.map((leave) => (
                      <li
                        key={leave.id}
                        className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors"
                      >
                        <div className="flex items-start gap-4">
                          <div className="bg-blue-50 p-2 rounded-lg text-blue-600">
                            <CalendarDays className="h-5 w-5" />
                          </div>
                          <div>
                            <p className="font-medium text-slate-900">
                              {leave.leave_type} Leave
                            </p>
                            <p className="text-sm text-slate-500">
                              {format(
                                parseISO(leave.start_date),
                                "MMM d, yyyy",
                              )}{" "}
                              -{" "}
                              {format(parseISO(leave.end_date), "MMM d, yyyy")}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-slate-700">
                            {leave.total_days} Days
                          </p>
                          <div className="mt-1">
                            {renderStatusBadge(leave.status)}
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="p-8 text-center text-slate-500">
                    <CalendarDays className="h-10 w-10 mx-auto text-slate-300 mb-2" />
                    <p>No upcoming approved leaves.</p>
                  </div>
                )}
              </div>
            </div>
          </>
        ) : (
          // --- MANAGER / ADMIN VIEW ---
          <>
            <div className="grid gap-4 md:grid-cols-3">
              <MetricCard
                title="On Leave Today"
                value={onLeaveTodayCount}
                subtitle="Team members absent"
                icon={Users}
                iconColor="text-blue-500"
              />
              <MetricCard
                title="Pending Review"
                value={pendingRequestsCount}
                subtitle="Team requests awaiting action"
                icon={Clock}
                iconColor="text-amber-500"
              />
              <MetricCard
                title="Total Requests"
                value={leaves.length}
                subtitle="All time requests"
                icon={Activity}
                iconColor="text-indigo-500"
              />
            </div>

            <div className="grid gap-6 md:grid-cols-3 mt-6">
              <LeaveTrendsChart leaves={leaves} />
              <LeaveStatusChart leaves={leaves} />
            </div>

            <div className="mt-8 flex justify-end">
              {/* Could add a shortcut to team requests tab here */}
            </div>
          </>
        )}
      </div>
    </BodyLayout>
  );
}
