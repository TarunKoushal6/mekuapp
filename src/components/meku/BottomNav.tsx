import { NavLink, useLocation } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";
import { haptic } from "@/lib/haptics";
import {
  IconHome,
  IconSearch,
  IconWallet,
  IconMessages,
  IconCompass,
} from "./MekuIcon";

const items = [
  { to: "/home", label: "Home", icon: IconHome },
  { to: "/explore", label: "Search", icon: IconSearch },
  { to: "/wallet", label: "Wallet", icon: IconWallet },
  { to: "/browser", label: "Browser", icon: IconCompass },
  { to: "/inbox", label: "Chat", icon: IconMessages },
];

export const BottomNav = () => {
  const { pathname } = useLocation();
  const reduce = useReducedMotion();

  return (
    <nav
      aria-label="Primary"
      className="fixed inset-x-0 bottom-0 z-40"
      style={{ paddingBottom: "max(env(safe-area-inset-bottom), 6px)" }}
    >
      {/* Scroll-edge fade — bridges page content into the floating pill.
          Taste: no hard hairline; softer material read. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 -top-6 h-6"
        style={{
          background:
            "linear-gradient(to top, hsl(var(--background) / 0.85), hsl(var(--background) / 0))",
        }}
      />
      <div className="mx-auto max-w-[440px] px-3 pt-1.5">
        <ul
          className="glass-floating flex h-[62px] items-center justify-between rounded-[22px] px-2"
          style={{ boxShadow: "0 12px 40px -14px hsl(var(--primary) / 0.28), var(--shadow-2)" }}
        >
          {items.map(({ to, label, icon: Icon }) => {
            const active =
              pathname === to || (to !== "/home" && pathname.startsWith(to));
            return (
              <li key={to} className="flex flex-1 justify-center">
                <NavLink
                  to={to}
                  aria-label={label}
                  onClick={() => haptic("selection")}
                  className={cn(
                    "relative inline-flex h-[44px] w-[44px] items-center justify-center rounded-full outline-none",
                    "transition-colors duration-[var(--d2)] ease-[cubic-bezier(0.23,1,0.32,1)]",
                    active ? "text-primary" : "text-muted-foreground",
                  )}
                  style={{ WebkitTapHighlightColor: "transparent" }}
                >
                  {({ isActive }) => {
                    const isOn = isActive || active;
                    return (
                      <motion.span
                        className="relative inline-flex h-11 w-11 items-center justify-center"
                        whileTap={reduce ? undefined : { scale: 0.88 }}
                        transition={{ type: "spring", stiffness: 520, damping: 26, mass: 0.6 }}
                      >
                        {isOn && (
                          <motion.span
                            layoutId="bottomnav-pill"
                            className="absolute inset-0 rounded-full bg-primary/12 ring-1 ring-primary/15"
                            transition={
                              reduce
                                ? { duration: 0.15 }
                                : { type: "spring", stiffness: 480, damping: 34, mass: 0.7 }
                            }
                          />
                        )}
                        <motion.span
                          className="relative inline-flex"
                          animate={reduce ? undefined : { y: isOn ? -1 : 0, scale: isOn ? 1.06 : 1 }}
                          transition={{ type: "spring", stiffness: 500, damping: 28, mass: 0.6 }}
                        >
                          <Icon size={22} strokeWidth={isOn ? 2.2 : 1.7} />
                        </motion.span>
                      </motion.span>
                    );
                  }}
                </NavLink>
              </li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
};
