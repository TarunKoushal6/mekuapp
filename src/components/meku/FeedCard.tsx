import { MessageCircle, Repeat2, Upload, Coins, MoreHorizontal, Trash2, BarChart2 } from "lucide-react";
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
import { AnimatedCount } from "./AnimatedCount";
import { HeartLike } from "./HeartLike";
import { BookmarkSave } from "./BookmarkSave";
import { readBookmarks, toggleBookmark } from "@/lib/bookmarks";
import { supabase } from "@/integrations/supabase/client";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { ActionButton } from "./ActionButton";

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
  const [viewCount, setViewCount] = useState<number>((post as any).view_count ?? 0);
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

  // Impressions: count once per session per post, subscribe to live updates.
  useEffect(() => {
    const key = `mv:${post.id}`;
    if (!sessionStorage.getItem(key)) {
      sessionStorage.setItem(key, "1");
      supabase.rpc("increment_post_view", { _post_id: post.id }).then(({ data }) => {
        if (typeof data === "number") setViewCount(data);
      });
    }
    const ch = supabase
      .channel(`post-views-${post.id}`)
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "posts", filter: `id=eq.${post.id}` },
        (payload: any) => {
          const v = payload.new?.view_count;
          if (typeof v === "number") setViewCount(v);
        })
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [post.id]);

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
      className="hairline-b animate-fade-in cursor-pointer pl-5 pr-3 pt-3 pb-3.5 transition-colors duration-200 hover:bg-surface/40 active:bg-surface/60"
    >
      {post.reposted_by && (
        <Link
          to={`/u/${post.reposted_by.username ?? ""}`}
          onClick={(e) => e.stopPropagation()}
          className="mb-1 ml-14 flex items-center gap-1.5 text-[12px] font-semibold text-muted-foreground hover:underline"
        >
          <Repeat2 className="h-3.5 w-3.5" strokeWidth={1.8} />
          <span>
            {user && post.reposted_by.id === user.id
              ? "You reposted"
              : `${post.reposted_by.display_name || post.reposted_by.username || "Someone"} reposted`}
          </span>
        </Link>
      )}
      <header className="flex items-start gap-3">
        <Link to={`/u/${handle}`} onClick={(e) => e.stopPropagation()} className="shrink-0">
          <Avatar name={name} src={author?.avatar_url ?? undefined} size="lg" />
        </Link>
        <div className="flex min-w-0 flex-1 items-start justify-between gap-1">
          <div className="flex min-w-0 flex-1 items-baseline gap-x-1 leading-tight">
            <Link
              to={`/u/${handle}`}
              onClick={(e) => e.stopPropagation()}
              className="truncate text-[16px] font-semibold tracking-[-0.01em] text-foreground hover:underline"
            >
              {name}
            </Link>
            <VerificationBadge
              kind={(author?.verification_kind ?? (author?.verified ? "verified" : "none")) as any}
              size={15}
              className="shrink-0 self-center"
            />
            <span className="min-w-0 truncate text-[14px] font-normal text-muted-foreground">@{handle}</span>
            <span className="shrink-0 text-[14px] text-muted-foreground">·</span>
            <span className="shrink-0 whitespace-nowrap text-[14px] text-muted-foreground tabular-nums">
              {timeAgo(post.created_at)}
            </span>
          </div>
          <div className="flex shrink-0 items-start gap-0.5">
            {!isOwn && (
              <button
                aria-label="Tip USDC"
                onClick={(e) => { e.stopPropagation(); if (!user) return navigate("/auth"); setTipOpen(true); }}
                className="tap -mt-1 inline-flex h-10 w-10 items-center justify-center rounded-full text-amber-500 transition-colors hover:bg-amber-500/10"
              >
                <Coins size={16} strokeWidth={1.8} />
              </button>
            )}
            {isOwn && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    aria-label="More"
                    onClick={(e) => e.stopPropagation()}
                    className="tap -mt-1 inline-flex h-10 w-10 items-center justify-center rounded-full text-muted-foreground hover:bg-surface-2"
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
        </div>
      </header>


      <div className="ml-14 mt-1.5">
        {post.title && <h2 className="text-[16px] font-semibold leading-[24px] tracking-[-0.01em] text-foreground">{post.title}</h2>}
        {post.body && (
          <PostBody
            text={post.body}
            className={(post.title ? "mt-0.5 " : "") + "whitespace-pre-wrap text-[16px] font-normal leading-[24px] tracking-normal text-foreground"}
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

        <div className={cn("-ml-2 flex items-center gap-1 pr-1 text-muted-foreground", post.image_url ? "mt-2.5" : "mt-3")}>
          <ActionButton
            aria-label="Comment"
            onClick={(e) => { e.stopPropagation(); navigate(`/p/${post.id}`); }}
          >
            <MessageCircle className="h-5 w-5" strokeWidth={1.7} />
            <AnimatedCount value={post.comment_count} className="text-[13px]" />
          </ActionButton>

          <ActionButton
            aria-label="Repost"
            onClick={handleRepost}
            active={reposted}
            activeClassName="text-emerald-500 hover:bg-emerald-500/10"
          >
            <Repeat2 className="h-5 w-5" strokeWidth={1.7} />
            {repostCount > 0 && <AnimatedCount value={repostCount} className="text-[13px]" />}
          </ActionButton>

          <ActionButton as="div" aria-label="Like">
            <HeartLike checked={liked} onChange={(e) => handleLike(e)} size={18} aria-label="Like" />
            <AnimatedCount value={likeCount} className={cn("text-[13px]", liked && "text-[#ff5b89]")} />
          </ActionButton>

          <ActionButton
            aria-label="Views"
            onClick={(e) => { e.stopPropagation(); navigate(`/p/${post.id}`); }}
          >
            <BarChart2 className="h-5 w-5" strokeWidth={1.7} />
            <AnimatedCount value={viewCount} className="text-[13px]" />
          </ActionButton>

          <ActionButton as="div" aria-label="Save">
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
          </ActionButton>

          <ActionButton aria-label="Share" onClick={handleShare}>
            <Upload className="h-5 w-5" strokeWidth={1.7} />
          </ActionButton>
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

