import { NavLink, useLocation } from "react-router-dom";
import { Home, Search, Plus, Inbox, User } from "lucide-react";
import { cn } from "@/lib/utils";

const items = [
  { to: "/", label: "Home", icon: Home },
  { to: "/explore", label: "Explore", icon: Search },
  { to: "/create", label: "Create", icon: Plus, primary: true },
  { to: "/inbox", label: "Inbox", icon: Inbox },
  { to: "/profile", label: "Profile", icon: User },
];

export const BottomNav = () => {
  const { pathname } = useLocation();
  return (
    <nav
      aria-label="Primary"
      className="fixed inset-x-0 bottom-0 z-40 border-t hairline bg-background/85 backdrop-blur-xl"
      style={{ paddingBottom: "max(env(safe-area-inset-bottom), 0.5rem)" }}
    >
      <ul className="mx-auto flex max-w-md items-center justify-between px-6 pt-2">
        {items.map(({ to, label, icon: Icon, primary }) => {
          const active = pathname === to;
          if (primary) {
            return (
              <li key={to} className="flex-1 flex justify-center">
                <NavLink
                  to={to}
                  aria-label={label}
                  className="meku-tap -mt-6 flex h-12 w-12 items-center justify-center rounded-full bg-foreground text-background shadow-card"
                >
                  <Icon className="h-[18px] w-[18px]" strokeWidth={2.25} />
                </NavLink>
              </li>
            );
          }
          return (
            <li key={to} className="flex-1">
              <NavLink
                to={to}
                aria-label={label}
                className={cn(
                  "meku-tap mx-auto flex flex-col items-center gap-1 py-2 text-[10px] tracking-wide uppercase",
                  active ? "text-foreground" : "text-muted-foreground"
                )}
              >
                <Icon
                  className={cn("h-[20px] w-[20px]", active ? "opacity-100" : "opacity-70")}
                  strokeWidth={active ? 2 : 1.5}
                />
                <span className="text-[10px] font-medium">{label}</span>
              </NavLink>
            </li>
          );
        })}
      </ul>
    </nav>
  );
};
