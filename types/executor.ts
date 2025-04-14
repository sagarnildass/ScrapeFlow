import { Browser } from "puppeteer";

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
