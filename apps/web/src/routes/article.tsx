import { useEffect } from 'react';
import { Link, useParams } from 'react-router';

import { BackButton } from '@/components/back-button';
import { DepthField } from '@/components/fx/depth-field';
import { ClosingCta } from '@/components/landing/closing-cta';
import { Container } from '@/components/ui/container';
import { PageLoader } from '@/components/ui/page-loader';
import { Photo } from '@/components/ui/photo';
import { storedPhoto, useArticle } from '@/lib/live-content';
import { Markdown } from '@/lib/markdown';

const dateFormat = new Intl.DateTimeFormat('en-IN', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
});

/** One published Dental Knowledge article or blog post. */
export default function ArticlePage() {
  const { slug } = useParams();
  const article = useArticle(slug);

  useEffect(() => {
    if (!article.data) return;
    const previous = document.title;
    document.title = `${article.data.title} · Quantum Digital Dentistry`;
    return () => {
      document.title = previous;
    };
  }, [article.data]);

  if (article.isPending && article.fetchStatus !== 'idle')
    return <PageLoader label="Loading article" />;
  if (!article.data) {
    return (
      <Container className="flex flex-col items-start gap-4 py-20">
        <h1 className="font-display text-title font-bold">Article not found</h1>
        <p className="text-ink-muted">It may have been moved or taken down.</p>
        <Link to="/dental-knowledge" className="font-semibold text-brand">
          All dental knowledge
        </Link>
      </Container>
    );
  }
  const data = article.data;

  return (
    <>
      <section className="relative isolate overflow-hidden bg-linear-to-br from-hero-from to-hero-to text-on-hero">
        <DepthField className="-z-10" density={0.7} />
        <Container className="flex flex-col gap-4 py-10 md:py-16">
          <BackButton fallback="/dental-knowledge" />
          <p className="enter text-label font-semibold tracking-[0.14em] text-on-hero-muted uppercase">
            {data.kind === 'blog' ? 'Blog' : 'Guide'}
            {data.published_at ? ` · ${dateFormat.format(new Date(data.published_at))}` : ''}
          </p>
          <h1 className="enter max-w-3xl font-display text-[clamp(2.2rem,6vw,3.6rem)] leading-[1.06] font-bold tracking-[-0.03em] text-balance">
            {data.title}
          </h1>
          {data.excerpt ? (
            <p className="enter max-w-[60ch] text-on-hero-muted md:text-heading md:font-normal">
              {data.excerpt}
            </p>
          ) : null}
        </Container>
      </section>
      <Container className="py-10 md:py-16">
        <article className="mx-auto flex max-w-3xl flex-col gap-8">
          {data.cover_path ? (
            <Photo
              photo={storedPhoto(data.cover_path, data.cover_alt)}
              sizes="(min-width: 768px) 48rem, 92vw"
              priority
              className="block aspect-video overflow-hidden rounded-4xl"
            />
          ) : null}
          <Markdown
            source={data.body}
            className="flex flex-col gap-4 text-body leading-relaxed md:text-heading md:font-normal"
          />
        </article>
      </Container>
      <ClosingCta />
    </>
  );
}
