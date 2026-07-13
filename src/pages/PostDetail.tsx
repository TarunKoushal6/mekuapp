import { AppShell } from "@/components/meku/AppShell";
import { ChevronLeft, MoreHorizontal, MessageCircle, Repeat2, Upload, Loader2, Coins, Trash2, BarChart2 } from "lucide-react";
import { VerificationBadge } from "@/components/meku/VerificationBadge";
import { HeartLike } from "@/components/meku/HeartLike";
import { BookmarkSave } from "@/components/meku/BookmarkSave";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useEffect, useState, useCallback } from "react";
import { Avatar } from "@/components/meku/Avatar";
import { useAuth } from "@/hooks/useAuth";
import {
  fetchPost,
  fetchComments,
  createComment,
  toggleLike,
  type Post,
  type CommentRow,
  timeAgo,
} from "@/lib/social";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { PostBody } from "@/components/meku/PostBody";
import { AnimatedCount } from "@/components/meku/AnimatedCount";
import { readBookmarks, toggleBookmark } from "@/lib/bookmarks";
import { PostCardSkeleton } from "@/components/meku/Skeletons";
import { SendSheet } from "@/components/meku/SendSheet";
import { supabase } from "@/integrations/supabase/client";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

interface TreeNode extends CommentRow { children: TreeNode[]; }

const buildTree = (rows: CommentRow[]): TreeNode[] => {
  const map = new Map<string, TreeNode>();
  rows.forEach((r) => map.set(r.id, { ...r, children: [] }));
  const roots: TreeNode[] = [];
  map.forEach((n) => {
    if (n.parent_id && map.has(n.parent_id)) map.get(n.parent_id)!.children.push(n);
    else roots.push(n);
  });
  return roots;
};

const CommentNode = ({ node, postId, onReplied, depth = 0 }: { node: TreeNode; postId: string; onReplied: () => void; depth?: number }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [showReply, setShowReply] = useState(false);
  const [draft, setDraft] = useState("");
  const [busy, setBusy] = useState(false);

  const send = async () => {
    if (!user) { navigate("/auth"); return; }
    const text = draft.trim();
    if (!text || busy) return;
    setBusy(true);
    try {
      await createComment(postId, user.id, text, node.id);
      setDraft("");
      setShowReply(false);
      onReplied();
    } catch (e: any) {
      toast.error(e.message ?? "Could not reply");
    } finally {
      setBusy(false);
    }
  };

  const name = node.author?.display_name || node.author?.username || "Anonymous";

  const hasChildren = node.children.length > 0;

  return (
    <div className="relative">
      <div className="flex min-w-0 gap-3 pt-3">
        {/* Avatar column with X-style vertical connector */}
        <div className="relative flex shrink-0 flex-col items-center">
          <Avatar name={name} src={node.author?.avatar_url ?? undefined} size="sm" />
          {hasChildren && <div className="mt-1 w-px flex-1 bg-border" aria-hidden />}
        </div>
        <div className="min-w-0 flex-1 pb-2">
          <div className="flex items-center gap-1.5 text-[13px]">
            <span className="truncate font-semibold text-foreground">{name}</span>
            {node.author?.verification_kind && node.author.verification_kind !== "none" && (
              <VerificationBadge kind={node.author.verification_kind as any} size={12} />
            )}
            <span className="truncate text-muted-foreground">@{node.author?.username ?? "anon"}</span>
            <span className="shrink-0 text-muted-foreground">· {timeAgo(node.created_at)}</span>
          </div>
          <PostBody text={node.body} className="mt-0.5 whitespace-pre-wrap break-words text-[14px] leading-[1.45] text-foreground/90" />
          <button onClick={() => setShowReply((v) => !v)} className="tap mt-1 text-[12px] font-medium text-muted-foreground hover:text-foreground">
            Reply
          </button>
          {showReply && (
            <div className="mt-2 flex min-w-0 items-center gap-2">
              <input
                autoFocus
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && send()}
                placeholder={`Reply to ${name}…`}
                className="h-[36px] min-w-0 flex-1 rounded-full border border-border bg-surface px-3 text-[13px] outline-none focus:border-primary"
              />
              <button onClick={send} disabled={busy || !draft.trim()} className="tap shrink-0 rounded-full bg-primary px-3 py-1.5 text-[12px] font-bold text-primary-foreground disabled:opacity-40">
                Send
              </button>
            </div>
          )}
        </div>
      </div>
      {hasChildren && (
        <div className="pl-[calc(2rem+0.75rem)]">
          {node.children.map((c) => (
            <CommentNode key={c.id} node={c} postId={postId} onReplied={onReplied} depth={Math.min(depth + 1, 3)} />
          ))}
        </div>
      )}
    </div>
  );
};

const formatCount = (n: number) => {
  if (n < 1000) return String(n);
  if (n < 10000) return (n / 1000).toFixed(1).replace(/\.0$/, "") + "K";
  if (n < 1000000) return Math.floor(n / 1000) + "K";
  return (n / 1000000).toFixed(1).replace(/\.0$/, "") + "M";
};

