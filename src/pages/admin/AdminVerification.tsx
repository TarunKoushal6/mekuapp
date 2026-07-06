import { useEffect, useState } from "react";
import { AdminShell, GlassCard } from "@/components/admin/AdminShell";
import { supabase } from "@/integrations/supabase/client";
import { VerificationBadge } from "@/components/meku/VerificationBadge";
import { Avatar } from "@/components/meku/Avatar";
import { toast } from "sonner";

interface Row {
  id: string;
  username: string | null;
  display_name: string | null;
  avatar_url: string | null;
  verification_kind: "none" | "verified" | "premium";
}

const AdminVerification = () => {
  const [rows, setRows] = useState<Row[]>([]);
  const [tab, setTab] = useState<"verified" | "premium" | "none">("verified");
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("profiles")
      .select("id, username, display_name, avatar_url, verification_kind")
      .order("created_at", { ascending: false })
      .limit(500);
    setRows((data as any) ?? []);
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const setKind = async (id: string, kind: Row["verification_kind"]) => {
    const { error } = await supabase.from("profiles").update({ verification_kind: kind }).eq("id", id);
    if (error) { toast.error(error.message); return; }
    setRows((rs) => rs.map((r) => (r.id === id ? { ...r, verification_kind: kind } : r)));
    toast.success(kind === "none" ? "Badge removed" : `Granted ${kind}`);
  };

  const filtered = rows.filter((r) => r.verification_kind === tab);
  const counts = {
    verified: rows.filter((r) => r.verification_kind === "verified").length,
    premium: rows.filter((r) => r.verification_kind === "premium").length,
    none: rows.filter((r) => r.verification_kind === "none").length,
  };

  return (
    <AdminShell title="Verification Center">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <GlassCard>
          <div className="flex items-center gap-3">
            <VerificationBadge kind="verified" size={22} />
            <div>
              <p className="text-[13px] font-semibold text-white">Blue — Verified individuals</p>
              <p className="text-[12px] text-white/50">Notable, authentic accounts</p>
            </div>
            <p className="ml-auto text-[22px] font-semibold tabular-nums text-white">{counts.verified}</p>
          </div>
        </GlassCard>
        <GlassCard>
          <div className="flex items-center gap-3">
            <VerificationBadge kind="premium" size={22} />
            <div>
              <p className="text-[13px] font-semibold text-white">Purple — Premium / Official</p>
              <p className="text-[12px] text-white/50">Partners, brands and official accounts</p>
            </div>
            <p className="ml-auto text-[22px] font-semibold tabular-nums text-white">{counts.premium}</p>
          </div>
        </GlassCard>
      </div>

      <GlassCard className="mt-6 p-0">
        <div className="flex items-center gap-1 border-b border-white/[0.05] px-4 pt-4">
          {(["verified", "premium", "none"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`relative px-4 py-2.5 text-[12.5px] font-medium capitalize transition ${
                tab === t ? "text-white" : "text-white/50 hover:text-white/80"
              }`}
            >
              {t === "none" ? "Unverified" : t}
              <span className="ml-1.5 text-white/40">({counts[t]})</span>
              {tab === t && <span className="absolute inset-x-3 -bottom-px h-[2px] rounded-full bg-white" />}
            </button>
          ))}
        </div>

        <div className="divide-y divide-white/[0.04]">
          {loading && <p className="px-5 py-10 text-center text-[13px] text-white/40">Loading…</p>}
          {!loading && filtered.length === 0 && (
            <p className="px-5 py-10 text-center text-[13px] text-white/40">No accounts in this bucket.</p>
          )}
          {filtered.slice(0, 100).map((r) => (
            <div key={r.id} className="flex items-center gap-3 px-5 py-3 hover:bg-white/[0.02]">
              <Avatar name={r.display_name ?? r.username ?? "?"} src={r.avatar_url ?? undefined} size="sm" />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <p className="truncate text-[13.5px] font-medium text-white">{r.display_name ?? r.username ?? "—"}</p>
                  <VerificationBadge kind={r.verification_kind} size={13} />
                </div>
                <p className="truncate text-[12px] text-white/50">@{r.username ?? "—"}</p>
              </div>
              <div className="flex gap-2">
                {r.verification_kind !== "verified" && (
                  <button onClick={() => setKind(r.id, "verified")} className="rounded-lg border border-blue-400/20 bg-blue-500/10 px-3 py-1.5 text-[11.5px] font-medium text-blue-200 transition hover:bg-blue-500/20">
                    Grant blue
                  </button>
                )}
                {r.verification_kind !== "premium" && (
                  <button onClick={() => setKind(r.id, "premium")} className="rounded-lg border border-purple-400/20 bg-purple-500/10 px-3 py-1.5 text-[11.5px] font-medium text-purple-200 transition hover:bg-purple-500/20">
                    Grant purple
                  </button>
                )}
                {r.verification_kind !== "none" && (
                  <button onClick={() => setKind(r.id, "none")} className="rounded-lg border border-white/[0.08] px-3 py-1.5 text-[11.5px] font-medium text-white/70 transition hover:bg-white/[0.05]">
                    Remove
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </GlassCard>
    </AdminShell>
  );
};

export default AdminVerification;
