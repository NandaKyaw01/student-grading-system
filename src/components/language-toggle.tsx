import React from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Languages } from "lucide-react";
import { Button } from "./ui/button";

const LanguageToggle = () => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger as-child>
        <Button variant="ghost">
          <Languages className="w-5 h-5" />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-min">
        <DropdownMenuItem className="cursor-pointer">
          <span className="mr-1">MM</span>
          Myanmar
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default LanguageToggle;
