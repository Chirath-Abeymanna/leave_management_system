"use client";

import { useAuth } from "@/lib/auth-context";
import { BodyLayout } from "@/components/layout/Body";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Building2, Mail, CalendarDays, Activity } from "lucide-react";

export default function ProfilePage() {
  const { user } = useAuth();

  if (!user) return null;

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  return (
    <BodyLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            My Profile
          </h1>
          <p className="text-slate-500 mt-1">
            View your personal information and leave balances.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {/* Profile Card */}
          <div className=" relative md:col-span-1 bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="h-32 bg-slate-900 w-full animate-in fade-in duration-500"></div>
            <div className="px-6 pb-6 ">
              <Avatar className="h-24 w-24 border-4 border-white absolute top-12 left-3  bg-white shadow-sm hover:scale-105 transition-transform">
                <AvatarFallback className="bg-blue-50 text-blue-700 text-2xl font-bold">
                  {getInitials(user.full_name)}
                </AvatarFallback>
              </Avatar>
              <div className="mt-14 space-y-1">
                <h2 className="text-xl font-bold text-slate-900">
                  {user.full_name}
                </h2>
                <div className="flex items-center gap-2">
                  <Badge
                    variant="secondary"
                    className="bg-blue-50 text-blue-700 font-medium"
                  >
                    {user.role}
                  </Badge>
                </div>
              </div>
            </div>

            <div className="border-t border-slate-100 px-6 py-4 space-y-4">
              <div className="flex items-center text-sm text-slate-600">
                <Mail className="h-4 w-4 mr-3 text-slate-400" />
                {user.email}
              </div>
              <div className="flex items-center text-sm text-slate-600">
                <Building2 className="h-4 w-4 mr-3 text-slate-400" />
                Work Ethics Inc.
              </div>
            </div>
          </div>

          {/* Details & Balances */}
          <div className="md:col-span-2 space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 transition-all hover:shadow-md">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">
                Leave Balances
              </h3>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-lg bg-blue-50 border border-blue-100 flex items-start gap-4 hover:bg-blue-100/50 transition-colors">
                  <div className="bg-white p-2 text-blue-600 rounded-md shadow-sm">
                    <CalendarDays className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-600">
                      Annual Leave
                    </p>
                    <p className="text-2xl font-bold text-slate-900 mt-1">
                      {user.annual_leave_balance}{" "}
                      <span className="text-sm font-normal text-slate-500">
                        days
                      </span>
                    </p>
                  </div>
                </div>
                <div className="p-4 rounded-lg bg-rose-50 border border-rose-100 flex items-start gap-4 hover:bg-rose-100/50 transition-colors">
                  <div className="bg-white p-2 text-rose-600 rounded-md shadow-sm">
                    <Activity className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-600">
                      Sick Leave
                    </p>
                    <p className="text-2xl font-bold text-slate-900 mt-1">
                      {user.sick_leave_balance}{" "}
                      <span className="text-sm font-normal text-slate-500">
                        days
                      </span>
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">
                Account Information
              </h3>
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-4 py-3 border-b border-slate-100">
                  <div className="text-sm font-medium text-slate-500">
                    Full Name
                  </div>
                  <div className="col-span-2 text-sm text-slate-900 font-medium">
                    {user.full_name}
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4 py-3 border-b border-slate-100">
                  <div className="text-sm font-medium text-slate-500">
                    Email Address
                  </div>
                  <div className="col-span-2 text-sm text-slate-900">
                    {user.email}
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4 py-3 border-b border-slate-100">
                  <div className="text-sm font-medium text-slate-500">
                    System Role
                  </div>
                  <div className="col-span-2 text-sm text-slate-900">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-800">
                      {user.role}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </BodyLayout>
  );
}
