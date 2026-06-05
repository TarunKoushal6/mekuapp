import { Heart, MessageCircle, Bookmark, Share } from "lucide-react";
import { Avatar } from "./Avatar";

export interface FeedItem {
  id: string;
  author: { name: string; handle: string };
  time: string;
  title?: string;
  body: string;
  image?: string;
  tag?: string;
  likes: number;
  comments: number;
}

interface FeedCardProps {
  item: FeedItem;
  variant?: "default" | "editorial";
}

export const FeedCard = ({ item, variant = "default" }: FeedCardProps) => {
  return (
    <article className="px-5 py-6 border-b hairline meku-fade-in">
      <header className="flex items-center gap-3">
        <Avatar name={item.author.name} size="md" />
        <div className="min-w-0 flex-1">
          <div className="flex items-baseline gap-2">
            <p className="truncate text-sm font-medium text-foreground">{item.author.name}</p>
            <span className="truncate text-xs text-muted-foreground">@{item.author.handle}</span>
          </div>
          <p className="text-[11px] uppercase tracking-wider text-muted-foreground">{item.time}</p>
        </div>
        {item.tag && (
          <span className="rounded-full border hairline px-2.5 py-1 text-[10px] uppercase tracking-wider text-muted-foreground">
            {item.tag}
          </span>
        )}
      </header>

      <div className="mt-5">
        {item.title && (
          <h2
            className={
              variant === "editorial"
                ? "font-serif-display text-[28px] leading-[1.1] tracking-tightish text-foreground"
                : "text-lg font-semibold leading-snug tracking-tightish text-foreground"
            }
          >
            {item.title}
          </h2>
        )}
        <p className="mt-3 text-[15px] leading-relaxed text-foreground/85">{item.body}</p>
        {item.image && (
          <div className="mt-5 overflow-hidden rounded-md border hairline bg-surface-muted">
            <img src={item.image} alt="" className="aspect-[4/3] w-full object-cover" />
          </div>
        )}
      </div>

      <footer className="mt-5 flex items-center gap-6 text-muted-foreground">
        <button className="meku-tap flex items-center gap-2 text-xs">
          <Heart className="h-[18px] w-[18px]" strokeWidth={1.5} />
          <span>{item.likes}</span>
        </button>
        <button className="meku-tap flex items-center gap-2 text-xs">
          <MessageCircle className="h-[18px] w-[18px]" strokeWidth={1.5} />
          <span>{item.comments}</span>
        </button>
        <button className="meku-tap ml-auto flex items-center gap-2 text-xs">
          <Bookmark className="h-[18px] w-[18px]" strokeWidth={1.5} />
        </button>
        <button className="meku-tap flex items-center gap-2 text-xs">
          <Share className="h-[18px] w-[18px]" strokeWidth={1.5} />
        </button>
      </footer>
    </article>
  );
};
