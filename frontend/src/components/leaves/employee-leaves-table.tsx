"use client";

import { useState } from "react";
import { format, parseISO } from "date-fns";
import { api } from "@/lib/api";
import { LeaveRequest } from "@/lib/types";
import {
  Table,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableBody,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
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
import {
  CheckCircle2,
  Clock,
  XCircle,
  Ban,
  MessageSquare,
  CalendarDays,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  leaves: LeaveRequest[];
  onCancelSuccess: () => void;
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
  if (!cfg) return <Badge variant="secondary">{status}</Badge>;
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

// ─── Date range ──────────────────────────────────────────────────────────────

function formatRange(start: string, end: string) {
  const s = format(parseISO(start), "MMM d, yyyy");
  const e = format(parseISO(end), "MMM d, yyyy");
  return start === end ? s : `${s} – ${e}`;
}

// ─── Main component ───────────────────────────────────────────────────────────

export function EmployeeLeavesTable({ leaves, onCancelSuccess }: Props) {
  const [cancelTarget, setCancelTarget] = useState<LeaveRequest | null>(null);
  const [cancelLoading, setCancelLoading] = useState(false);

  const handleConfirmCancel = async () => {
    if (!cancelTarget) return;
    setCancelLoading(true);
    try {
      await api.cancelLeave(cancelTarget.id);
      setCancelTarget(null);
      onCancelSuccess();
    } catch {
      // keep dialog open so user sees something went wrong
    } finally {
      setCancelLoading(false);
    }
  };

  if (leaves.length === 0) {
    return (
      <div className="border border-slate-200 rounded-2xl p-12 text-center bg-white shadow-sm">
        <CalendarDays className="h-10 w-10 text-gray-300 mx-auto mb-3" />
        <p className="text-gray-500 font-medium">No leave requests yet</p>
        <p className="text-gray-400 text-sm mt-1">
          Your submitted leave requests will appear here.
        </p>
      </div>
    );
  }

  return (
    <>
      {/* ── Mobile: card list (hidden on sm+) ── */}
      <div className="sm:hidden space-y-3">
        {leaves.map((leave) => (
          <div
            key={leave.id}
            className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm space-y-3"
          >
            {/* Top row: type + status */}
            <div className="flex items-center justify-between">
              <span className="font-semibold text-gray-900 text-sm">
                {leave.leave_type}
              </span>
              <StatusBadge status={leave.status} />
            </div>

            {/* Date + days */}
            <div className="flex items-center justify-between text-xs text-gray-500">
              <div className="flex items-center gap-1.5">
                <CalendarDays className="h-3.5 w-3.5 text-gray-400" />
                <span>{formatRange(leave.start_date, leave.end_date)}</span>
              </div>
              <span className="font-semibold text-gray-700">
                {leave.total_days} {leave.total_days === 1 ? "day" : "days"}
              </span>
            </div>

            {/* Reason */}
            {leave.reason && (
              <p className="text-xs text-gray-500 line-clamp-2">
                {leave.reason}
              </p>
            )}

            {/* Manager note */}
            {leave.manager_note && (
              <div className="flex items-start gap-1.5 text-xs text-red-600 bg-red-50 border border-red-100 rounded-lg px-2.5 py-1.5">
                <MessageSquare className="h-3 w-3 mt-0.5 shrink-0" />
                <span>{leave.manager_note}</span>
              </div>
            )}

            {/* Cancel button */}
            {leave.status === "Pending" && (
              <div className="pt-1">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCancelTarget(leave)}
                  className="w-full rounded-xl border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 text-xs"
                >
                  Cancel Request
                </Button>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* ── Desktop: table (hidden below sm) ── */}
      <div className="hidden sm:block border border-slate-200 rounded-2xl bg-white shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-slate-50/80">
            <TableRow className="border-b border-slate-100">
              <TableHead className="text-xs font-semibold uppercase tracking-wider text-gray-400 px-5">
                Dates
              </TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                Type
              </TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wider text-gray-400 text-center">
                Days
              </TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                Status
              </TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                Reason & Notes
              </TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wider text-gray-400 text-right px-5">
                Action
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="divide-y divide-slate-50">
            {leaves.map((leave) => (
              <TableRow
                key={leave.id}
                className="hover:bg-slate-50/60 transition-colors"
              >
                <TableCell className="px-5 py-4 font-medium text-sm text-gray-800 whitespace-nowrap">
                  {formatRange(leave.start_date, leave.end_date)}
                </TableCell>
                <TableCell className="text-sm text-gray-600">
                  {leave.leave_type}
                </TableCell>
                <TableCell className="text-center text-sm font-semibold text-gray-800">
                  {leave.total_days}
                </TableCell>
                <TableCell>
                  <StatusBadge status={leave.status} />
                </TableCell>
                <TableCell className="max-w-[220px]">
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
                      <span className="truncate max-w-[160px]">
                        {leave.manager_note}
                      </span>
                    </div>
                  )}
                </TableCell>
                <TableCell className="text-right px-5">
                  {leave.status === "Pending" && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setCancelTarget(leave)}
                      className="text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg text-xs"
                    >
                      Cancel
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* ── Cancel confirmation ── */}
      <AlertDialog
        open={!!cancelTarget}
        onOpenChange={(v) => !v && setCancelTarget(null)}
      >
        <AlertDialogContent className="rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-gray-900">
              Cancel Leave Request
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to cancel your{" "}
              <span className="font-semibold text-gray-800">
                {cancelTarget?.leave_type}
              </span>{" "}
              leave request for{" "}
              <span className="font-semibold text-gray-800">
                {cancelTarget &&
                  formatRange(cancelTarget.start_date, cancelTarget.end_date)}
              </span>
              ?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-xl">
              Keep It
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmCancel}
              disabled={cancelLoading}
              className="rounded-xl bg-red-600 hover:bg-red-700 text-white"
            >
              {cancelLoading && (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              )}
              Yes, Cancel
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
