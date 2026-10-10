import type { Icon } from '@phosphor-icons/react';

import { Reveal } from '@/components/reveal';
import { Photo } from '@/components/ui/photo';
import type { Photo as PhotoData } from '@/content/photos';
import { cx } from '@/lib/cx';

export type Feature = {
  title: string;
  body: string;
  /** A photo header, or an icon when there's no photo. */
  photo?: PhotoData;
  Icon?: Icon;
};

/**
 * Cards for features, spaces or reasons. With photos they get an image header that
 * zooms on hover; with icons they're compact. One column on phones, then 2 or 3.
 */
export function FeatureGrid({
  features,
  columns = 3,
  className,
}: {
  features: Feature[];
  columns?: 2 | 3 | 4;
  className?: string;
}) {
  return (
    <ul
      className={cx(
        'grid gap-4 sm:grid-cols-2',
        columns === 3 && 'lg:grid-cols-3',
        columns === 4 && 'lg:grid-cols-4',
        className,
      )}
    >
      {features.map(({ title, body, photo, Icon }, index) => (
        <li key={title}>
          <Reveal step={index} className="h-full">
            <article className="group flex h-full flex-col overflow-hidden rounded-container border border-line bg-surface transition-[border-color,translate] duration-300 ease-out hover:-translate-y-1 hover:border-aqua">
              {photo ? (
                <div className="aspect-4/3 overflow-hidden">
                  <Photo
                    photo={photo}
                    sizes="(min-width: 1024px) 30vw, (min-width: 640px) 45vw, 92vw"
                    className="block size-full"
                    imgClassName="transition-transform duration-700 ease-out group-hover:scale-105"
                  />
                </div>
              ) : null}
              <div className="flex flex-1 flex-col gap-2 p-5 md:p-6">
                {Icon && !photo ? (
                  <span className="mb-1 grid size-12 place-items-center rounded-control bg-aqua-soft text-on-aqua-soft transition-transform duration-300 group-hover:-rotate-6">
                    <Icon size={24} weight="duotone" aria-hidden />
                  </span>
                ) : null}
                <h3 className="font-display text-heading font-semibold">{title}</h3>
                <p className="text-small text-ink-muted">{body}</p>
              </div>
            </article>
          </Reveal>
        </li>
      ))}
    </ul>
  );
}
