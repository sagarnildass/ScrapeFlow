"use client";

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function NavigationTabs({ workflowId }: { workflowId: string }) {
  const pathname = usePathname();
  const activeValue = pathname?.split("/")[2];
  return (
    <Tabs value={activeValue} className="w-[400px]">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger
          value="editor"
          asChild
          className="w-full data-[state=inactive]:text-muted-foreground data-[state=inactive]:hover:text-foreground/80"
        >
          <Link href={`/workflow/editor/${workflowId}`}>Editor</Link>
        </TabsTrigger>
        <TabsTrigger
          value="runs"
          asChild
          className="w-full data-[state=inactive]:text-muted-foreground data-[state=inactive]:hover:text-foreground/80"
        >
          <Link href={`/workflow/runs/${workflowId}`}>Runs</Link>
        </TabsTrigger>
      </TabsList>
    </Tabs>
  );
}
