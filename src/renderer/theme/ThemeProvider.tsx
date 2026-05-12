import { createContext, type ReactNode, useContext, useEffect, useMemo, useState } from "react";
import type { ThemeMode } from "@shared/contracts/domain";

interface ThemeContextValue {
  theme: ThemeMode;
  toggleTheme(): void;
  setTheme(theme: ThemeMode): void;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<ThemeMode>(() => {
    return (localStorage.getItem("bickspec.theme") as ThemeMode | null) ?? "light";
  });

  useEffect(() => {
    const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    document.documentElement.dataset.theme = theme === "system" ? systemTheme : theme;
    localStorage.setItem("bickspec.theme", theme);
  }, [theme]);

  const value = useMemo(
    () => ({
      theme,
      setTheme,
      toggleTheme: () => setTheme((current) => (current === "dark" ? "light" : "dark"))
    }),
    [theme]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) throw new Error("useTheme must be used inside ThemeProvider");
  return context;
}
