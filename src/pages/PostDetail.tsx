import { AppShell } from "@/components/meku/AppShell";
import { ChevronLeft, MoreHorizontal, BadgeCheck, MessageCircle, Repeat2, Upload, Loader2 } from "lucide-react";
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

  return (
    <div className={cn("py-3", depth > 0 && "border-l border-border pl-3")}>
      <div className="flex min-w-0 gap-3">
        <Avatar name={name} src={node.author?.avatar_url ?? undefined} size="sm" />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5 text-[13px]">
            <span className="font-semibold text-foreground">{name}</span>
            <span className="text-muted-foreground">@{node.author?.username ?? "anon"}</span>
            <span className="text-muted-foreground">· {timeAgo(node.created_at)}</span>
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
      {node.children.length > 0 && (
        <div className="ml-3 mt-1">
          {node.children.map((c) => <CommentNode key={c.id} node={c} postId={postId} onReplied={onReplied} depth={Math.min(depth + 1, 3)} />)}
        </div>
      )}
    </div>
  );
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

  const [bookmarked, setBookmarked] = useState<boolean>(() => {
    try { return (JSON.parse(localStorage.getItem("meku.bookmarks.v1") ?? "[]") as string[]).includes(id); }
    catch { return false; }
  });

  const load = useCallback(async () => {
    const [p, c] = await Promise.all([fetchPost(id, user?.id), fetchComments(id)]);
    setPost(p);
    setComments(c);
    setLoading(false);
  }, [id, user?.id]);

  useEffect(() => { load(); }, [load]);

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
    <AppShell hideNav><div className="flex min-h-svh items-center justify-center"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div></AppShell>
  );
  if (!post) return (
    <AppShell hideNav><div className="p-8 text-center text-muted-foreground">Post not found</div></AppShell>
  );

  const name = post.author?.display_name || post.author?.username || "Anonymous";
  const tree = buildTree(comments);

  return (
    <AppShell hideNav>
      <header className="sticky top-0 z-30 flex h-[56px] items-center justify-between bg-background/90 px-3 backdrop-blur-xl">
        <button onClick={() => navigate(-1)} aria-label="Back" className="tap inline-flex h-10 w-10 items-center justify-center rounded-full">
          <ChevronLeft className="h-[22px] w-[22px]" strokeWidth={1.6} />
        </button>
        <p className="text-[14px] font-bold">Post</p>
        <button aria-label="More" className="tap inline-flex h-10 w-10 items-center justify-center rounded-full">
          <MoreHorizontal className="h-[20px] w-[20px]" strokeWidth={1.6} />
        </button>
      </header>

      <article className="px-4 py-4">
        <Link to={`/u/${post.author?.username ?? ""}`} className="flex items-center gap-3">
          <Avatar name={name} src={post.author?.avatar_url ?? undefined} size="md" />
          <div>
            <div className="flex items-center gap-1.5">
              <p className="text-[15px] font-semibold text-foreground">{name}</p>
              {post.author?.verified && <BadgeCheck className="h-[14px] w-[14px] fill-primary text-background" strokeWidth={2.2} />}
            </div>
            <p className="text-[13px] text-muted-foreground">@{post.author?.username ?? "anon"}</p>
          </div>
        </Link>

        {post.title && <h1 className="mt-4 text-[20px] font-bold leading-tight tracking-[-0.01em] text-foreground">{post.title}</h1>}
        <PostBody text={post.body} className="mt-2 whitespace-pre-wrap break-words text-[16px] leading-[1.55] text-foreground/90" />
        {post.image_url && <div className="mt-3 overflow-hidden rounded-[14px] border border-border"><img src={post.image_url} alt="" className="w-full" /></div>}

        <p className="mt-3 text-[12px] text-muted-foreground">{new Date(post.created_at).toLocaleString()}</p>

        <div className="mt-3 flex items-center gap-6 border-y border-border py-2 text-[13px] text-muted-foreground">
          <span><strong className="text-foreground">{post.comment_count}</strong> Comments</span>
          <span><strong className="text-foreground">{post.like_count}</strong> Likes</span>
        </div>

        <div className="mt-2 flex items-center justify-around pt-1 text-muted-foreground">
          <button className="tap inline-flex items-center gap-1.5"><MessageCircle className="h-[20px] w-[20px]" strokeWidth={1.6} /></button>
          <button className="tap inline-flex items-center gap-1.5"><Repeat2 className="h-[20px] w-[20px]" strokeWidth={1.6} /></button>
          <HeartLike checked={!!post.liked_by_me} onChange={() => handleLike()} size={22} aria-label="Like" />
          <BookmarkSave
            checked={bookmarked}
            onChange={() => {
              const next = !bookmarked;
              setBookmarked(next);
              try {
                const arr = JSON.parse(localStorage.getItem("meku.bookmarks.v1") ?? "[]") as string[];
                const set = new Set(arr);
                if (next) set.add(post.id); else set.delete(post.id);
                localStorage.setItem("meku.bookmarks.v1", JSON.stringify([...set]));
              } catch {}
            }}
            size={20}
            aria-label="Save"
          />
          <button className="tap"><Upload className="h-[20px] w-[20px]" strokeWidth={1.6} /></button>
        </div>
      </article>

      <section className="px-4 pb-[120px]">
        <h2 className="mb-1 text-[13px] font-bold uppercase tracking-wider text-muted-foreground">Comments</h2>
        {tree.length === 0 ? (
          <p className="py-6 text-center text-[13px] text-muted-foreground">Be the first to comment.</p>
        ) : (
          tree.map((c) => <CommentNode key={c.id} node={c} postId={post.id} onReplied={load} />)
        )}
      </section>

      <div className="fixed inset-x-0 bottom-0 z-30 mx-auto max-w-[440px] hairline-t bg-background/95 px-3 py-2 backdrop-blur-xl" style={{ paddingBottom: "max(env(safe-area-inset-bottom), 8px)" }}>
        <div className="flex items-center gap-2">
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && send()}
            placeholder="Add a comment…"
            className="h-[44px] flex-1 rounded-full border border-border bg-surface px-4 text-[14px] outline-none focus:border-primary"
          />
          <button onClick={send} disabled={sending || !draft.trim()} className="tap rounded-full bg-primary px-4 py-2.5 text-[13px] font-bold text-primary-foreground disabled:opacity-40">
            {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Reply"}
          </button>
        </div>
      </div>
    </AppShell>
  );
};

export default PostDetail;
