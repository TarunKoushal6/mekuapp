// Per-user bookmark storage. Keyed by user id so accounts don't share state.
const BASE = "meku.bookmarks.v1";

const keyFor = (userId?: string | null) => (userId ? `${BASE}:${userId}` : `${BASE}:anon`);

export const readBookmarks = (userId?: string | null): Set<string> => {
  try {
    return new Set(JSON.parse(localStorage.getItem(keyFor(userId)) ?? "[]"));
  } catch {
    return new Set();
  }
};

export const writeBookmarks = (userId: string | null | undefined, set: Set<string>) => {
  try {
    localStorage.setItem(keyFor(userId), JSON.stringify([...set]));
  } catch {
    /* noop */
  }
};

export const toggleBookmark = (userId: string | null | undefined, postId: string, next: boolean) => {
  const set = readBookmarks(userId);
  if (next) set.add(postId);
  else set.delete(postId);
  writeBookmarks(userId, set);
  return set;
};
