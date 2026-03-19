"use client";

import { useState } from "react";
import { format, parseISO } from "date-fns";
import { api } from "@/lib/api";
import { LeaveRequest, User } from "@/lib/types";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
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
import { RejectDialog } from "./reject-dialog";
import {
  Check,
  X,
  Clock,
  CheckCircle2,
  XCircle,
  Ban,
  CalendarDays,
  Loader2,
  MessageSquare,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  leaves: LeaveRequest[];
  users: User[];
  onActionSuccess: () => void;
}

// ─── Status badge ─────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: string }) {
  const map: Record<
    string,
    { class: string; icon: React.ElementType; label: string }
  > = {
    Approved: {
      class: "bg-emerald-50 text-emerald-700 border-emerald-200",
      icon: CheckCircle2,
      label: "Approved",
    },
    Pending: {
      class: "bg-amber-50 text-amber-700 border-amber-200",
      icon: Clock,
      label: "Pending",
    },
    Rejected: {
      class: "bg-red-50 text-red-700 border-red-200",
      icon: XCircle,
      label: "Rejected",
    },
    Cancelled: {
      class: "bg-gray-50 text-gray-500 border-gray-200",
      icon: Ban,
      label: "Cancelled",
    },
  };
  const cfg = map[status];
  if (!cfg) return <span className="text-xs text-gray-500">{status}</span>;
  const Icon = cfg.icon;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-xs font-semibold border",
        cfg.class,
      )}
    >
      <Icon className="h-3 w-3" />
      {cfg.label}
    </span>
  );
}

function formatRange(start: string, end: string) {
  const s = format(parseISO(start), "MMM d, yyyy");
  const e = format(parseISO(end), "MMM d, yyyy");
  return start === end ? s : `${s} – ${e}`;
}

// ─── Mobile card ──────────────────────────────────────────────────────────────

function LeaveCard({
  leave,
  userName,
  userRole,
  isActionable,
  isProcessing,
  onApprove,
  onReject,
  onCancelReject,
}: {
  leave: LeaveRequest;
  userName: string;
  userRole: string;
  isActionable: boolean;
  isProcessing: boolean;
  onApprove: () => void;
  onReject: () => void;
  onCancelReject: () => void;
}) {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm space-y-3">
      {/* Top: name + status */}
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="font-semibold text-gray-900 text-sm">{userName}</p>
          <p className="text-xs text-gray-400">{userRole}</p>
        </div>
        <StatusBadge status={leave.status} />
      </div>

      {/* Type + days */}
      <div className="flex items-center justify-between text-xs text-gray-500">
        <span className="font-medium text-gray-700">{leave.leave_type}</span>
        <span className="font-semibold text-gray-800">
          {leave.total_days} {leave.total_days === 1 ? "day" : "days"}
        </span>
      </div>

      {/* Date range */}
      <div className="flex items-center gap-1.5 text-xs text-gray-500">
        <CalendarDays className="h-3.5 w-3.5 text-gray-400 shrink-0" />
        <span>{formatRange(leave.start_date, leave.end_date)}</span>
      </div>

      {/* Reason */}
      {leave.reason && (
        <p className="text-xs text-gray-500 line-clamp-2">{leave.reason}</p>
      )}

      {/* Manager note */}
      {leave.manager_note && (
        <div className="flex items-start gap-1.5 text-xs text-red-600 bg-red-50 border border-red-100 rounded-lg px-2.5 py-1.5">
          <MessageSquare className="h-3 w-3 mt-0.5 shrink-0" />
          <span>{leave.manager_note}</span>
        </div>
      )}

      {/* Actions */}
      {isActionable && (
        <div className="flex gap-2 pt-1">
          <Button
            size="sm"
            onClick={onApprove}
            disabled={isProcessing}
            className="flex-1 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs h-8"
          >
            {isProcessing ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <>
                <Check className="h-3.5 w-3.5 mr-1" />
                Approve
              </>
            )}
          </Button>
          <Button
            size="sm"
            variant="destructive"
            onClick={onReject}
            disabled={isProcessing}
            className="flex-1 rounded-xl text-xs h-8"
          >
            <X className="h-3.5 w-3.5 mr-1" />
            Reject
          </Button>
        </div>
      )}
      {!isActionable && leave.status === "Approved" && (
        <Button
          size="sm"
          variant="outline"
          onClick={onCancelReject}
          disabled={isProcessing}
          className="w-full rounded-xl border-gray-200 text-gray-600 text-xs h-8"
        >
          Cancel / Reject
        </Button>
      )}
    </div>
  );
}

