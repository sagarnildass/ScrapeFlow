import { cn } from "@/lib/utils";
import { WorkflowExecutionStatus } from "@/types/workflow";
import React from "react";

const indicatorColors: Record<WorkflowExecutionStatus, string> = {
  [WorkflowExecutionStatus.PENDING]: "bg-slate-400",
  [WorkflowExecutionStatus.RUNNING]: "bg-yellow-400",
  [WorkflowExecutionStatus.COMPLETED]: "bg-emerald-600",
  [WorkflowExecutionStatus.FAILED]: "bg-red-400",
};

function ExecutionStatusIndicator({
  status,
}: {
  status: WorkflowExecutionStatus;
}) {
  return (
    <div className={cn("w-2 h-2 rounded-full", indicatorColors[status])} />
  );
}

export default ExecutionStatusIndicator;
