"use client";

import { Button } from "@/components/ui/button";
import { RunWorkflow } from "@/lib/actions/workflow.action";
import { useMutation } from "@tanstack/react-query";
import { PlayIcon } from "lucide-react";
import React from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

function RunBtn({ workflowId }: { workflowId: string }) {
  const router = useRouter();
  const mutation = useMutation({
    mutationFn: RunWorkflow,
    onSuccess: (data) => {
      toast.success("Workflow started", { id: workflowId });
      router.push(`/workflow/runs/${workflowId}/${data.executionId}`);
    },
    onError: () => {
      toast.error("Something went wrong", { id: workflowId });
    },
  });

  return (
    <Button
      variant="outline"
      size="sm"
      disabled={mutation.isPending}
      onClick={() => {
        toast.loading("Scheduling Run...", { id: workflowId });
        mutation.mutate({ workflowId });
      }}
      className="flex items-center gap-2"
    >
      <PlayIcon size={16} />
      Run
    </Button>
  );
}

export default RunBtn;
