"use client";

import React, { useState } from "react";
import {
  CalendarClock,
  Edit,
  Loader2,
  MoreVertical,
  Trash2,
  Users,
  ShieldCheck,
  UserCog,
  UserCheck,
} from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { cn } from "@/lib/utils";
import { User, UserRole } from "@/lib/types";

// ─── Helpers ─────────────────────────────────────────────────────────────────

function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

const avatarPalette = [
  "bg-blue-500",
  "bg-violet-500",
  "bg-emerald-500",
  "bg-amber-500",
  "bg-rose-500",
  "bg-cyan-500",
];
function avatarColor(id: string) {
  const sum = id.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
  return avatarPalette[sum % avatarPalette.length];
}

const roleConfig: Record<UserRole, { color: string; icon: React.ElementType }> =
  {
    Admin: {
      color: "bg-purple-50 text-purple-700 border-purple-200",
      icon: ShieldCheck,
    },
    Manager: {
      color: "bg-blue-50 text-blue-700 border-blue-200",
      icon: UserCog,
    },
    Employee: {
      color: "bg-emerald-50 text-emerald-700 border-emerald-200",
      icon: UserCheck,
    },
  };

// ─── Props ────────────────────────────────────────────────────────────────────

interface Props {
  users: User[];
  loading: boolean;
  search: string;
  totalCount: number;
  onUpdate: (
    id: string,
    data: { full_name: string; email: string; role: UserRole },
  ) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onLeaveBalance: (id: string, annual: number, sick: number) => Promise<void>;
}

// ─── Component ───────────────────────────────────────────────────────────────

