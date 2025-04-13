import { Workflow as PrismaWorkflow } from "@/lib/generated/prisma";
import { LucideProps } from "lucide-react";
import { TaskParam, TaskType } from "./task";

export enum WorkflowStatus {
    DRAFT = "DRAFT",
    PUBLISHED = "PUBLISHED",
}

export type Workflow = PrismaWorkflow;

export type WorkflowTask = {
    label: string;
    icon: React.FC<LucideProps>;
    type: TaskType;
    isEntryPoint?: boolean;
    inputs: TaskParam[];
    outputs: TaskParam[];
    credits: number;
}