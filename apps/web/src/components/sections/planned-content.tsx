import { CheckCircleIcon } from '@phosphor-icons/react';

import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';

/**
 * Placeholder for a page that hasn't been built yet: says plainly that it's coming and
 * lists what it will cover, so the structure is reviewable before the content exists.
 */
export function PlannedContent({ items }: { items: string[] }) {
  return (
    <Card className="flex flex-col gap-4">
      <Badge label="Coming soon" tone="highlight" className="self-start" />
      <p className="text-ink-muted">This page is being written. It will cover:</p>
      <ul className="grid gap-3 sm:grid-cols-2">
        {items.map((item) => (
          <li key={item} className="flex items-start gap-2.5">
            <CheckCircleIcon
              size={20}
              weight="fill"
              className="mt-0.5 shrink-0 text-brand"
              aria-hidden
            />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </Card>
  );
}
