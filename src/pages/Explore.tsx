import { AppShell } from "@/components/meku/AppShell";
import { TopBar } from "@/components/meku/TopBar";
import { Avatar } from "@/components/meku/Avatar";
import { Logo } from "@/components/meku/Logo";
import { Search } from "lucide-react";

const collections = [
  { title: "Slow Mornings", count: 24, author: "Mira Okafor" },
  { title: "Studio Notes", count: 18, author: "Sōta Lin" },
  { title: "Field Recordings", count: 12, author: "Aïcha Devereaux" },
  { title: "Long Reads", count: 36, author: "Idris Vahn" },
];

const people = [
  { name: "Mira Okafor", handle: "mira", bio: "Essays on craft & attention." },
  { name: "Sōta Lin", handle: "sota", bio: "Industrial designer, Tokyo." },
  { name: "Aïcha Devereaux", handle: "aicha", bio: "Journalist. Slow news." },
  { name: "Idris Vahn", handle: "idris", bio: "Woodworker & writer." },
];

const Explore = () => {
  return (
    <AppShell>
      <TopBar left={<div className="pl-3"><Logo size={22} /></div>} />

      {/* Editorial header */}
      <section className="px-3 pb-5 pt-6">
        <p className="t-eyebrow text-muted-foreground">Discover</p>
        <h1 className="mt-3 font-serif text-[44px] leading-[1.02] tracking-[-0.025em] text-foreground">
          A quieter way to <span className="font-serif-italic">find good work.</span>
        </h1>
      </section>

      {/* Search — large, calm, single hairline */}
      <div className="px-3">
        <label className="flex items-center gap-3 hairline-b py-3">
          <Search className="h-[18px] w-[18px] text-muted-foreground" strokeWidth={1.4} />
          <input
            placeholder="Search people, essays, collections"
            className="flex-1 bg-transparent t-body text-foreground outline-none placeholder:text-muted-foreground"
          />
        </label>
      </div>

      {/* Collections — editorial list, not a tile grid */}
      <section className="mt-8 px-3">
        <p className="t-eyebrow mb-3 text-muted-foreground">Collections</p>
        <ul>
          {collections.map((c, i) => (
            <li key={c.title}>
              <button className="tap group flex w-full items-baseline justify-between gap-4 py-4 text-left">
                <div className="min-w-0">
                  <p className="font-serif text-[26px] leading-[1.1] tracking-[-0.015em] text-foreground">
                    {c.title}
                  </p>
                  <p className="mt-1 t-caption text-muted-foreground">
                    {c.author} · {c.count} pieces
                  </p>
                </div>
                <span className="t-caption tabular-nums text-muted-foreground">
                  {String(i + 1).padStart(2, "0")}
                </span>
              </button>
              {i < collections.length - 1 && <div className="hairline-b" />}
            </li>
          ))}
        </ul>
      </section>

      {/* People — same restraint */}
      <section className="mt-8 px-3 pb-8">
        <p className="t-eyebrow mb-3 text-muted-foreground">People to read</p>
        <ul>
          {people.map((p, i) => (
            <li key={p.handle}>
              <div className="flex items-center gap-3 py-4">
                <Avatar name={p.name} size="md" />
                <div className="min-w-0 flex-1">
                  <p className="t-body font-medium text-foreground">{p.name}</p>
                  <p className="truncate t-caption text-muted-foreground">{p.bio}</p>
                </div>
                <button className="tap t-caption text-foreground">Follow</button>
              </div>
              {i < people.length - 1 && <div className="hairline-b" />}
            </li>
          ))}
        </ul>
      </section>
    </AppShell>
  );
};

export default Explore;
