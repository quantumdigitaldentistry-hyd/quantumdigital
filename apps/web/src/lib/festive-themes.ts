import type { FestivalKey } from '@quantam/shared';
import { useEffect } from 'react';

/**
 * Festival overlay. A festival only repaints the six `festive*` tokens, which are used by
 * offer banners, greeting cards and festive badges. Brand, ink and status colours never
 * change, so clinical screens look and read the same all year.
 *
 * Every palette is checked for WCAG AA (`pnpm check:contrast`): on-festive must reach
 * 4.5:1 on festive and festiveEnd, and on-festive-soft on festive-soft, in both themes.
 * festiveAccent is decorative only (dots, borders, motifs) and never carries text.
 */
export type FestivePalette = {
  festive: string;
  /** Second gradient stop. on-festive must pass on it too, so text can sit anywhere on the gradient. */
  festiveEnd: string;
  onFestive: string;
  festiveSoft: string;
  onFestiveSoft: string;
  festiveAccent: string;
};

export type FestiveTheme = {
  /** Name shown to clinic staff when they pick a theme for a campaign. */
  label: string;
  /** Default greeting line. The clinic can override it per campaign. */
  greeting: string;
  /** Where the colours come from, so future edits stay faithful to the festival. */
  inspiration: string;
  light: FestivePalette;
  dark: FestivePalette;
};

