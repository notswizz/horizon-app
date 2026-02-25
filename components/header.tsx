"use client";

import { useState, useEffect } from "react";
import { Sun, Moon, LogOut } from "lucide-react";
import { useRouter } from "next/navigation";

export function Header() {
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const router = useRouter();

  useEffect(() => {
    const saved = localStorage.getItem("horizon_theme") as "dark" | "light" | null;
    if (saved) {
      setTheme(saved);
      document.documentElement.setAttribute("data-theme", saved);
    }
  }, []);

  function toggleTheme() {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    localStorage.setItem("horizon_theme", next);
    document.documentElement.setAttribute("data-theme", next);
  }

  async function handleLogout() {
    await fetch("/api/auth", { method: "DELETE" });
    router.push("/login");
    router.refresh();
  }

  return (
    <header className="flex items-center justify-between px-4 md:px-6 py-3 border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-30">
      <h2 className="text-lg font-semibold md:hidden flex items-center gap-2">
        <span className="text-accent">⚡</span> Horizon
      </h2>
      <div className="hidden md:block" />
      <div className="flex items-center gap-2">
        <button
          onClick={toggleTheme}
          className="p-2 rounded-lg hover:bg-card-hover transition-colors text-muted hover:text-foreground"
          aria-label="Toggle theme"
        >
          {theme === "dark" ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </button>
        <button
          onClick={handleLogout}
          className="p-2 rounded-lg hover:bg-card-hover transition-colors text-muted hover:text-foreground"
          aria-label="Log out"
        >
          <LogOut className="w-5 h-5" />
        </button>
      </div>
    </header>
  );
}
