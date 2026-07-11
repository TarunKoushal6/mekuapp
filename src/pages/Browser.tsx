import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AppShell } from "@/components/meku/AppShell";
import { IconBack, IconRefresh, IconExternal, IconSearch } from "@/components/meku/MekuIcon";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

/**
 * In-app browser for Arc testnet products.
 * Users connect their MEKU wallet (already provisioned) and open dApps
 * without leaving the app. Uses <iframe sandbox> — many dApps forbid
 * framing (CSP/X-Frame-Options); we detect that and offer "Open in Safari".
 */
const featured = [
  { name: "Arc Explorer", url: "https://testnet.arcscan.app", desc: "Testnet block explorer" },
  { name: "Circle Faucet", url: "https://faucet.circle.com", desc: "Get testnet USDC" },
  { name: "Arc Docs", url: "https://docs.arc.network", desc: "Developer documentation" },
  { name: "Circle Developers", url: "https://developers.circle.com", desc: "APIs & SDKs" },
];

const normalizeUrl = (raw: string) => {
  const v = raw.trim();
  if (!v) return "";
  if (/^https?:\/\//i.test(v)) return v;
  if (v.includes(".") && !v.includes(" ")) return `https://${v}`;
  return `https://www.google.com/search?q=${encodeURIComponent(v)}`;
};

const Browser = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [input, setInput] = useState("");
  const [url, setUrl] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  const host = useMemo(() => {
    if (!url) return "";
    try { return new URL(url).host; } catch { return url; }
  }, [url]);

  const go = (raw: string) => {
    const u = normalizeUrl(raw);
    if (!u) return;
    if (!user) toast.message("Sign in to connect your MEKU wallet inside dApps");
    setUrl(u);
    setInput(u);
  };

  return (
    <AppShell hideNav={!!url}>
      <header className="sticky top-0 z-30 flex h-[52px] items-center gap-2 bg-background/85 px-2 backdrop-blur-xl hairline-b">
        <button
          onClick={() => (url ? setUrl(null) : navigate(-1))}
          aria-label="Back"
          className="tap inline-flex h-9 w-9 items-center justify-center rounded-full text-foreground"
        >
          <IconBack size={22} />
        </button>
        <form
          onSubmit={(e) => { e.preventDefault(); go(input); }}
          className="flex flex-1 items-center gap-2 rounded-full bg-surface-2 px-3 py-1.5"
        >
          <IconSearch size={16} className="text-muted-foreground" />
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Search or enter address"
            inputMode="url"
            autoCapitalize="off"
            autoCorrect="off"
            className="min-w-0 flex-1 bg-transparent text-[14px] text-foreground placeholder:text-muted-foreground focus:outline-none"
          />
        </form>
        {url && (
          <>
            <button onClick={() => setReloadKey((k) => k + 1)} aria-label="Reload" className="tap inline-flex h-9 w-9 items-center justify-center rounded-full text-foreground">
              <IconRefresh size={18} />
            </button>
            <a href={url} target="_blank" rel="noreferrer" aria-label="Open externally" className="tap inline-flex h-9 w-9 items-center justify-center rounded-full text-foreground">
              <IconExternal size={18} />
            </a>
          </>
        )}
      </header>

      {url ? (
        <div className="relative h-[calc(100vh-52px)] w-full bg-background">
          <iframe
            key={reloadKey}
            src={url}
            title={host}
            sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-modals"
            referrerPolicy="no-referrer-when-downgrade"
            className="h-full w-full border-0 bg-white"
          />
          <div className="pointer-events-none absolute inset-x-0 bottom-2 flex justify-center">
            <span className="pointer-events-auto rounded-full bg-background/80 px-3 py-1 text-[11px] text-muted-foreground backdrop-blur">
              Some sites block embedding — tap ↗ to open externally
            </span>
          </div>
        </div>
      ) : (
        <div className="px-4 py-5">
          <h1 className="font-display text-[22px] font-bold tracking-[-0.02em] text-foreground">Explore Arc</h1>
          <p className="mt-1 text-[14px] text-muted-foreground">Testnet dApps — connect with your MEKU wallet.</p>

          <div className="mt-5 space-y-2">
            {featured.map((f) => (
              <button
                key={f.url}
                onClick={() => go(f.url)}
                className="tap flex w-full items-center gap-3 rounded-2xl bg-surface-2 p-4 text-left transition-colors hover:bg-surface"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl gradient-purple text-[15px] font-bold text-primary-foreground">
                  {f.name[0]}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-[15px] font-semibold text-foreground">{f.name}</div>
                  <div className="truncate text-[13px] text-muted-foreground">{f.desc}</div>
                </div>
                <IconExternal size={16} className="text-muted-foreground" />
              </button>
            ))}
          </div>
        </div>
      )}
    </AppShell>
  );
};

export default Browser;
