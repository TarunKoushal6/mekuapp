import { FeedItem } from "@/components/meku/FeedCard";

export const feedItems: FeedItem[] = [
  {
    id: "1",
    author: { name: "Mira Okafor", handle: "mira" },
    time: "8:14",
    title: "On making small things, slowly.",
    body: "I keep returning to the idea that the work which matters is rarely the work which shouts. A short essay on craft, patience, and the hours between drafts.",
    likes: 248,
    comments: 32,
  },
  {
    id: "2",
    author: { name: "Sōta Lin", handle: "sota" },
    time: "Yesterday",
    body: "Spent the afternoon rearranging my studio. Less is, almost always, more.",
    image:
      "https://images.unsplash.com/photo-1493809842364-78817add7ffb?auto=format&fit=crop&w=1200&q=80",
    likes: 91,
    comments: 6,
  },
  {
    id: "3",
    author: { name: "Aïcha Devereaux", handle: "aicha" },
    time: "2d",
    title: "A field guide to noticing.",
    body: "Three small practices that have changed the way I move through a week. The first is the easiest: keep a single notebook, and only one.",
    likes: 412,
    comments: 58,
  },
  {
    id: "4",
    author: { name: "Idris Vahn", handle: "idris" },
    time: "3d",
    body: "New piece up in the studio. Walnut, linseed oil, a great deal of sanding.",
    image:
      "https://images.unsplash.com/photo-1556228453-efd6c1ff04f6?auto=format&fit=crop&w=1200&q=80",
    likes: 184,
    comments: 14,
  },
];
