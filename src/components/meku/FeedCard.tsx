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
      className="hairline-b animate-fade-in cursor-pointer px-4 py-3 transition-colors duration-150 hover:bg-surface/30"
    >
      <div className="flex gap-3">
        {/* Avatar column */}
        <Link to={`/u/${handle}`} onClick={(e) => e.stopPropagation()} className="shrink-0">
          <Avatar name={name} src={author?.avatar_url ?? undefined} size="md" />
        </Link>

        {/* Content column */}
        <div className="min-w-0 flex-1">
          {/* Single-row meta: name · @handle · · time · more */}
          <header className="flex min-w-0 items-center gap-1 text-[15px] leading-tight">
            <Link
              to={`/u/${handle}`}
              onClick={(e) => e.stopPropagation()}
              className="truncate font-bold tracking-[-0.01em] text-foreground hover:underline"
            >
              {name}
            </Link>
            <VerificationBadge
              kind={(author?.verification_kind ?? (author?.verified ? "verified" : "none")) as any}
              size={15}
              className="shrink-0"
            />
            <span className="truncate text-muted-foreground">@{handle}</span>
            <span className="text-muted-foreground">·</span>
            <span className="shrink-0 whitespace-nowrap text-muted-foreground tabular-nums">
              {timeAgo(post.created_at)}
            </span>
            <div className="ml-auto flex shrink-0 items-center">
              <button
                aria-label="Tip USDC"
                onClick={(e) => { e.stopPropagation(); if (!user) return navigate("/auth"); setTipOpen(true); }}
                className="tap -my-1 inline-flex h-8 w-8 items-center justify-center rounded-full text-amber-500 transition-colors hover:bg-amber-500/10"
              >
                <Coins size={16} strokeWidth={1.8} />
              </button>
              {isOwn && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button
                      aria-label="More"
                      onClick={(e) => e.stopPropagation()}
                      className="tap -my-1 inline-flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground hover:bg-surface-2"
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

          {/* Body */}
          <div className="mt-0.5">
            {post.title && <h2 className="text-[15px] font-bold leading-[1.3] tracking-[-0.01em] text-foreground">{post.title}</h2>}
            {post.body && (
              <PostBody
                text={post.body}
                className={(post.title ? "mt-0.5 " : "") + "whitespace-pre-wrap text-[15px] leading-[1.35] tracking-[-0.003em] text-foreground"}
              />
            )}
            {post.image_url && (
              <div className="mt-2 overflow-hidden rounded-2xl border border-border bg-surface-2">
                <img src={post.image_url} alt="" loading="lazy" className="aspect-[5/4] w-full object-cover" />
              </div>
            )}
            {(() => {
              const action = parseInlineAction([post.title, post.body].filter(Boolean).join(" "));
              return action ? <InlineActionCard action={action} postId={post.id} /> : null;
            })()}

            {/* X-style action row — evenly spaced, icon + count grouped */}
            <div className="mt-2 flex max-w-[420px] items-center justify-between text-muted-foreground">
              <button
                onClick={(e) => { e.stopPropagation(); navigate(`/p/${post.id}`); }}
                className="tap group inline-flex items-center gap-1 transition-colors hover:text-primary"
                aria-label="Comment"
              >
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-full transition-colors group-hover:bg-primary/10">
                  <MessageCircle className="h-[18px] w-[18px]" strokeWidth={1.75} />
                </span>
                <span className="text-[13px] tabular-nums">{post.comment_count || ""}</span>
              </button>
              <button
                onClick={handleRepost}
                className={cn(
                  "tap group inline-flex items-center gap-1 transition-colors",
                  reposted ? "text-emerald-500" : "hover:text-emerald-500",
                )}
                aria-label="Repost"
              >
                <span className={cn(
                  "inline-flex h-8 w-8 items-center justify-center rounded-full transition-colors",
                  reposted ? "bg-emerald-500/10" : "group-hover:bg-emerald-500/10",
                )}>
                  <Repeat2 className="h-[18px] w-[18px]" strokeWidth={1.75} />
                </span>
                {repostCount > 0 && <span className="text-[13px] tabular-nums">{repostCount}</span>}
              </button>
              <div className="inline-flex items-center gap-1">
                <HeartLike
                  checked={liked}
                  onChange={(e) => handleLike(e)}
                  size={18}
                  aria-label="Like"
                />
                {likeCount > 0 && (
                  <span className={cn("text-[13px] tabular-nums", liked && "text-[#f91880]")}>{likeCount}</span>
                )}
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
              <button onClick={handleShare} className="tap group inline-flex items-center transition-colors hover:text-primary" aria-label="Share">
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-full transition-colors group-hover:bg-primary/10">
                  <Upload className="h-[18px] w-[18px]" strokeWidth={1.75} />
                </span>
              </button>
            </div>
          </div>
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

