import { CalendarPlusIcon, SparkleIcon, XIcon } from '@phosphor-icons/react';
import { useEffect, useLayoutEffect, useRef } from 'react';

import { FestivalAmbience } from '@/components/fx/festival-ambience';
import { Tilt } from '@/components/fx/tilt';
import { Reveal } from '@/components/reveal';
import { Container } from '@/components/ui/container';
import { BookLink } from '@/components/contact/book-link';
import { useActiveFestival } from '@/lib/active-festival';
import { greetingFor, type FestivalPack } from '@/lib/festival-packs';
import { markPopupSeen, popupSeen, useFestivalPopup } from '@/lib/festival-popup';
import { useSiteSettings, type FestivalOffer } from '@/lib/site-settings';

const validity = (offer: FestivalOffer) =>
  offer.validUntil
    ? `Valid till ${new Intl.DateTimeFormat('en-IN', { day: 'numeric', month: 'long' }).format(new Date(`${offer.validUntil}T12:00`))}`
    : 'For a limited time';

/** The deity (or symbol) in an arch, with a glowing festive ring and floating light. */
function Shrine({ pack, className = '' }: { pack: FestivalPack; className?: string }) {
  return (
    <div className={`festival-shrine relative ${className}`}>
      <span aria-hidden className="festival-halo absolute -inset-4 rounded-t-full" />
      <div className="relative size-full overflow-hidden rounded-t-full rounded-b-3xl border-2 border-festive-accent shadow-2xl shadow-elevation/40">
        <img
          src={pack.icon3d.portrait}
          alt={pack.icon3d.alt}
          width={720}
          height={900}
          className="size-full object-cover"
        />
        <span aria-hidden className="festival-sheen absolute inset-0" />
      </div>
    </div>
  );
}

/** Small round medallion of the festival's deity/symbol for the navbar; opens the popup. */
export function FestivalMedallion() {
  const pack = useActiveFestival();
  const setOpen = useFestivalPopup((s) => s.setOpen);
  if (!pack) return null;
  return (
    <button
      type="button"
      onClick={() => setOpen(true)}
      aria-label={`${greetingFor(pack)}: festival greetings and offer`}
      title={greetingFor(pack)}
      className="festival-medallion relative grid size-11 shrink-0 place-items-center rounded-full"
    >
      <span aria-hidden className="festival-ring absolute inset-0 rounded-full" />
      <img
        src={pack.icon3d.small}
        alt=""
        width={160}
        height={160}
        className="relative size-9 rounded-full object-cover ring-2 ring-surface"
      />
    </button>
  );
}

/** Offer details, shared by the banner and the popup. */
function OfferCard({ offer, compact = false }: { offer: FestivalOffer; compact?: boolean }) {
  return (
    <div className="festival-offer relative overflow-hidden rounded-3xl border border-on-festive/25 bg-on-festive/10 p-4 backdrop-blur-sm">
      <p className="text-caption font-semibold tracking-[0.14em] uppercase opacity-85">
        Festival offer
      </p>
      {offer.discount ? (
        <p
          className={`festival-shimmer font-display leading-none font-bold ${compact ? 'text-[2.4rem]' : 'text-[3.2rem]'}`}
        >
          {offer.discount}
        </p>
      ) : null}
      {offer.title ? (
        <p className="mt-1 font-display text-heading font-semibold">{offer.title}</p>
      ) : null}
      {offer.details ? <p className="mt-1 text-small opacity-90">{offer.details}</p> : null}
      <p className="mt-2 text-caption opacity-80">{validity(offer)} · Terms apply</p>
    </div>
  );
}

/** Home banner during a festival: deity, greeting, blessing and the offer, in 3D. */
export function FestivalBanner({ className }: { className?: string }) {
  const pack = useActiveFestival();
  const offer = useSiteSettings((s) => s.offer);
  const setOpen = useFestivalPopup((s) => s.setOpen);
  if (!pack) return null;

  return (
    <Container className={className}>
      <Reveal variant="tilt">
        <Tilt className="rounded-4xl" max={4}>
          <section
            aria-label={greetingFor(pack)}
            className="festival-banner relative isolate overflow-hidden rounded-4xl bg-linear-to-br from-festive to-festive-end text-on-festive shadow-2xl shadow-elevation/30"
          >
            <span aria-hidden className="festival-sweep absolute inset-0 -z-10" />
            <div className="grid items-center gap-6 p-6 md:grid-cols-[auto_1fr_auto] md:gap-10 md:p-10">
              <Shrine pack={pack} className="mx-auto h-48 w-38 md:h-60 md:w-48" />
              <div className="flex flex-col gap-3 text-center md:text-left">
                <p className="flex items-center justify-center gap-2 text-label font-semibold tracking-[0.16em] uppercase opacity-90 md:justify-start">
                  <SparkleIcon size={16} weight="fill" aria-hidden /> {pack.label}
                </p>
                <h2 className="font-display text-[clamp(2rem,5vw,3.4rem)] leading-[1.05] font-bold text-balance">
                  {greetingFor(pack)}
                </h2>
                <p className="max-w-[46ch] text-body opacity-90 md:text-heading md:font-normal">
                  {pack.blessing}
                </p>
                <div className="mt-1 flex flex-wrap justify-center gap-3 md:justify-start">
                  <BookLink className="inline-flex min-h-11 items-center gap-2 rounded-full bg-on-festive px-5 font-semibold text-festive transition-transform active:scale-[0.97]">
                    <CalendarPlusIcon size={20} aria-hidden />
                    {offer ? 'Book with this offer' : 'Book a visit'}
                  </BookLink>
                  {offer ? (
                    <button
                      type="button"
                      onClick={() => setOpen(true)}
                      className="inline-flex min-h-11 items-center gap-2 rounded-full border border-on-festive/40 px-5 font-semibold"
                    >
                      View offer
                    </button>
                  ) : null}
                </div>
              </div>
              {offer ? (
                <div className="md:w-64">
                  <OfferCard offer={offer} />
                </div>
              ) : (
                <img
                  src={pack.logo.small}
                  alt=""
                  width={256}
                  height={256}
                  className="mx-auto hidden size-32 md:block"
                />
              )}
            </div>
            <p className="absolute right-4 bottom-2 text-[10px] opacity-60">
              Photo: {pack.icon3d.credit} / Unsplash
            </p>
          </section>
        </Tilt>
      </Reveal>
    </Container>
  );
}