const PostDetail = () => {
  const { id = "" } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [post, setPost] = useState<Post | null>(null);
  const [comments, setComments] = useState<CommentRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const [tipOpen, setTipOpen] = useState(false);

  const [bookmarked, setBookmarked] = useState<boolean>(() => readBookmarks(user?.id).has(id));
  const [viewCount, setViewCount] = useState<number>(0);

  useEffect(() => {
    setBookmarked(readBookmarks(user?.id).has(id));
  }, [user?.id, id]);

  const load = useCallback(async () => {
    const [p, c] = await Promise.all([fetchPost(id, user?.id), fetchComments(id)]);
    setPost(p);
    setComments(c);
    if (p) setViewCount((p as any).view_count ?? 0);
    setLoading(false);
  }, [id, user?.id]);

  useEffect(() => { load(); }, [load]);

  // Increment impression once per session for this post, and live-subscribe to updates
  useEffect(() => {
    if (!id) return;
    const key = `meku:viewed:${id}`;
    if (!sessionStorage.getItem(key)) {
      sessionStorage.setItem(key, "1");
      supabase.rpc("increment_post_view", { _post_id: id }).then(({ data }) => {
        if (typeof data === "number") setViewCount(data);
      });
    }
    const channel = supabase
      .channel(`post-views-detail-${id}`)
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "posts", filter: `id=eq.${id}` }, (payload: any) => {
        const v = payload.new?.view_count;
        if (typeof v === "number") setViewCount(v);
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [id]);


  const handleLike = async () => {
    if (!user || !post) { navigate("/auth"); return; }
    const wasLiked = !!post.liked_by_me;
    // optimistic — no full reload so the page doesn't flash
    setPost({ ...post, liked_by_me: !wasLiked, like_count: post.like_count + (wasLiked ? -1 : 1) });
    try {
      await toggleLike(post.id, user.id, wasLiked);
    } catch (e: any) {
      setPost({ ...post });
      toast.error(e.message);
    }
  };

  const send = async () => {
    if (!user) { navigate("/auth"); return; }
    const text = draft.trim();
    if (!text || sending) return;
    setSending(true);
    try {
      await createComment(id, user.id, text);
      setDraft("");
      load();
    } catch (e: any) { toast.error(e.message); }
    finally { setSending(false); }
  };

  if (loading) return (
    <AppShell hideNav>
      <header className="sticky top-0 z-30 flex h-[56px] items-center justify-between bg-background/90 px-3 backdrop-blur-xl">
        <button onClick={() => navigate(-1)} aria-label="Back" className="tap inline-flex h-10 w-10 items-center justify-center rounded-full">
          <ChevronLeft className="h-[22px] w-[22px]" strokeWidth={1.6} />
        </button>
        <p className="text-[14px] font-bold">Post</p>
        <span className="w-10" />
      </header>
      <div className="animate-fade-in"><PostCardSkeleton /><PostCardSkeleton /></div>
    </AppShell>
  );
  if (!post) return (
    <AppShell hideNav><div className="p-8 text-center text-muted-foreground">Post not found</div></AppShell>
  );

  const name = post.author?.display_name || post.author?.username || "Anonymous";
  const tree = buildTree(comments);

  const isOwn = !!user && user.id === post.user_id;

  const handleDelete = async () => {
    if (!isOwn) return;
    if (!confirm("Delete this post? This cannot be undone.")) return;
    const { error } = await supabase.from("posts").delete().eq("id", post.id);
    if (error) return toast.error(error.message);
    toast.success("Post deleted");
    navigate(-1);
  };

  return (
    <AppShell hideNav>
      <>

      <header className="sticky top-0 z-30 flex h-[56px] items-center justify-between bg-background/90 px-3 backdrop-blur-xl">
        <button onClick={() => navigate(-1)} aria-label="Back" className="tap inline-flex h-10 w-10 items-center justify-center rounded-full">
          <ChevronLeft className="h-[22px] w-[22px]" strokeWidth={1.6} />
        </button>
        <p className="text-[14px] font-bold">Post</p>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button aria-label="More" className="tap inline-flex h-10 w-10 items-center justify-center rounded-full">
              <MoreHorizontal className="h-[20px] w-[20px]" strokeWidth={1.6} />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="rounded-2xl">
            {isOwn ? (
              <DropdownMenuItem onClick={handleDelete} className="text-destructive focus:text-destructive">
                <Trash2 size={16} className="mr-2" /> Delete post
              </DropdownMenuItem>
            ) : (
              <DropdownMenuItem onClick={() => { if (!user) return navigate("/auth"); setTipOpen(true); }}>
                <Coins size={16} className="mr-2" /> Tip USDC
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </header>

      <article className="px-4 pt-3 pb-4 hairline-b">
        <div className="flex items-start gap-3">
          <Link to={`/u/${post.author?.username ?? ""}`} className="shrink-0">
            <Avatar name={name} src={post.author?.avatar_url ?? undefined} size="lg" />
          </Link>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              <Link to={`/u/${post.author?.username ?? ""}`} className="truncate text-[16px] font-semibold tracking-[-0.01em] text-foreground hover:underline">
                {name}
              </Link>
              <VerificationBadge kind={(post.author?.verification_kind ?? (post.author?.verified ? "verified" : "none")) as any} size={14} />
            </div>
            <p className="truncate text-[14px] text-muted-foreground">@{post.author?.username ?? "anon"}</p>
          </div>
          <span className="shrink-0 pt-0.5 text-[13px] text-muted-foreground tabular-nums">{timeAgo(post.created_at)}</span>
        </div>

        {post.title && <h1 className="mt-3 text-[17px] font-semibold leading-[1.35] tracking-[-0.01em] text-foreground">{post.title}</h1>}
        <PostBody text={post.body} className="mt-1.5 whitespace-pre-wrap break-words text-[16px] leading-[24px] text-foreground" />
        {post.image_url && <div className="mt-3 overflow-hidden rounded-[16px] border border-border"><img src={post.image_url} alt="" className="w-full" /></div>}

        <div className="mt-4 flex items-center justify-between text-muted-foreground">
          <button onClick={() => document.getElementById("reply-input")?.focus()} className="tap inline-flex items-center gap-1.5 rounded-full px-2 py-1 text-[13px] hover:bg-foreground/5 hover:text-foreground" aria-label="Reply">
            <MessageCircle className="h-5 w-5" strokeWidth={1.7} />
            <AnimatedCount value={post.comment_count} />
          </button>
          <button className="tap inline-flex items-center gap-1.5 rounded-full px-2 py-1 text-[13px] hover:bg-foreground/5 hover:text-foreground" aria-label="Repost">
            <Repeat2 className="h-5 w-5" strokeWidth={1.7} />
          </button>
          <div className="inline-flex items-center gap-1.5 rounded-full px-2 py-1 text-[13px]">
            <HeartLike checked={!!post.liked_by_me} onChange={() => handleLike()} size={20} aria-label="Like" />
            <AnimatedCount value={post.like_count} className={cn(post.liked_by_me && "text-[#ff5b89]")} />
          </div>
          <button className="tap inline-flex items-center gap-1.5 rounded-full px-2 py-1 text-[13px] hover:bg-foreground/5 hover:text-foreground" aria-label="Views">
            <BarChart2 className="h-5 w-5" strokeWidth={1.7} />
            <AnimatedCount value={viewCount} />
          </button>
          <div className="inline-flex items-center gap-0.5">
            <BookmarkSave
              checked={bookmarked}
              onChange={() => { const next = !bookmarked; setBookmarked(next); toggleBookmark(user?.id, post.id, next); }}
              size={20}
              aria-label="Save"
            />
            <button className="tap inline-flex h-9 w-9 items-center justify-center rounded-full hover:bg-foreground/5 hover:text-foreground" aria-label="Share">
              <Upload className="h-5 w-5" strokeWidth={1.7} />
            </button>
          </div>
        </div>
      </article>

      <section className="px-4 pb-[120px]">
        <div className="flex items-center justify-between py-3">
          <h2 className="text-[15px] font-semibold text-foreground">Replies</h2>
          <button className="tap inline-flex h-8 items-center rounded-full bg-surface-2 px-3 text-[12.5px] font-medium text-muted-foreground">
            Most relevant
          </button>
        </div>
        {tree.length === 0 ? (
          <p className="py-6 text-center text-[13px] text-muted-foreground">Be the first to reply.</p>
        ) : (
          tree.map((c) => <CommentNode key={c.id} node={c} postId={post.id} onReplied={load} />)
        )}
      </section>

      <div className="fixed inset-x-0 bottom-0 z-30 mx-auto max-w-[440px] hairline-t bg-background/95 px-3 py-2 backdrop-blur-xl" style={{ paddingBottom: "max(env(safe-area-inset-bottom), 8px)" }}>
        <div className="flex min-w-0 items-center gap-2">
          <Avatar name={user?.email ?? "You"} size="sm" />
          <div className="relative min-w-0 flex-1">
            <input
              id="reply-input"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && send()}
              placeholder="Post your reply..."
              className="h-[42px] w-full rounded-full border border-border bg-surface pl-4 pr-12 text-[14px] outline-none focus:border-primary"
            />
            <button
              onClick={send}
              disabled={sending || !draft.trim()}
              aria-label="Send reply"
              className="tap absolute right-1 top-1/2 inline-flex h-[34px] w-[34px] -translate-y-1/2 items-center justify-center rounded-full bg-primary text-primary-foreground disabled:opacity-40"
            >
              {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4 rotate-90" strokeWidth={2} />}
            </button>
          </div>
        </div>
      </div>
      </>


      {tipOpen && post && (
        <SendSheet
          open={tipOpen}
          onOpenChange={setTipOpen}
          defaults={{ recipientUserId: post.user_id, postId: post.id, kind: "tip", amount: "1" }}
          recipientLabel={`@${post.author?.username ?? "anon"}`}
          title="Tip USDC"
        />
      )}
    </AppShell>
  );
};

export default PostDetail;
