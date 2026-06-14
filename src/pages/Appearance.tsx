import { AppShell } from "@/components/meku/AppShell";
import { ChevronLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "@/hooks/useTheme";
import { Switch } from "@/components/ui/switch";

const Appearance = () => {
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();

  return (
    <AppShell hideNav>
      <header className="sticky top-0 z-30 flex h-[56px] items-center bg-background/90 px-3 backdrop-blur-xl">
        <button onClick={() => navigate(-1)} aria-label="Back" className="tap inline-flex h-10 w-10 items-center justify-center rounded-full">
          <ChevronLeft className="h-[22px] w-[22px]" strokeWidth={1.7} />
        </button>
        <h1 className="text-[16px] font-bold">Appearance</h1>
      </header>

      <section className="px-5 pt-4">
        <p className="t-eyebrow text-muted-foreground">Theme</p>
        <div className="mt-3 rounded-[20px] border border-border bg-surface">
          <div className="flex items-center justify-between p-4 hairline-b">
            <div>
              <p className="text-[15px] font-semibold text-foreground">Dark mode</p>
              <p className="text-[13px] text-muted-foreground">Deep black with purple accents.</p>
            </div>
            <Switch checked={theme === "dark"} onCheckedChange={(c) => setTheme(c ? "dark" : "light")} />
          </div>
          <div className="grid grid-cols-2 gap-3 p-4">
            <button
              onClick={() => setTheme("dark")}
              className={`tap rounded-[16px] border p-3 text-left ${theme === "dark" ? "border-primary" : "border-border"}`}
            >
              <div className="h-[80px] rounded-[10px] bg-[hsl(240_10%_4%)] ring-1 ring-white/5">
                <div className="m-3 h-[12px] w-[40%] rounded-full bg-[hsl(252_95%_72%)]" />
                <div className="mx-3 h-[8px] w-[60%] rounded-full bg-white/20" />
              </div>
              <p className="mt-2 text-[13px] font-semibold text-foreground">Dark</p>
            </button>
            <button
              onClick={() => setTheme("light")}
              className={`tap rounded-[16px] border p-3 text-left ${theme === "light" ? "border-primary" : "border-border"}`}
            >
              <div className="h-[80px] rounded-[10px] bg-white ring-1 ring-black/5">
                <div className="m-3 h-[12px] w-[40%] rounded-full bg-[hsl(252_95%_60%)]" />
                <div className="mx-3 h-[8px] w-[60%] rounded-full bg-black/15" />
              </div>
              <p className="mt-2 text-[13px] font-semibold text-foreground">Light</p>
            </button>
          </div>
        </div>
      </section>
    </AppShell>
  );
};

export default Appearance;
