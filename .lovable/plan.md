
## Recommendation: Circle User-Controlled Wallets (UCW)

For a social app where users own their funds and trigger tx from posts/comments, **User-Controlled Wallets** is the right fit:
- Built-in **email OTP login** (= your "Circle auth" requirement, no Supabase auth needed for sign-in).
- **Auto wallet creation** on first login (one wallet per user on Arc Testnet).
- Non-custodial via MPC + user PIN — you never hold keys, users sign every tx with PIN.
- Works on Arc Testnet with USDC.

Modular Wallets (passkey) is slicker UX but adds complexity; Dev-Controlled makes you custodian (bad for a social app). UCW is the standard pick for consumer social + onchain.

## Scope

### 1. Auth & wallet bootstrap
- Remove Supabase email/password auth UI. Keep Supabase only as **app DB** (posts/comments/profiles) — auth state will come from Circle session.
- Add Circle UCW SDK + edge function `circle-session` that:
  - issues user token from `CIRCLE_API_KEY` + `CIRCLE_ENTITY_SECRET`
  - creates wallet on Arc Testnet on first sign-in
- New `useCircleAuth` hook replaces `useAuth`. Email OTP screen + PIN setup screen.
- Sync Circle `userId` → `profiles.id` so existing posts/comments keep working.

### 2. Wallet screen (replaces current mock)
- Live USDC balance on Arc Testnet (Circle `getWalletTokenBalance`).
- Tx history list.
- Top action grid using your icons: Send · Swap · Bridge · Assets.
- Receive sheet with address + QR.

### 3. Send / Swap / Bridge sheets
- **Send** — Circle UCW `createTransaction` (USDC on Arc), PIN challenge.
- **Swap** — Circle App Kit `kit.swap` via edge function `circle-swap` (uses `KIT_KEY`).
- **Bridge** — Circle App Kit `kit.bridge` (CCTP) via edge function `circle-bridge`. Arc Testnet ↔ Base/Eth Sepolia.

### 4. Inline onchain UX in feed
- **Tip button** on every post + comment → opens preset USDC tip sheet → PIN → send to author's wallet.
- **Payment-request post type** — new `posts.kind = 'request'` with `amount_usdc`, `recipient_wallet`. Renders as a card with "Pay X USDC" button.
- **@mention send command** — when composing a post/comment, parser detects `@handle send <n> usdc` → renders an inline "Send" action card on the post; tapping it opens PIN sheet and executes the transfer to that handle's wallet. Mentioned user gets a notification.
- All executed tx show inline confirmation chip with tx hash → Arc explorer link.

### 5. Icon set
Replace lucide icons with the 10 from your reference (Send, Swap, Bridge, Reply, Assets, Wallet, Explore, Notifications, Community, Activity) as a local `MekuIcon` component using minimal stroke SVGs that match the line weight in your screenshot.

## Technical notes

- New tables (migration):
  - `wallets (user_id pk, circle_user_id, wallet_id, address, chain)`
  - `transactions (id, user_id, tx_hash, kind, amount, token, counterparty, post_id?, created_at, status)`
  - `posts.kind` enum + `amount_usdc`, `recipient_user_id` nullable columns for request posts.
- Edge functions: `circle-session`, `circle-wallet`, `circle-send`, `circle-swap`, `circle-bridge`, `circle-balance`.
- Secrets needed (I'll prompt securely): `CIRCLE_API_KEY`, `CIRCLE_ENTITY_SECRET`, `KIT_KEY`.
- Skills I'll follow: `use-user-controlled-wallets`, `use-arc`, `use-usdc`, `swap-tokens`, `bridge-stablecoin`.

## Order of execution

1. Add secrets prompt → install Circle SDKs + skills.
2. Migration (wallets, transactions, post kinds).
3. Edge functions (session/wallet/balance/send first; swap/bridge second).
4. Auth swap: Circle email OTP + PIN screens, kill Supabase auth UI.
5. Wallet screen + Send/Swap/Bridge sheets.
6. Tip button + payment-request post type + @mention-send parser.
7. Replace icon set.

Shall I proceed? On approval I'll start by requesting the three secrets.
