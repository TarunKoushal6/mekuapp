-- Prevent clients from fabricating transaction rows. All real transaction
-- writes go through edge functions using the service role, which bypasses
-- RLS. Client is only allowed to mark its own already-pending row as failed
-- (used by Wallet's stale-pending auto-fail sweep).

DROP POLICY IF EXISTS "Users insert own transactions" ON public.transactions;
DROP POLICY IF EXISTS "Users update own transactions" ON public.transactions;

CREATE POLICY "Users mark own pending tx failed"
  ON public.transactions
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id AND status = 'pending')
  WITH CHECK (auth.uid() = user_id AND status = 'failed');