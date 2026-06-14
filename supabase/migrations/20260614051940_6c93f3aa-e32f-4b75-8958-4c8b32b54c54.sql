
-- WALLETS ------------------------------------------------------
CREATE TABLE public.wallets (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  circle_user_id text NOT NULL UNIQUE,
  wallet_id text,
  address text,
  chain text NOT NULL DEFAULT 'ARC-TESTNET',
  status text NOT NULL DEFAULT 'pending',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.wallets TO authenticated;
GRANT ALL ON public.wallets TO service_role;
ALTER TABLE public.wallets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Wallets viewable by everyone (address only)"
  ON public.wallets FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users manage own wallet"
  ON public.wallets FOR ALL TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- TRANSACTIONS -------------------------------------------------
CREATE TABLE public.transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  kind text NOT NULL,                       -- send | swap | bridge | tip | request
  token text NOT NULL DEFAULT 'USDC',
  amount numeric(38,6) NOT NULL,
  counterparty_user_id uuid,
  counterparty_address text,
  chain text NOT NULL DEFAULT 'ARC-TESTNET',
  tx_hash text,
  status text NOT NULL DEFAULT 'pending',   -- pending | confirmed | failed
  post_id uuid REFERENCES public.posts(id) ON DELETE SET NULL,
  comment_id uuid REFERENCES public.comments(id) ON DELETE SET NULL,
  circle_tx_id text,
  metadata jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.transactions TO authenticated;
GRANT ALL ON public.transactions TO service_role;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users see own transactions"
  ON public.transactions FOR SELECT TO authenticated
  USING (auth.uid() = user_id OR auth.uid() = counterparty_user_id);
CREATE POLICY "Users insert own transactions"
  ON public.transactions FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own transactions"
  ON public.transactions FOR UPDATE TO authenticated
  USING (auth.uid() = user_id);

-- POSTS extensions --------------------------------------------
ALTER TABLE public.posts
  ADD COLUMN IF NOT EXISTS kind text NOT NULL DEFAULT 'post',
  ADD COLUMN IF NOT EXISTS token text,
  ADD COLUMN IF NOT EXISTS amount_usdc numeric(38,6),
  ADD COLUMN IF NOT EXISTS recipient_user_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL;

-- COMMENTS extensions -----------------------------------------
ALTER TABLE public.comments
  ADD COLUMN IF NOT EXISTS kind text NOT NULL DEFAULT 'comment',
  ADD COLUMN IF NOT EXISTS token text,
  ADD COLUMN IF NOT EXISTS amount_usdc numeric(38,6),
  ADD COLUMN IF NOT EXISTS recipient_user_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL;

-- updated_at trigger ------------------------------------------
CREATE OR REPLACE FUNCTION public.touch_updated_at()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END $$;

DROP TRIGGER IF EXISTS wallets_touch ON public.wallets;
CREATE TRIGGER wallets_touch BEFORE UPDATE ON public.wallets
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

DROP TRIGGER IF EXISTS transactions_touch ON public.transactions;
CREATE TRIGGER transactions_touch BEFORE UPDATE ON public.transactions
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
