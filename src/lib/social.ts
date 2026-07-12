import { supabase } from "@/integrations/supabase/client";

export interface Profile {
  id: string;
  username: string | null;
  display_name: string | null;
  bio: string | null;
  avatar_url: string | null;
  verified: boolean;
  verification_kind?: "none" | "verified" | "premium" | null;
}

export interface Post {
  id: string;
  user_id: string;
  title: string | null;
  body: string;
  image_url: string | null;
  created_at: string;
  author: Profile | null;
  like_count: number;
  comment_count: number;
  liked_by_me: boolean;
  /** When present, this post is being surfaced because `reposted_by` reposted it. */
  reposted_by?: Profile | null;
  reposted_at?: string;
}

export interface CommentRow {
  id: string;
  post_id: string;
  user_id: string;
  parent_id: string | null;
  body: string;
  created_at: string;
  author: Profile | null;
}

export const timeAgo = (iso: string) => {
  const s = (Date.now() - new Date(iso).getTime()) / 1000;
  if (s < 60) return `${Math.floor(s)}s`;
  if (s < 3600) return `${Math.floor(s / 60)}m`;
  if (s < 86400) return `${Math.floor(s / 3600)}h`;
  if (s < 604800) return `${Math.floor(s / 86400)}d`;
  return new Date(iso).toLocaleDateString();
};

export interface FetchPostsOptions {
  /** When true, only include posts from accounts the viewer follows. */
  followingOnly?: boolean;
  /** Optional explicit author filter (e.g. profile page). */
  authorId?: string;
  /** Cursor: return posts strictly older than this ISO timestamp. */
  before?: string;
  /** Page size (default 20). */
  limit?: number;
}

export async function fetchPosts(
  viewerId?: string | null,
  opts: FetchPostsOptions = {},
): Promise<Post[]> {
  let followingIds: string[] | null = null;
  if (opts.followingOnly && viewerId) {
    const { data: fl } = await supabase
      .from("follows")
      .select("followee_id")
      .eq("follower_id", viewerId);
    followingIds = (fl ?? []).map((r: any) => r.followee_id);
    if (followingIds.length === 0) return [];
  }

  let query = supabase
    .from("posts")
    .select("id, user_id, title, body, image_url, created_at, view_count")
    .order("created_at", { ascending: false })
    .limit(opts.limit ?? 20);
  if (opts.authorId) query = query.eq("user_id", opts.authorId);
  if (followingIds) query = query.in("user_id", followingIds);
  if (opts.before) query = query.lt("created_at", opts.before);

  const { data: posts, error } = await query;
  if (error) throw error;
  if (!posts || posts.length === 0) return [];

  const ids = posts.map((p) => p.id);
  const userIds = Array.from(new Set(posts.map((p) => p.user_id)));

  const [{ data: profiles }, { data: likes }, { data: comments }, { data: myLikes }] = await Promise.all([
    supabase.from("profiles").select("*").in("id", userIds),
    supabase.from("post_likes").select("post_id").in("post_id", ids),
    supabase.from("comments").select("post_id").in("post_id", ids),
    viewerId
      ? supabase.from("post_likes").select("post_id").eq("user_id", viewerId).in("post_id", ids)
      : Promise.resolve({ data: [] as { post_id: string }[] }),
  ]);

  const pMap = new Map((profiles ?? []).map((p: any) => [p.id, p as Profile]));
  const likeCount = new Map<string, number>();
  (likes ?? []).forEach((l: any) => likeCount.set(l.post_id, (likeCount.get(l.post_id) ?? 0) + 1));
  const cmtCount = new Map<string, number>();
  (comments ?? []).forEach((c: any) => cmtCount.set(c.post_id, (cmtCount.get(c.post_id) ?? 0) + 1));
  const liked = new Set((myLikes ?? []).map((l: any) => l.post_id));

  return posts.map((p: any) => ({
    ...p,
    author: pMap.get(p.user_id) ?? null,
    like_count: likeCount.get(p.id) ?? 0,
    comment_count: cmtCount.get(p.id) ?? 0,
    liked_by_me: liked.has(p.id),
  }));
}