// ─── Section ──────────────────────────────────────────────────────────────────

function Section({
  title,
  badge,
  leaves,
  users,
  isActionable,
  actionLoadingId,
  onApprove,
  onReject,
}: {
  title: React.ReactNode;
  badge?: React.ReactNode;
  leaves: LeaveRequest[];
  users: User[];
  isActionable: boolean;
  actionLoadingId: string | null;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
}) {
  const getUserName = (id: string) =>
    users.find((u) => u.id === id)?.full_name ?? "Unknown";
  const getUserRole = (id: string) =>
    users.find((u) => u.id === id)?.role ?? "Unknown";
  const emptyMsg = isActionable ? "No pending requests." : "No past requests.";

  return (
    <div className="space-y-3">
      <h3 className="text-base font-semibold text-gray-900 flex items-center gap-2">
        {title}
        {badge}
      </h3>

      {/* Mobile cards */}
      <div className="sm:hidden space-y-3">
        {leaves.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center text-gray-400 text-sm">
            {emptyMsg}
          </div>
        ) : (
          leaves.map((leave) => (
            <LeaveCard
              key={leave.id}
              leave={leave}
              userName={getUserName(leave.user_id)}
              userRole={getUserRole(leave.user_id)}
              isActionable={isActionable}
              isProcessing={actionLoadingId === leave.id}
              onApprove={() => onApprove(leave.id)}
              onReject={() => onReject(leave.id)}
              onCancelReject={() => onReject(leave.id)}
            />
          ))
        )}
      </div>

      {/* Desktop table */}
      <div className="hidden sm:block border border-slate-200 rounded-2xl bg-white shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-slate-50/80">
            <TableRow className="border-b border-slate-100">
              {[
                "Employee",
                "Type & Days",
                "Dates",
                "Reason",
                "Status",
                "Actions",
              ].map((h) => (
                <TableHead
                  key={h}
                  className={cn(
                    "text-xs font-semibold uppercase tracking-wider text-gray-400 px-5",
                    h === "Actions" && "text-right",
                  )}
                >
                  {h}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody className="divide-y divide-slate-50">
            {leaves.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="text-center text-gray-400 py-10 text-sm"
                >
                  {emptyMsg}
                </TableCell>
              </TableRow>
            ) : (
              leaves.map((leave) => {
                const isProcessing = actionLoadingId === leave.id;
                return (
                  <TableRow
                    key={leave.id}
                    className="hover:bg-slate-50/60 transition-colors"
                  >
                    <TableCell className="px-5 py-4">
                      <p className="font-medium text-sm text-gray-900">
                        {getUserName(leave.user_id)}
                      </p>
                      <p className="text-xs text-gray-400">
                        {getUserRole(leave.user_id)}
                      </p>
                    </TableCell>
                    <TableCell className="px-5 py-4">
                      <p className="text-sm font-medium text-gray-800">
                        {leave.leave_type}
                      </p>
                      <p className="text-xs text-gray-400">
                        {leave.total_days} day
                        {leave.total_days !== 1 ? "s" : ""}
                      </p>
                    </TableCell>
                    <TableCell className="px-5 py-4 text-sm text-gray-600 whitespace-nowrap">
                      {formatRange(leave.start_date, leave.end_date)}
                    </TableCell>
                    <TableCell className="px-5 py-4 max-w-[180px]">
                      <p
                        className="text-sm text-gray-600 truncate"
                        title={leave.reason}
                      >
                        {leave.reason || "—"}
                      </p>
                      {leave.manager_note && (
                        <div
                          className="mt-1 inline-flex items-center gap-1 text-xs text-red-600 bg-red-50 border border-red-100 rounded-md px-1.5 py-0.5"
                          title={leave.manager_note}
                        >
                          <MessageSquare className="h-3 w-3 shrink-0" />
                          <span className="truncate max-w-[140px]">
                            {leave.manager_note}
                          </span>
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="px-5 py-4">
                      <StatusBadge status={leave.status} />
                    </TableCell>
                    <TableCell className="px-5 py-4 text-right">
                      {isActionable ? (
                        <div className="flex justify-end gap-2">
                          <Button
                            size="sm"
                            onClick={() => onApprove(leave.id)}
                            disabled={isProcessing}
                            className="rounded-xl bg-emerald-600 hover:bg-emerald-700 h-8 px-3 text-xs"
                          >
                            {isProcessing ? (
                              <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            ) : (
                              <>
                                <Check className="h-3.5 w-3.5 mr-1" />
                                Approve
                              </>
                            )}
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => onReject(leave.id)}
                            disabled={isProcessing}
                            className="rounded-xl h-8 px-3 text-xs"
                          >
                            <X className="h-3.5 w-3.5 mr-1" />
                            Reject
                          </Button>
                        </div>
                      ) : leave.status === "Approved" ? (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => onReject(leave.id)}
                          disabled={isProcessing}
                          className="rounded-xl h-8 text-xs border-gray-200 text-gray-600"
                        >
                          Cancel / Reject
                        </Button>
                      ) : null}
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export function TeamRequestsTable({ leaves, users, onActionSuccess }: Props) {
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [rejectingLeaveId, setRejectingLeaveId] = useState<string | null>(null);
  const [approveTarget, setApproveTarget] = useState<LeaveRequest | null>(null);
  const [approveLoading, setApproveLoading] = useState(false);

  const pendingLeaves = leaves.filter((l) => l.status === "Pending");
  const actionedLeaves = leaves.filter((l) => l.status !== "Pending");

  const handleApproveConfirm = async () => {
    if (!approveTarget) return;
    setApproveLoading(true);
    setActionLoadingId(approveTarget.id);
    try {
      await api.updateLeave(approveTarget.id, { status: "Approved" });
      setApproveTarget(null);
      onActionSuccess();
    } finally {
      setApproveLoading(false);
      setActionLoadingId(null);
    }
  };

  const handleRejectConfirm = async (note: string) => {
    if (!rejectingLeaveId) return;
    setActionLoadingId(rejectingLeaveId);
    try {
      await api.updateLeave(rejectingLeaveId, {
        status: "Rejected",
        manager_note: note || undefined,
      });
      setRejectDialogOpen(false);
      onActionSuccess();
    } finally {
      setActionLoadingId(null);
      setRejectingLeaveId(null);
    }
  };

  const openReject = (id: string) => {
    setRejectingLeaveId(id);
    setRejectDialogOpen(true);
  };
  const openApprove = (id: string) => {
    const leave = leaves.find((l) => l.id === id) ?? null;
    setApproveTarget(leave);
  };

  return (
    <>
      <div className="space-y-8">
        <Section
          title="Needs Action"
          badge={
            <span className="inline-flex items-center px-2 py-0.5 rounded-lg text-xs font-semibold border bg-amber-50 text-amber-700 border-amber-200">
              {pendingLeaves.length}
            </span>
          }
          leaves={pendingLeaves}
          users={users}
          isActionable={true}
          actionLoadingId={actionLoadingId}
          onApprove={openApprove}
          onReject={openReject}
        />
        <Section
          title="Recently Actioned"
          leaves={actionedLeaves}
          users={users}
          isActionable={false}
          actionLoadingId={actionLoadingId}
          onApprove={openApprove}
          onReject={openReject}
        />
      </div>

      {/* Approve confirmation */}
      <AlertDialog
        open={!!approveTarget}
        onOpenChange={(v) => !v && setApproveTarget(null)}
      >
        <AlertDialogContent className="rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-gray-900">
              Approve Leave Request
            </AlertDialogTitle>
            <AlertDialogDescription>
              Approve the leave request for{" "}
              <span className="font-semibold text-gray-800">
                {approveTarget &&
                  users.find((u) => u.id === approveTarget.user_id)?.full_name}
              </span>{" "}
              ({approveTarget?.leave_type},{" "}
              {approveTarget &&
                formatRange(approveTarget.start_date, approveTarget.end_date)}
              )?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-xl">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleApproveConfirm}
              disabled={approveLoading}
              className="rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              {approveLoading && (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              )}
              Approve
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <RejectDialog
        open={rejectDialogOpen}
        onOpenChange={setRejectDialogOpen}
        onReject={handleRejectConfirm}
        isLoading={actionLoadingId === rejectingLeaveId}
      />
    </>
  );
}