export function EmployeeTable({
  users,
  loading,
  search,
  totalCount,
  onUpdate,
  onDelete,
  onLeaveBalance,
}: Props) {
  const [editTarget, setEditTarget] = useState<User | null>(null);
  const [editName, setEditName] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editRole, setEditRole] = useState<UserRole>("Employee");
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState("");

  const [leaveTarget, setLeaveTarget] = useState<User | null>(null);
  const [leaveAnnual, setLeaveAnnual] = useState(0);
  const [leaveSick, setLeaveSick] = useState(0);
  const [leaveLoading, setLeaveLoading] = useState(false);
  const [leaveError, setLeaveError] = useState("");

  const [deleteTarget, setDeleteTarget] = useState<User | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const openEdit = (user: User) => {
    setEditTarget(user);
    setEditName(user.full_name);
    setEditEmail(user.email);
    setEditRole(user.role);
    setEditError("");
  };
  const openLeave = (user: User) => {
    setLeaveTarget(user);
    setLeaveAnnual(user.annual_leave_balance);
    setLeaveSick(user.sick_leave_balance);
    setLeaveError("");
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editTarget) return;
    setEditError("");
    setEditLoading(true);
    try {
      await onUpdate(editTarget.id, {
        full_name: editName,
        email: editEmail,
        role: editRole,
      });
      setEditTarget(null);
    } catch (err: any) {
      setEditError(err.message ?? "Failed to update");
    } finally {
      setEditLoading(false);
    }
  };

  const handleLeaveSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!leaveTarget) return;
    setLeaveError("");
    setLeaveLoading(true);
    try {
      await onLeaveBalance(leaveTarget.id, leaveAnnual, leaveSick);
      setLeaveTarget(null);
    } catch (err: any) {
      setLeaveError(err.message ?? "Failed to update");
    } finally {
      setLeaveLoading(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      await onDelete(deleteTarget.id);
      setDeleteTarget(null);
    } finally {
      setDeleteLoading(false);
    }
  };

  if (loading)
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="h-7 w-7 animate-spin text-blue-500" />
      </div>
    );

  if (users.length === 0)
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <Users className="h-10 w-10 text-gray-300 mb-3" />
        <p className="text-gray-500 font-medium">No employees found</p>
        <p className="text-gray-400 text-sm mt-1">
          {search
            ? "Try a different search term"
            : "Add your first employee to get started"}
        </p>
      </div>
    );

  return (
    <>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50/60">
              <th className="text-left px-4 py-3.5 text-xs font-semibold uppercase tracking-wider text-gray-400">
                Employee
              </th>
              <th className="text-left px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-gray-400 hidden sm:table-cell">
                Role
              </th>
              <th className="text-left px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-gray-400 hidden sm:table-cell">
                Leave Balance
              </th>
              <th className="text-left px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-gray-400 hidden md:table-cell">
                Joined
              </th>
              <th className="w-12 px-3 py-3.5" />
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {users.map((user) => {
              const rc = roleConfig[user.role];
              const RoleIcon = rc.icon;
              return (
                <tr
                  key={user.id}
                  className="hover:bg-slate-50/70 border-b border-gray-100 transition-colors"
                >
                  <td className="px-3 py-4">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8 shrink-0">
                        <AvatarFallback
                          className={cn(
                            "text-white text-xs font-semibold",
                            avatarColor(user.id),
                          )}
                        >
                          {getInitials(user.full_name)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <p className="font-medium text-gray-900 truncate text-sm">
                          {user.full_name}
                        </p>
                        <p className="text-gray-400 text-xs truncate">
                          {user.email}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className=" sm:table-cell">
                    <span
                      className={cn(
                        "inline-flex items-center gap-1.5 px-1 py-2 rounded-lg text-xs font-semibold border",
                        rc.color,
                      )}
                    >
                      <RoleIcon className="h-3 w-3" />
                      {user.role}
                    </span>
                  </td>
                  <td className="px-5 py-4 hidden sm:table-cell">
                    <div className="flex gap-3 text-xs text-gray-500">
                      <span>
                        <span className="font-semibold text-gray-800">
                          {user.annual_leave_balance}
                        </span>{" "}
                        Annual
                      </span>
                      <span>
                        <span className="font-semibold text-gray-800">
                          {user.sick_leave_balance}
                        </span>{" "}
                        Sick
                      </span>
                    </div>
                  </td>
                  <td className="px-5 py-4 hidden md:table-cell text-gray-400 text-xs">
                    {new Date(user.created_at).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </td>
                  <td className="px-3 py-4">
                    <DropdownMenu>
                      <DropdownMenuTrigger
                        render={
                          <button className="h-8 w-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-700 hover:bg-slate-100 transition-colors outline-none focus:ring-2 focus:ring-blue-500/30" />
                        }
                      >
                        <MoreVertical className="h-4 w-4" />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent
                        align="end"
                        className="rounded-xl w-48"
                      >
                        <DropdownMenuItem
                          onClick={() => openLeave(user)}
                          className="gap-2 cursor-pointer"
                        >
                          <CalendarClock className="h-3.5 w-3.5" /> Adjust Leave
                          Balance
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => openEdit(user)}
                          className="gap-2 cursor-pointer"
                        >
                          <Edit className="h-3.5 w-3.5" /> Edit Details
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => setDeleteTarget(user)}
                          className="gap-2 cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-50"
                        >
                          <Trash2 className="h-3.5 w-3.5" /> Delete Employee
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="px-5 py-3 border-t border-slate-100 bg-slate-50/50">
        <p className="text-xs text-gray-400">
          Showing {users.length} of {totalCount} employees
        </p>
      </div>

      {/* Edit Dialog */}
      <Dialog
        open={!!editTarget}
        onOpenChange={(v) => !v && setEditTarget(null)}
      >
        <DialogContent className="sm:max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold text-gray-900">
              Edit Employee
            </DialogTitle>
            <DialogDescription className="text-gray-500 text-sm">
              Update details for {editTarget?.full_name}.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEditSubmit} className="space-y-4 mt-1">
            {editError && (
              <p className="text-sm text-red-600 bg-red-50 border border-red-200 px-3 py-2 rounded-lg">
                {editError}
              </p>
            )}
            <div className="space-y-1.5">
              <Label className="text-sm font-medium text-gray-700">
                Full Name
              </Label>
              <Input
                required
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className="h-10 rounded-xl border-gray-200 focus-visible:ring-blue-500/30 focus-visible:border-blue-400"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm font-medium text-gray-700">
                Email Address
              </Label>
              <Input
                required
                type="email"
                value={editEmail}
                onChange={(e) => setEditEmail(e.target.value)}
                className="h-10 rounded-xl border-gray-200 focus-visible:ring-blue-500/30 focus-visible:border-blue-400"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm font-medium text-gray-700">Role</Label>
              <select
                value={editRole}
                onChange={(e) => setEditRole(e.target.value as UserRole)}
                className="w-full h-10 rounded-xl border border-gray-200 px-3 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400"
              >
                <option value="Employee">Employee</option>
                <option value="Manager">Manager</option>
                <option value="Admin">Admin</option>
              </select>
            </div>
            <DialogFooter className="pt-2 gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setEditTarget(null)}
                className="rounded-xl"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={editLoading}
                className="rounded-xl bg-blue-600 hover:bg-blue-700"
              >
                {editLoading && (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                )}{" "}
                Save Changes
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Leave Balance Dialog */}
      <Dialog
        open={!!leaveTarget}
        onOpenChange={(v) => !v && setLeaveTarget(null)}
      >
        <DialogContent className="sm:max-w-sm rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold text-gray-900">
              Adjust Leave Balance
            </DialogTitle>
            <DialogDescription className="text-gray-500 text-sm">
              Updating balances for {leaveTarget?.full_name}.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleLeaveSubmit} className="space-y-4 mt-1">
            {leaveError && (
              <p className="text-sm text-red-600 bg-red-50 border border-red-200 px-3 py-2 rounded-lg">
                {leaveError}
              </p>
            )}
            <div className="space-y-1.5">
              <Label className="text-sm font-medium text-gray-700">
                Annual Leave (days)
              </Label>
              <Input
                type="number"
                min={0}
                max={365}
                required
                value={leaveAnnual}
                onChange={(e) => setLeaveAnnual(parseInt(e.target.value) || 0)}
                className="h-10 rounded-xl border-gray-200 focus-visible:ring-blue-500/30 focus-visible:border-blue-400"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm font-medium text-gray-700">
                Sick Leave (days)
              </Label>
              <Input
                type="number"
                min={0}
                max={365}
                required
                value={leaveSick}
                onChange={(e) => setLeaveSick(parseInt(e.target.value) || 0)}
                className="h-10 rounded-xl border-gray-200 focus-visible:ring-blue-500/30 focus-visible:border-blue-400"
              />
            </div>
            <DialogFooter className="pt-2 gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setLeaveTarget(null)}
                className="rounded-xl"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={leaveLoading}
                className="rounded-xl bg-blue-600 hover:bg-blue-700"
              >
                {leaveLoading && (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                )}{" "}
                Update Balance
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={(v) => !v && setDeleteTarget(null)}
      >
        <AlertDialogContent className="rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-gray-900">
              Delete Employee
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to permanently delete{" "}
              <span className="font-semibold text-gray-800">
                {deleteTarget?.full_name}
              </span>
              ? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-xl">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              disabled={deleteLoading}
              className="rounded-xl bg-red-600 hover:bg-red-700 text-white"
            >
              {deleteLoading && (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              )}{" "}
              Delete Employee
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
