import { z } from 'zod';

import { FESTIVAL_KEYS } from '../constants';

/**
 * A festival offer or greeting the clinic runs for a fixed window. Festival dates move
 * every year (most follow the lunar calendar), so the clinic sets the window per campaign
 * instead of the app computing it.
 */
export const campaignSchema = z
  .object({
    festival: z.enum(FESTIVAL_KEYS),
    title: z.string().trim().min(3, 'Add a short title').max(60),
    /** The headline number, kept short so it fits a phone banner: "20% off", "₹999". */
    offer: z.string().trim().min(2).max(24),
    details: z.string().trim().max(160).optional(),
    startsOn: z.iso.date(),
    endsOn: z.iso.date(),
  })
  .refine((c) => c.endsOn >= c.startsOn, {
    path: ['endsOn'],
    message: 'End date must be on or after the start date',
  });

export type Campaign = z.infer<typeof campaignSchema>;

/** The campaign running on `today` (YYYY-MM-DD). If several overlap, the one that started last wins. */
export function activeCampaign<T extends Pick<Campaign, 'startsOn' | 'endsOn'>>(
  campaigns: readonly T[],
  today: string,
): T | undefined {
  return campaigns
    .filter((c) => c.startsOn <= today && today <= c.endsOn)
    .sort((a, b) => b.startsOn.localeCompare(a.startsOn))[0];
}
