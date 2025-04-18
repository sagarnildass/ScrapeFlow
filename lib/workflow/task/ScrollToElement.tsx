import { TaskParamType, TaskType } from "@/types/task";
import { ArrowUp } from "lucide-react";
import { WorkflowTask } from "@/types/workflow";

export const ScrollToElementTask = {
  type: TaskType.SCROLL_TO_ELEMENT,
  label: "Scroll to element",
  icon: (props) => <ArrowUp className="stroke-orange-400" {...props} />,
  isEntryPoint: false,
  credits: 1,
  inputs: [
    {
      name: "Web page",
      type: TaskParamType.BROWSER_INSTANCE,
      required: true,
    },
    {
      name: "Selector",
      type: TaskParamType.STRING,
      required: true,
    },
  ] as const,
  outputs: [
    {
      name: "Web page",
      type: TaskParamType.BROWSER_INSTANCE,
    },
  ] as const,
} satisfies WorkflowTask;
