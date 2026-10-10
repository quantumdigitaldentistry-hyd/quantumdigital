import { PhoneCallIcon } from '@phosphor-icons/react';

import { PhoneLink } from '@/components/contact/phone-link';
import { SocialLinks } from '@/components/contact/social-links';
import { Container } from '@/components/ui/container';
import { useQuickActions } from '@/lib/quick-actions';

/**
 * Contact strip above the navigation: phone number and Instant call back on every screen
 * size, social icons from md up (on phones they live in the menu). Scrolls away; the
 * navigation below it stays.
 */
export function TopBar() {
  const show = useQuickActions((s) => s.show);
  return (
    <div className="bg-topbar text-small text-on-topbar">
      <Container className="flex min-h-12 items-center justify-between gap-3">
        <PhoneLink />
        <div className="flex items-center gap-4">
          <div className="hidden md:block">
            <SocialLinks size="sm" />
          </div>
          <button
            type="button"
            onClick={() => show('callback')}
            className="inline-flex min-h-9 items-center gap-1.5 rounded-full bg-highlight px-3.5 text-small font-semibold whitespace-nowrap text-on-highlight transition-transform duration-150 active:scale-95"
          >
            <PhoneCallIcon size={16} weight="bold" aria-hidden />
            Instant call back
          </button>
        </div>
      </Container>
    </div>
  );
}
