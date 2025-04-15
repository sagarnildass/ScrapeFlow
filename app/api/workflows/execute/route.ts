import { prisma } from "@/lib/prisma";
import {
  WorkflowExecutionPlan,
  WorkflowExecutionStatus,
  WorkflowExecutionTrigger,
} from "@/types/workflow";
import { timingSafeEqual } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { TaskRegistry } from "@/lib/workflow/task/registry";
import { ExecutionPhaseStatus } from "@/types/workflow";
import { ExecuteWorkflow } from "@/lib/workflow/executeWorkflow";
import { CronExpressionParser } from "cron-parser";

function isValidSecret(secret: string) {
  const API_SECRET = process.env.API_SECRET;

  if (!API_SECRET) return false;

  try {
    return timingSafeEqual(Buffer.from(API_SECRET), Buffer.from(secret));
  } catch (error) {
    console.error("Error validating secret", error);
    return false;
  }
}

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("Authorization");

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const secret = authHeader.split(" ")[1];

  if (!isValidSecret(secret)) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const workflowId = searchParams.get("workflowId") as string;

  if (!workflowId) {
    return new NextResponse("bad request", { status: 400 });
  }

  const workflow = await prisma.workflow.findUnique({
    where: {
      id: workflowId,
    },
  });

  if (!workflow) {
    return new NextResponse("bad request", { status: 404 });
  }

  const executionPlan = JSON.parse(
    workflow.executionPlan!
  ) as WorkflowExecutionPlan;

  if (!executionPlan) {
    return new NextResponse("bad request", { status: 404 });
  }

  try {
    const cron = CronExpressionParser.parse(workflow.cron!, {
      tz: "UTC",
      currentDate: new Date(),
    });
    const nextRun = cron.next().toDate();

    const execution = await prisma.workflowExecution.create({
      data: {
        workflowId,
        userId: workflow.userId,
        definition: workflow.definition,
        status: WorkflowExecutionStatus.PENDING,
        startedAt: new Date(),
        trigger: WorkflowExecutionTrigger.CRON,
        phases: {
          create: executionPlan.flatMap((phase) => {
            return phase.nodes.flatMap((node) => {
              return {
                userId: workflow.userId,
                status: ExecutionPhaseStatus.CREATED,
                number: phase.phase,
                node: JSON.stringify(node),
                name: TaskRegistry[node.data.type].label,
              };
            });
          }),
        },
      },
    });

    await ExecuteWorkflow(execution.id, nextRun);

    return new NextResponse(null, { status: 200 });
  } catch (error) {
    console.error("Error parsing cron expression", error);
    return new NextResponse("internal server error", { status: 500 });
  }
}
