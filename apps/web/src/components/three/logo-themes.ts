/**
 * Theme palettes for the 3D logo, from the brand kit (docs/brand/kit/dashboard3d).
 * They colour 3D materials and the stage, so they live here rather than in the UI tokens.
 */
export const LOGO_THEMES = {
  brand: {
    stage: '#050a24',
    glow: '#29a9e6',
    v: ['#1f3fc4', '#29a9e6', '#6fd2e5', '#7b5cff', '#ffffff'],
  },
  independence: {
    stage: '#06123a',
    glow: '#ff9a1f',
    v: ['#ff7a00', '#ffffff', '#00b140', '#1a3cff', '#ffb300'],
  },
  diwali: {
    stage: '#12052a',
    glow: '#ffb703',
    v: ['#ffb703', '#ff6d00', '#ff006e', '#9d4edd', '#ffe066'],
  },
  holi: {
    stage: '#18062e',
    glow: '#ff006e',
    v: ['#ff006e', '#ffbe0b', '#00f5d4', '#3a86ff', '#8338ec', '#fb5607'],
  },
  ganesh: {
    stage: '#2a0c00',
    glow: '#ff8c00',
    v: ['#ff6d00', '#ffc300', '#ff2e2e', '#ff8fab', '#ffe45e'],
  },
  navratri: {
    stage: '#24031a',
    glow: '#ff4081',
    v: ['#ff1744', '#ff9100', '#ffea00', '#00e676', '#2979ff', '#d500f9', '#ff4081'],
  },
  sankranti: {
    stage: '#03203d',
    glow: '#00bbf9',
    v: ['#ff006e', '#ffbe0b', '#00bbf9', '#00f5d4', '#fb5607'],
  },
  onam: {
    stage: '#0b2006',
    glow: '#ffb703',
    v: ['#ffb703', '#fb8500', '#e10600', '#38b000', '#ffea00'],
  },
  janmashtami: {
    stage: '#04182a',
    glow: '#3fb3d1',
    v: ['#0b6e99', '#3fb3d1', '#f2b53c', '#2e8b57', '#ffffff'],
  },
  raksha: {
    stage: '#2a0610',
    glow: '#f0b429',
    v: ['#c8102e', '#f0b429', '#ff7a00', '#ffd166', '#ffffff'],
  },
  eid: {
    stage: '#021f17',
    glow: '#ffd166',
    v: ['#ffd166', '#06d6a0', '#118ab2', '#fff4d6', '#90e0ef'],
  },
  christmas: {
    stage: '#03190f',
    glow: '#ff1e3c',
    v: ['#ff1e3c', '#00e676', '#ffd700', '#ffffff', '#40c4ff'],
  },
} as const;

export type LogoTheme = keyof typeof LOGO_THEMES;
