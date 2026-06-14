import { AppShell } from "@/components/meku/AppShell";
import { TopBar, IconButton } from "@/components/meku/TopBar";
import { Logo } from "@/components/meku/Logo";
import { EmptyState } from "@/components/meku/EmptyState";
import { IconCompose } from "@/components/meku/MekuIcon";
import { Link } from "react-router-dom";

const Inbox = () => {
  const threads: { id: string; name: string; preview: string; time: string; unread?: boolean }[] = [];

  return (
    <AppShell>
      <TopBar
        left={<div className="pl-3"><Logo size={20} /></div>}
        right={
          <IconButton ariaLabel="New message">
            <IconCompose size={20} />
          </IconButton>
        }
      />

      <section className="px-4 pb-4 pt-4">
        <h1 className="t-h2 text-foreground">Messages</h1>
      </section>

      {threads.length === 0 ? (
        <EmptyState
          pose="caughtup"
          title="No messages yet"
          description="Start a conversation with someone you follow."
          action={
            <Link
              to="/explore"
              className="tap inline-flex h-[44px] items-center rounded-full bg-foreground px-5 text-[14px] font-semibold text-background"
            >
              Find people
            </Link>
          }
        />
      ) : (
        <ul className="px-3">
          {threads.map((t) => (
            <li key={t.id}>
              <Link
                to={`/inbox/${t.id}`}
                className="tap flex w-full items-start gap-3 py-4 text-left"
              >
                <div className="text-foreground">{t.name}</div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </AppShell>
  );
};

export default Inbox;
