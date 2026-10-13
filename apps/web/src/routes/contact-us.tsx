import {
  CalendarPlusIcon,
  EnvelopeSimpleIcon,
  PhoneIcon,
  ShareNetworkIcon,
} from '@phosphor-icons/react';
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
import { Photo } from '@/components/ui/photo';
import { clinic } from '@/config/site';
import { photos } from '@/content/photos';
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
        aside={
          // The same doctor as the call-back panel, standing on the band's lower edge.
          <>
            <span
              aria-hidden
              className="absolute bottom-0 left-1/2 size-80 -translate-x-1/2 translate-y-1/3 rounded-full bg-surface/40 blur-2xl"
            />
            <Photo
              photo={photos.callbackDoctor}
              sizes="20rem"
              fit="contain"
              priority
              className="absolute inset-x-0 top-6 bottom-0 mx-auto block w-full"
              imgClassName="object-bottom drop-shadow-[0_18px_24px_rgb(7_13_40/0.25)]"
            />
          </>
        }
      >
        <ContactOptions />
      </PageHero>

      <Section title="Ways to reach us">
        {/* Two to a row on tablets (social media full width under them), three on laptops. */}
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <li>
            <Reveal step={0} className="h-full">
              <ContactCard
                icon={<PhoneIcon size={24} weight="duotone" aria-hidden />}
                title="Call or email"
              >
                <PhoneLink className="text-brand" />
                <a
                  href={`mailto:${clinic.email}`}
                  className="inline-flex w-fit items-center gap-2 text-small font-medium break-all text-brand hover:underline"
                >
                  <EnvelopeSimpleIcon size={16} weight="fill" className="shrink-0" aria-hidden />
                  {clinic.email}
                </a>
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
          <li className="sm:col-span-2 lg:col-span-1">
            <Reveal step={2} className="h-full">
              <ContactCard
                icon={<ShareNetworkIcon size={24} weight="duotone" aria-hidden />}
                title="Social media"
              >
                <SocialLinks className="-ml-2.5 flex-wrap text-brand" />
              </ContactCard>
            </Reveal>
          </li>
        </ul>
      </Section>

      <ClinicLocation tinted />
    </>
  );
}
