"use client";

import useExecutionPlan from "@/components/hooks/useExecutionPlan";
import { Button } from "@/components/ui/button";
import { PublishWorkflow } from "@/lib/actions/workflow.action";
import { useMutation } from "@tanstack/react-query";
import { useReactFlow } from "@xyflow/react";
import { UploadIcon } from "lucide-react";
import React from "react";
import { toast } from "sonner";

function PublishBtn({ workflowId }: { workflowId: string }) {
  const generateExecutionPlan = useExecutionPlan();
  const { toObject } = useReactFlow();

  const mutation = useMutation({
    mutationFn: PublishWorkflow,
    onSuccess: () => {
      toast.success("Workflow Published", { id: workflowId });
    },
    onError: (error) => {
      console.log(error);
      toast.error("Something went wrong", { id: workflowId });
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
        toast.loading("Publishing Workflow...", { id: workflowId });
        mutation.mutate({
          workflowId: workflowId,
          flowDefinition: JSON.stringify(toObject()),
        });
      }}
    >
      <UploadIcon size={16} className="stroke-green-400" />
      Publish
    </Button>
  );
}

export default PublishBtn;
