import { AppShell } from "@/components/meku/AppShell";
import { ChevronLeft, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { getProfile, updateProfile, type Profile } from "@/lib/social";
import { toast } from "sonner";

const EditProfile = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [p, setP] = useState<Profile | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => { if (user) getProfile(user.id).then(setP); }, [user]);

  const save = async () => {
    if (!user || !p) return;
    setBusy(true);
    try {
      await updateProfile(user.id, {
        username: p.username,
        display_name: p.display_name,
        bio: p.bio,
        avatar_url: p.avatar_url,
      });
      toast.success("Saved");
      navigate(-1);
    } catch (e: any) {
      toast.error(e.message ?? "Could not save");
    } finally { setBusy(false); }
  };

  if (!p) return <AppShell hideNav><div className="flex min-h-svh items-center justify-center"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div></AppShell>;

  return (
    <AppShell hideNav>
      <header className="sticky top-0 z-30 flex h-[56px] items-center justify-between bg-background/90 px-3 backdrop-blur-xl">
        <button onClick={() => navigate(-1)} className="tap inline-flex h-10 w-10 items-center justify-center rounded-full">
          <ChevronLeft className="h-[22px] w-[22px]" strokeWidth={1.6} />
        </button>
        <h1 className="text-[15px] font-bold">Edit profile</h1>
        <button onClick={save} disabled={busy} className="tap rounded-full bg-primary px-4 py-1.5 text-[13px] font-bold text-primary-foreground disabled:opacity-40">
          {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save"}
        </button>
      </header>

      <div className="space-y-4 px-4 py-4">
        {[
          { label: "Display name", key: "display_name", placeholder: "Your name" },
          { label: "Username", key: "username", placeholder: "handle" },
          { label: "Avatar URL", key: "avatar_url", placeholder: "https://…" },
        ].map((f) => (
          <label key={f.key} className="block">
            <span className="block pb-1 text-[12px] font-bold uppercase tracking-wider text-muted-foreground">{f.label}</span>
            <input
              value={(p as any)[f.key] ?? ""}
              onChange={(e) => setP({ ...p, [f.key]: e.target.value } as Profile)}
              placeholder={f.placeholder}
              className="h-[48px] w-full rounded-2xl border border-border bg-surface px-3 text-[15px] outline-none focus:border-primary"
            />
          </label>
        ))}
        <label className="block">
          <span className="block pb-1 text-[12px] font-bold uppercase tracking-wider text-muted-foreground">Bio</span>
          <textarea
            rows={4}
            value={p.bio ?? ""}
            onChange={(e) => setP({ ...p, bio: e.target.value })}
            placeholder="Tell people what you're building."
            className="w-full resize-none rounded-2xl border border-border bg-surface px-3 py-2 text-[15px] outline-none focus:border-primary"
          />
        </label>
      </div>
    </AppShell>
  );
};

export default EditProfile;
