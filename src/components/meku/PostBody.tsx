import { Link } from "react-router-dom";

// Render free text with @mentions linkified. Mentions navigate to /u/<handle>.
const MENTION_RE = /(@[A-Za-z0-9_]{1,32})/g;

export const PostBody = ({ text, className }: { text: string; className?: string }) => {
  const parts = text.split(MENTION_RE);
  return (
    <p className={className}>
      {parts.map((part, i) => {
        if (/^@[A-Za-z0-9_]{1,32}$/.test(part)) {
          const handle = part.slice(1).toLowerCase();
          return (
            <Link
              key={i}
              to={`/u/${handle}`}
              onClick={(e) => e.stopPropagation()}
              className="font-semibold text-primary hover:underline"
            >
              {part}
            </Link>
          );
        }
        return <span key={i}>{part}</span>;
      })}
    </p>
  );
};
