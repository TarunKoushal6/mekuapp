import { AppShell } from "@/components/meku/AppShell";
import { TopBar, IconButton } from "@/components/meku/TopBar";
import { Logo } from "@/components/meku/Logo";
import { EmptyState } from "@/components/meku/EmptyState";
import { ChevronLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Notifications = () => {
  const navigate = useNavigate();
  const items: { id: string }[] = [];

  return (
    <AppShell>
      <TopBar
        left={
          <IconButton ariaLabel="Back" onClick={() => navigate(-1)}>
            <ChevronLeft className="h-[22px] w-[22px]" strokeWidth={1.6} />
          </IconButton>
        }
        title={<span className="text-[15px] font-bold">Notifications</span>}
      />

      <section className="px-4 pb-4 pt-4">
        <h1 className="t-h2 text-foreground">Activity</h1>
      </section>

      {items.length === 0 ? (
        <EmptyState
          pose="caughtup"
          title="You're all caught up"
          description="New replies, follows and mentions will appear here."
        />
      ) : null}
    </AppShell>
  );
};

export default Notifications;
