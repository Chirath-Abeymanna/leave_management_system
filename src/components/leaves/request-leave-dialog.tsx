"use client";

import { useState } from "react";
import { format } from "date-fns";
import { Calendar as CalendarIcon, Loader2 } from "lucide-react";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

interface RequestLeaveDialogProps {
  onSuccess: () => void;
}

export function RequestLeaveDialog({ onSuccess }: RequestLeaveDialogProps) {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const [leaveType, setLeaveType] = useState("Annual");
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();
  const [reason, setReason] = useState("");

  const calculateDays = (start: Date, end: Date) => {
    // Simple calc, doesn't account for weekends/holidays perfectly but good for demo
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return diffDays;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!startDate || !endDate) {
      setError("Please select both start and end dates");
      return;
    }

    if (endDate < startDate) {
      setError("End date cannot be before start date");
      return;
    }

    setError("");
    setIsLoading(true);

    try {
      const days = calculateDays(startDate, endDate);

      await api.createLeave({
        leave_type: leaveType,
        start_date: format(startDate, "yyyy-MM-dd"),
        end_date: format(endDate, "yyyy-MM-dd"),
        total_days: days,
        reason: reason,
      });

      setOpen(false);
      resetForm();
      onSuccess();
    } catch (err: any) {
      setError(err.message || "Failed to submit request");
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setLeaveType("Annual");
    setStartDate(undefined);
    setEndDate(undefined);
    setReason("");
    setError("");
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(val) => {
        setOpen(val);
        if (!val) resetForm();
      }}
    >
      <DialogTrigger
        render={<Button className="bg-blue-600 hover:bg-blue-700" />}
      >
        Request Leave
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Request Leave</DialogTitle>
          <DialogDescription>
            Submit a new time-off request for manager approval.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            {error && (
              <div className="p-3 bg-red-50 text-red-600 text-sm rounded border border-red-200">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="type">Leave Type</Label>
              <Select
                value={leaveType}
                onValueChange={(val) => val && setLeaveType(val)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Annual">Annual Leave</SelectItem>
                  <SelectItem value="Sick">Sick Leave</SelectItem>
                  <SelectItem value="Unpaid">Unpaid Leave</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2 flex flex-col">
                <Label>Start Date</Label>
                <Popover>
                  <PopoverTrigger
                    render={
                      <Button
                        variant="outline"
                        className={cn(
                          "justify-start text-left font-normal",
                          !startDate && "text-muted-foreground",
                        )}
                      />
                    }
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {startDate ? (
                      format(startDate, "PP")
                    ) : (
                      <span>Pick a date</span>
                    )}
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={startDate}
                      onSelect={setStartDate}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <div className="space-y-2 flex flex-col">
                <Label>End Date</Label>
                <Popover>
                  <PopoverTrigger
                    render={
                      <Button
                        variant="outline"
                        className={cn(
                          "justify-start text-left font-normal",
                          !endDate && "text-muted-foreground",
                        )}
                      />
                    }
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {endDate ? format(endDate, "PP") : <span>Pick a date</span>}
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={endDate}
                      onSelect={setEndDate}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            {startDate && endDate && endDate >= startDate && (
              <div className="text-sm font-medium text-blue-600 bg-blue-50 p-2 rounded text-center">
                Total Request: {calculateDays(startDate, endDate)} Day(s)
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="reason">Reason (Optional for Annual/Sick)</Label>
              <Textarea
                id="reason"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Briefly describe why you are taking this leave..."
                className="resize-none"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              Submit Request
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
