"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Plus, Search, X, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { BodyLayout } from "@/components/layout/Body";
import { User, UserRole } from "@/lib/types";
import { cn } from "@/lib/utils";
import { EmployeeTable } from "@/components/employee/EmployeeTable";
import { AddEmployeeDialog } from "@/components/employee/AddEmployee";

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api/v1";

function getHeaders() {
  const token =
    typeof window !== "undefined" ? localStorage.getItem("auth_token") : null;
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

function getAPIHeaders() {
  const API_KEY = process.env.NEXT_PUBLIC_API_KEY || "";
  return {
    "Content-Type": "application/json",
    "X-API-Key": API_KEY,
  };
}

export default function EmployeesPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<UserRole | "All">("All");
  const [addOpen, setAddOpen] = useState(false);

  // ── GET all users ──
  const loadUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/users`, {
        method: "GET",
        headers: getHeaders(),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.message ?? "Failed to fetch employees");
      }
      setUsers(await res.json());
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  // ── POST create user ──
  const handleCreate = async (data: {
    full_name: string;
    email: string;
    password: string;
    role: UserRole;
  }) => {
    const res = await fetch(`${API_BASE}/users`, {
      method: "POST",
      headers: getAPIHeaders(),
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      throw new Error(body.message ?? "Failed to create employee");
    }
    const created: User = await res.json();
    setUsers((prev) => [...prev, created]);
  };

  // ── PUT update user ──
  const handleUpdate = async (
    id: string,
    data: { full_name: string; email: string; role: UserRole },
  ) => {
    const res = await fetch(`${API_BASE}/users/${id}`, {
      method: "PUT",
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      throw new Error(body.message ?? "Failed to update employee");
    }
    const updated: User = await res.json();
    setUsers((prev) => prev.map((u) => (u.id === id ? updated : u)));
  };

  // ── DELETE user ──
  const handleDelete = async (id: string) => {
    const res = await fetch(`${API_BASE}/users/${id}`, {
      method: "DELETE",
      headers: getHeaders(),
    });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      throw new Error(body.message ?? "Failed to delete employee");
    }
    setUsers((prev) => prev.filter((u) => u.id !== id));
  };

  // ── PUT leave balance ──
  const handleLeaveBalance = async (
    id: string,
    annual: number,
    sick: number,
  ) => {
    const res = await fetch(`${API_BASE}/users/${id}/leave-balance`, {
      method: "PUT",
      headers: getHeaders(),
      body: JSON.stringify({
        annual_leave_balance: annual,
        sick_leave_balance: sick,
      }),
    });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      throw new Error(body.message ?? "Failed to update leave balance");
    }
    const updated: User = await res.json();
    setUsers((prev) => prev.map((u) => (u.id === id ? updated : u)));
  };

  // ── Filter ──
  const filtered = users.filter((u) => {
    const matchSearch =
      u.full_name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase());
    const matchRole = roleFilter === "All" || u.role === roleFilter;
    return matchSearch && matchRole;
  });

  const stats = [
    {
      label: "Total",
      value: users.length,
      color: "text-slate-900",
      bg: "bg-white",
    },
    {
      label: "Admins",
      value: users.filter((u) => u.role === "Admin").length,
      color: "text-purple-700",
      bg: "bg-purple-50",
    },
    {
      label: "Managers",
      value: users.filter((u) => u.role === "Manager").length,
      color: "text-blue-700",
      bg: "bg-blue-50",
    },
    {
      label: "Employees",
      value: users.filter((u) => u.role === "Employee").length,
      color: "text-emerald-700",
      bg: "bg-emerald-50",
    },
  ];

  return (
    <BodyLayout>
      <div className="w-full max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              Employee Management
            </h1>
            <p className="text-slate-500 text-sm mt-0.5">
              Manage team members, roles, and leave balances.
            </p>
          </div>
          <Button
            onClick={() => setAddOpen(true)}
            className="bg-blue-600 hover:bg-blue-700 rounded-md gap-2 shadow-sm shadow-blue-100 self-start sm:self-auto p-5"
          >
            <Plus className="h-4 w-4" /> Add Employee
          </Button>
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {stats.map((s) => (
            <div
              key={s.label}
              className={cn(
                "rounded-2xl border border-slate-100 px-5 py-4 shadow-sm",
                s.bg,
              )}
            >
              <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400">
                {s.label}
              </p>
              <p className={cn("text-3xl font-bold mt-1", s.color)}>
                {s.value}
              </p>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name or email…"
              className="pl-9 rounded-xl border-gray-200 bg-white focus-visible:ring-blue-500/30 focus-visible:border-blue-400"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
          <div className="flex gap-2 flex-wrap">
            {(["All", "Admin", "Manager", "Employee"] as const).map((r) => (
              <button
                key={r}
                onClick={() => setRoleFilter(r)}
                className={cn(
                  "px-4 py-2 rounded-xl text-sm font-medium border transition-all",
                  roleFilter === r
                    ? "bg-blue-600 text-white border-blue-600 shadow-sm"
                    : "bg-white text-gray-500 border-gray-200 hover:border-gray-300 hover:text-gray-700",
                )}
              >
                {r}
              </button>
            ))}
          </div>
          <Button
            variant="outline"
            size="icon"
            onClick={loadUsers}
            className="rounded-xl border-gray-200 shrink-0"
          >
            <RefreshCw
              className={cn("h-4 w-4 text-gray-500", loading && "animate-spin")}
            />
          </Button>
        </div>

        {/* Error */}
        {error && (
          <div className="flex items-center gap-2.5 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
            <span>⚠ {error}</span>
            <button onClick={() => setError(null)} className="ml-auto">
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        )}

        {/* Table */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <EmployeeTable
            users={filtered}
            loading={loading}
            search={search}
            totalCount={users.length}
            onUpdate={handleUpdate}
            onDelete={handleDelete}
            onLeaveBalance={handleLeaveBalance}
          />
        </div>
      </div>

      <AddEmployeeDialog
        open={addOpen}
        onClose={() => setAddOpen(false)}
        onSubmit={handleCreate}
      />
    </BodyLayout>
  );
}
