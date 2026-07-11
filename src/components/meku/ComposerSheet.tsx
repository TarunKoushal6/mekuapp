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
        className="rounded-t-[28px] border-border bg-background p-0 shadow-[0_-20px_60px_-20px_hsl(252_95%_40%/0.25)]"
      >
        <div className="mx-auto mt-2 h-1 w-10 rounded-full bg-muted-foreground/30" />
        <div className="px-4 pb-6 pt-4">
          <h2 className="mb-2 px-1 text-[15px] font-bold text-foreground">Create</h2>
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
                  className="tap flex w-full items-center gap-4 rounded-2xl px-3 py-3 text-left hover:bg-surface-2 active:scale-[0.99]"
                >
                  <span className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-surface-2 text-primary">
                    <o.icon size={22} strokeWidth={2} />
                  </span>
                  <span className="flex-1">
                    <span className="flex items-center gap-2">
                      <span className="text-[16px] font-bold text-foreground">{o.label}</span>
                      {o.soon && (
                        <span className="rounded-full bg-surface-2 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
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
