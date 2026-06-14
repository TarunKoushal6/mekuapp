import { AppShell } from "@/components/meku/AppShell";
import { useNavigate } from "react-router-dom";
import { IconBack } from "@/components/meku/MekuIcon";

const Appearance = () => {
  const navigate = useNavigate();

  return (
    <AppShell hideNav>
      <header className="sticky top-0 z-30 flex h-[56px] items-center bg-background/90 px-3 backdrop-blur-xl">
        <button onClick={() => navigate(-1)} aria-label="Back" className="tap inline-flex h-10 w-10 items-center justify-center rounded-full">
          <IconBack size={22} />
        </button>
        <h1 className="text-[16px] font-bold">Appearance</h1>
      </header>

      <section className="px-5 pt-4">
        <p className="t-eyebrow text-muted-foreground">Theme</p>
        <div className="mt-3 rounded-[20px] border border-border bg-surface p-4">
          <p className="text-[15px] font-semibold text-foreground">Light</p>
          <p className="mt-1 text-[13px] text-muted-foreground">
            MEKU is designed in a single, premium light theme. More options will arrive later.
          </p>
          <div className="mt-4 h-[100px] rounded-[12px] bg-white ring-1 ring-black/5">
            <div className="m-4 h-[12px] w-[40%] rounded-full bg-[hsl(252_95%_60%)]" />
            <div className="mx-4 h-[8px] w-[60%] rounded-full bg-black/15" />
          </div>
        </div>
      </section>
    </AppShell>
  );
};

export default Appearance;
