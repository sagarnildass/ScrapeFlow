import React from "react";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import Editor from "../../_components/Editor";

async function page({ params }: { params: { workflowId: string } }) {
  const { workflowId } = await params;
  const { userId } = await auth();

  if (!userId) return <div>Unauthorized</div>;

  const workflow = await prisma.workflow.findUnique({
    where: {
      id: workflowId,
      userId,
    },
  });

  if (!workflow) return <div>Workflow not found</div>;

  return (
    <Editor workflow={workflow} />
  );
}

export default page;
