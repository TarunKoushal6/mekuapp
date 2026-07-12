import { ReactNode, useState } from "react";
import { useLocation } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";
import { BottomNav } from "./BottomNav";
import { ComposerSheet } from "./ComposerSheet";
import { IconCompose } from "./MekuIcon";
import { haptic } from "@/lib/haptics";

interface AppShellProps {
  children: ReactNode;
  /** Hide bottom nav (e.g. focus screens like Create). */
  hideNav?: boolean;
  /** Hide the floating compose button. */
  hideCompose?: boolean;
}

export const AppShell = ({ children, hideNav, hideCompose }: AppShellProps) => {
  const [composerOpen, setComposerOpen] = useState(false);
  const { pathname } = useLocation();
  const reduce = useReducedMotion();
  // Compose FAB is a home-only affordance.
  const isHome = pathname === "/" || pathname === "/home";
  const showFab = !hideNav && !hideCompose && isHome;

  return (
    <div className="min-h-screen overflow-x-hidden bg-background">
      <div className="mx-auto flex min-h-screen w-full max-w-[440px] flex-col overflow-x-hidden">
        <main className={hideNav ? "flex-1 min-w-0" : "flex-1 min-w-0 pb-[88px]"}>
          {children}
        </main>
      </div>
      {showFab && (
        <motion.button
          aria-label="Create post"
          onClick={() => { haptic("medium"); setComposerOpen(true); }}
          className="fixed z-40 inline-flex h-[56px] w-[56px] items-center justify-center rounded-full gradient-purple text-primary-foreground shadow-[0_14px_36px_-10px_hsl(252_95%_40%/0.55)] ring-4 ring-background"
          style={{
            right: "max(env(safe-area-inset-right), 16px)",
            bottom: "calc(max(env(safe-area-inset-bottom), 6px) + 82px)",
            WebkitTapHighlightColor: "transparent",
            transformOrigin: "bottom right",
          }}
          initial={reduce ? false : { opacity: 0, scale: 0.6 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={reduce ? undefined : { opacity: 0, scale: 0.6 }}
          whileTap={reduce ? undefined : { scale: 0.9 }}
          transition={{ type: "spring", stiffness: 480, damping: 26, mass: 0.7 }}
        >
          <IconCompose size={24} strokeWidth={2} />
        </motion.button>
      )}
      <ComposerSheet open={composerOpen} onOpenChange={setComposerOpen} />
      {!hideNav && <BottomNav />}
    </div>
  );
};