/**
 * Profile feed: authored posts + reposts by that profile, interleaved by time.
 * Reposts carry `reposted_by` (the profile) and `reposted_at`.
 */
export async function fetchProfileFeed(
  profileId: string,
  viewerId?: string | null,
): Promise<Post[]> {
  const [authored, { data: repostRows }] = await Promise.all([
    fetchPosts(viewerId, { authorId: profileId, limit: 40 }),
    supabase
      .from("reposts")
      .select("post_id, created_at")
      .eq("user_id", profileId)
      .order("created_at", { ascending: false })
      .limit(40),
  ]);

  const repostIds = (repostRows ?? []).map((r: any) => r.post_id);
  let reposts: Post[] = [];
  if (repostIds.length > 0) {
    // Reuse the enrichment path — fetchPosts filters by authorId, so query directly.
    const { data: rawPosts } = await supabase
      .from("posts")
      .select("id, user_id, title, body, image_url, created_at, view_count")
      .in("id", repostIds);
    const userIds = Array.from(new Set((rawPosts ?? []).map((p: any) => p.user_id).concat([profileId])));
    const [{ data: profiles }, { data: likes }, { data: comments }, { data: myLikes }] = await Promise.all([
      supabase.from("profiles").select("*").in("id", userIds),
      supabase.from("post_likes").select("post_id").in("post_id", repostIds),
      supabase.from("comments").select("post_id").in("post_id", repostIds),
      viewerId
        ? supabase.from("post_likes").select("post_id").eq("user_id", viewerId).in("post_id", repostIds)
        : Promise.resolve({ data: [] as { post_id: string }[] }),
    ]);
    const pMap = new Map((profiles ?? []).map((p: any) => [p.id, p as Profile]));
    const likeCount = new Map<string, number>();
    (likes ?? []).forEach((l: any) => likeCount.set(l.post_id, (likeCount.get(l.post_id) ?? 0) + 1));
    const cmtCount = new Map<string, number>();
    (comments ?? []).forEach((c: any) => cmtCount.set(c.post_id, (cmtCount.get(c.post_id) ?? 0) + 1));
    const likedSet = new Set((myLikes ?? []).map((l: any) => l.post_id));
    const repostedByProfile = pMap.get(profileId) ?? null;
    const repostAtMap = new Map((repostRows ?? []).map((r: any) => [r.post_id, r.created_at]));

    reposts = (rawPosts ?? [])
      // Don't double-count: skip if the profile is also the author (already in `authored`).
      .filter((p: any) => p.user_id !== profileId)
      .map((p: any) => ({
        ...p,
        author: pMap.get(p.user_id) ?? null,
        like_count: likeCount.get(p.id) ?? 0,
        comment_count: cmtCount.get(p.id) ?? 0,
        liked_by_me: likedSet.has(p.id),
        reposted_by: repostedByProfile,
        reposted_at: repostAtMap.get(p.id) as string | undefined,
      }));
  }

  // Merge & sort by repost time when present, otherwise by post creation.
  const merged = [...authored, ...reposts];
  merged.sort((a, b) => {
    const ta = new Date(a.reposted_at ?? a.created_at).getTime();
    const tb = new Date(b.reposted_at ?? b.created_at).getTime();
    return tb - ta;
  });
  // Dedupe by id (keep first occurrence — most recent surface).
  const seen = new Set<string>();
  return merged.filter((p) => (seen.has(p.id) ? false : (seen.add(p.id), true)));
}

// ============ Follows ============
export async function isFollowing(viewerId: string, targetId: string) {
  const { data } = await supabase
    .from("follows").select("followee_id")
    .eq("follower_id", viewerId).eq("followee_id", targetId).maybeSingle();
  return !!data;
}

export async function followUser(viewerId: string, targetId: string) {
  if (!viewerId || !targetId || viewerId === targetId) return;
  const { error } = await supabase
    .from("follows")
    .upsert(
      { follower_id: viewerId, followee_id: targetId },
      { onConflict: "follower_id,followee_id", ignoreDuplicates: true },
    );
  if (error) throw error;
}

export async function unfollowUser(viewerId: string, targetId: string) {
  const { error } = await supabase.from("follows").delete()
    .eq("follower_id", viewerId).eq("followee_id", targetId);
  if (error) throw error;
}

