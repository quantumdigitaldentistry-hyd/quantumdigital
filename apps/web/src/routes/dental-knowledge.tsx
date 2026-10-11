import { ArrowRightIcon } from '@phosphor-icons/react';
import { Link } from 'react-router';

import { Tilt } from '@/components/fx/tilt';
import { Reveal } from '@/components/reveal';
import { PageHero } from '@/components/sections/page-hero';
import { PlannedContent } from '@/components/sections/planned-content';
import { Section } from '@/components/sections/section';
import { storedPhoto, useArticles } from '@/lib/live-content';
import { Photo } from '@/components/ui/photo';

const dateFormat = new Intl.DateTimeFormat('en-IN', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
});

export default function DentalKnowledgePage() {
  const articles = useArticles();
  const list = articles.data ?? [];

  return (
    <>
      <PageHero
        eyebrow="Dental knowledge"
        title="Clear answers about your teeth"
        description="Short, practical guides and stories from the clinic's dentists."
      />
      {list.length ? (
        <Section title="Latest from the clinic">
          <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {list.map((article, index) => (
              <li key={article.id}>
                <Reveal step={index % 3} variant="tilt" className="h-full">
                  <Tilt className="h-full rounded-container">
                    <Link
                      to={`/dental-knowledge/${article.slug}`}
                      viewTransition
                      className="group flex h-full flex-col overflow-hidden rounded-container border border-line bg-surface transition-[border-color,translate] duration-300 hover:-translate-y-1 hover:border-aqua"
                    >
                      <div className="aspect-video overflow-hidden bg-sunken">
                        {article.cover_path ? (
                          <Photo
                            photo={storedPhoto(article.cover_path, article.cover_alt)}
                            sizes="(min-width: 1024px) 30vw, (min-width: 640px) 45vw, 92vw"
                            className="block size-full"
                            imgClassName="transition-transform duration-700 ease-out group-hover:scale-105"
                          />
                        ) : null}
                      </div>
                      <div className="flex flex-1 flex-col gap-2 p-5">
                        <p className="text-caption font-semibold tracking-widest text-brand uppercase">
                          {article.kind === 'blog' ? 'Blog' : 'Guide'}
                          {article.published_at
                            ? ` · ${dateFormat.format(new Date(article.published_at))}`
                            : ''}
                        </p>
                        <h3 className="font-display text-heading font-semibold text-balance">
                          {article.title}
                        </h3>
                        {article.excerpt ? (
                          <p className="text-small text-ink-muted">{article.excerpt}</p>
                        ) : null}
                        <span className="mt-auto inline-flex items-center gap-1.5 pt-3 text-small font-semibold text-brand">
                          Read
                          <ArrowRightIcon
                            size={16}
                            aria-hidden
                            className="transition-transform duration-300 group-hover:translate-x-1"
                          />
                        </span>
                      </div>
                    </Link>
                  </Tilt>
                </Reveal>
              </li>
            ))}
          </ul>
        </Section>
      ) : (
        <Section title="Guides on the way">
          <PlannedContent
            items={[
              'Brushing and flossing, done right',
              "Children's dental care",
              'Keeping gums healthy',
              'Aligners or braces: how to choose',
              'Living with dental implants',
              'Common dental myths',
            ]}
          />
        </Section>
      )}
    </>
  );
}
