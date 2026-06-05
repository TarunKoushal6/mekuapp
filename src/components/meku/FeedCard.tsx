import { Heart, MessageCircle, Send, Bookmark, MoreHorizontal, BadgeCheck } from "lucide-react";
import { Avatar } from "./Avatar";

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
  variant?: "default" | "editorial";
}

/**
 * Feed card — content-first, hairline-separated.
 * Header: avatar · name · @handle · time · …
 * Footer: like, comment, share, bookmark with inline counts.
 */
export const FeedCard = ({ item }: FeedCardProps) => {
  return (
    <article className="hairline-b fade-in px-4 py-4">
      {/* Meta row */}
      <header className="flex items-center gap-3">
        <Avatar name={item.author.name} size="md" />
        <div className="flex min-w-0 flex-1 items-center gap-1.5">
          <p className="truncate t-body font-semibold text-foreground">{item.author.name}</p>
          {item.author.verified && (
            <BadgeCheck className="h-[14px] w-[14px] fill-primary text-background" strokeWidth={2.2} />
          )}
          <span className="t-caption text-muted-foreground">@{item.author.handle}</span>
          <span className="t-caption text-muted-foreground">·</span>
          <span className="t-caption text-muted-foreground">{item.time}</span>
        </div>
        <button aria-label="More" className="tap -mr-2 inline-flex h-8 w-8 items-center justify-center text-muted-foreground">
          <MoreHorizontal className="h-[18px] w-[18px]" strokeWidth={1.6} />
        </button>
      </header>

      {/* Body */}
      <div className="ml-[52px] mt-2">
        {item.title && (
          <h2 className="text-[17px] font-semibold leading-[1.32] tracking-[-0.012em] text-foreground">
            {item.title}
          </h2>
        )}
        {item.body && (
          <p className={(item.title ? "mt-1.5 " : "") + "text-[15px] leading-[1.55] text-foreground/85"}>
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

        {/* Action row */}
        <div className="mt-3 flex items-center justify-between pr-1 text-muted-foreground">
          <button className="tap inline-flex items-center gap-1.5" aria-label="Like">
            <Heart className="h-[18px] w-[18px]" strokeWidth={1.6} />
            <span className="t-caption tabular-nums">{item.likes}</span>
          </button>
          <button className="tap inline-flex items-center gap-1.5" aria-label="Comment">
            <MessageCircle className="h-[18px] w-[18px]" strokeWidth={1.6} />
            <span className="t-caption tabular-nums">{item.comments}</span>
          </button>
          <button className="tap inline-flex items-center gap-1.5" aria-label="Share">
            <Send className="h-[17px] w-[17px]" strokeWidth={1.6} />
            {item.shares !== undefined && <span className="t-caption tabular-nums">{item.shares}</span>}
          </button>
          <button className="tap" aria-label="Save">
            <Bookmark className="h-[18px] w-[18px]" strokeWidth={1.6} />
          </button>
        </div>
      </div>
    </article>
  );
};
