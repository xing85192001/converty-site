"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { T } from "@/components/ui/t";
import { cn } from "@/lib/utils";

export function ThemeToggle() {
  const { setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const isDark = mounted && resolvedTheme === "dark";

  return (
    <Button
      variant="ghost"
      size="icon"
      type="button"
      className="h-9 w-9 rounded-xl border border-border text-muted-foreground transition hover:border-primary hover:text-primary"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      aria-label="toggle theme"
    >
      <Sun
        className={cn(
          "h-[18px] w-[18px] transition-all",
          isDark ? "rotate-90 scale-0" : "rotate-0 scale-100"
        )}
      />
      <Moon
        className={cn(
          "absolute h-[18px] w-[18px] transition-all",
          isDark ? "rotate-0 scale-100" : "-rotate-90 scale-0"
        )}
      />
      <span className="sr-only">
        <T k="ui.toggle-theme" />
      </span>
    </Button>
  );
}
