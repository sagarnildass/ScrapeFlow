"use client";

import useExecutionPlan from "@/components/hooks/useExecutionPlan";
import { Button } from "@/components/ui/button";
import { RunWorkflow } from "@/lib/actions/workflow.action";
import { useMutation } from "@tanstack/react-query";
import { useReactFlow } from "@xyflow/react";
import { PlayIcon } from "lucide-react";
import React from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

function ExecuteBtn({ workflowId }: { workflowId: string }) {
  const generateExecutionPlan = useExecutionPlan();
  const { toObject } = useReactFlow();
  const router = useRouter();
  const mutation = useMutation({
    mutationFn: RunWorkflow,
    onSuccess: (data) => {
      toast.success("Execution Started", { id: "flow-execution" });
      router.push(`/workflow/runs/${workflowId}/${data.executionId}`);
    },
    onError: (error) => {
      console.log(error);
      toast.error("Something went wrong", { id: "flow-execution" });
    },
  });
  return (
    <Button
      variant="outline"
      className="flex items-center gap-2"
      disabled={mutation.isPending}
      onClick={() => {
        const plan = generateExecutionPlan();
        if (!plan) {
          // Client Side Validation
          return;
        }
        mutation.mutate({
          workflowId: workflowId,
          flowDefinition: JSON.stringify(toObject()),
        });
      }}
    >
      <PlayIcon size={16} className="stroke-orange-400" />
      Execute
    </Button>
  );
}

export default ExecuteBtn;
