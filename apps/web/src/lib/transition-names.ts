/**
 * Shared view-transition names: an element on one page and its counterpart on the next
 * get the same name, and the browser morphs one into the other during navigation.
 * Each name must be unique on a page at any moment.
 */
export const vtNames = {
  treatmentTitle: (slug: string) => `treatment-title-${slug}`,
  treatmentPhoto: (slug: string) => `treatment-photo-${slug}`,
  doctorPhoto: (slug: string) => `doctor-photo-${slug}`,
};
