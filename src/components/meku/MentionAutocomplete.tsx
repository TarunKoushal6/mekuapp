// @mention autocomplete. Watches a textarea/input ref for "@xyz" tokens at
// the caret and shows matching profiles. On select, replaces the in-progress
// token with "@username " and fires onPick.
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Avatar } from "./Avatar";
import type { Profile } from "@/lib/social";

interface Props {
  value: string;
  onChange: (next: string) => void;
  caret: number;
  setCaret: (n: number) => void;
  inputRef: React.RefObject<HTMLTextAreaElement | HTMLInputElement>;
  onPick?: (profile: Profile) => void;
}

function extractToken(value: string, caret: number) {
  // Look backward from caret for an "@" that's at start or after whitespace.
  const upto = value.slice(0, caret);
  const m = upto.match(/(^|\s)@(\w{0,32})$/);
  if (!m) return null;
  return { start: caret - (m[2].length + 1), query: m[2] };
}

export const MentionAutocomplete = ({ value, onChange, caret, setCaret, inputRef, onPick }: Props) => {
  const token = useMemo(() => extractToken(value, caret), [value, caret]);
  const [results, setResults] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!token) { setResults([]); return; }
    let cancelled = false;
    const t = setTimeout(async () => {
      setLoading(true);
      const { data } = await supabase
        .from("profiles")
        .select("*")
        .ilike("username", `${token.query}%`)
        .limit(6);
      if (!cancelled) setResults((data as Profile[]) ?? []);
      setLoading(false);
    }, 120);
    return () => { cancelled = true; clearTimeout(t); };
  }, [token?.query]);

  if (!token || results.length === 0) return null;

  const pick = (p: Profile) => {
    const before = value.slice(0, token.start);
    const after = value.slice(caret);
    const insertion = `@${p.username} `;
    const next = `${before}${insertion}${after}`;
    onChange(next);
    const newCaret = before.length + insertion.length;
    setCaret(newCaret);
    requestAnimationFrame(() => {
      const el = inputRef.current as any;
      if (el && typeof el.setSelectionRange === "function") {
        el.focus();
        el.setSelectionRange(newCaret, newCaret);
      }
    });
    onPick?.(p);
  };

  return (
    <div className="fade-in absolute left-0 right-0 top-full z-40 mt-1 overflow-hidden rounded-2xl border border-border bg-background shadow-lg">
      <ul className="max-h-[260px] overflow-y-auto py-1">
        {results.map((p) => (
          <li key={p.id}>
            <button
              type="button"
              onClick={() => pick(p)}
              className="tap flex w-full items-center gap-3 px-3 py-2 text-left hover:bg-surface-2"
            >
              <Avatar name={p.display_name ?? p.username ?? "user"} src={p.avatar_url ?? undefined} size="sm" />
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[14px] font-semibold text-foreground">
                  {p.display_name ?? p.username}
                </span>
                <span className="block truncate text-[12px] text-muted-foreground">@{p.username}</span>
              </span>
            </button>
          </li>
        ))}
        {loading && <li className="px-3 py-2 text-[12px] text-muted-foreground">Searching…</li>}
      </ul>
    </div>
  );
};
