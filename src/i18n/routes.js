// Single source of truth for translated URL slugs.
// Add a new entry here and the language switcher + nav + canonical URL all follow.
export const ROUTES = {
  home:       { fr: '/',           en: '/en/',           es: '/es/',           it: '/it/' },
  fleet:      { fr: '/flotte',     en: '/en/fleet',      es: '/es/flota',      it: '/it/flotta' },
  rates:      { fr: '/tarifs',     en: '/en/rates',      es: '/es/tarifas',    it: '/it/tariffe' },
  faqContact: { fr: '/faq-contact', en: '/en/faq-contact', es: '/es/faq-contacto', it: '/it/faq-contatti' },
};

export function pathForRoute(routeKey, locale) {
  return ROUTES[routeKey]?.[locale] ?? ROUTES.home[locale];
}

export const ROUTE_KEYS = Object.keys(ROUTES);
