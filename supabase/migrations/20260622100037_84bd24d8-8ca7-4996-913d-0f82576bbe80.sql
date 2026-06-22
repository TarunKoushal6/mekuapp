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

  INSERT INTO public.notifications (user_id, actor_id, kind, post_id, comment_id)
  VALUES (_user_id, _actor_id, _kind, _post_id, _comment_id);
END;
$$;

CREATE OR REPLACE FUNCTION public.notify_mentions_in_text(
  _actor_id uuid,
  _text text,
  _post_id uuid DEFAULT NULL,
  _comment_id uuid DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  handle text;
  recipient uuid;
BEGIN
  IF _actor_id IS NULL OR COALESCE(_text, '') = '' THEN
    RETURN;
  END IF;

  FOR handle IN
    SELECT DISTINCT lower(match[1])
    FROM regexp_matches(_text, '@([A-Za-z0-9_]{1,32})', 'g') AS match
  LOOP
    SELECT id INTO recipient
    FROM public.profiles
    WHERE lower(username) = handle
    LIMIT 1;

    PERFORM public.create_notification_if_needed(recipient, _actor_id, 'mention', _post_id, _comment_id);
  END LOOP;
END;
$$;

CREATE OR REPLACE FUNCTION public.notify_follow_trigger()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  PERFORM public.create_notification_if_needed(NEW.followee_id, NEW.follower_id, 'follow', NULL, NULL);
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS follows_notify_insert ON public.follows;
CREATE TRIGGER follows_notify_insert
AFTER INSERT ON public.follows
FOR EACH ROW EXECUTE FUNCTION public.notify_follow_trigger();

CREATE OR REPLACE FUNCTION public.notify_post_like_trigger()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  owner_id uuid;
BEGIN
  SELECT user_id INTO owner_id FROM public.posts WHERE id = NEW.post_id;
  PERFORM public.create_notification_if_needed(owner_id, NEW.user_id, 'like', NEW.post_id, NULL);
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS post_likes_notify_insert ON public.post_likes;
CREATE TRIGGER post_likes_notify_insert
AFTER INSERT ON public.post_likes
FOR EACH ROW EXECUTE FUNCTION public.notify_post_like_trigger();

CREATE OR REPLACE FUNCTION public.notify_repost_trigger()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  owner_id uuid;
BEGIN
  SELECT user_id INTO owner_id FROM public.posts WHERE id = NEW.post_id;
  PERFORM public.create_notification_if_needed(owner_id, NEW.user_id, 'repost', NEW.post_id, NULL);
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS reposts_notify_insert ON public.reposts;
CREATE TRIGGER reposts_notify_insert
AFTER INSERT ON public.reposts
FOR EACH ROW EXECUTE FUNCTION public.notify_repost_trigger();

CREATE OR REPLACE FUNCTION public.notify_comment_trigger()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  post_owner_id uuid;
  parent_owner_id uuid;
BEGIN
  SELECT user_id INTO post_owner_id FROM public.posts WHERE id = NEW.post_id;
  PERFORM public.create_notification_if_needed(post_owner_id, NEW.user_id, 'comment', NEW.post_id, NEW.id);

  IF NEW.parent_id IS NOT NULL THEN
    SELECT user_id INTO parent_owner_id FROM public.comments WHERE id = NEW.parent_id;
    PERFORM public.create_notification_if_needed(parent_owner_id, NEW.user_id, 'comment', NEW.post_id, NEW.id);
  END IF;

  PERFORM public.notify_mentions_in_text(NEW.user_id, NEW.body, NEW.post_id, NEW.id);
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS comments_notify_insert ON public.comments;
CREATE TRIGGER comments_notify_insert
AFTER INSERT ON public.comments
FOR EACH ROW EXECUTE FUNCTION public.notify_comment_trigger();

CREATE OR REPLACE FUNCTION public.notify_post_mentions_trigger()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  PERFORM public.notify_mentions_in_text(NEW.user_id, CONCAT_WS(' ', NEW.title, NEW.body), NEW.id, NULL);
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS posts_notify_mentions_insert ON public.posts;
CREATE TRIGGER posts_notify_mentions_insert
AFTER INSERT ON public.posts
FOR EACH ROW EXECUTE FUNCTION public.notify_post_mentions_trigger();