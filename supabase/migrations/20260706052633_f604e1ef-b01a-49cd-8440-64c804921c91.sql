
-- 1) Private wallet_pins table (owner-only)
CREATE TABLE IF NOT EXISTS public.wallet_pins (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  pin_hash text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.wallet_pins TO authenticated;
GRANT ALL ON public.wallet_pins TO service_role;

ALTER TABLE public.wallet_pins ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owner can read own pin"
  ON public.wallet_pins FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Owner can insert own pin"
  ON public.wallet_pins FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Owner can update own pin"
  ON public.wallet_pins FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Owner can delete own pin"
  ON public.wallet_pins FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE TRIGGER wallet_pins_touch_updated_at
  BEFORE UPDATE ON public.wallet_pins
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- 2) Migrate existing hashes from profiles then drop the column
INSERT INTO public.wallet_pins (user_id, pin_hash)
SELECT id, pin_hash FROM public.profiles WHERE pin_hash IS NOT NULL
ON CONFLICT (user_id) DO NOTHING;

ALTER TABLE public.profiles DROP COLUMN IF EXISTS pin_hash;

-- 3) Wallets: remove broad SELECT policy; owner-only ALL policy already covers own access
DROP POLICY IF EXISTS "Wallets viewable by everyone (address only)" ON public.wallets;
