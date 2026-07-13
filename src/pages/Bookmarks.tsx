import { AppShell } from "@/components/meku/AppShell";
import { ScreenHeader } from "@/components/meku/ScreenHeader";
import { FeedCard } from "@/components/meku/FeedCard";
import { EmptyState } from "@/components/meku/EmptyState";
import { PostListSkeleton } from "@/components/meku/Skeletons";
import { useEffect, useState } from "react";
import { fetchPost, type Post } from "@/lib/social";
import { useAuth } from "@/hooks/useAuth";
import { readBookmarks } from "@/lib/bookmarks";

const Bookmarks = () => {
  const { user } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const ids = [...readBookmarks(user?.id)];
    const results = await Promise.all(ids.map((id) => fetchPost(id, user?.id)));
    setPosts(results.filter((p): p is Post => !!p));
    setLoading(false);
  };

  useEffect(() => { load(); }, [user?.id]);

  return (
    <AppShell>
      <ScreenHeader title="Bookmarks" />
      {loading ? (
        <PostListSkeleton count={4} />
      ) : posts.length === 0 ? (
        <EmptyState
          title="No bookmarks yet"
          description="Tap the bookmark icon on any post to save it here for later."
        />
      ) : (
        posts.map((p) => <FeedCard key={p.id} post={p} onChanged={load} />)
      )}
    </AppShell>
  );
};

export default Bookmarks;
