import Topbar from "@/app/workflow/_components/topbar/Topbar";
import React from "react";

async function ExecutionViewerPage({
  params,
}: {
  params: { workflowId: string; executionId: string };
}) {
  const { workflowId, executionId } = await params;
  return (
    <div className="flex flex-col h-screen w-full overflow-hidden">
      <Topbar
        title="Workflow run details"
        workflowId={workflowId}
        subtitle={`Run ID: ${executionId}`}
        hideButtons={true}
      />
    </div>
  );
}

export default ExecutionViewerPage;
