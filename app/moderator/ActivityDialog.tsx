"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import TableActivityTracker from "./TableActivityTracker";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tableId: string;
  tableName?: string | null;
  sessionId: string | null;
  customerName?: string | null;
};

export const ActivityDialog: React.FC<Props> = ({
  open,
  onOpenChange,
  tableId,
  tableName,
  sessionId,
  customerName,
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] max-w-6xl h-[85vh] p-0 overflow-hidden">
        <DialogHeader className="px-6 pt-6">
          <DialogTitle className="text-xl">
            Hoạt động - {customerName ?? "Khách"} • {tableName ?? tableId}
          </DialogTitle>
          <p className="text-sm text-gray-500">Session: {sessionId ?? "-"}</p>
        </DialogHeader>

        <div className="h-[calc(85vh-88px)] overflow-auto px-6 pb-6">
          <TableActivityTracker propSessionId={sessionId} variant="embedded" />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ActivityDialog;
