"use client";

import * as React from "react";
import { Moon, Sun, Monitor } from "lucide-react";
import { useTheme } from "next-themes";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="w-9 h-9" />;
  }

  return (
    <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg">
      <button
        onClick={() => setTheme("light")}
        className={`p-1.5 rounded-md transition-colors ${
          theme === "light" ? "bg-white text-amber-500 shadow-sm" : "text-gray-500 hover:text-gray-700"
        }`}
        title="Light Mode"
      >
        <Sun className="w-4 h-4" />
      </button>
      <button
        onClick={() => setTheme("dark")}
        className={`p-1.5 rounded-md transition-colors ${
          theme === "dark" ? "bg-gray-700 text-blue-400 shadow-sm" : "text-gray-500 hover:text-gray-300"
        }`}
        title="Dark Mode"
      >
        <Moon className="w-4 h-4" />
      </button>
      <button
        onClick={() => setTheme("system")}
        className={`p-1.5 rounded-md transition-colors ${
          theme === "system" ? "bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 shadow-sm" : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
        }`}
        title="System Default"
      >
        <Monitor className="w-4 h-4" />
      </button>
    </div>
  );
}