export async function getFollowCounts(userId: string) {
  const [{ count: followers }, { count: following }] = await Promise.all([
    supabase.from("follows").select("*", { count: "exact", head: true }).eq("followee_id", userId),
    supabase.from("follows").select("*", { count: "exact", head: true }).eq("follower_id", userId),
  ]);
  return { followers: followers ?? 0, following: following ?? 0 };
}

// ============ Reposts ============
export async function isReposted(viewerId: string, postId: string) {
  const { data } = await supabase.from("reposts").select("post_id")
    .eq("user_id", viewerId).eq("post_id", postId).maybeSingle();
  return !!data;
}

export async function toggleRepost(viewerId: string, postId: string, currentlyReposted: boolean) {
  if (currentlyReposted) {
    const { error } = await supabase.from("reposts").delete()
      .eq("user_id", viewerId).eq("post_id", postId);
    if (error) throw error;
  } else {
    const { error } = await supabase.from("reposts").insert({ user_id: viewerId, post_id: postId });
    if (error && !String(error.message).toLowerCase().includes("duplicate")) throw error;
  }
}

export async function getRepostCount(postId: string) {
  const { count } = await supabase.from("reposts").select("*", { count: "exact", head: true }).eq("post_id", postId);
  return count ?? 0;
}

export async function fetchPost(id: string, viewerId?: string | null): Promise<Post | null> {
  const { data, error } = await supabase
    .from("posts")
    .select("id, user_id, title, body, image_url, created_at, view_count")
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  if (!data) return null;
  const [{ data: author }, { count: lc }, { count: cc }, mine] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", data.user_id).maybeSingle(),
    supabase.from("post_likes").select("*", { count: "exact", head: true }).eq("post_id", id),
    supabase.from("comments").select("*", { count: "exact", head: true }).eq("post_id", id),
    viewerId
      ? supabase.from("post_likes").select("post_id").eq("post_id", id).eq("user_id", viewerId).maybeSingle()
      : Promise.resolve({ data: null }),
  ]);
  return {
    ...data,
    author: (author as Profile) ?? null,
    like_count: lc ?? 0,
    comment_count: cc ?? 0,
    liked_by_me: !!(mine as any)?.data,
  };
}

export async function toggleLike(postId: string, userId: string, currentlyLiked: boolean) {
  if (currentlyLiked) {
    const { error } = await supabase.from("post_likes").delete().eq("post_id", postId).eq("user_id", userId);
    if (error) throw error;
  } else {
    const { error } = await supabase.from("post_likes").insert({ post_id: postId, user_id: userId });
    if (error) throw error;
  }
}

export async function fetchComments(postId: string): Promise<CommentRow[]> {
  const { data, error } = await supabase
    .from("comments")
    .select("*")
    .eq("post_id", postId)
    .order("created_at", { ascending: true });
  if (error) throw error;
  const userIds = Array.from(new Set((data ?? []).map((c: any) => c.user_id)));
  if (userIds.length === 0) return [];
  const { data: profiles } = await supabase.from("profiles").select("*").in("id", userIds);
  const pMap = new Map((profiles ?? []).map((p: any) => [p.id, p as Profile]));
  return (data ?? []).map((c: any) => ({ ...c, author: pMap.get(c.user_id) ?? null }));
}

export async function createComment(postId: string, userId: string, body: string, parentId?: string | null) {
  const { error } = await supabase
    .from("comments")
    .insert({ post_id: postId, user_id: userId, body, parent_id: parentId ?? null });
  if (error) throw error;
}

export async function createPost(userId: string, body: string, title?: string) {
  const { data, error } = await supabase
    .from("posts")
    .insert({ user_id: userId, body, title: title || null })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function getProfile(userId: string): Promise<Profile | null> {
  const { data } = await supabase.from("profiles").select("*").eq("id", userId).maybeSingle();
  return (data as Profile) ?? null;
}

export async function updateProfile(userId: string, patch: Partial<Profile>) {
  const { error } = await supabase.from("profiles").update(patch).eq("id", userId);
  if (error) throw error;
}
