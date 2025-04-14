import { GetWorkflowExecutions } from "@/lib/actions/workflow.action";
import Topbar from "../../_components/topbar/Topbar";
import { Suspense } from "react";
import { InboxIcon, Loader2Icon } from "lucide-react";
import ExecutionsTable from "./_components/ExecutionsTable";

export default async function ExecutionsPage({
  params,
}: {
  params: { workflowId: string };
}) {
  const { workflowId } = await params;
  return (
    <div className="h-full w-full overflow-auto">
      <Topbar
        title="All Runs"
        subtitle="List of all runs for this workflow"
        workflowId={workflowId}
        hideButtons
      />
      <Suspense
        fallback={
          <div className="flex justify-center items-center w-full h-full">
            <Loader2Icon size={30} className="animate-spin stroke-primary" />
          </div>
        }
      >
        <ExecutionsTableWrapper workflowId={workflowId} />
      </Suspense>
    </div>
  );
}

async function ExecutionsTableWrapper({ workflowId }: { workflowId: string }) {
  const executions = await GetWorkflowExecutions(workflowId);

  if (!executions) {
    return <div>No runs found</div>;
  }

  if (executions.length === 0) {
    return (
      <div className="container w-full py-6">
        <div className="flex flex-col items-center justify-center gap-2 h-full w-full">
          <div className="rounded-full bg-accent h-20 w-20 flex items-center justify-center">
            <InboxIcon size={40} className="stroke-primary" />
          </div>
          <div className="flex flex-col gap-1 text-center">
            <p className="font-bold">
              No runs have been triggered yet for this workflow
            </p>
            <p className="text-sm text-muted-foreground">
              You can trigger a new run in the Editor page
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-5xl py-6 w-full">
      <ExecutionsTable workflowId={workflowId} initialData={executions} />
    </div>
  );
}
