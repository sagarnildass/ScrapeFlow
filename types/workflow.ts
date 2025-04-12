import { Workflow as PrismaWorkflow } from "@/lib/generated/prisma";

export enum WorkflowStatus {
    DRAFT = "DRAFT",
    PUBLISHED = "PUBLISHED",
}

export type Workflow = PrismaWorkflow;

