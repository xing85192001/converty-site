import type { ReactNode } from "react";
import { Link } from "@/i18n/navigation";
import type { BlogBlock } from "@/lib/blog/posts";

/**
 * Render a single line of inline markdown:
 * - [label](href) becomes an internal (Link) or external (a) link
 * - **bold** becomes <strong>
 */
function renderInline(text: string): ReactNode[] {
  const nodes: ReactNode[] = [];
  let key = 0;

  // Split on links first so we don't try to bold inside a URL.
  const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
  let last = 0;
  let match: RegExpExecArray | null = linkRegex.exec(text);

  while (match !== null) {
    if (match.index > last) {
      nodes.push(<span key={key++}>{renderBold(text.slice(last, match.index))}</span>);
    }
    const [, label, href] = match;
    const isInternal = href.startsWith("/");
    nodes.push(
      isInternal ? (
        <Link
          key={key++}
          href={href}
          className="font-medium text-primary underline underline-offset-4 hover:opacity-80"
        >
          {label}
        </Link>
      ) : (
        <a
          key={key++}
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="font-medium text-primary underline underline-offset-4 hover:opacity-80"
        >
          {label}
        </a>
      )
    );
    last = linkRegex.lastIndex;
    match = linkRegex.exec(text);
  }
  if (last < text.length) {
    nodes.push(<span key={key++}>{renderBold(text.slice(last))}</span>);
  }
  return nodes;
}

function renderBold(text: string): ReactNode[] {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) => {
    const m = part.match(/^\*\*([^*]+)\*\*$/);
    if (m) return <strong key={i}>{m[1]}</strong>;
    return <span key={i}>{part}</span>;
  });
}

export function BlogContent({ blocks }: { blocks: BlogBlock[] }) {
  return (
    <div className="space-y-5 text-sm leading-relaxed text-foreground/90 sm:text-base">
      {blocks.map((block, i) => {
        switch (block.type) {
          case "p":
            return <p key={i}>{renderInline(block.text)}</p>;
          case "h2":
            return (
              <h2 key={i} className="pt-2 text-xl font-semibold tracking-tight">
                {block.text}
              </h2>
            );
          case "ul":
            return (
              <ul key={i} className="list-disc space-y-1 pl-5">
                {block.items.map((item, j) => (
                  <li key={j}>{renderInline(item)}</li>
                ))}
              </ul>
            );
          case "callout":
            return (
              <div
                key={i}
                className="rounded-lg border border-primary/30 bg-primary/5 px-4 py-3 text-sm text-foreground/90"
              >
                {renderInline(block.text)}
              </div>
            );
          default:
            return null;
        }
      })}
    </div>
  );
}
