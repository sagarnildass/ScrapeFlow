import { Node } from "@xyflow/react";
import { TaskType } from "./task";
export interface AppNodeData {
    type: TaskType;
    inputs: Record<string, string>;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    [key: string]: any;
}

export interface AppNode extends Node {
    data: AppNodeData;
}

