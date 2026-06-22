DROP POLICY IF EXISTS "Authenticated can insert as actor" ON public.notifications;
REVOKE INSERT ON public.notifications FROM authenticated;

CREATE OR REPLACE FUNCTION public.create_notification_if_needed(
  _user_id uuid,
  _actor_id uuid,
  _kind text,
  _post_id uuid DEFAULT NULL,
  _comment_id uuid DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF _user_id IS NULL OR _actor_id IS NULL OR _user_id = _actor_id THEN
    RETURN;
  END IF;

  IF EXISTS (
    SELECT 1
    FROM public.notifications
    WHERE user_id = _user_id
      AND actor_id = _actor_id
      AND kind = _kind
      AND COALESCE(post_id, '00000000-0000-0000-0000-000000000000'::uuid) = COALESCE(_post_id, '00000000-0000-0000-0000-000000000000'::uuid)
      AND COALESCE(comment_id, '00000000-0000-0000-0000-000000000000'::uuid) = COALESCE(_comment_id, '00000000-0000-0000-0000-000000000000'::uuid)
      AND created_at > now() - interval '30 seconds'
  ) THEN
    RETURN;
  END IF;

  INSERT INTO public.notifications (user_id, actor_id, kind, post_id, comment_id)
  VALUES (_user_id, _actor_id, _kind, _post_id, _comment_id);
END;
$$;

REVOKE ALL ON FUNCTION public.create_notification_if_needed(uuid, uuid, text, uuid, uuid) FROM PUBLIC, anon, authenticated;