export const festiveThemes: Record<FestivalKey, FestiveTheme> = {
  clinic: {
    label: 'Everyday',
    greeting: 'Quantum Digital Dentistry',
    inspiration: 'Clinic signage: sunshine-yellow pills with plum lettering on aqua',
    light: {
      festive: '#FFE419',
      festiveEnd: '#FFD60A',
      onFestive: '#4A1D6B',
      festiveSoft: '#FFF8C7',
      onFestiveSoft: '#4A1D6B',
      festiveAccent: '#6DD3E6',
    },
    dark: {
      festive: '#FFE419',
      festiveEnd: '#FFC93C',
      onFestive: '#3A1556',
      festiveSoft: '#2E2A0B',
      onFestiveSoft: '#FFE97A',
      festiveAccent: '#5CC8DC',
    },
  },
  'new-year': {
    label: 'New Year',
    greeting: 'Happy New Year',
    inspiration: 'Midnight navy with the brand yellow as fireworks',
    light: {
      festive: '#0D1B2A',
      festiveEnd: '#1A3A6B',
      onFestive: '#FFE419',
      festiveSoft: '#E3EEFB',
      onFestiveSoft: '#13469B',
      festiveAccent: '#6DD3E6',
    },
    dark: {
      festive: '#FFE419',
      festiveEnd: '#FFB938',
      onFestive: '#0D1B2A',
      festiveSoft: '#13284A',
      onFestiveSoft: '#B7D3FF',
      festiveAccent: '#6DD3E6',
    },
  },
  sankranti: {
    label: 'Sankranti',
    greeting: 'Happy Sankranti',
    inspiration: 'Kites: saffron paper against a clear January sky',
    light: {
      festive: '#C2410C',
      festiveEnd: '#9A3412',
      onFestive: '#FFFFFF',
      festiveSoft: '#FFEAD5',
      onFestiveSoft: '#7C2D12',
      festiveAccent: '#2BB3D9',
    },
    dark: {
      festive: '#FF9A4D',
      festiveEnd: '#FFB870',
      onFestive: '#2A1003',
      festiveSoft: '#3A1C08',
      onFestiveSoft: '#FFC9A0',
      festiveAccent: '#6DD3E6',
    },
  },
  holi: {
    label: 'Holi',
    greeting: 'Happy Holi',
    inspiration: 'Gulal: magenta and green powder colours',
    light: {
      festive: '#C2185B',
      festiveEnd: '#8E24AA',
      onFestive: '#FFFFFF',
      festiveSoft: '#FDE4EF',
      onFestiveSoft: '#8A0F3F',
      festiveAccent: '#18A558',
    },
    dark: {
      festive: '#FF7AB6',
      festiveEnd: '#D98CFF',
      onFestive: '#2B0716',
      festiveSoft: '#3A0F22',
      onFestiveSoft: '#FFC2DD',
      festiveAccent: '#5FD49A',
    },
  },
  ugadi: {
    label: 'Ugadi',
    greeting: 'Ugadi Subhakankshalu',
    inspiration: 'Mango-leaf thoranam and turmeric',
    light: {
      festive: '#3F7D20',
      festiveEnd: '#2E6B1E',
      onFestive: '#FFFFFF',
      festiveSoft: '#E9F5DC',
      onFestiveSoft: '#2C5A14',
      festiveAccent: '#F2B705',
    },
    dark: {
      festive: '#9AD66B',
      festiveEnd: '#C5E26A',
      onFestive: '#0F1E05',
      festiveSoft: '#1C2C10',
      onFestiveSoft: '#C8EBA8',
      festiveAccent: '#F2C94C',
    },
  },
  'oral-health': {
    label: 'World Oral Health Day',
    greeting: 'Smile check-up week',
    inspiration: 'The clinic aqua, for dental awareness days (20 March, Dentist Day)',
    light: {
      festive: '#6DD3E6',
      festiveEnd: '#A5E6F2',
      onFestive: '#0D1B2A',
      festiveSoft: '#DDF5FA',
      onFestiveSoft: '#0B4F5C',
      festiveAccent: '#FFE419',
    },
    dark: {
      festive: '#5CC8DC',
      festiveEnd: '#8EDCEA',
      onFestive: '#04141A',
      festiveSoft: '#0E2A33',
      onFestiveSoft: '#A8E9F5',
      festiveAccent: '#FFE419',
    },
  },
  eid: {
    label: 'Ramzan',
    greeting: 'Eid Mubarak',
    inspiration: 'Deep emerald with a gold crescent',
    light: {
      festive: '#0F6B4F',
      festiveEnd: '#0B5A5E',
      onFestive: '#FFFFFF',
      festiveSoft: '#DDF2EA',
      onFestiveSoft: '#0A4A37',
      festiveAccent: '#C9A227',
    },
    dark: {
      festive: '#5ED3A8',
      festiveEnd: '#7DD8D8',
      onFestive: '#03201A',
      festiveSoft: '#0D2A22',
      onFestiveSoft: '#A8EBD3',
      festiveAccent: '#E3C25A',
    },
  },
  national: {
    label: 'Independence and Republic Day',
    greeting: 'Jai Hind',
    inspiration: 'Chakra navy, with saffron and green used only as small accents',
    light: {
      festive: '#0B3D91',
      festiveEnd: '#12307A',
      onFestive: '#FFFFFF',
      festiveSoft: '#FFF1E3',
      onFestiveSoft: '#9A3B00',
      festiveAccent: '#138808',
    },
    dark: {
      festive: '#8FB0FF',
      festiveEnd: '#B0C6FF',
      onFestive: '#071633',
      festiveSoft: '#2A1A0A',
      onFestiveSoft: '#FFC48A',
      festiveAccent: '#4CC24A',
    },
  },
  ganesh: {
    label: 'Vinayaka Chavithi',
    greeting: 'Happy Vinayaka Chavithi',
    inspiration: 'Vermilion and marigold garlands',
    light: {
      festive: '#B3261E',
      festiveEnd: '#C2410C',
      onFestive: '#FFFFFF',
      festiveSoft: '#FFF0D1',
      onFestiveSoft: '#7A4100',
      festiveAccent: '#F59E0B',
    },
    dark: {
      festive: '#FF8A75',
      festiveEnd: '#FFAA5C',
      onFestive: '#2B0804',
      festiveSoft: '#33240A',
      onFestiveSoft: '#FFD27A',
      festiveAccent: '#FBBF24',
    },
  },
  raksha: {
    label: 'Raksha Bandhan',
    greeting: 'Happy Raksha Bandhan',
    inspiration: 'Rakhi threads: deep sindoor red with marigold gold',
    light: {
      festive: '#9E1B32',
      festiveEnd: '#B8283D',
      onFestive: '#FFF1D0',
      festiveSoft: '#FDE8EC',
      onFestiveSoft: '#7A1426',
      festiveAccent: '#F0B429',
    },
    dark: {
      festive: '#F0B429',
      festiveEnd: '#F7C95E',
      onFestive: '#3A0A14',
      festiveSoft: '#2E1016',
      onFestiveSoft: '#FFC2CC',
      festiveAccent: '#E05A6E',
    },
  },
  janmashtami: {
    label: 'Janmashtami',
    greeting: 'Happy Janmashtami',
    inspiration: "Krishna's peacock feather: deep peacock blue with gold",
    light: {
      festive: '#0B4F6C',
      festiveEnd: '#12708F',
      onFestive: '#FFE7A3',
      festiveSoft: '#E2F3F8',
      onFestiveSoft: '#0B4F6C',
      festiveAccent: '#F2B53C',
    },
    dark: {
      festive: '#F2B53C',
      festiveEnd: '#F7C96B',
      onFestive: '#0B2A38',
      festiveSoft: '#0F2A33',
      onFestiveSoft: '#9FE0F2',
      festiveAccent: '#3FB3D1',
    },
  },
  onam: {
    label: 'Onam',
    greeting: 'Happy Onam',
    inspiration: 'Onasadya banana leaf green with kasavu cream and gold',
    light: {
      festive: '#1F5130',
      festiveEnd: '#2E6B3F',
      onFestive: '#FFF4D6',
      festiveSoft: '#FFF4D6',
      onFestiveSoft: '#1F5130',
      festiveAccent: '#D9A520',
    },
    dark: {
      festive: '#E8C35A',
      festiveEnd: '#F2D27A',
      onFestive: '#1A2E1F',
      festiveSoft: '#1A2B1F',
      onFestiveSoft: '#F5E2A8',
      festiveAccent: '#7CC489',
    },
  },
  dasara: {
    label: 'Bathukamma and Dasara',
    greeting: 'Happy Dasara',
    inspiration: 'Bathukamma flowers: gunugu magenta and tangedu yellow',
    light: {
      festive: '#A21C7A',
      festiveEnd: '#7B1FA2',
      onFestive: '#FFFFFF',
      festiveSoft: '#FBE3F3',
      onFestiveSoft: '#6E1053',
      festiveAccent: '#F5C400',
    },
    dark: {
      festive: '#F48FD3',
      festiveEnd: '#D9A0FF',
      onFestive: '#2A0620',
      festiveSoft: '#36102B',
      onFestiveSoft: '#FFC4EA',
      festiveAccent: '#FFD84D',
    },
  },
  diwali: {
    label: 'Deepavali',
    greeting: 'Happy Deepavali',
    inspiration: 'Diya gold on a deep indigo night',
    light: {
      festive: '#2E1A6E',
      festiveEnd: '#4A1D6B',
      onFestive: '#FFD873',
      festiveSoft: '#FFF4D6',
      onFestiveSoft: '#5B3A00',
      festiveAccent: '#FF8A00',
    },
    dark: {
      festive: '#FFC94D',
      festiveEnd: '#FFA94D',
      onFestive: '#1E1147',
      festiveSoft: '#241A3D',
      onFestiveSoft: '#FFE09A',
      festiveAccent: '#FF9F43',
    },
  },
  christmas: {
    label: 'Christmas',
    greeting: 'Merry Christmas',
    inspiration: 'Evergreen with holly red',
    light: {
      festive: '#1F6B3A',
      festiveEnd: '#14532D',
      onFestive: '#FFFFFF',
      festiveSoft: '#FCE8E8',
      onFestiveSoft: '#8E1B1B',
      festiveAccent: '#C62828',
    },
    dark: {
      festive: '#7FD69B',
      festiveEnd: '#A8E6B8',
      onFestive: '#062012',
      festiveSoft: '#33141A',
      onFestiveSoft: '#FFB4B4',
      festiveAccent: '#FF6B6B',
    },
  },
};

