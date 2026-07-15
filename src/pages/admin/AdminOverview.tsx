import { useEffect, useState } from "react";
import { AdminShell, GlassCard } from "@/components/admin/AdminShell";
import { supabase } from "@/integrations/supabase/client";
import {
  Users, ShieldCheck, FileText, Crown, MessageSquare, Heart, ArrowUpRight,
} from "lucide-react";
import { Link } from "react-router-dom";

interface Stat {
  label: string;
  value: number | string;
  hint?: string;
  icon: any;
  accent: string;
  ring: string;
}

const AdminOverview = () => {
  const [stats, setStats] = useState<Stat[]>([]);
  const [recent, setRecent] = useState<
    { id: string; username: string | null; display_name: string | null; created_at: string; verification_kind: string }[]
  >([]);

  useEffect(() => {
    (async () => {
      const [
        { count: users },
        { count: verified },
        { count: premium },
        { count: posts },
        { count: comments },
        { count: likes },
        { count: admins },
        { data: latest },
      ] = await Promise.all([
        supabase.from("profiles").select("*", { count: "exact", head: true }),
        supabase.from("profiles").select("*", { count: "exact", head: true }).eq("verification_kind", "verified"),
        supabase.from("profiles").select("*", { count: "exact", head: true }).eq("verification_kind", "premium"),
        supabase.from("posts").select("*", { count: "exact", head: true }),
        supabase.from("comments").select("*", { count: "exact", head: true }),
        supabase.from("post_likes").select("*", { count: "exact", head: true }),
        supabase.from("user_roles").select("*", { count: "exact", head: true }).eq("role", "admin"),
        supabase.from("profiles").select("id, username, display_name, created_at, verification_kind").order("created_at", { ascending: false }).limit(6),
      ]);
      setStats([
        { label: "Total users", value: users ?? 0, icon: Users, accent: "from-sky-400/25 to-sky-600/5", ring: "ring-sky-400/20" },
        { label: "Blue verified", value: verified ?? 0, hint: "50% reach", icon: ShieldCheck, accent: "from-blue-400/25 to-blue-600/5", ring: "ring-blue-400/20" },
        { label: "Purple premium", value: premium ?? 0, hint: "100% reach", icon: Crown, accent: "from-purple-400/25 to-purple-600/5", ring: "ring-purple-400/20" },
        { label: "Admins", value: admins ?? 0, icon: ShieldCheck, accent: "from-emerald-400/25 to-emerald-600/5", ring: "ring-emerald-400/20" },
        { label: "Posts", value: posts ?? 0, icon: FileText, accent: "from-white/15 to-white/5", ring: "ring-white/10" },
        { label: "Comments", value: comments ?? 0, icon: MessageSquare, accent: "from-white/15 to-white/5", ring: "ring-white/10" },
        { label: "Likes", value: likes ?? 0, icon: Heart, accent: "from-rose-400/25 to-rose-600/5", ring: "ring-rose-400/20" },
      ]);
      setRecent((latest as any) ?? []);
    })();
  }, []);

  return (
    <AdminShell title="Overview">
      {/* Primary stats — 4-up on desktop, natural wrap on mobile. */}
      <section>
        <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-white/40">Community</p>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {stats.slice(0, 4).map((s) => (
            <StatCard key={s.label} s={s} />
          ))}
        </div>
      </section>

      <section className="mt-8">
        <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-white/40">Content</p>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
          {stats.slice(4).map((s) => (
            <StatCard key={s.label} s={s} />
          ))}
        </div>
      </section>

      <section className="mt-8 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <GlassCard className="lg:col-span-2 p-0">
          <div className="flex items-center justify-between border-b border-white/[0.05] px-5 py-4">
            <div>
              <p className="text-[13px] font-semibold text-white">Newest members</p>
              <p className="text-[11.5px] text-white/40">Last {recent.length} sign-ups</p>
            </div>
            <Link to="/admin/users" className="text-[12px] font-medium text-white/70 hover:text-white">View all →</Link>
          </div>
          <ul className="divide-y divide-white/[0.04]">
            {recent.length === 0 && (
              <li className="px-5 py-10 text-center text-[13px] text-white/40">Loading…</li>
            )}
            {recent.map((r) => (
              <li key={r.id} className="flex items-center gap-3 px-5 py-3 hover:bg-white/[0.02]">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/[0.06] text-[12px] font-semibold text-white/70">
                  {(r.display_name || r.username || "?").slice(0, 1).toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[13px] font-medium text-white">{r.display_name ?? r.username ?? "—"}</p>
                  <p className="truncate text-[11.5px] text-white/40">@{r.username ?? "—"} · {new Date(r.created_at).toLocaleDateString()}</p>
                </div>
                {r.verification_kind !== "none" && (
                  <span className={`rounded-full px-2 py-0.5 text-[10.5px] font-medium capitalize ${
                    r.verification_kind === "premium" ? "bg-purple-500/15 text-purple-200" : "bg-blue-500/15 text-blue-200"
                  }`}>
                    {r.verification_kind}
                  </span>
                )}
              </li>
            ))}
          </ul>
        </GlassCard>

        <GlassCard>
          <p className="text-[13px] font-semibold text-white">Quick actions</p>
          <div className="mt-4 flex flex-col gap-2">
            <QuickLink to="/admin/users" label="Manage users" />
            <QuickLink to="/admin/verification" label="Verification center" />
            <QuickLink to="/premium" label="Premium rules" />
          </div>

          <div className="mt-6 rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
            <p className="text-[12px] font-semibold text-white">System</p>
            <div className="mt-2 flex items-center justify-between text-[12px] text-white/60">
              <span>All services</span>
              <span className="rounded-full bg-emerald-400/10 px-2 py-0.5 text-[11px] font-medium text-emerald-300">OK</span>
            </div>
          </div>
        </GlassCard>
      </section>
    </AdminShell>
  );
};

const StatCard = ({ s }: { s: Stat }) => (
  <GlassCard className={`relative overflow-hidden p-4 ring-1 ${s.ring}`}>
    <div className={`pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full bg-gradient-to-br ${s.accent} blur-2xl`} />
    <div className="relative">
      <div className="flex items-center justify-between">
        <p className="text-[11px] font-medium uppercase tracking-wider text-white/50">{s.label}</p>
        <s.icon size={14} className="text-white/60" strokeWidth={1.6} />
      </div>
      <p className="mt-3 text-[26px] font-semibold tracking-[-0.02em] text-white tabular-nums">{s.value}</p>
      {s.hint && <p className="mt-0.5 text-[11px] text-white/40">{s.hint}</p>}
    </div>
  </GlassCard>
);

const QuickLink = ({ to, label }: { to: string; label: string }) => (
  <Link
    to={to}
    className="group flex items-center justify-between rounded-xl border border-white/[0.06] bg-white/[0.03] px-4 py-3 text-[13px] text-white/80 transition hover:bg-white/[0.06]"
  >
    <span>{label}</span>
    <ArrowUpRight size={14} className="text-white/40 transition group-hover:text-white group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
  </Link>
);

export default AdminOverview;