/** Greeting + offer popup: once per visit when the team has set an offer, or from the medallion. */
function FestivalPopup({ pack }: { pack: FestivalPack }) {
  const offer = useSiteSettings((s) => s.offer);
  const { open, setOpen } = useFestivalPopup();
  const ref = useRef<HTMLDialogElement>(null);

  // First visit during the festival: open after a short pause, if the offer asks for it.
  useEffect(() => {
    if (!offer?.popup || popupSeen(pack.id)) return;
    const timer = window.setTimeout(() => setOpen(true), 2500);
    return () => window.clearTimeout(timer);
  }, [offer, pack.id, setOpen]);

  useLayoutEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  const close = () => {
    markPopupSeen(pack.id);
    setOpen(false);
  };

  return (
    <dialog
      ref={ref}
      aria-labelledby="festival-popup-title"
      onClose={close}
      onClick={(event) => event.target === event.currentTarget && close()}
      className="festival-popup m-auto w-[min(56rem,calc(100vw-1.5rem))] max-w-none overflow-visible border-0 bg-transparent p-0 backdrop:bg-scrim/60 backdrop:backdrop-blur-sm"
    >
      {open ? (
        <div className="festival-popup-card relative isolate overflow-hidden rounded-[2rem] bg-linear-to-br from-festive to-festive-end text-on-festive shadow-2xl">
          <FestivalAmbienceInline effect={pack.effect} />
          <span aria-hidden className="festival-sweep absolute inset-0 -z-10" />
          <button
            type="button"
            onClick={close}
            aria-label="Close"
            className="absolute top-3 right-3 z-10 grid size-11 place-items-center rounded-full bg-on-festive/15 hover:bg-on-festive/25"
          >
            <XIcon size={20} aria-hidden />
          </button>
          <div className="grid gap-6 p-6 md:grid-cols-[0.85fr_1fr] md:items-center md:gap-10 md:p-10">
            <Shrine pack={pack} className="mx-auto h-64 w-52 md:h-[26rem] md:w-80" />
            <div className="flex flex-col gap-4 text-center md:text-left">
              <p className="text-label font-semibold tracking-[0.16em] uppercase opacity-90">
                Quantum Digital Dentistry
              </p>
              <h2
                id="festival-popup-title"
                className="font-display text-[clamp(2rem,6vw,3.2rem)] leading-[1.04] font-bold text-balance"
              >
                {greetingFor(pack)}
              </h2>
              <p className="opacity-90 md:text-heading md:font-normal">{pack.blessing}</p>
              {offer ? <OfferCard offer={offer} compact /> : null}
              <div className="flex flex-wrap justify-center gap-3 md:justify-start">
                <BookLink
                  onClick={close}
                  className="inline-flex min-h-12 items-center gap-2 rounded-full bg-on-festive px-6 font-semibold text-festive transition-transform active:scale-[0.97]"
                >
                  <CalendarPlusIcon size={20} aria-hidden />
                  {offer ? 'Book with this offer' : 'Book a visit'}
                </BookLink>
                <button
                  type="button"
                  onClick={close}
                  className="min-h-12 rounded-full px-5 font-semibold opacity-90 hover:opacity-100"
                >
                  Maybe later
                </button>
              </div>
              <p className="text-[11px] opacity-60">Photo: {pack.icon3d.credit} / Unsplash</p>
            </div>
          </div>
        </div>
      ) : null}
    </dialog>
  );
}

/** Particles confined to the popup card. */
function FestivalAmbienceInline({ effect }: { effect: FestivalPack['effect'] }) {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 -z-10 [&>canvas]:absolute! [&>canvas]:z-0!"
    >
      <FestivalAmbience effect={effect} />
    </div>
  );
}

/**
 * Everything a festival adds to every page: the ambient particles and lighting, and the
 * greeting/offer popup. Mounted once in the root layout; renders nothing on normal days.
 */
export function FestivalLayer() {
  const pack = useActiveFestival();
  if (!pack) return null;
  return (
    <>
      <FestivalAmbience effect={pack.effect} />
      <FestivalPopup pack={pack} />
    </>
  );
}
