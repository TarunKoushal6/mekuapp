import { Sheet, SheetContent } from "@/components/ui/sheet";
import { useNavigate } from "react-router-dom";
import { IconCompose, IconShield, IconActivity, IconRequest } from "./MekuIcon";
import { haptic } from "@/lib/haptics";

interface Props {
  open: boolean;
  onOpenChange: (o: boolean) => void;
}

type Option = {
  key: string;
  label: string;
  description: string;
  icon: (p: any) => JSX.Element;
  to: string;
  soon?: boolean;
};

const options: Option[] = [
  { key: "post", label: "Post", description: "Share what's happening", icon: IconCompose, to: "/create" },
  { key: "anon", label: "Anonymous Post", description: "Post without your handle", icon: IconShield, to: "/create?anon=1" },
  { key: "article", label: "Article", description: "Long-form writing", icon: IconActivity, to: "/create?type=article", soon: true },
  { key: "poll", label: "Poll", description: "Ask your followers", icon: IconRequest, to: "/create?type=poll", soon: true },
];

export const ComposerSheet = ({ open, onOpenChange }: Props) => {
  const navigate = useNavigate();
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="bottom"
        className="rounded-t-[var(--r4)] border-t border-border bg-background p-0"
        style={{ boxShadow: "0 -24px 60px -24px hsl(var(--primary) / 0.28), var(--shadow-3)" }}
      >
        <div className="mx-auto mt-2 h-[5px] w-10 rounded-full bg-muted-foreground/25" />
        <div className="px-3 pb-6 pt-3" style={{ paddingBottom: "max(env(safe-area-inset-bottom), 16px)" }}>
          <h2 className="mb-1 px-2 text-[12px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">Create</h2>
          <ul className="flex flex-col">
            {options.map((o) => (
              <li key={o.key}>
                <button
                  onClick={() => {
                    haptic("selection");
                    if (o.soon) return;
                    onOpenChange(false);
                    navigate(o.to);
                  }}
                  disabled={o.soon}
                  className="tap flex w-full items-center gap-4 rounded-[var(--r3)] px-2 py-3 text-left transition-[background-color,transform] duration-[160ms] ease-[cubic-bezier(0.23,1,0.32,1)] hover:bg-foreground/[0.04] active:scale-[0.985] disabled:opacity-60"
                >
                  <span className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <o.icon size={22} strokeWidth={2} />
                  </span>
                  <span className="flex-1">
                    <span className="flex items-center gap-2">
                      <span className="text-[16px] font-bold text-foreground">{o.label}</span>
                      {o.soon && (
                        <span className="rounded-full bg-foreground/[0.06] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                          Soon
                        </span>
                      )}
                    </span>
                    <span className="block text-[13px] text-muted-foreground">{o.description}</span>
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      </SheetContent>
    </Sheet>
  );
};
