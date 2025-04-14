import { Browser } from "puppeteer";
import { WorkflowTask } from "./workflow";

export type Environment = {
  browser?: Browser;
  // phases with the nodeId / taskId as key
  phases: Record<
    string, // key: nodeId / taskId
    {
      inputs: Record<string, string>;
      outputs: Record<string, string>;
    }
  >;
};

export type ExecutionEnvironment<T extends WorkflowTask> = {
  getInput: (name: T["inputs"][number]["name"]) => string;
};
