import Logo from "@/components/Logo";
import { ModeToggle } from "@/components/ThemeModeToggle";
import { Separator } from "@/components/ui/separator";
import React from "react";

function layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col w-full h-screen">
      {children}
      <Separator />
      <footer className="flex items-center justify-between p-2">
        <div className="pl-18">
          <Logo iconSize={16} fontSize="text-xl" />
        </div>
        <ModeToggle />
      </footer>
    </div>
  );
}

export default layout;
