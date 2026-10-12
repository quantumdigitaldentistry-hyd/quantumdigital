import {
  CalendarPlusIcon,
  EnvelopeSimpleIcon,
  MapPinIcon,
  PhoneCallIcon,
} from '@phosphor-icons/react';
import { Link } from 'react-router';

import { Logo } from '@/components/brand/logo';
import { BookLink } from '@/components/contact/book-link';
import { PhoneLink } from '@/components/contact/phone-link';
import { SocialLinks } from '@/components/contact/social-links';
import { buttonClass } from '@/components/ui/button-class';
import { Container } from '@/components/ui/container';
import { clinic, navItems } from '@/config/site';
import { treatments } from '@/content/clinic';
import { useQuickActions } from '@/lib/quick-actions';

const heading = 'text-label font-semibold tracking-[0.08em] text-ink-subtle uppercase';
const link = 'w-fit text-small transition-colors hover:text-brand';

// A short list for the footer; the full list is one click away.
const footerTreatments = ['implants', 'aligners', 'braces', 'smile-design', 'root-canal']
  .map((slug) => treatments.find((treatment) => treatment.slug === slug))
  .filter((treatment) => treatment !== undefined);

/**
 * Four columns from lg up: the clinic and its two main actions, site links, popular
 * treatments, and how to reach us (phone, email, address, social media). Below lg the
 * clinic and contact blocks run full width, with the two link lists side by side.
 */
export function SiteFooter() {
  const show = useQuickActions((s) => s.show);

  return (
    // Extra bottom space on phones so the floating actions never cover the last line.
    <footer className="border-t border-line bg-surface pb-28 md:pb-0">
      <Container className="grid grid-cols-2 gap-x-6 gap-y-10 py-12 lg:grid-cols-[1.4fr_0.8fr_1fr_1.3fr] lg:gap-8">
        <div className="col-span-2 flex flex-col gap-4 lg:col-span-1">
          <Logo />
          <p className="max-w-xs text-small text-ink-muted">
            Your complete smile destination. All your dental solutions, digitally advanced.
          </p>
          <div className="flex flex-wrap gap-2">
            <BookLink className={buttonClass('primary', 'min-h-10 px-4 text-small')}>
              <CalendarPlusIcon size={18} aria-hidden />
              Book appointment
            </BookLink>
            <button
              type="button"
              onClick={() => show('callback')}
              className={buttonClass('callback', 'min-h-10 px-4 text-small')}
            >
              <PhoneCallIcon size={18} aria-hidden />
              Instant call back
            </button>
          </div>
        </div>

        <nav aria-label="Footer" className="flex flex-col gap-2.5">
          <p className={heading}>Explore</p>
          {[...navItems, { to: '/gallery', label: 'Gallery' }].map(({ to, label }) => (
            <Link key={to} to={to} viewTransition className={link}>
              {label}
            </Link>
          ))}
        </nav>

        <nav aria-label="Popular treatments" className="flex flex-col gap-2.5">
          <p className={heading}>Treatments</p>
          {footerTreatments.map((treatment) => (
            <Link
              key={treatment.slug}
              to={`/treatments/${treatment.slug}`}
              viewTransition
              className={link}
            >
              {treatment.name}
            </Link>
          ))}
          <Link to="/treatments" viewTransition className={`${link} font-semibold text-brand`}>
            All {treatments.length} treatments
          </Link>
        </nav>

        <div className="col-span-2 flex flex-col gap-4 lg:col-span-1">
          <p className={heading}>Contact</p>
          <div className="flex flex-col gap-2.5">
            <PhoneLink className="text-small" />
            <a
              href={`mailto:${clinic.email}`}
              className="inline-flex w-fit items-center gap-2 text-small break-all hover:text-brand hover:underline"
            >
              <EnvelopeSimpleIcon size={16} weight="fill" className="shrink-0" aria-hidden />
              {clinic.email}
            </a>
          </div>
          <a
            href={clinic.address.mapsUrl}
            target="_blank"
            rel="noreferrer"
            className="flex items-start gap-2 text-small text-ink-muted transition-colors hover:text-brand"
          >
            <MapPinIcon size={16} weight="fill" className="mt-0.5 shrink-0 text-ink" aria-hidden />
            <address className="not-italic">
              {clinic.address.lines.map((line) => (
                <span key={line} className="block">
                  {line}
                </span>
              ))}
            </address>
          </a>
          <SocialLinks className="-ml-2.5 text-brand" />
        </div>
      </Container>
      <Container className="flex flex-col gap-2 border-t border-line py-5 text-caption text-ink-muted sm:flex-row sm:justify-between">
        <p>
          © {new Date().getFullYear()} {clinic.name}
        </p>
        <p>
          Developed by{' '}
          <a
            href="https://www.linkedin.com/in/gandhodijayanth/"
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-ink underline-offset-2 hover:text-brand hover:underline"
          >
            Jayanth
            <span className="sr-only"> (LinkedIn, opens in a new tab)</span>
          </a>
        </p>
      </Container>
    </footer>
  );
}
