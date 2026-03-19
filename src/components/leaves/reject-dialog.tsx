"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

interface RejectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onReject: (note: string) => Promise<void>;
  isLoading: boolean;
}

export function RejectDialog({ open, onOpenChange, onReject, isLoading }: RejectDialogProps) {
  const [note, setNote] = useState("");

  const handleReject = async () => {
    await onReject(note);
    setNote("");
  };

  return (
    <Dialog open={open} onOpenChange={(val) => {
        onOpenChange(val);
        if (!val) setNote("");
    }}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Reject Leave Request</DialogTitle>
          <DialogDescription>
            Provide an optional note explaining why this request is being rejected. The employee will see this note.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <Textarea 
            placeholder="E.g., Too many people off this week..."
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className="resize-none h-24"
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={handleReject} disabled={isLoading}>
            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Confirm Rejection
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
