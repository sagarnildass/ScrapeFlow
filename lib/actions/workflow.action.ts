"use server";

import { auth } from "@clerk/nextjs/server";
import { prisma } from "../prisma";
import {
  createWorkflowSchema,
  createWorkflowSchemaType,
} from "@/schema/workflow";
import { WorkflowStatus } from "@/types/workflow";
import { revalidatePath } from "next/cache";
import { waitFor } from "../helper/waitFor";

export async function GetWorkflowsForUser() {
  const { userId } = await auth();
  if (!userId) {
    throw new Error("User not authenticated");
  }
  return prisma.workflow.findMany({
    where: {
      userId,
    },
    orderBy: {
      createdAt: "desc",
    },
  });
}

export async function CreateWorkflow(form: createWorkflowSchemaType) {
  const { userId } = await auth();
  if (!userId) {
    throw new Error("User not authenticated");
  }

  const { success, data } = createWorkflowSchema.safeParse(form);
  if (!success) {
    throw new Error("Invalid form data");
  }

  const result = await prisma.workflow.create({
    data: {
      userId,
      status: WorkflowStatus.DRAFT,
      definition: "TODO",
      ...data,
    },
  });

  if (!result) {
    throw new Error("Failed to create workflow");
  }

  return result; // Return the result instead of redirecting
}

export async function UpdateWorkflow({
  id,
  definition,
}: {
  id: string;
  definition: string;
}) {
  const { userId } = await auth();
  if (!userId) {
    throw new Error("User not authenticated");
  }

  const workflow = await prisma.workflow.findUnique({
    where: {
      id,
      userId,
    },
  });

  if (!workflow) {
    throw new Error("Workflow not found");
  }

  if (workflow.status !== WorkflowStatus.DRAFT) {
    throw new Error("Workflow is not in draft mode");
  }

  await prisma.workflow.update({
    data: {
      definition,
    },
    where: { id, userId },
  });
}

export async function DeleteWorkflow(workflowId: string) {
  const { userId } = await auth();
  if (!userId) {
    throw new Error("User not authenticated");
  }

  await prisma.workflow.delete({
    where: {
      id: workflowId,
      userId,
    },
  });

  revalidatePath("/workflows");
}
