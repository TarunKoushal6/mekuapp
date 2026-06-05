import { Heart, MessageCircle, Bookmark } from "lucide-react";
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

/**
 * Feed card — content is hero.
 * No card chrome. No badges. Minimal metadata.
 * Read.cv meets Apple Notes.
 */
export const FeedCard = ({ item, variant = "default" }: FeedCardProps) => {
  const isEditorial = variant === "editorial";
  return (
    <article className="hairline-b fade-in px-3 py-4">
      {/* Meta line — one row, dot-separated, ultra quiet */}
      <div className="flex items-center gap-[10px]">
        <Avatar name={item.author.name} size="sm" />
        <p className="t-caption text-foreground">{item.author.name}</p>
        <span className="t-caption text-muted-foreground">·</span>
        <p className="t-caption text-muted-foreground">{item.time}</p>
      </div>

      <div className="mt-[18px]">
        {item.title && (
          <h2
            className={
              isEditorial
                ? "font-serif text-[34px] leading-[1.06] tracking-[-0.02em] text-foreground"
                : "text-[20px] font-medium leading-[1.25] tracking-[-0.015em] text-foreground"
            }
          >
            {item.title}
          </h2>
        )}
        <p
          className={
            (item.title ? "mt-[10px] " : "") +
            "t-body text-foreground/80"
          }
        >
          {item.body}
        </p>

        {item.image && (
          <div className="mt-[18px] overflow-hidden rounded-[12px] bg-surface-2">
            <img
              src={item.image}
              alt=""
              loading="lazy"
              className="aspect-[5/4] w-full object-cover"
            />
          </div>
        )}
      </div>

      {/* Actions — hairline-thin, almost invisible */}
      <div className="mt-[18px] flex items-center gap-6 text-muted-foreground">
        <button className="tap flex items-center gap-2" aria-label="Like">
          <Heart className="h-[17px] w-[17px]" strokeWidth={1.4} />
          <span className="t-caption">{item.likes}</span>
        </button>
        <button className="tap flex items-center gap-2" aria-label="Reply">
          <MessageCircle className="h-[17px] w-[17px]" strokeWidth={1.4} />
          <span className="t-caption">{item.comments}</span>
        </button>
        <button className="tap ml-auto" aria-label="Save">
          <Bookmark className="h-[17px] w-[17px]" strokeWidth={1.4} />
        </button>
      </div>
    </article>
  );
};