const toDeclarations = (palette: FestivePalette) =>
  Object.entries({
    festive: palette.festive,
    'festive-end': palette.festiveEnd,
    'on-festive': palette.onFestive,
    'festive-soft': palette.festiveSoft,
    'on-festive-soft': palette.onFestiveSoft,
    'festive-accent': palette.festiveAccent,
  })
    .map(([name, value]) => `--color-${name}:${value};`)
    .join('');

const STYLE_ID = 'festive-theme';

/**
 * Repaints the festive tokens for light and dark by writing one small style tag.
 * `:root:root` outranks the defaults in styles.css whatever the stylesheet order.
 * The everyday `clinic` look is the default in styles.css, so it clears the tag.
 */
export function applyFestiveTheme(key: FestivalKey) {
  let style = document.getElementById(STYLE_ID);
  if (!style) {
    style = document.createElement('style');
    style.id = STYLE_ID;
    document.head.append(style);
  }
  const theme = festiveThemes[key];
  style.textContent =
    key === 'clinic'
      ? ''
      : `:root:root{${toDeclarations(theme.light)}}` +
        `:root:root[data-theme='dark']{${toDeclarations(theme.dark)}}`;
}

/** Keeps the festive tokens in sync with the running campaign. Mount once, near the root. */
export function useFestiveTheme(key: FestivalKey = 'clinic') {
  useEffect(() => {
    applyFestiveTheme(key);
  }, [key]);
}
