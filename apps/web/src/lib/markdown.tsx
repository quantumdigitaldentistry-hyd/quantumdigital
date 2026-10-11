import { Fragment, type ReactNode } from 'react';

/**
 * A small, safe Markdown renderer for Dental Knowledge articles. It builds React elements
 * directly (never HTML strings), so nothing in an article can inject markup or scripts.
 *
 * Supported: ## / ### headings, paragraphs, - or * bullet lists, 1. numbered lists,
 * > quotes, **bold**, *italic*, and [links](https://…) to http(s), mailto, tel or
 * same-site paths. Anything else shows as plain text.
 */

const SAFE_LINK = /^(https?:\/\/|mailto:|tel:|\/(?!\/))/i;

function inline(text: string, keyBase: string): ReactNode[] {
  const nodes: ReactNode[] = [];
  const pattern = /\*\*([^*]+)\*\*|\*([^*]+)\*|\[([^\]]+)\]\(([^)\s]+)\)/g;
  let last = 0;
  let match: RegExpExecArray | null;
  let i = 0;
  while ((match = pattern.exec(text))) {
    if (match.index > last) nodes.push(text.slice(last, match.index));
    const key = `${keyBase}-${i++}`;
    if (match[1] !== undefined) nodes.push(<strong key={key}>{match[1]}</strong>);
    else if (match[2] !== undefined) nodes.push(<em key={key}>{match[2]}</em>);
    else if (match[3] !== undefined && match[4] && SAFE_LINK.test(match[4])) {
      const external = /^https?:/i.test(match[4]);
      nodes.push(
        <a
          key={key}
          href={match[4]}
          {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
          className="font-medium text-brand underline underline-offset-2"
        >
          {match[3]}
        </a>,
      );
    } else nodes.push(match[0]);
    last = pattern.lastIndex;
  }
  if (last < text.length) nodes.push(text.slice(last));
  return nodes;
}

export function Markdown({ source, className }: { source: string; className?: string }) {
  const lines = source.replace(/\r\n?/g, '\n').split('\n');
  const blocks: ReactNode[] = [];
  let i = 0;
  let key = 0;
  while (i < lines.length) {
    const line = lines[i]!;
    if (!line.trim()) {
      i++;
      continue;
    }
    const heading = /^(#{2,3})\s+(.*)$/.exec(line);
    if (heading) {
      const Tag = heading[1]!.length === 2 ? 'h2' : 'h3';
      blocks.push(
        <Tag
          key={key++}
          className={
            Tag === 'h2'
              ? 'mt-8 font-display text-title font-bold text-balance'
              : 'mt-6 font-display text-heading font-semibold'
          }
        >
          {inline(heading[2]!, `h${key}`)}
        </Tag>,
      );
      i++;
      continue;
    }
    if (/^\s*([-*]|\d+\.)\s+/.test(line)) {
      const ordered = /^\s*\d+\./.test(line);
      const items: string[] = [];
      while (i < lines.length && /^\s*([-*]|\d+\.)\s+/.test(lines[i]!)) {
        items.push(lines[i]!.replace(/^\s*([-*]|\d+\.)\s+/, ''));
        i++;
      }
      const List = ordered ? 'ol' : 'ul';
      blocks.push(
        <List
          key={key++}
          className={`flex flex-col gap-1.5 pl-6 ${ordered ? 'list-decimal' : 'list-disc'}`}
        >
          {items.map((item, index) => (
            <li key={index}>{inline(item, `l${key}-${index}`)}</li>
          ))}
        </List>,
      );
      continue;
    }
    if (line.startsWith('>')) {
      const quote: string[] = [];
      while (i < lines.length && lines[i]!.startsWith('>')) {
        quote.push(lines[i]!.replace(/^>\s?/, ''));
        i++;
      }
      blocks.push(
        <blockquote key={key++} className="border-l-4 border-aqua pl-4 text-ink-muted italic">
          {inline(quote.join(' '), `q${key}`)}
        </blockquote>,
      );
      continue;
    }
    const paragraph: string[] = [];
    while (
      i < lines.length &&
      lines[i]!.trim() &&
      !/^(#{2,3}\s|>|\s*([-*]|\d+\.)\s)/.test(lines[i]!)
    ) {
      paragraph.push(lines[i]!.trim());
      i++;
    }
    blocks.push(<p key={key++}>{inline(paragraph.join(' '), `p${key}`)}</p>);
  }
  return (
    <div className={className ?? 'flex flex-col gap-4 leading-relaxed'}>
      {blocks.map((block, index) => (
        <Fragment key={index}>{block}</Fragment>
      ))}
    </div>
  );
}
