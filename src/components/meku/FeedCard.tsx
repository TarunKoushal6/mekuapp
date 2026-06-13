import { Heart, MessageCircle, Repeat2, Upload, MoreHorizontal, BadgeCheck } from "lucide-react";
import { Avatar } from "./Avatar";
import { useState } from "react";
import { cn } from "@/lib/utils";

export interface FeedItem {
  id: string;
  author: { name: string; handle: string; verified?: boolean };
  time: string;
  title?: string;
  body: string;
  image?: string;
  tag?: string;
  likes: number;
  comments: number;
  shares?: number;
}

interface FeedCardProps {
  item: FeedItem;
}

/**
 * Feed card matched to MEKU reference frames:
 * header — avatar · name @handle · time · …
 * body  — title (optional) + body, then optional image (rounded 14)
 * actions — comment, repost, like, share (counts inline, share has no count)
 */
export const FeedCard = ({ item }: FeedCardProps) => {
  const [liked, setLiked] = useState(false);

  return (
    <article className="hairline-b fade-in px-4 py-4">
      {/* Meta row */}
      <header className="flex items-start gap-3">
        <Avatar name={item.author.name} size="md" />
        <div className="flex min-w-0 flex-1 items-center gap-1.5">
          <p className="truncate text-[15px] font-semibold text-foreground">{item.author.name}</p>
          {item.author.verified && (
            <BadgeCheck className="h-[14px] w-[14px] shrink-0 fill-primary text-background" strokeWidth={2.2} />
          )}
          <span className="truncate text-[14px] text-muted-foreground">@{item.author.handle}</span>
          <span className="text-[14px] text-muted-foreground">·</span>
          <span className="shrink-0 text-[14px] text-muted-foreground">{item.time}</span>
        </div>
        <button
          aria-label="More"
          className="tap -mr-2 -mt-1 inline-flex h-8 w-8 items-center justify-center text-muted-foreground"
        >
          <MoreHorizontal className="h-[18px] w-[18px]" strokeWidth={1.6} />
        </button>
      </header>

      {/* Body */}
      <div className="ml-[52px] mt-1.5">
        {item.title && (
          <h2 className="text-[15.5px] font-semibold leading-[1.4] tracking-[-0.005em] text-foreground">
            {item.title}
          </h2>
        )}
        {item.body && (
          <p className={(item.title ? "mt-1 " : "") + "text-[15px] leading-[1.5] text-foreground/90"}>
            {item.body}
          </p>
        )}

        {item.image && (
          <div className="mt-3 overflow-hidden rounded-[14px] border border-border bg-surface-2">
            <img
              src={item.image}
              alt=""
              loading="lazy"
              className="aspect-[5/4] w-full object-cover"
            />
          </div>
        )}

        {/* Action row — order: comment, repost, like, share */}
        <div className="mt-3 flex items-center justify-between pr-1 text-muted-foreground">
          <button className="tap inline-flex items-center gap-1.5" aria-label="Comment">
            <MessageCircle className="h-[18px] w-[18px]" strokeWidth={1.6} />
            <span className="text-[13px] tabular-nums">{item.comments}</span>
          </button>
          <button className="tap inline-flex items-center gap-1.5" aria-label="Repost">
            <Repeat2 className="h-[18px] w-[18px]" strokeWidth={1.6} />
            {item.shares !== undefined && (
              <span className="text-[13px] tabular-nums">{item.shares}</span>
            )}
          </button>
          <button
            onClick={() => setLiked((v) => !v)}
            className="tap inline-flex items-center gap-1.5"
            aria-label="Like"
          >
            <Heart
              className={cn(
                "h-[18px] w-[18px] transition-colors",
                liked ? "fill-[#ef3b6b] text-[#ef3b6b]" : ""
              )}
              strokeWidth={1.6}
            />
            <span
              className={cn(
                "text-[13px] tabular-nums",
                liked ? "text-[#ef3b6b]" : ""
              )}
            >
              {item.likes + (liked ? 1 : 0)}
            </span>
          </button>
          <button className="tap" aria-label="Share">
            <Upload className="h-[18px] w-[18px]" strokeWidth={1.6} />
          </button>
        </div>
      </div>
    </article>
  );
};
