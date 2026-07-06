import { useEffect, useState } from "react";
import { AdminShell, GlassCard } from "@/components/admin/AdminShell";
import { supabase } from "@/integrations/supabase/client";
import { VerificationBadge } from "@/components/meku/VerificationBadge";
import { Avatar } from "@/components/meku/Avatar";
import { Search } from "lucide-react";
import { toast } from "sonner";

interface Row {
  id: string;
  username: string | null;
  display_name: string | null;
  avatar_url: string | null;
  verification_kind: "none" | "verified" | "premium";
  created_at: string;
}

const AdminUsers = () => {
  const [rows, setRows] = useState<Row[]>([]);
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("profiles")
      .select("id, username, display_name, avatar_url, verification_kind, created_at")
      .order("created_at", { ascending: false })
      .limit(200);
    setRows((data as any) ?? []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const filtered = rows.filter((r) => {
    if (!q) return true;
    const s = q.toLowerCase();
    return (r.username ?? "").toLowerCase().includes(s) || (r.display_name ?? "").toLowerCase().includes(s);
  });

  const setKind = async (id: string, kind: Row["verification_kind"]) => {
    const { error } = await supabase.from("profiles").update({ verification_kind: kind }).eq("id", id);
    if (error) { toast.error(error.message); return; }
    setRows((rs) => rs.map((r) => (r.id === id ? { ...r, verification_kind: kind } : r)));
    toast.success(kind === "none" ? "Badge removed" : `Marked as ${kind}`);
  };

  return (
    <AdminShell title="Users">
      <GlassCard className="p-0">
        <div className="flex items-center justify-between border-b border-white/[0.05] px-5 py-4">
          <div className="relative">
            <Search size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search users…"
              className="w-[280px] rounded-xl border border-white/[0.06] bg-white/[0.03] py-2 pl-9 pr-3 text-[13px] text-white placeholder:text-white/40 outline-none focus:border-white/20"
            />
          </div>
          <p className="text-[12px] text-white/40">{filtered.length} users</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left text-[11px] font-semibold uppercase tracking-wider text-white/40">
                <th className="px-5 py-3">User</th>
                <th className="px-5 py-3">Handle</th>
                <th className="px-5 py-3">Badge</th>
                <th className="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr><td colSpan={4} className="px-5 py-10 text-center text-[13px] text-white/40">Loading…</td></tr>
              )}
              {!loading && filtered.map((r) => (
                <tr key={r.id} className="border-t border-white/[0.04] hover:bg-white/[0.02]">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <Avatar name={r.display_name ?? r.username ?? "?"} src={r.avatar_url ?? undefined} size="sm" />
                      <div className="flex items-center gap-1.5">
                        <span className="text-[13.5px] font-medium text-white">{r.display_name ?? r.username ?? "—"}</span>
                        <VerificationBadge kind={r.verification_kind} size={13} />
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-[13px] text-white/60">@{r.username ?? "—"}</td>
                  <td className="px-5 py-3 text-[12px] capitalize text-white/70">{r.verification_kind}</td>
                  <td className="px-5 py-3">
                    <div className="flex justify-end gap-2">
                      <ActionButton active={r.verification_kind === "verified"} onClick={() => setKind(r.id, "verified")} tone="blue">Verify</ActionButton>
                      <ActionButton active={r.verification_kind === "premium"} onClick={() => setKind(r.id, "premium")} tone="purple">Premium</ActionButton>
                      <ActionButton active={r.verification_kind === "none"} onClick={() => setKind(r.id, "none")} tone="ghost">Remove</ActionButton>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </GlassCard>
    </AdminShell>
  );
};

const ActionButton = ({
  children, onClick, active, tone,
}: { children: React.ReactNode; onClick: () => void; active?: boolean; tone: "blue" | "purple" | "ghost" }) => {
  const styles =
    tone === "blue"
      ? active ? "bg-blue-500/20 text-blue-200 border-blue-400/30" : "text-blue-200/80 border-blue-400/15 hover:bg-blue-500/10"
      : tone === "purple"
      ? active ? "bg-purple-500/20 text-purple-200 border-purple-400/30" : "text-purple-200/80 border-purple-400/15 hover:bg-purple-500/10"
      : active ? "bg-white/[0.08] text-white border-white/10" : "text-white/60 border-white/[0.08] hover:bg-white/[0.05]";
  return (
    <button
      onClick={onClick}
      className={`rounded-lg border px-2.5 py-1.5 text-[11.5px] font-medium transition ${styles}`}
    >
      {children}
    </button>
  );
};

export default AdminUsers;
