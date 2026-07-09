import { createContext, useContext, useEffect, ReactNode } from "react";

type Theme = "dark";
const ThemeCtx = createContext<{ theme: Theme; setTheme: (t: Theme) => void; toggle: () => void }>({
  theme: "dark",
  setTheme: () => {},
  toggle: () => {},
});

// MEKU — Midnight Indigo. Dark by product decision.
export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove("light");
    root.classList.add("dark");
    try { localStorage.setItem("meku-theme", "dark"); } catch {}
  }, []);

  return (
    <ThemeCtx.Provider value={{ theme: "dark", setTheme: () => {}, toggle: () => {} }}>
      {children}
    </ThemeCtx.Provider>
  );
};

export const useTheme = () => useContext(ThemeCtx);
