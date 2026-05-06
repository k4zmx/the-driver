// Real Google reviews. Each review stays in the language the customer wrote it in.
// On the site, if `lang !== siteLocale`, a subtle "Translated by Google" hint is
// rendered beneath the body — matching the authentic Google Reviews UI pattern.
//
// Source of truth: Google Reviews (profile of the driver). Do not edit texts
// here to "smooth" grammar — stay true to the reviewer's original voice.

export const REVIEW_TOTAL_COUNT = 45;
export const REVIEW_AVERAGE = 5.0;

/**
 * Each review: { text, name, flag, lang, rating, date, reviewsCount, photosCount, localGuide }
 * - `lang`: BCP-47 language tag of the original text ('fr', 'en', 'it', 'es', 'da').
 *   Used to decide whether to show the "Translated by Google" hint per site locale.
 * - `date`: calendar year+month (1-12) of the review; rendered as a relative
 *   label per locale at build time (e.g. "il y a 2 mois" / "2 months ago").
 * - `reviewsCount` / `photosCount`: raw numbers — Reviews.astro formats them
 *   per locale via the i18n `reviewCount` / `photosCount` templates so the
 *   author meta line ("Local Guide · 24 reviews · 22 photos") localizes
 *   correctly on EN / ES / IT without duplicating data here.
 * - `localGuide`: true if the Google profile shows a Local Guide badge. The
 *   "Local Guide" label itself stays English on every locale (Google's own
 *   convention), so no i18n is needed for the phrase.
 */
export const REVIEWS = [
  {
    text: "Top ! Service de qualité. Je ne peux que recommander.",
    name: "Sébastien Dussol",
    flag: "🇫🇷",
    lang: "fr",
    rating: 5,
    date: { year: 2026, month: 3 },
    reviewsCount: 9,
    photosCount: 0,
    localGuide: false,
  },
  {
    text: "Très bonne expérience, chauffeur à l'heure, conduite agréable et service de qualité. Je referai appel à eux sans hésiter.",
    name: "Lalinthan Ratnakumar",
    flag: "🇫🇷",
    lang: "fr",
    rating: 5,
    date: { year: 2026, month: 3 },
    reviewsCount: 3,
    photosCount: 4,
    localGuide: false,
  },
  {
    text: "Excellent service. The driver was waiting for us upon arrival and was very friendly and welcoming.",
    name: "Caroline Sofie Svendsen",
    flag: "🇩🇰",
    lang: "en",
    rating: 5,
    date: { year: 2026, month: 3 },
    reviewsCount: 112,
    photosCount: 41,
    localGuide: true,
  },
  {
    text: "Rapide et professionnel. Course vers l'aéroport effectuée sans stress, avec des prix vraiment intéressants. Je recommande sans hésiter !",
    name: "Bakar Ko",
    flag: "🇫🇷",
    lang: "fr",
    rating: 5,
    date: { year: 2026, month: 1 },
    reviewsCount: 24,
    photosCount: 22,
    localGuide: true,
  },
  {
    text: "Chauffeur très aimable, serviable, sympathique, compétent et très professionnel.",
    name: "Elisa Vettese",
    flag: "🇮🇹",
    lang: "it",
    rating: 5,
    date: { year: 2026, month: 4 },
    reviewsCount: 2,
    photosCount: 0,
    localGuide: false,
  },
  {
    text: "He was extremely helpful and courteous, and made our trip smooth and memorable. He also went out of his way to help us manage our schedule.",
    name: "Anurag Srivastava",
    flag: "🇮🇳",
    lang: "en",
    rating: 5,
    date: { year: 2024, month: 10 },
    reviewsCount: 6,
    photosCount: 0,
    localGuide: false,
  },
  {
    text: "Ponctuel, excellent. Un vrai professionnel.",
    name: "Oscar Rodríguez",
    flag: "🇪🇸",
    lang: "es",
    rating: 5,
    date: { year: 2025, month: 9 },
    reviewsCount: 4,
    photosCount: 0,
    localGuide: false,
  },
];
