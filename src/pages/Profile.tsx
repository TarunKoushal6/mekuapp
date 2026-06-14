import { AppShell } from "@/components/meku/AppShell";
import { BadgeCheck, Loader2 } from "lucide-react";
import { IconBack, IconMore, IconSettings } from "@/components/meku/MekuIcon";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useState, useEffect, useCallback } from "react";
import { cn } from "@/lib/utils";
import { Avatar } from "@/components/meku/Avatar";
import { EmptyState } from "@/components/meku/EmptyState";
import { FeedCard } from "@/components/meku/FeedCard";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { fetchPosts, getProfile, type Post, type Profile as ProfileT } from "@/lib/social";

const tabs = ["Posts", "Replies", "Media", "Likes"] as const;
type Tab = (typeof tabs)[number];

const Profile = () => {
  const navigate = useNavigate();
  const { handle } = useParams();
  const { user } = useAuth();
  const [tab, setTab] = useState<Tab>("Posts");
  const [profile, setProfile] = useState<ProfileT | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      let p: ProfileT | null = null;
      if (handle) {
        const { data } = await supabase.from("profiles").select("*").eq("username", handle).maybeSingle();
        p = (data as ProfileT) ?? null;
      } else if (user) {
        p = await getProfile(user.id);
      }
      setProfile(p);
      if (p) {
        const all = await fetchPosts(user?.id);
        setPosts(all.filter((x) => x.user_id === p!.id));
      }
    } finally { setLoading(false); }
  }, [handle, user]);

  useEffect(() => { load(); }, [load]);

  const isMe = user && profile && user.id === profile.id;
  const name = profile?.display_name || profile?.username || (user?.email ?? "Profile");
  const stats = { posts: posts.length, followers: 0, following: 0 };

  return (
    <AppShell>
      <header className="sticky top-0 z-30 flex h-[56px] items-center justify-between bg-background/80 px-3 backdrop-blur-xl">
        <button onClick={() => navigate(-1)} aria-label="Back" className="tap inline-flex h-10 w-10 items-center justify-center rounded-full text-foreground">
          <IconBack size={22} />
        </button>
        <div className="flex items-center gap-1">
          {isMe && (
            <Link to="/settings" aria-label="Settings" className="tap inline-flex h-10 w-10 items-center justify-center rounded-full text-foreground">
              <IconSettings size={18} />
            </Link>
          )}
          <button aria-label="More" className="tap inline-flex h-10 w-10 items-center justify-center rounded-full text-foreground">
            <IconMore size={20} />
          </button>
        </div>
      </header>

      <section className="px-5 pb-5 pt-2">
        <div className="flex h-[96px] w-[96px] items-center justify-center overflow-hidden rounded-full border border-border bg-surface-2">
          <Avatar name={name} src={profile?.avatar_url ?? undefined} className="h-full w-full" />
        </div>

        <div className="mt-5 flex items-center gap-2">
          <h1 className="text-[26px] font-bold tracking-[-0.02em] text-foreground">{name}</h1>
          {profile?.verified && <BadgeCheck className="h-[18px] w-[18px] fill-primary text-background" strokeWidth={2.2} />}
        </div>
        <p className="mt-1 text-[14px] text-muted-foreground">@{profile?.username ?? "—"}</p>

        <p className="mt-4 text-[15px] leading-[1.5] text-foreground/85">
          {profile?.bio || (isMe ? "Add a bio to tell people what you're building." : "No bio yet.")}
        </p>

        <div className="mt-5 flex items-baseline gap-7">
          {[[stats.posts, "Posts"], [stats.followers, "Followers"], [stats.following, "Following"]].map(([n, l]) => (
            <div key={l as string}>
              <p className="text-[20px] font-bold tabular-nums text-foreground">{n}</p>
              <p className="text-[12px] text-muted-foreground">{l}</p>
            </div>
          ))}
        </div>

        <div className="mt-5 flex items-center gap-2">
          {isMe ? (
            <Link to="/settings/profile" className="tap flex-1 rounded-full bg-foreground py-[11px] text-center text-[14px] font-bold text-background">
              Edit profile
            </Link>
          ) : (
            <button className="tap flex-1 rounded-full bg-primary py-[11px] text-[14px] font-bold text-primary-foreground">
              Follow
            </button>
          )}
          <button className="tap rounded-full border border-border bg-background px-4 py-[11px] text-[14px] font-bold text-foreground">
            Share
          </button>
        </div>
      </section>

      <nav className="sticky top-[56px] z-20 hairline-b bg-background/90 backdrop-blur-xl">
        <ul className="flex gap-6 px-5">
          {tabs.map((t) => (
            <li key={t}>
              <button
                onClick={() => setTab(t)}
                className={cn("tap relative py-3 text-[14px] font-bold", tab === t ? "text-foreground" : "text-muted-foreground")}
              >
                {t}
                {tab === t && <span className="absolute inset-x-0 -bottom-px h-[2px] bg-foreground" />}
              </button>
            </li>
          ))}
        </ul>
      </nav>

      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>
      ) : tab === "Posts" && posts.length > 0 ? (
        posts.map((p) => <FeedCard key={p.id} post={p} onChanged={load} />)
      ) : (
        <EmptyState pose="sitting" title={`No ${tab.toLowerCase()} yet`} description="When there's something to show, it shows up here." />
      )}
    </AppShell>
  );
};

export default Profile;
