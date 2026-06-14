import { AppShell } from "@/components/meku/AppShell";
import { TopBar } from "@/components/meku/TopBar";
import { Logo } from "@/components/meku/Logo";
import { EmptyState } from "@/components/meku/EmptyState";
import { IconSearch } from "@/components/meku/MekuIcon";
import { useState } from "react";

const Explore = () => {
  const [q, setQ] = useState("");
  const results: { id: string }[] = [];

  return (
    <AppShell>
      <TopBar left={<div className="pl-3"><Logo size={20} /></div>} />

      <section className="px-4 pb-4 pt-4">
        <h1 className="t-h2 text-foreground">Explore</h1>
      </section>

      <div className="px-4">
        <label className="flex h-[48px] items-center gap-3 rounded-full bg-surface-2 px-4">
          <IconSearch size={18} />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search people, posts, collections"
            className="flex-1 bg-transparent text-[15px] text-foreground outline-none placeholder:text-muted-foreground"
          />
        </label>
      </div>

      {q.length === 0 ? (
        <EmptyState
          pose="searching"
          title="Find your people"
          description="Search by name, handle, or what they're building."
        />
      ) : results.length === 0 ? (
        <EmptyState
          pose="thinking"
          title={`No results for "${q}"`}
          description="Try a different name or topic."
        />
      ) : null}
    </AppShell>
  );
};

export default Explore;
