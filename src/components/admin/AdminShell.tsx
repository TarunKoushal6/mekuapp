import { ReactNode } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { LayoutDashboard, Users, ShieldCheck } from "lucide-react";
import { useIsAdmin } from "@/hooks/useIsAdmin";
import { Navigate } from "react-router-dom";

const navItems = [
  { to: "/admin", label: "Overview", icon: LayoutDashboard, end: true },
  { to: "/admin/users", label: "Users", icon: Users, end: false },
  { to: "/admin/verification", label: "Verification", icon: ShieldCheck, end: false },
];

export const AdminShell = ({ children, title }: { children: ReactNode; title: string }) => {
  const { isAdmin, loading } = useIsAdmin();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen bg-[hsl(220_15%_6%)] text-foreground">
        <div className="flex h-screen items-center justify-center text-sm text-muted-foreground">Loading admin…</div>
      </div>
    );
  }
  if (!isAdmin) return <Navigate to="/home" replace state={{ from: location }} />;

  return (
    <div className="min-h-screen bg-[hsl(220_15%_6%)] text-foreground">
      {/* Ambient gradient */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <div className="absolute -left-40 top-0 h-[500px] w-[500px] rounded-full bg-[radial-gradient(circle,hsl(270_90%_60%/0.18),transparent_70%)]" />
        <div className="absolute -right-40 top-1/3 h-[600px] w-[600px] rounded-full bg-[radial-gradient(circle,hsl(210_100%_55%/0.14),transparent_70%)]" />
      </div>

      <div className="relative z-10 mx-auto flex min-h-screen max-w-[1400px]">
        {/* Sidebar */}
        <aside className="hidden w-[240px] shrink-0 border-r border-white/[0.06] px-4 py-6 md:block">
          <div className="mb-8 px-2">
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-white/40">MEKU</p>
            <p className="text-[18px] font-semibold tracking-tight text-white">Admin</p>
          </div>
          <nav className="flex flex-col gap-1">
            {navItems.map(({ to, label, icon: Icon, end }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                className={({ isActive }) =>
                  `group flex items-center gap-3 rounded-xl px-3 py-2.5 text-[13.5px] font-medium transition-all ${
                    isActive
                      ? "bg-white/[0.08] text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] backdrop-blur"
                      : "text-white/60 hover:bg-white/[0.04] hover:text-white"
                  }`
                }
              >
                <Icon size={16} strokeWidth={1.8} />
                {label}
              </NavLink>
            ))}
          </nav>
        </aside>

        {/* Main */}
        <main className="min-w-0 flex-1 px-6 py-8 md:px-10">
          <header className="mb-8 flex items-baseline justify-between">
            <div>
              <h1 className="text-[28px] font-semibold tracking-[-0.02em] text-white">{title}</h1>
              <p className="mt-1 text-[13px] text-white/50">MEKU control center</p>
            </div>
          </header>
          {children}
        </main>
      </div>
    </div>
  );
};

export const GlassCard = ({ children, className = "" }: { children: ReactNode; className?: string }) => (
  <div
    className={`rounded-2xl border border-white/[0.07] bg-white/[0.03] p-6 shadow-[0_1px_0_rgba(255,255,255,0.04)_inset,0_20px_60px_-30px_rgba(0,0,0,0.7)] backdrop-blur-xl ${className}`}
  >
    {children}
  </div>
);
