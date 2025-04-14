"use client";

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Link from "next/link";

export default function NavigationTabs({ workflowId }: { workflowId: string }) {
  return (
    <Tabs className="w-[400px]">
      <TabsList className="grid w-full grid-cols-2">
        <Link href={`/workflow/editor/${workflowId}`}>Editor</Link>
        <Link href={`/workflow/runs/${workflowId}`}>Runs</Link>
      </TabsList>
    </Tabs>
  );
}
