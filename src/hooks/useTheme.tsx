import { createContext, useContext, useEffect, ReactNode } from "react";

type Theme = "light";
const ThemeCtx = createContext<{ theme: Theme; setTheme: (t: Theme) => void; toggle: () => void }>({
  theme: "light",
  setTheme: () => {},
  toggle: () => {},
});

// MEKU — Light theme.
export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove("dark");
    root.classList.add("light");
    try { localStorage.setItem("meku-theme", "light"); } catch {}
  }, []);

  return (
    <ThemeCtx.Provider value={{ theme: "light", setTheme: () => {}, toggle: () => {} }}>
      {children}
    </ThemeCtx.Provider>
  );
};

export const useTheme = () => useContext(ThemeCtx);
