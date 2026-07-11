import { MessageCircle, Repeat2, Upload, Coins, MoreHorizontal, Trash2 } from "lucide-react";
import { VerificationBadge } from "./VerificationBadge";
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
import { readBookmarks, toggleBookmark } from "@/lib/bookmarks";
import { supabase } from "@/integrations/supabase/client";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

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
  const [bookmarked, setBookmarked] = useState(() => readBookmarks(user?.id).has(post.id));
  const author = post.author;
  const name = author?.display_name || author?.username || "Anonymous";
  const handle = author?.username || "anon";

  // Reset local optimistic state when post or signed-in user changes
  // (prevents one account's likes/bookmarks leaking to another).
  useEffect(() => {
    setLiked(post.liked_by_me);
    setLikeCount(post.like_count);
    setBookmarked(readBookmarks(user?.id).has(post.id));
  }, [post.id, post.liked_by_me, post.like_count, user?.id]);

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
      // Intentionally do NOT call onChanged — optimistic state suffices.
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

  const isOwn = !!user && user.id === post.user_id;

  const handleDelete = async (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (!isOwn) return;
    if (!confirm("Delete this post? This cannot be undone.")) return;
    const { error } = await supabase.from("posts").delete().eq("id", post.id);
    if (error) return toast.error(error.message);
    toast.success("Post deleted");
    onChanged?.();
  };

  return (
    <article
      onClick={() => navigate(`/p/${post.id}`)}
      className="hairline-b animate-fade-in cursor-pointer px-4 py-4 transition-colors duration-200 hover:bg-surface/40 active:bg-surface/60"
    >
      <header className="flex items-start gap-3">
        <Link to={`/u/${handle}`} onClick={(e) => e.stopPropagation()} className="shrink-0">
          <Avatar name={name} src={author?.avatar_url ?? undefined} size="md" />
        </Link>
        <div className="flex min-w-0 flex-1 flex-col leading-tight">
          <div className="flex min-w-0 flex-wrap items-center gap-x-1">
            <Link
              to={`/u/${handle}`}
              onClick={(e) => e.stopPropagation()}
              className="break-words text-[15px] font-bold tracking-[-0.01em] text-foreground hover:underline"
            >
              {name}
            </Link>
            <VerificationBadge
              kind={(author?.verification_kind ?? (author?.verified ? "verified" : "none")) as any}
              size={15}
              className="shrink-0"
            />
          </div>
          <span className="break-all text-[13px] text-muted-foreground">@{handle}</span>
        </div>
        <div className="ml-2 flex shrink-0 items-start gap-1">
          <span className="mt-[2px] whitespace-nowrap text-[12.5px] text-muted-foreground tabular-nums">
            {timeAgo(post.created_at)}
          </span>
          <button
            aria-label="Tip USDC"
            onClick={(e) => { e.stopPropagation(); if (!user) return navigate("/auth"); setTipOpen(true); }}
            className="tap -mt-1 inline-flex h-8 w-8 items-center justify-center rounded-full text-amber-500 transition-colors hover:bg-amber-500/10"
          >
            <Coins size={16} strokeWidth={1.8} />
          </button>
          {isOwn && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  aria-label="More"
                  onClick={(e) => e.stopPropagation()}
                  className="tap -mt-1 inline-flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground hover:bg-surface-2"
                >
                  <MoreHorizontal size={18} />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()} className="rounded-2xl">
                <DropdownMenuItem onClick={(e) => handleDelete(e as any)} className="text-destructive focus:text-destructive">
                  <Trash2 size={16} className="mr-2" /> Delete post
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </header>

      <div className="ml-[52px] mt-1.5">
        {post.title && <h2 className="text-[17px] font-bold leading-[1.3] tracking-[-0.01em] text-foreground">{post.title}</h2>}
        {post.body && (
          <PostBody
            text={post.body}
            className={(post.title ? "mt-1 " : "") + "whitespace-pre-wrap text-[15px] leading-[1.45] tracking-[-0.003em] text-foreground/95"}
          />
        )}
        {post.image_url && (
          <div className="mt-3 overflow-hidden rounded-[16px] border border-border bg-surface-2">
            <img src={post.image_url} alt="" loading="lazy" className="aspect-[5/4] w-full object-cover transition-transform duration-500 hover:scale-[1.02]" />
          </div>
        )}
        {(() => {
          const action = parseInlineAction([post.title, post.body].filter(Boolean).join(" "));
          return action ? <InlineActionCard action={action} postId={post.id} /> : null;
        })()}

        <div className="mt-3 flex items-center justify-between pr-1 text-muted-foreground">
          <button
            onClick={(e) => { e.stopPropagation(); navigate(`/p/${post.id}`); }}
            className="tap inline-flex items-center gap-1.5 transition-colors hover:text-foreground"
            aria-label="Comment"
          >
            <MessageCircle className="h-[18px] w-[18px]" strokeWidth={1.6} />
            <span className="text-[13px] tabular-nums">{post.comment_count}</span>
          </button>
          <button
            onClick={handleRepost}
            className={cn("tap inline-flex items-center gap-1.5 transition-colors", reposted ? "text-emerald-500" : "hover:text-foreground")}
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
          <BookmarkSave
            checked={bookmarked}
            onChange={(e) => {
              e.stopPropagation();
              const next = !bookmarked;
              setBookmarked(next);
              toggleBookmark(user?.id, post.id, next);
            }}
            size={18}
            aria-label="Save"
          />
          <button onClick={handleShare} className="tap transition-colors hover:text-foreground" aria-label="Share">
            <Upload className="h-[18px] w-[18px]" strokeWidth={1.6} />
          </button>
        </div>
      </div>
      {tipOpen && (
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

