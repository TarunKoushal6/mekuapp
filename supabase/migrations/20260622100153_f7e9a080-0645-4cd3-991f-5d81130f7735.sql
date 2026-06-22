CREATE OR REPLACE FUNCTION public.notify_tip_transaction_trigger()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.kind = 'tip' AND NEW.counterparty_user_id IS NOT NULL THEN
    PERFORM public.create_notification_if_needed(
      NEW.counterparty_user_id,
      NEW.user_id,
      'tip',
      NEW.post_id,
      NEW.comment_id
    );
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS transactions_notify_tip_insert ON public.transactions;
CREATE TRIGGER transactions_notify_tip_insert
AFTER INSERT ON public.transactions
FOR EACH ROW EXECUTE FUNCTION public.notify_tip_transaction_trigger();

REVOKE ALL ON FUNCTION public.create_notification_if_needed(uuid, uuid, text, uuid, uuid) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.notify_mentions_in_text(uuid, text, uuid, uuid) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.notify_follow_trigger() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.notify_post_like_trigger() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.notify_repost_trigger() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.notify_comment_trigger() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.notify_post_mentions_trigger() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.notify_tip_transaction_trigger() FROM PUBLIC, anon, authenticated;