import { useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Copy, Reply, Trash2 } from "lucide-react";
import { haptic } from "@/lib/haptics";
import { toast } from "sonner";
import { motion } from "framer-motion";

export type BubblePos = "single" | "first" | "middle" | "last";

interface Props {
  body: string;
  mine: boolean;
  pos: BubblePos;
  showTime?: string | null;
  onDelete?: () => void;
  onReact?: (emoji: string) => void;
  onReply?: () => void;
}

const REACTIONS = ["❤️", "😂", "👍", "😮", "😢", "🔥"];

const cornerFor = (mine: boolean, pos: BubblePos) => {
  const base = "rounded-2xl";
  if (pos === "single") return base;
  if (mine) {
    if (pos === "first") return `${base} rounded-br-md`;
    if (pos === "middle") return `${base} rounded-r-md`;
    return `${base} rounded-tr-md`;
  }
  if (pos === "first") return `${base} rounded-bl-md`;
  if (pos === "middle") return `${base} rounded-l-md`;
  return `${base} rounded-tl-md`;
};

// Detects a serialized reply header of the form:
//   ↪ @name: "snippet"\n\n{body}
// produced by the composer's reply flow so the bubble can render a
// pretty inset instead of raw text.
const REPLY_RE = /^↪\s+@([^:\n]+):\s+"([\s\S]*?)"\n\n([\s\S]*)$/;
function parseReply(body: string): { quotedName: string; quotedText: string; rest: string } | null {
  const m = body.match(REPLY_RE);
  if (!m) return null;
  return { quotedName: m[1].trim(), quotedText: m[2].trim(), rest: m[3] };
}

export const MessageBubble = ({ body, mine, pos, showTime, onDelete, onReact, onReply }: Props) => {
  const [open, setOpen] = useState(false);
  const timer = useRef<number | null>(null);
  const moved = useRef(false);
  const startY = useRef(0);

  const startPress = (e: React.PointerEvent) => {
    moved.current = false;
    startY.current = e.clientY;
    timer.current = window.setTimeout(() => {
      if (moved.current) return;
      haptic("medium");
      setOpen(true);
    }, 260);
  };
  const trackMove = (e: React.PointerEvent) => {
    if (Math.abs(e.clientY - startY.current) > 8) moved.current = true;
  };
  const cancelPress = () => {
    if (timer.current) { clearTimeout(timer.current); timer.current = null; }
  };

  const reply = parseReply(body);

  return (
    <>
      {showTime && (
        <div className="my-3 text-center text-[11.5px] font-medium text-muted-foreground">{showTime}</div>
      )}
      <div className={cn("flex", mine ? "justify-end" : "justify-start")}>
        <div
          onPointerDown={startPress}
          onPointerMove={trackMove}
          onPointerUp={cancelPress}
          onPointerLeave={cancelPress}
          onPointerCancel={cancelPress}
          onContextMenu={(e) => { e.preventDefault(); haptic("medium"); setOpen(true); }}
          className={cn(
            "max-w-[78%] cursor-pointer whitespace-pre-wrap break-words px-3.5 py-2 text-[15px] leading-[1.35] transition-transform duration-150 ease-out active:scale-[0.96] motion-reduce:active:scale-100",
            mine ? "bg-primary text-primary-foreground" : "bg-surface-2 text-foreground",
            cornerFor(mine, pos),
          )}
        >
          {reply && (
            <div
              className={cn(
                "mb-2 overflow-hidden rounded-lg border-l-[3px] px-2.5 py-1.5 text-[12.5px] leading-tight",
                mine
                  ? "border-primary-foreground/70 bg-primary-foreground/10 text-primary-foreground/85"
                  : "border-primary bg-primary/10 text-foreground/80",
              )}
            >
              <p className={cn("truncate text-[11.5px] font-semibold tracking-[-0.005em]", mine ? "text-primary-foreground" : "text-primary")}>
                Replying to @{reply.quotedName}
              </p>
              <p className="mt-0.5 line-clamp-2 opacity-90">{reply.quotedText}</p>
            </div>
          )}
          {reply ? reply.rest : body}
        </div>
      </div>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent
          side="bottom"
          className="rounded-t-3xl border-border bg-background/90 p-0 backdrop-blur-2xl"
        >
          <div className="mx-auto mt-2 h-1 w-10 rounded-full bg-muted" />
          <div className="flex justify-around px-4 py-4">
            {REACTIONS.map((e, i) => (
              <motion.button
                key={e}
                initial={{ opacity: 0, y: 14, scale: 0.6 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{
                  delay: 0.02 * i,
                  type: "spring",
                  stiffness: 520,
                  damping: 22,
                  mass: 0.6,
                }}
                whileHover={{ scale: 1.22, y: -3 }}
                whileTap={{ scale: 0.88 }}
                onClick={() => { onReact?.(e); haptic("light"); setOpen(false); }}
                className="tap flex h-12 w-12 items-center justify-center rounded-full text-[24px]"
              >
                {e}
              </motion.button>
            ))}
          </div>
          <div className="hairline-t">
            <button
              onClick={() => { navigator.clipboard?.writeText(reply ? reply.rest : body); toast.success("Copied"); setOpen(false); }}
              className="tap flex w-full items-center gap-3 px-5 py-3.5 text-left text-[15px] text-foreground hover:bg-surface/40"
            >
              <Copy size={18} /> Copy
            </button>
            <button
              onClick={() => { onReply?.(); setOpen(false); }}
              className="tap flex w-full items-center gap-3 px-5 py-3.5 text-left text-[15px] text-foreground hover:bg-surface/40"
            >
              <Reply size={18} /> Reply
            </button>
            {mine && onDelete && (
              <button
                onClick={() => { onDelete(); setOpen(false); }}
                className="tap flex w-full items-center gap-3 px-5 py-3.5 text-left text-[15px] text-destructive hover:bg-surface/40"
              >
                <Trash2 size={18} /> Delete
              </button>
            )}
          </div>
          <div style={{ paddingBottom: "max(env(safe-area-inset-bottom), 12px)" }} />
        </SheetContent>
      </Sheet>
    </>
  );
};
