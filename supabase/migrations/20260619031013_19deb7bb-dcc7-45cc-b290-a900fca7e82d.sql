CREATE TABLE public.notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  actor_id uuid,
  kind text NOT NULL,
  post_id uuid,
  comment_id uuid,
  read_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.notifications TO authenticated;
GRANT ALL ON public.notifications TO service_role;

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Recipients can read and mark their own notifications.
CREATE POLICY "Recipient can read own notifications"
ON public.notifications FOR SELECT TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Recipient can update own notifications"
ON public.notifications FOR UPDATE TO authenticated
USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Recipient can delete own notifications"
ON public.notifications FOR DELETE TO authenticated
USING (auth.uid() = user_id);

-- Authenticated users may insert notifications they originate
-- (actor_id must equal their uid) and never aimed at themselves.
CREATE POLICY "Authenticated can insert as actor"
ON public.notifications FOR INSERT TO authenticated
WITH CHECK (auth.uid() = actor_id AND user_id <> actor_id);

CREATE INDEX notifications_user_created_idx
  ON public.notifications (user_id, created_at DESC);

-- Enable Realtime
ALTER TABLE public.notifications REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
