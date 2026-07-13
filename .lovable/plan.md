# Redesign MEKU to match the reference mockup (pixel-perfect)

Goal: rebuild the 10 screens shown in the reference — Intro, Home Feed, Post Detail, Notifications, Chat list, DM thread, New Message, Wallet, Browser, Profile — to match layout, spacing, typography, and interaction feel exactly, while keeping our existing mascot/logo/avatar assets. **No Stories row on Home.**

Applied craft rules (from Emil Kowalski):
- Custom easing `cubic-bezier(0.23, 1, 0.32, 1)` for enter, `(0.77, 0, 0.175, 1)` for movement.
- Durations 150–250ms for UI, 100–160ms for press feedback, `scale(0.97)` on `:active`.
- Enter from `scale(0.95) + opacity 0`, never `scale(0)`.
- Origin-aware popovers, no `transition: all`, only `transform`/`opacity`.
- Reduced-motion respected; stagger 30–80ms for list entries.

---

## Chunk 1 — Design tokens & base
- Lock type scale: 17sp titles / 16sp name / 14sp meta / 13sp counters / 15sp body.
- Spacing rhythm: 20/16/12/10/8/6/4 dp; 44dp avatar; 52dp header.
- Tune `index.css`: hairline dividers, surface/surface-2 tokens, purple primary matching the mockup violet (`#6C5CE7`-family), muted foreground grey.
- Motion tokens: `--ease-out-strong`, `--ease-in-out-strong`, `--dur-fast/base/slow`.

## Chunk 2 — App shell & Bottom Nav
- 5-tab nav: Home, Explore, Wallet, Browser, Chat (icons match mockup, filled-on-active).
- Center Create FAB **removed from nav** (Create lives as top-left tile in feed, per mockup).
- Animated active indicator: subtle icon `y: -1` + scale `1.06`, filled variant swap; no dot.

## Chunk 3 — Home Feed (For you / Following) — NO STORIES
- Header: left Meku `M` logo, centered segmented `For you | Following` with 3dp underline, right bell with unread dot.
- Feed cards already close; tighten to reference: 44dp avatar 20dp/12dp offsets, name+handle+time single baseline, 13sp action counts, 20dp icons, hairline dividers between posts (no card gaps).
- Remove any stories rail if present.

## Chunk 4 — Post Detail
- Sticky header "Post" with back + more.
- Author block, body, action row identical to feed card.
- "Replies" section header with "Most relevant" pill.
- Reply composer docked at bottom with rounded pill input + purple send FAB.

## Chunk 5 — Notifications
- Tabs: All / Mentions / Replies / Likes (scrollable).
- Row = 26dp tinted icon (heart pink, repost green, comment/mention purple, tip amber, follow purple) + small avatar + text + timeAgo.
- Grouped "Nina and 18 others liked…" with avatar stack.

## Chunk 6 — Chat list + DM thread + New Message
- Chat list: search bar, rows with 44dp avatar, name + last message, right time + unread pill (purple).
- Thread: iOS-style bubbles — mine purple right, theirs surface-2 left; header shows avatar, name, online, call/video icons; composer with mic/emoji/plus + purple send.
- New Message: "To:" search, "Suggested" list with radio circles.

## Chunk 7 — Wallet
- Purple gradient balance card with iridescent blob, eye toggle, address, arrow → detail.
- Four action tiles: Send / Receive / Swap / History (rounded squares, icon + label).
- Assets list rows: token logo, name/ticker, balance right + USD sub.

## Chunk 8 — Browser
- Search/address bar with scan icon, tab count top-right.
- Favorites row: 5 rounded-square icon tiles with labels.
- Discover cards: title + description left, illustration right, rounded 20dp.

## Chunk 9 — Profile
- Cover-less header, back + settings, ellipsis top-left.
- 88dp avatar, verified name, @handle, bio, `Edit profile` primary + secondary icon button.
- Stat row Posts / Followers / Following.
- Tabs Posts / Replies / Highlights / Likes, underline indicator, feed below.

## Chunk 10 — Intro / Onboarding
- Centered `Welcome to Meku` (Meku in primary), subtitle, waving mascot, full-width purple `Create account` CTA with arrow, ghost `I already have an account`.

## Chunk 11 — Polish pass
- Press states (`scale(0.97)`), origin-aware popovers, tooltip instant-repeat, stagger on feed mount, blur mask on tab crossfade, reduced-motion fallbacks.
- Manual QA at 360×704 against each reference tile; screenshot diff via Playwright.

---

### Technical notes
- Assets: keep `src/assets/meku_*` (logo, wordmark, mascots) and `default_avatar`; no new binaries needed.
- Files touched (approx): `index.css`, `tailwind.config.ts`, `BottomNav`, `FeedCard`, `Home`, `PostDetail`, `Notifications`, `Inbox`, `Chat`, `NewMessage`, `Wallet`, `Browser`, `Profile`, `Intro`, plus small primitives (`SegmentedTabs`, `ActionTile`, `NotifRow`).
- No backend/schema changes.
- Ship chunks sequentially; each chunk is independently reviewable in preview.
