"use client";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

export default function ThemeToggle() {
    const { theme, setTheme } = useTheme();
    const isDark = theme === "dark";
    return (
        <button
            aria-label="Toggle theme"
            onClick={() => setTheme(isDark ? "light" : "dark")}
            className="inline-flex h-9 w-9 items-center justify-center rounded-full border hover:bg-black/5 dark:hover:bg-white/10"
        >
            {isDark ? <Sun size={18}/> : <Moon size={18}/>}
        </button>
    );
}
