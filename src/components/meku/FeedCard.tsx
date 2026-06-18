import { MessageCircle, Repeat2, Upload, BadgeCheck, Coins } from "lucide-react";
import { Avatar } from "./Avatar";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { toggleLike, toggleRepost, isReposted, getRepostCount, type Post, timeAgo } from "@/lib/social";
import { SendSheet } from "./SendSheet";
import { InlineActionCard, parseInlineAction } from "./InlineActionCard";
import { PostBody } from "./PostBody";
import { HeartLike } from "./HeartLike";
import { BookmarkSave } from "./BookmarkSave";

const BOOKMARK_KEY = "meku.bookmarks.v1";
const readBookmarks = (): Set<string> => {
  try { return new Set(JSON.parse(localStorage.getItem(BOOKMARK_KEY) ?? "[]")); }
  catch { return new Set(); }
};
const writeBookmarks = (s: Set<string>) => {
  try { localStorage.setItem(BOOKMARK_KEY, JSON.stringify([...s])); } catch {}
};

interface FeedCardProps {
  post: Post;
  onChanged?: () => void;
}

export const FeedCard = ({ post, onChanged }: FeedCardProps) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [liked, setLiked] = useState(post.liked_by_me);
  const [likeCount, setLikeCount] = useState(post.like_count);
  const [tipOpen, setTipOpen] = useState(false);
  const [reposted, setReposted] = useState(false);
  const [repostCount, setRepostCount] = useState(0);
  const [bookmarked, setBookmarked] = useState(() => readBookmarks().has(post.id));
  const author = post.author;
  const name = author?.display_name || author?.username || "Anonymous";
  const handle = author?.username || "anon";

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const [c, mine] = await Promise.all([
        getRepostCount(post.id),
        user ? isReposted(user.id, post.id) : Promise.resolve(false),
      ]);
      if (!cancelled) { setRepostCount(c); setReposted(mine); }
    })();
    return () => { cancelled = true; };
  }, [post.id, user?.id]);

  const handleRepost = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user) { navigate("/auth"); return; }
    const next = !reposted;
    setReposted(next);
    setRepostCount((c) => c + (next ? 1 : -1));
    try {
      await toggleRepost(user.id, post.id, reposted);
    } catch (err: any) {
      setReposted(!next);
      setRepostCount((c) => c + (next ? -1 : 1));
      toast.error(err?.message ?? "Could not repost");
    }
  };

  const handleLike = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user) {
      navigate("/auth");
      return;
    }
    const next = !liked;
    setLiked(next);
    setLikeCount((c) => c + (next ? 1 : -1));
    try {
      await toggleLike(post.id, user.id, liked);
      onChanged?.();
    } catch (err: any) {
      setLiked(!next);
      setLikeCount((c) => c + (next ? -1 : 1));
      toast.error(err.message ?? "Could not update like");
    }
  };

  const handleShare = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const url = `${window.location.origin}/p/${post.id}`;
    try {
      if (navigator.share) await navigator.share({ url, title: post.title || "MEKU post" });
      else {
        await navigator.clipboard.writeText(url);
        toast.success("Link copied");
      }
    } catch {}
  };

  return (
    <article
      onClick={() => navigate(`/p/${post.id}`)}
      className="hairline-b fade-in cursor-pointer px-4 py-4 transition-colors hover:bg-surface/40"
    >
      <header className="flex items-start gap-3">
        <Link to={`/u/${handle}`} onClick={(e) => e.stopPropagation()}>
          <Avatar name={name} src={author?.avatar_url ?? undefined} size="md" />
        </Link>
        <div className="flex min-w-0 flex-1 items-center gap-1.5">
          <p className="truncate text-[15px] font-semibold text-foreground">{name}</p>
          {author?.verified && (
            <BadgeCheck className="h-[14px] w-[14px] shrink-0 fill-primary text-background" strokeWidth={2.2} />
          )}
          <span className="truncate text-[14px] text-muted-foreground">@{handle}</span>
          <span className="text-[14px] text-muted-foreground">·</span>
          <span className="shrink-0 text-[14px] text-muted-foreground">{timeAgo(post.created_at)}</span>
        </div>
        <button aria-label="More" onClick={(e) => e.stopPropagation()} className="tap -mr-2 -mt-1 inline-flex h-8 w-8 items-center justify-center text-muted-foreground">
          <IconMore size={18} />
        </button>
      </header>

      <div className="ml-[52px] mt-1.5">
        {post.title && <h2 className="text-[17px] font-bold leading-[1.3] tracking-[-0.01em] text-foreground">{post.title}</h2>}
        {post.body && (
          <PostBody
            text={post.body}
            className={(post.title ? "mt-1 " : "") + "whitespace-pre-wrap text-[15.5px] leading-[1.4] font-medium tracking-[-0.005em] text-foreground"}
          />
        )}
        {post.image_url && (
          <div className="mt-3 overflow-hidden rounded-[14px] border border-border bg-surface-2">
            <img src={post.image_url} alt="" loading="lazy" className="aspect-[5/4] w-full object-cover" />
          </div>
        )}
        {(() => {
          const action = parseInlineAction([post.title, post.body].filter(Boolean).join(" "));
          return action ? <InlineActionCard action={action} postId={post.id} /> : null;
        })()}

        <div className="mt-3 flex items-center justify-between pr-1 text-muted-foreground">
          <button
            onClick={(e) => { e.stopPropagation(); navigate(`/p/${post.id}`); }}
            className="tap inline-flex items-center gap-1.5"
            aria-label="Comment"
          >
            <MessageCircle className="h-[18px] w-[18px]" strokeWidth={1.6} />
            <span className="text-[13px] tabular-nums">{post.comment_count}</span>
          </button>
          <button
            onClick={handleRepost}
            className={cn("tap inline-flex items-center gap-1.5", reposted && "text-emerald-500")}
            aria-label="Repost"
          >
            <Repeat2 className="h-[18px] w-[18px]" strokeWidth={1.6} />
            {repostCount > 0 && <span className="text-[13px] tabular-nums">{repostCount}</span>}
          </button>
          <div className="inline-flex items-center gap-1.5">
            <HeartLike
              checked={liked}
              onChange={(e) => handleLike(e)}
              size={20}
              aria-label="Like"
            />
            <span className={cn("text-[13px] tabular-nums", liked && "text-[#ff5b89]")}>{likeCount}</span>
          </div>
          <button
            onClick={(e) => { e.stopPropagation(); if (!user) return navigate("/auth"); setTipOpen(true); }}
            className="tap inline-flex items-center gap-1.5 text-primary"
            aria-label="Tip USDC"
          >
            <IconSend size={18} />
          </button>
          <BookmarkSave
            checked={bookmarked}
            onChange={(e) => {
              e.stopPropagation();
              const next = !bookmarked;
              setBookmarked(next);
              const set = readBookmarks();
              if (next) set.add(post.id); else set.delete(post.id);
              writeBookmarks(set);
              toast.success(next ? "Saved" : "Removed");
            }}
            size={18}
            aria-label="Save"
          />
          <button onClick={handleShare} className="tap" aria-label="Share">
            <Upload className="h-[18px] w-[18px]" strokeWidth={1.6} />
          </button>
        </div>
      </div>
      {tipOpen && author && (
        <SendSheet
          open={tipOpen}
          onOpenChange={setTipOpen}
          defaults={{ recipientUserId: post.user_id, postId: post.id, kind: "tip", amount: "1" }}
          recipientLabel={`@${handle}`}
          title="Tip USDC"
        />
      )}
    </article>
  );
};
