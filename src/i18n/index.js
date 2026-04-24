import fr from './fr.json';
import en from './en.json';
import es from './es.json';
import it from './it.json';

export const LOCALES = ['fr', 'en', 'es', 'it'];
export const DEFAULT_LOCALE = 'fr';

const STRINGS = { fr, en, es, it };

export function t(locale) {
  return STRINGS[locale] ?? STRINGS[DEFAULT_LOCALE];
}

// Build a path for a given locale. FR (default) is unprefixed.
// Prefer pathForRoute() for navigable app pages — localizedPath is for ad-hoc
// anchors or deep-links (e.g. "/#booking-form") that don't need a translated slug.
export function localizedPath(locale, path = '/') {
  const clean = path.startsWith('/') ? path : `/${path}`;
  if (locale === DEFAULT_LOCALE) return clean;
  return `/${locale}${clean === '/' ? '' : clean}`;
}

export { ROUTES, pathForRoute, ROUTE_KEYS } from './routes.js';
