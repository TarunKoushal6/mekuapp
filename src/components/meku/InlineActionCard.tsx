// Inline action card surfaced when a post / comment body contains
//   "@handle send 5 usdc"
// (also "request" or "tip" variants). One-tap to open the SendSheet.
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { SendSheet } from "./SendSheet";
import { IconSend, IconRequest } from "./MekuIcon";

const PATTERN = /@(\w{1,32})\s+(send|tip|request|pay)\s+([\d.]+)\s*(usdc|usd)?/i;

export interface InlineAction {
  handle: string;
  verb: "send" | "tip" | "request" | "pay";
  amount: string;
}

export function parseInlineAction(text: string | null | undefined): InlineAction | null {
  if (!text) return null;
  const m = text.match(PATTERN);
  if (!m) return null;
  const verb = m[2].toLowerCase() as InlineAction["verb"];
  return { handle: m[1].toLowerCase(), verb, amount: m[3] };
}

interface Props {
  action: InlineAction;
  postId?: string;
  commentId?: string;
  /** ID of the author who wrote the post/comment containing the tag. Only they see the Send CTA. */
  authorId?: string;
}

export const InlineActionCard = ({ action, postId, commentId, authorId }: Props) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [recipientId, setRecipientId] = useState<string | null>(null);
  const [lookedUp, setLookedUp] = useState(false);
  const [open, setOpen] = useState(false);

  // Only the author of the post/comment can act on their own tag-to-tip card.
  // Everyone else just sees the post text — no exposed transfer button.
  const canAct = !!user && !!authorId && user.id === authorId;
  if (!canAct) return null;


  useEffect(() => {
    supabase
      .from("profiles")
      .select("id")
      .ilike("username", action.handle)
      .maybeSingle()
      .then(({ data }) => {
        setRecipientId((data as any)?.id ?? null);
        setLookedUp(true);
      });
  }, [action.handle]);

  const isRequest = action.verb === "request";
  const Icon = isRequest ? IconRequest : IconSend;
  const notFound = lookedUp && !recipientId;
  const cta = notFound ? "Handle not found" : isRequest ? "Pay request" : "Send now";
  const headline = isRequest
    ? `@${action.handle} requested ${action.amount} USDC`
    : `Send ${action.amount} USDC to @${action.handle}`;

  const disabled = useMemo(() => !recipientId, [recipientId]);

  return (
    <div
      className="mt-3 flex items-center gap-3 rounded-[16px] border border-primary/30 bg-primary-soft px-3 py-3"
      onClick={(e) => e.stopPropagation()}
    >
      <span className="inline-flex h-[40px] w-[40px] shrink-0 items-center justify-center rounded-full gradient-purple text-primary-foreground shadow-purple">
        <Icon size={18} />
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-[14px] font-semibold text-foreground">{headline}</p>
        <p className="text-[11.5px] text-muted-foreground">Arc Testnet · USDC</p>
      </div>
      <button
        disabled={disabled}
        onClick={(e) => {
          e.stopPropagation();
          if (!user) return navigate("/auth");
          setOpen(true);
        }}
        className="tap rounded-full bg-foreground px-3.5 py-2 text-[12.5px] font-bold text-background disabled:opacity-40"
      >
        {cta}
      </button>
      {open && recipientId && (
        <SendSheet
          open={open}
          onOpenChange={setOpen}
          recipientLabel={`@${action.handle}`}
          title={isRequest ? "Pay request" : "Send USDC"}
          defaults={{
            recipientUserId: recipientId,
            amount: action.amount,
            postId,
            commentId,
            kind: isRequest ? "send" : action.verb === "tip" ? "tip" : "send",
          }}
        />
      )}
    </div>
  );
};
