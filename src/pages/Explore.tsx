import { AppShell } from "@/components/meku/AppShell";
import { ScreenHeader } from "@/components/meku/ScreenHeader";
import { Avatar } from "@/components/meku/Avatar";
import { Search } from "lucide-react";

const collections = [
  { title: "Slow Mornings", count: 24, hue: "bg-[hsl(40_30%_92%)]" },
  { title: "Studio Notes", count: 18, hue: "bg-[hsl(220_14%_94%)]" },
  { title: "Field Recordings", count: 12, hue: "bg-[hsl(160_18%_92%)]" },
  { title: "Long Reads", count: 36, hue: "bg-[hsl(20_30%_92%)]" },
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
      <ScreenHeader
        title={<span className="font-serif-display italic">Explore</span>}
        subtitle="A quieter way to find good work."
      />

      <div className="px-5">
        <div className="flex items-center gap-3 rounded-full border hairline bg-surface px-4 py-3">
          <Search className="h-[18px] w-[18px] text-muted-foreground" strokeWidth={1.5} />
          <input
            placeholder="Search people, essays, collections"
            className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
          />
        </div>
      </div>

      <section className="mt-10 px-5">
        <h2 className="mb-4 text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
          Collections
        </h2>
        <div className="grid grid-cols-2 gap-3">
          {collections.map((c) => (
            <button
              key={c.title}
              className={"meku-tap aspect-[5/6] rounded-xl border hairline p-4 text-left " + c.hue}
            >
              <p className="font-serif-display text-2xl leading-tight tracking-tightish text-foreground">
                {c.title}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">{c.count} pieces</p>
            </button>
          ))}
        </div>
      </section>

      <section className="mt-10 px-5">
        <h2 className="mb-2 text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
          People to read
        </h2>
        <ul className="divide-y hairline">
          {people.map((p) => (
            <li key={p.handle} className="flex items-center gap-3 py-4">
              <Avatar name={p.name} size="lg" />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-foreground">{p.name}</p>
                <p className="truncate text-xs text-muted-foreground">@{p.handle} · {p.bio}</p>
              </div>
              <button className="meku-tap rounded-full border hairline px-3.5 py-1.5 text-xs text-foreground">
                Follow
              </button>
            </li>
          ))}
        </ul>
      </section>
    </AppShell>
  );
};

export default Explore;
