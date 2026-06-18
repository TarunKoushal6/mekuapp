
CREATE TABLE public.wallet_pin_recovery (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  q1 TEXT NOT NULL,
  q2 TEXT NOT NULL,
  q3 TEXT NOT NULL,
  a1_hash TEXT NOT NULL,
  a2_hash TEXT NOT NULL,
  a3_hash TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.wallet_pin_recovery TO authenticated;
GRANT ALL ON public.wallet_pin_recovery TO service_role;
ALTER TABLE public.wallet_pin_recovery ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Owner can read recovery" ON public.wallet_pin_recovery FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Owner can insert recovery" ON public.wallet_pin_recovery FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Owner can update recovery" ON public.wallet_pin_recovery FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Owner can delete recovery" ON public.wallet_pin_recovery FOR DELETE TO authenticated USING (auth.uid() = user_id);
CREATE TRIGGER trg_wallet_pin_recovery_touch BEFORE UPDATE ON public.wallet_pin_recovery FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
