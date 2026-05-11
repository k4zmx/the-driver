// JSON-LD schema builders — one place for structured data helpers so the
// page files stay free of schema boilerplate.

/**
 * Turn the localized FAQ categories tree into a flat FAQPage schema.
 * Google only uses the top-level `mainEntity` array; categories are flattened.
 */
export function buildFaqPageSchema(faq) {
  const items = [];
  for (const category of faq?.categories ?? []) {
    for (const qa of category?.items ?? []) {
      if (!qa?.q || !qa?.a) continue;
      items.push({
        '@type': 'Question',
        name: qa.q,
        acceptedAnswer: { '@type': 'Answer', text: qa.a },
      });
    }
  }
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items,
  };
}

/**
 * Taxi / transfer Service schema — shipped on the Tarifs page so search
 * engines understand the priced service offerings.
 */
export function buildRatesServiceSchema({ locale, siteUrl }) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Service',
    serviceType: 'Private chauffeur / taxi transfer',
    provider: {
      '@type': 'TaxiService',
      name: 'Driver Services',
      telephone: '+33634301292',
      areaServed: 'Paris, Île-de-France',
    },
    areaServed: ['Paris', 'Charles de Gaulle Airport', 'Orly Airport', 'Beauvais Airport', 'Disneyland Paris', 'Versailles'],
    offers: {
      '@type': 'AggregateOffer',
      priceCurrency: 'EUR',
      lowPrice: '45',
      highPrice: '200',
      offerCount: '42',
      availability: 'https://schema.org/InStock',
      url: siteUrl,
    },
    inLanguage: locale,
  };
}
