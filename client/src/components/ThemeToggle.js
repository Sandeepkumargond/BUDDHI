"use client";
import { useContext } from "react";
import { ThemeContext } from "@/context/ThemeContext";
import { Button } from "@/components/ui/button";

export default function ThemeToggle() {
  const { theme, toggleTheme } = useContext(ThemeContext);

  return (
    <Button variant="outline" onClick={toggleTheme}>
      {theme === "dark" ? "☀️ Light Mode" : "🌙 Dark Mode"}
    </Button>
  );
}
