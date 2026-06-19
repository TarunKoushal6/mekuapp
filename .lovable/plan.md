Five fixes grouped by area. I'll ship them in this order.

## 1. Per-account bookmarks/likes/reposts
The likes/reposts are already user-scoped in DB — the bug is that `FeedCard`'s local optimistic state isn't refreshed after a logout/login (component holds the previous user's initial values). Bookmarks are the real bug: stored in a single `localStorage` key.

- Namespace bookmarks per user: `meku.bookmarks.v1:<userId>` (anonymous bucket for logged-out).
- On `user.id` change in `FeedCard`, reset `liked/likeCount/bookmarked/reposted` from current props/DB.
- `Bookmarks` page reads the per-user key.

## 2. Real-time notifications
Add a `notifications` table + realtime publication. Insert rows from existing flows (likes, reposts, comments, @mentions in `Create.tsx`/`PostDetail.tsx` comment submit). Subscribe in a top-level `useNotifications` hook that:
- Loads unread on mount.
- Subscribes via `supabase.channel('notif:'+userId)` filtered to `user_id=eq.<me>`.
- Pops a `toast.info(...)` and updates a badge on the bell icon in `TopBar`.

Schema:
```sql
create table public.notifications(
  id uuid pk default gen_random_uuid(),
  user_id uuid not null,           -- recipient
  actor_id uuid,                   -- who did it
  kind text not null,              -- 'like' | 'repost' | 'comment' | 'mention' | 'tip'
  post_id uuid,
  comment_id uuid,
  read_at timestamptz,
  created_at timestamptz default now()
);
-- GRANTs + RLS: recipient can select/update; service_role full.
alter publication supabase_realtime add table public.notifications;
```
Inserts done client-side right after the social action (RLS allows authenticated insert when `actor_id = auth.uid()`).

## 3. Confirmation cards for Send / Swap / Bridge
Replace the "Review" button's direct execute path with a `ConfirmSheet` (shared component) showing:
- From / To (address or chain)
- Amount in + amount out (estimate for swap, 1:1 for bridge, single for send)
- Network fee, route, slippage
- Big "Confirm" button using `SendFlyButton`

Send already has `SendSheet` — refactor it to a two-step (compose → confirm) using the same shared `ConfirmSheet`.

## 4. Button animations on success
- `SendFlyButton` already animates the plane flying. Extend it: after `flying` finishes, swap to a `success` state — green bg + checkmark icon for ~1.2s before sheet closes. Use for Send + Bridge.
- For Swap, build `SwapCardButton` mimicking the "credit card" flip animation (card slides in, flips to a check). Pure CSS keyframes, no new deps.

## 5. Destination-chain dropdown (Bridge)
Replace the list of buttons with a proper `<Select>` (shadcn) anchored on the "Destination chain" row. Add more chains: Base Sepolia, Ethereum Sepolia, Arbitrum Sepolia, Optimism Sepolia, Polygon Amoy, Avalanche Fuji (Circle CCTP testnet set).

## Technical notes
- No new packages. Pure Tailwind/CSS for animations.
- Edge functions unchanged (still gated on the Fly.io swap node for execution — confirmation UX still works and shows the 501 error inline).
- Migration adds `notifications` table + grants + RLS + realtime publication.

## Out of scope (deferred per user)
- Actually getting `circle-swap` to execute end-to-end (still needs Fly.io node).

Shall I proceed?
