import { FeedItem } from "@/components/meku/FeedCard";

export const feedItems: FeedItem[] = [
  {
    id: "1",
    author: { name: "Aria Builder", handle: "aria_builder", verified: true },
    time: "2h",
    title: "Shipping the new explorer for Onchain builders.",
    body: "Been heads down for weeks. Excited to finally show it to you all. Feedback?",
    image:
      "https://images.unsplash.com/photo-1487958449943-2429e8be8625?auto=format&fit=crop&w=1200&q=80",
    likes: 128,
    comments: 32,
    shares: 16,
  },
  {
    id: "2",
    author: { name: "Nova", handle: "novaa" },
    time: "3h",
    title: "The best ideas come when you stop scrolling and start building.",
    body: "",
    likes: 96,
    comments: 24,
    shares: 8,
  },
  {
    id: "3",
    author: { name: "Kai", handle: "kaizen" },
    time: "4h",
    body: "Quiet mornings build loud futures.",
    image:
      "https://images.unsplash.com/photo-1493809842364-78817add7ffb?auto=format&fit=crop&w=1200&q=80",
    likes: 142,
    comments: 41,
    shares: 12,
  },
  {
    id: "4",
    author: { name: "Design Circle", handle: "design_circle", verified: true },
    time: "8h",
    title: "A guide to better design systems.",
    body: "Design principles that scale with your product.",
    likes: 98,
    comments: 21,
    shares: 9,
  },
];
