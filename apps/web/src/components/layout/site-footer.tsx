import { Link } from 'react-router';

import { Logo } from '@/components/brand/logo';
import { PhoneLink } from '@/components/contact/phone-link';
import { SocialLinks } from '@/components/contact/social-links';
import { Container } from '@/components/ui/container';
import { clinic, navItems } from '@/config/site';
import { photoCredits } from '@/content/photos';

export function SiteFooter() {
  return (
    // Extra bottom space on phones so the floating actions never cover the last line.
    <footer className="border-t border-line bg-surface pb-28 md:pb-0">
      <Container className="grid gap-8 py-10 md:grid-cols-[1.4fr_1fr_1fr]">
        <div className="flex flex-col gap-3">
          <Logo />
          <p className="max-w-xs text-small text-ink-muted">
            Your complete smile destination. All your dental solutions, digitally advanced.
          </p>
        </div>
        <nav aria-label="Footer" className="flex flex-col gap-2">
          <p className="text-label font-semibold tracking-[0.08em] text-ink-subtle uppercase">
            Explore
          </p>
          {navItems.map(({ to, label }) => (
            <Link key={to} to={to} viewTransition className="text-small hover:text-brand">
              {label}
            </Link>
          ))}
        </nav>
        <div className="flex flex-col gap-3">
          <p className="text-label font-semibold tracking-[0.08em] text-ink-subtle uppercase">
            Contact
          </p>
          <PhoneLink className="text-small" />
          <SocialLinks className="-ml-2.5 text-brand" />
        </div>
      </Container>
      <Container className="flex flex-col gap-2 border-t border-line py-5 text-caption text-ink-muted sm:flex-row sm:justify-between">
        <p>
          © {new Date().getFullYear()} {clinic.name}
        </p>
        <p>
          Photos on{' '}
          <a
            href="https://unsplash.com"
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-brand"
          >
            Unsplash
          </a>
          : {photoCredits.join(', ')}
        </p>
        <Link to="/design" className="hover:text-brand">
          Design system
        </Link>
      </Container>
    </footer>
  );
}
