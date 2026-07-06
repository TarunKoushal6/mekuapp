import { useEffect, useState } from "react";
import { AdminShell, GlassCard } from "@/components/admin/AdminShell";
import { supabase } from "@/integrations/supabase/client";
import { Users, ShieldCheck, FileText, TrendingUp } from "lucide-react";

interface Stat { label: string; value: number | string; icon: any; accent: string; }

const AdminOverview = () => {
  const [stats, setStats] = useState<Stat[]>([
    { label: "Total users", value: "—", icon: Users, accent: "from-blue-400/30 to-blue-600/10" },
    { label: "Verified", value: "—", icon: ShieldCheck, accent: "from-purple-400/30 to-purple-600/10" },
    { label: "Posts", value: "—", icon: FileText, accent: "from-white/20 to-white/5" },
    { label: "Admins", value: "—", icon: TrendingUp, accent: "from-emerald-400/30 to-emerald-600/10" },
  ]);

  useEffect(() => {
    (async () => {
      const [{ count: users }, { count: verified }, { count: posts }, { count: admins }] = await Promise.all([
        supabase.from("profiles").select("*", { count: "exact", head: true }),
        supabase.from("profiles").select("*", { count: "exact", head: true }).in("verification_kind", ["verified", "premium"]),
        supabase.from("posts").select("*", { count: "exact", head: true }),
        supabase.from("user_roles").select("*", { count: "exact", head: true }).eq("role", "admin"),
      ]);
      setStats([
        { label: "Total users", value: users ?? 0, icon: Users, accent: "from-blue-400/30 to-blue-600/10" },
        { label: "Verified", value: verified ?? 0, icon: ShieldCheck, accent: "from-purple-400/30 to-purple-600/10" },
        { label: "Posts", value: posts ?? 0, icon: FileText, accent: "from-white/20 to-white/5" },
        { label: "Admins", value: admins ?? 0, icon: TrendingUp, accent: "from-emerald-400/30 to-emerald-600/10" },
      ]);
    })();
  }, []);

  return (
    <AdminShell title="Overview">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <GlassCard key={s.label} className="relative overflow-hidden">
            <div className={`pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-gradient-to-br ${s.accent} blur-2xl`} />
            <div className="relative">
              <div className="flex items-center justify-between">
                <p className="text-[12px] font-medium uppercase tracking-wider text-white/50">{s.label}</p>
                <s.icon size={16} className="text-white/60" strokeWidth={1.6} />
              </div>
              <p className="mt-4 text-[32px] font-semibold tracking-[-0.02em] text-white tabular-nums">{s.value}</p>
            </div>
          </GlassCard>
        ))}
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <GlassCard className="lg:col-span-2">
          <p className="text-[13px] font-semibold text-white">Recent activity</p>
          <p className="mt-2 text-[13px] text-white/50">Live moderation and verification events land here.</p>
          <div className="mt-6 space-y-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="flex items-center justify-between rounded-xl border border-white/[0.05] bg-white/[0.02] px-4 py-3">
                <div>
                  <p className="text-[13px] text-white">System healthy</p>
                  <p className="text-[11.5px] text-white/40">All services operational</p>
                </div>
                <span className="rounded-full bg-emerald-400/10 px-2 py-0.5 text-[11px] font-medium text-emerald-300">OK</span>
              </div>
            ))}
          </div>
        </GlassCard>
        <GlassCard>
          <p className="text-[13px] font-semibold text-white">Quick actions</p>
          <div className="mt-4 flex flex-col gap-2">
            <a href="/admin/users" className="rounded-xl border border-white/[0.06] bg-white/[0.03] px-4 py-3 text-[13px] text-white/80 transition hover:bg-white/[0.06]">Manage users →</a>
            <a href="/admin/verification" className="rounded-xl border border-white/[0.06] bg-white/[0.03] px-4 py-3 text-[13px] text-white/80 transition hover:bg-white/[0.06]">Verification center →</a>
          </div>
        </GlassCard>
      </div>
    </AdminShell>
  );
};

export default AdminOverview;
