
-- Revoke public execute on SECURITY DEFINER functions.
-- Trigger functions don't need to be callable by any client role.
REVOKE ALL ON FUNCTION public.notify_tip_transaction_trigger() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.notify_follow_trigger() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.notify_post_like_trigger() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.notify_repost_trigger() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.notify_comment_trigger() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.notify_post_mentions_trigger() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.guard_profile_verification() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.notify_mentions_in_text(uuid, text, uuid, uuid) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.create_notification_if_needed(uuid, uuid, text, uuid, uuid) FROM PUBLIC, anon, authenticated;

-- has_role must be callable by RLS as the signed-in user; revoke from anon/public only.
REVOKE ALL ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated;

-- Explicit restrictive policy: authenticated users cannot insert roles for themselves
-- unless they are already an admin. Combined with the existing "Admins can manage roles"
-- policy, this makes privilege-escalation impossible via the Data API.
DROP POLICY IF EXISTS "Non-admins cannot self-assign roles" ON public.user_roles;
CREATE POLICY "Non-admins cannot self-assign roles"
  ON public.user_roles
  AS RESTRICTIVE
  FOR INSERT
  TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));
