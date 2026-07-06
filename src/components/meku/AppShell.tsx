import { ReactNode } from "react";
import { BottomNav } from "./BottomNav";

interface AppShellProps {
  children: ReactNode;
  /** Hide bottom nav (e.g. focus screens like Create). */
  hideNav?: boolean;
}

export const AppShell = ({ children, hideNav }: AppShellProps) => {
  return (
    <div className="min-h-screen overflow-x-hidden bg-background">
      <div className="mx-auto flex min-h-screen w-full max-w-[440px] flex-col overflow-x-hidden">
        <main className={(hideNav ? "flex-1 min-w-0" : "flex-1 min-w-0 pb-[88px]") + " meku-page-in"}>{children}</main>
      </div>
      {!hideNav && <BottomNav />}
    </div>
  );
};
