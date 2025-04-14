import Topbar from "@/app/workflow/_components/topbar/Topbar";
import { GetWorkflowExecutionWithPhases } from "@/lib/actions/workflow.action";
import { Loader2Icon } from "lucide-react";
import React, { Suspense } from "react";
import ExecutionViewer from "./_components/ExecutionViewer";

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
      <section className="flex h-full overflow-auto">
        <Suspense fallback={
          <div className="flex justify-center items-center w-full">
            <Loader2Icon className="h-10 w-10 animate-spin stroke-primary" />
          </div>
        }>
          <ExecutionViewerWrapper executionId={executionId} />
        </Suspense>
      </section>
    </div>
  );
}

async function ExecutionViewerWrapper({ executionId }: { executionId: string }) {

  const workflowExecution = await GetWorkflowExecutionWithPhases(executionId);

  if (!workflowExecution) {
    return <div>Workflow execution not found</div>;
  }
  return (
    <ExecutionViewer initialData={workflowExecution} />
  )
}

export default ExecutionViewerPage;
