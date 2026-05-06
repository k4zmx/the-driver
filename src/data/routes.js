export const PICKUP_POINTS = ['CDG', 'Orly', 'Beauvais', 'Paris', 'Disneyland', 'Paris Train Station', 'Versailles'];
export const DROP_POINTS = ['Paris', 'Disneyland', 'Versailles', 'Paris Train Station', 'CDG', 'Orly', 'Beauvais'];

// ---------------------------------------------------------------------
// Per-passenger-count pricing.
//
// PRICES[from][to] = {
//   p1to3,                          // 1, 2, or 3 pax (Tesla Model Y)
//   p4, p5, p6, p7, p8,             // 4–8 pax (Vito / Trafic, single van)
//   p12, p16, p20, p24,             // explicit multi-vehicle group rates
// }
//
// In-between counts (9–11, 13–15, 17–19, 21–23) are resolved by the combo
// solver in pricing.js: it splits the group into the cheapest valid mix of
// sub-groups, each ≤ 8 pax, using the explicit per-pax prices above.
//
// Round-trip = oneWay × 2 × (1 − ROUND_TRIP_DISCOUNT). Currently 5%.
//
// Versailles prices are symmetric (same in both directions) per the
// client's confirmation. Paris Train Station ↔ Versailles uses the same
// prices as Paris ↔ Versailles.
// ---------------------------------------------------------------------
export const PRICES = {
  Paris: {
    Paris:                 { p1to3: 60,  p4: 65,  p5: 70,  p6: 70,  p7: 80,  p8: 80,  p12: 145, p16: 160, p20: 225, p24: 240 }, // intra-Paris transfer
    CDG:                   { p1to3: 65,  p4: 70,  p5: 75,  p6: 75,  p7: 85,  p8: 90,  p12: 160, p16: 180, p20: 250, p24: 270 },
    Disneyland:            { p1to3: 70,  p4: 75,  p5: 80,  p6: 85,  p7: 90,  p8: 100, p12: 170, p16: 200, p20: 270, p24: 300 },
    Orly:                  { p1to3: 65,  p4: 70,  p5: 75,  p6: 75,  p7: 85,  p8: 90,  p12: 160, p16: 180, p20: 250, p24: 270 },
    Beauvais:              { p1to3: 140, p4: 150, p5: 150, p6: 165, p7: 170, p8: 180, p12: 330, p16: 360, p20: 510, p24: 540 },
    'Paris Train Station': { p1to3: 60,  p4: 65,  p5: 70,  p6: 70,  p7: 80,  p8: 80,  p12: 145, p16: 160, p20: 225, p24: 240 },
    Versailles:            { p1to3: 75,  p4: 80,  p5: 80,  p6: 85,  p7: 85,  p8: 90,  p12: 170, p16: 180, p20: 260, p24: 270 },
  },
  CDG: {
    Paris:                 { p1to3: 65,  p4: 70,  p5: 80,  p6: 80,  p7: 85,  p8: 90,  p12: 160, p16: 180, p20: 250, p24: 270 },
    Disneyland:            { p1to3: 65,  p4: 70,  p5: 80,  p6: 80,  p7: 85,  p8: 90,  p12: 160, p16: 180, p20: 250, p24: 270 },
    Orly:                  { p1to3: 80,  p4: 80,  p5: 85,  p6: 90,  p7: 90,  p8: 100, p12: 180, p16: 200, p20: 280, p24: 300 },
    Beauvais:              { p1to3: 125, p4: 130, p5: 140, p6: 140, p7: 150, p8: 150, p12: 280, p16: 300, p20: 430, p24: 450 },
    'Paris Train Station': { p1to3: 65,  p4: 70,  p5: 80,  p6: 80,  p7: 85,  p8: 90,  p12: 160, p16: 180, p20: 250, p24: 270 },
    Versailles:            { p1to3: 85,  p4: 85,  p5: 90,  p6: 90,  p7: 95,  p8: 100, p12: 185, p16: 200, p20: 285, p24: 300 },
  },
  Orly: {
    Paris:                 { p1to3: 65,  p4: 70,  p5: 80,  p6: 80,  p7: 85,  p8: 90,  p12: 160, p16: 180, p20: 250, p24: 270 },
    CDG:                   { p1to3: 80,  p4: 80,  p5: 85,  p6: 90,  p7: 90,  p8: 100, p12: 180, p16: 200, p20: 280, p24: 300 },
    Disneyland:            { p1to3: 70,  p4: 80,  p5: 80,  p6: 85,  p7: 90,  p8: 95,  p12: 175, p16: 190, p20: 270, p24: 285 },
    Beauvais:              { p1to3: 160, p4: 160, p5: 170, p6: 170, p7: 180, p8: 190, p12: 350, p16: 380, p20: 540, p24: 570 },
    'Paris Train Station': { p1to3: 65,  p4: 70,  p5: 80,  p6: 80,  p7: 85,  p8: 90,  p12: 160, p16: 180, p20: 250, p24: 270 },
    Versailles:            { p1to3: 75,  p4: 80,  p5: 80,  p6: 85,  p7: 90,  p8: 90,  p12: 170, p16: 180, p20: 260, p24: 270 },
  },
  Beauvais: {
    Paris:                 { p1to3: 140, p4: 150, p5: 150, p6: 165, p7: 170, p8: 180, p12: 330, p16: 360, p20: 510, p24: 540 },
    Disneyland:            { p1to3: 140, p4: 150, p5: 160, p6: 165, p7: 170, p8: 180, p12: 330, p16: 360, p20: 510, p24: 540 },
    CDG:                   { p1to3: 125, p4: 130, p5: 140, p6: 140, p7: 150, p8: 150, p12: 280, p16: 300, p20: 430, p24: 450 },
    Orly:                  { p1to3: 160, p4: 160, p5: 170, p6: 170, p7: 180, p8: 190, p12: 350, p16: 380, p20: 540, p24: 570 },
    'Paris Train Station': { p1to3: 140, p4: 150, p5: 150, p6: 165, p7: 170, p8: 180, p12: 330, p16: 360, p20: 510, p24: 540 },
    Versailles:            { p1to3: 140, p4: 150, p5: 160, p6: 165, p7: 170, p8: 180, p12: 330, p16: 360, p20: 510, p24: 540 },
  },
  Disneyland: {
    Paris:                 { p1to3: 70,  p4: 75,  p5: 80,  p6: 85,  p7: 90,  p8: 100, p12: 170, p16: 200, p20: 270, p24: 300 },
    CDG:                   { p1to3: 65,  p4: 70,  p5: 80,  p6: 80,  p7: 85,  p8: 90,  p12: 160, p16: 180, p20: 250, p24: 270 },
    Orly:                  { p1to3: 70,  p4: 80,  p5: 80,  p6: 85,  p7: 90,  p8: 95,  p12: 175, p16: 190, p20: 270, p24: 285 },
    Beauvais:              { p1to3: 150, p4: 150, p5: 160, p6: 165, p7: 170, p8: 180, p12: 330, p16: 360, p20: 510, p24: 540 },
    'Paris Train Station': { p1to3: 70,  p4: 75,  p5: 80,  p6: 85,  p7: 90,  p8: 100, p12: 170, p16: 200, p20: 270, p24: 300 },
    Versailles:            { p1to3: 90,  p4: 90,  p5: 100, p6: 110, p7: 120, p8: 125, p12: 215, p16: 250, p20: 340, p24: 375 },
  },
  'Paris Train Station': {
    Paris:                 { p1to3: 60,  p4: 65,  p5: 70,  p6: 70,  p7: 80,  p8: 80,  p12: 145, p16: 160, p20: 225, p24: 240 },
    Disneyland:            { p1to3: 70,  p4: 75,  p5: 80,  p6: 85,  p7: 90,  p8: 100, p12: 170, p16: 200, p20: 270, p24: 300 },
    CDG:                   { p1to3: 65,  p4: 70,  p5: 80,  p6: 80,  p7: 85,  p8: 90,  p12: 160, p16: 180, p20: 250, p24: 270 },
    Orly:                  { p1to3: 65,  p4: 70,  p5: 80,  p6: 80,  p7: 85,  p8: 90,  p12: 160, p16: 180, p20: 250, p24: 270 },
    Beauvais:              { p1to3: 140, p4: 150, p5: 150, p6: 165, p7: 170, p8: 180, p12: 330, p16: 360, p20: 510, p24: 540 },
    Versailles:            { p1to3: 75,  p4: 80,  p5: 80,  p6: 85,  p7: 85,  p8: 90,  p12: 170, p16: 180, p20: 260, p24: 270 },
  },
  // FROM Versailles — symmetric mirror of TO-Versailles per client.
  Versailles: {
    Paris:                 { p1to3: 75,  p4: 80,  p5: 80,  p6: 85,  p7: 85,  p8: 90,  p12: 170, p16: 180, p20: 260, p24: 270 },
    CDG:                   { p1to3: 85,  p4: 85,  p5: 90,  p6: 90,  p7: 95,  p8: 100, p12: 185, p16: 200, p20: 285, p24: 300 },
    Orly:                  { p1to3: 75,  p4: 80,  p5: 80,  p6: 85,  p7: 90,  p8: 90,  p12: 170, p16: 180, p20: 260, p24: 270 },
    Beauvais:              { p1to3: 140, p4: 150, p5: 160, p6: 165, p7: 170, p8: 180, p12: 330, p16: 360, p20: 510, p24: 540 },
    Disneyland:            { p1to3: 90,  p4: 90,  p5: 100, p6: 110, p7: 120, p8: 125, p12: 215, p16: 250, p20: 340, p24: 375 },
    'Paris Train Station': { p1to3: 75,  p4: 80,  p5: 80,  p6: 85,  p7: 85,  p8: 90,  p12: 170, p16: 180, p20: 260, p24: 270 },
  },
};

// Informational vehicle metadata. Used only for human-readable summaries.
export const VEHICLE_CAPACITY = {
  car: { min: 1, max: 3, model: 'Tesla Model Y' },
  van: { min: 4, max: 8, model: 'Mercedes Vito / Renault Trafic' },
};

// 5% off the doubled one-way price when the user picks round-trip.
export const ROUND_TRIP_DISCOUNT = 0.05;

// Hourly mise à disposition — unaffected by the per-pax matrix.
export const HOURLY_RATE = 50;
