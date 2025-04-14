"use client";

import { Button } from "@/components/ui/button";
import { UnpublishWorkflow } from "@/lib/actions/workflow.action";
import { useMutation } from "@tanstack/react-query";
import { DownloadIcon } from "lucide-react";
import React from "react";
import { toast } from "sonner";

function UnpublishBtn({ workflowId }: { workflowId: string }) {

  const mutation = useMutation({
    mutationFn: UnpublishWorkflow,
    onSuccess: () => {
      toast.success("Workflow unpublished", { id: workflowId });
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
        toast.loading("Unpublishing Workflow...", { id: workflowId });
        mutation.mutate({
          workflowId: workflowId,
        });
      }}
    >
      <DownloadIcon size={16} className="stroke-orange-500" />
      Unpublish
    </Button>
  );
}

export default UnpublishBtn;
