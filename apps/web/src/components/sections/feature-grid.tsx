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
  /** Small label above the title, e.g. "01". */
  kicker?: string;
};

const widths = {
  2: 'sm:w-[calc((100%-1rem)/2)]',
  3: 'sm:w-[calc((100%-1rem)/2)] lg:w-[calc((100%-2rem)/3)]',
  4: 'sm:w-[calc((100%-1rem)/2)] lg:w-[calc((100%-3rem)/4)]',
};

/**
 * Cards for features, spaces or reasons. With photos they get an image header that
 * zooms on hover; with icons they're compact. One column on phones, then 2, 3 or 4.
 * Cards in a row share a height, and a short last row is centred.
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
    <ul className={cx('flex flex-wrap justify-center gap-4', className)}>
      {features.map(({ title, body, photo, Icon, kicker }, index) => (
        <li key={title} className={cx('w-full', widths[columns])}>
          <Reveal step={index % columns} className="h-full" variant="tilt">
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
                  <span className="mb-1 grid size-12 place-items-center rounded-full bg-aqua-soft text-on-aqua-soft transition-transform duration-300 group-hover:-rotate-6">
                    <Icon size={24} weight="duotone" aria-hidden />
                  </span>
                ) : null}
                {kicker ? (
                  <span className="font-mono text-caption font-medium text-brand">{kicker}</span>
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
