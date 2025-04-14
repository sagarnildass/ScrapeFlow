import "server-only";

import { prisma } from "../prisma";
import {
  WorkflowExecutionStatus,
  ExecutionPhaseStatus,
} from "@/types/workflow";
import { ExecutionPhase } from "../generated/prisma";
import { AppNode } from "@/types/appNode";
import { TaskRegistry } from "./task/registry";
import { ExecutorRegistry } from "./executor/registry";
import { Environment, ExecutionEnvironment } from "@/types/executor";
import { TaskParamType } from "@/types/task";
import { Browser, Page } from "puppeteer";

export async function ExecuteWorkflow(executionId: string) {
  const execution = await prisma.workflowExecution.findUnique({
    where: {
      id: executionId,
    },
    include: {
      workflow: true,
      phases: true,
    },
  });

  if (!execution) {
    throw new Error("Execution not found");
  }

  // TODO: Setup execution environment
  const environment: Environment = { phases: {} };

  // TODO: Initialize workflow execution
  await initializeWorkflowExecution(executionId, execution.workflowId);

  // TODO: Initialize phases status
  await initializePhaseStatuses(execution);

  const creditsConsumed = 0;
  let executionFailed = false;

  for (const phase of execution.phases) {
    // TODO: Consume credits
    // TODO: Execute phase
    const phaseExecution = executeWorkflowPhase(phase, environment);

    if (!(await phaseExecution).success) {
      executionFailed = true;
      break;
    }
  }

  // TODO: Finalize execution
  await finalizeWorkflowExecution(
    executionId,
    execution.workflowId,
    executionFailed,
    creditsConsumed
  );

  // TODO: Cleanup execution environment
  await cleanupEnvironment(environment);

  // revalidatePath("/workflow/runs");
}

async function initializeWorkflowExecution(
  executionId: string,
  workflowId: string
) {
  await prisma.workflowExecution.update({
    where: {
      id: executionId,
    },
    data: {
      startedAt: new Date(),
      status: WorkflowExecutionStatus.RUNNING,
    },
  });

  await prisma.workflow.update({
    where: {
      id: workflowId,
    },
    data: {
      lastRunAt: new Date(),
      lastRunStatus: WorkflowExecutionStatus.RUNNING,
      lastRunId: executionId,
    },
  });
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function initializePhaseStatuses(execution: any) {
  await prisma.executionPhase.updateMany({
    where: {
      id: {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        in: execution.phases.map((phase: any) => phase.id),
      },
    },
    data: {
      status: ExecutionPhaseStatus.PENDING,
    },
  });
}

async function finalizeWorkflowExecution(
  executionId: string,
  workflowId: string,
  executionFailed: boolean,
  creditsConsumed: number
) {
  const finalStatus = executionFailed
    ? WorkflowExecutionStatus.FAILED
    : WorkflowExecutionStatus.COMPLETED;

  await prisma.workflowExecution.update({
    where: {
      id: executionId,
    },
    data: {
      status: finalStatus,
      completedAt: new Date(),
      creditsConsumed,
    },
  });

  await prisma.workflow
    .update({
      where: {
        id: workflowId,
        lastRunId: executionId,
      },
      data: {
        lastRunStatus: finalStatus,
      },
    })
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    .catch((err) => {
      // ignore
      // this means that we have triggered other runs for this workflow
      // while an execution was running
    });
}

async function executeWorkflowPhase(
  phase: ExecutionPhase,
  environment: Environment
) {
  const startedAt = new Date();
  const node = JSON.parse(phase.node) as AppNode;
  setupEnvironmentForPhase(node, environment);

  // Update Phase Status
  await prisma.executionPhase.update({
    where: {
      id: phase.id,
    },
    data: {
      status: ExecutionPhaseStatus.RUNNING,
      startedAt,
      inputs: JSON.stringify(environment.phases[node.id].inputs),
    },
  });

  const creditsRequired = TaskRegistry[node.data.type].credits;

  console.log(
    `Executing phase ${phase.name} with ${creditsRequired} credits required`
  );

  // TODO: Decrement user balance (with required credits)

  const success = await executePhase(phase, node, environment);

  const outputs = environment.phases[node.id].outputs;

  await finalizePhase(phase.id, success, outputs);

  return { success };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function finalizePhase(phaseId: string, success: boolean, outputs: any) {
  const finalStatus = success
    ? ExecutionPhaseStatus.COMPLETED
    : ExecutionPhaseStatus.FAILED;

  await prisma.executionPhase.update({
    where: {
      id: phaseId,
    },
    data: {
      status: finalStatus,
      completedAt: new Date(),
      outputs: JSON.stringify(outputs),
    },
  });
}

async function executePhase(
  phase: ExecutionPhase,
  node: AppNode,
  environment: Environment
): Promise<boolean> {
  const runFn = ExecutorRegistry[node.data.type];

  if (!runFn) {
    return false;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const executionEnvironment: ExecutionEnvironment<any> =
    createExecutionEnvironment(node, environment);

  return await runFn(executionEnvironment);
}

function setupEnvironmentForPhase(node: AppNode, environment: Environment) {
  environment.phases[node.id] = {
    inputs: {},
    outputs: {},
  };

  const inputs = TaskRegistry[node.data.type].inputs;

  for (const input of inputs) {
    if (input.type === TaskParamType.BROWSER_INSTANCE) continue;
    const inputValue = node.data.inputs[input.name];

    if (inputValue) {
      environment.phases[node.id].inputs[input.name] = inputValue;
      continue;
    }

    // Get input value from outputs of previous phase in the environment
  }
}

function createExecutionEnvironment(
  node: AppNode,
  environment: Environment
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
): ExecutionEnvironment<any> {
  return {
    getInput: (name: string) => environment.phases[node.id]?.inputs[name],
    setOutput: (name: string, value: string) => {
      environment.phases[node.id].outputs[name] = value;
    },
    getBrowser: () => environment.browser,
    setBrowser: (browser: Browser) => {
      environment.browser = browser;
    },

    getPage: () => environment.page,
    setPage: (page: Page) => {
      environment.page = page;
    },
  };
}

async function cleanupEnvironment(environment: Environment) {
  if (environment.browser) {
    await environment.browser
      .close()
      .catch((err) => console.error("cannot close browser, reason:", err));
  }
}
