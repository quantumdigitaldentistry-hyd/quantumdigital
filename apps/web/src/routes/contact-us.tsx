import { CalendarPlusIcon, PhoneIcon, ShareNetworkIcon } from '@phosphor-icons/react';
import type { ReactNode } from 'react';

import { ClinicLocation } from '@/components/contact/clinic-location';
import { ContactOptions } from '@/components/contact/contact-options';
import { PhoneLink } from '@/components/contact/phone-link';
import { SocialLinks } from '@/components/contact/social-links';
import { Reveal } from '@/components/reveal';
import { PageHero } from '@/components/sections/page-hero';
import { Section } from '@/components/sections/section';
import { buttonClass } from '@/components/ui/button-class';
import { Card } from '@/components/ui/card';
import { BookLink } from '@/components/contact/book-link';

function ContactCard({
  icon,
  title,
  children,
}: {
  icon: ReactNode;
  title: string;
  children: ReactNode;
}) {
  return (
    <Card className="flex h-full flex-col gap-3">
      <span className="grid size-11 place-items-center rounded-control bg-aqua-soft text-on-aqua-soft">
        {icon}
      </span>
      <h3 className="font-display text-heading font-semibold">{title}</h3>
      {children}
    </Card>
  );
}

export default function ContactUsPage() {
  return (
    <>
      <PageHero
        eyebrow="Contact us"
        title="Talk to the clinic"
        description="Call, request a call back, or book a visit."
      >
        <ContactOptions />
      </PageHero>

      <Section title="Ways to reach us">
        <ul className="grid gap-4 md:grid-cols-3">
          <li>
            <Reveal step={0} className="h-full">
              <ContactCard
                icon={<PhoneIcon size={24} weight="duotone" aria-hidden />}
                title="Phone"
              >
                <PhoneLink className="text-brand" />
              </ContactCard>
            </Reveal>
          </li>
          <li>
            <Reveal step={1} className="h-full">
              <ContactCard
                icon={<CalendarPlusIcon size={24} weight="duotone" aria-hidden />}
                title="Appointments"
              >
                <BookLink className={buttonClass('secondary', 'self-start')}>
                  Book an appointment
                </BookLink>
              </ContactCard>
            </Reveal>
          </li>
          <li>
            <Reveal step={2} className="h-full">
              <ContactCard
                icon={<ShareNetworkIcon size={24} weight="duotone" aria-hidden />}
                title="Social media"
              >
                <SocialLinks className="-ml-2.5 text-brand" />
              </ContactCard>
            </Reveal>
          </li>
        </ul>
      </Section>

      <ClinicLocation tinted />
    </>
  );
}
