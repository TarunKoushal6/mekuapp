import { NavLink, useLocation } from "react-router-dom";
import { Home, Compass, Plus, MessageSquare, User } from "lucide-react";
import { cn } from "@/lib/utils";

const items = [
  { to: "/", label: "Home", icon: Home },
  { to: "/explore", label: "Explore", icon: Compass },
  { to: "/create", label: "Create", icon: Plus, primary: true },
  { to: "/inbox", label: "Inbox", icon: MessageSquare },
  { to: "/profile", label: "Profile", icon: User },
];

/**
 * Bottom nav — "should disappear visually".
 * Single hairline, thin Lucide, no labels, centered create.
 */
export const BottomNav = () => {
  const { pathname } = useLocation();
  return (
    <nav
      aria-label="Primary"
      className="fixed inset-x-0 bottom-0 z-40 hairline-t bg-background/85 backdrop-blur-xl"
      style={{ paddingBottom: "max(env(safe-area-inset-bottom), 8px)" }}
    >
      <ul className="mx-auto flex h-[56px] max-w-[440px] items-center justify-between px-6">
        {items.map(({ to, label, icon: Icon, primary }) => {
          const active = pathname === to || (to === "/" && pathname === "/index");
          if (primary) {
            return (
              <li key={to} className="flex flex-1 justify-center">
                <NavLink
                  to={to}
                  aria-label={label}
                  className="tap inline-flex h-[40px] w-[40px] items-center justify-center rounded-full bg-foreground text-background"
                >
                  <Icon className="h-[18px] w-[18px]" strokeWidth={1.75} />
                </NavLink>
              </li>
            );
          }
          return (
            <li key={to} className="flex flex-1 justify-center">
              <NavLink
                to={to}
                aria-label={label}
                className={cn(
                  "tap inline-flex h-[40px] w-[40px] items-center justify-center rounded-full",
                  active ? "text-foreground" : "text-muted-foreground"
                )}
              >
                <Icon className="h-[20px] w-[20px]" strokeWidth={active ? 1.75 : 1.4} />
              </NavLink>
            </li>
          );
        })}
      </ul>
    </nav>
  );
};
