export const PICKUP_POINTS = ['CDG', 'Orly', 'Beauvais', 'Paris', 'Disneyland', 'Paris Train Station', 'Versailles'];
export const DROP_POINTS = ['Paris', 'Disneyland', 'Versailles', 'Paris Train Station', 'CDG', 'Orly', 'Beauvais'];

// ---------------------------------------------------------------------
// Tier-based pricing.
//
// PRICES[from][to] = { tier_1_3, tier_4_6, tier_7_8 }
//
//   - tier_1_3 → 1–3 pax, vehicle: Tesla Model Y (car)
//   - tier_4_6 → 4–6 pax, vehicle: Vito / Trafic (van)
//   - tier_7_8 → 7–8 pax, same van, higher price (more weight + effort)
//
// 9+ pax → combo solver in pricing.js splits into sub-groups.
//
// Every entry below is a PLACEHOLDER — client swaps in real numbers later.
// Pricing rule used for placeholders: tier_1_3 === tier_4_6, tier_7_8 is
// €10–20 higher. Tweak freely once real tariffs are in.
// ---------------------------------------------------------------------
export const PRICES = {
  CDG: {
    Paris:                 { tier_1_3: 60,  tier_4_6: 60,  tier_7_8: 70  }, // PLACEHOLDER
    Disneyland:            { tier_1_3: 75,  tier_4_6: 75,  tier_7_8: 85  }, // PLACEHOLDER
    Versailles:            { tier_1_3: 95,  tier_4_6: 95,  tier_7_8: 110 }, // PLACEHOLDER
    'Paris Train Station': { tier_1_3: 65,  tier_4_6: 65,  tier_7_8: 75  }, // PLACEHOLDER
    Orly:                  { tier_1_3: 90,  tier_4_6: 90,  tier_7_8: 100 }, // PLACEHOLDER
    Beauvais:              { tier_1_3: 160, tier_4_6: 160, tier_7_8: 180 }, // PLACEHOLDER
  },
  Orly: {
    Paris:                 { tier_1_3: 55,  tier_4_6: 55,  tier_7_8: 65  }, // PLACEHOLDER
    Disneyland:            { tier_1_3: 80,  tier_4_6: 80,  tier_7_8: 90  }, // PLACEHOLDER
    Versailles:            { tier_1_3: 55,  tier_4_6: 55,  tier_7_8: 65  }, // PLACEHOLDER
    'Paris Train Station': { tier_1_3: 60,  tier_4_6: 60,  tier_7_8: 70  }, // PLACEHOLDER
    CDG:                   { tier_1_3: 90,  tier_4_6: 90,  tier_7_8: 100 }, // PLACEHOLDER
    Beauvais:              { tier_1_3: 180, tier_4_6: 180, tier_7_8: 200 }, // PLACEHOLDER
  },
  Beauvais: {
    Paris:                 { tier_1_3: 160, tier_4_6: 160, tier_7_8: 180 }, // PLACEHOLDER
    Disneyland:            { tier_1_3: 170, tier_4_6: 170, tier_7_8: 190 }, // PLACEHOLDER
    Versailles:            { tier_1_3: 170, tier_4_6: 170, tier_7_8: 190 }, // PLACEHOLDER
    'Paris Train Station': { tier_1_3: 160, tier_4_6: 160, tier_7_8: 180 }, // PLACEHOLDER
    CDG:                   { tier_1_3: 160, tier_4_6: 160, tier_7_8: 180 }, // PLACEHOLDER
    Orly:                  { tier_1_3: 180, tier_4_6: 180, tier_7_8: 200 }, // PLACEHOLDER
  },
  Disneyland: {
    Paris:                 { tier_1_3: 80,  tier_4_6: 80,  tier_7_8: 90  }, // PLACEHOLDER
    CDG:                   { tier_1_3: 75,  tier_4_6: 75,  tier_7_8: 85  }, // PLACEHOLDER
    Orly:                  { tier_1_3: 80,  tier_4_6: 80,  tier_7_8: 90  }, // PLACEHOLDER
    Versailles:            { tier_1_3: 105, tier_4_6: 105, tier_7_8: 120 }, // PLACEHOLDER
    'Paris Train Station': { tier_1_3: 80,  tier_4_6: 80,  tier_7_8: 90  }, // PLACEHOLDER
    Beauvais:              { tier_1_3: 170, tier_4_6: 170, tier_7_8: 190 }, // PLACEHOLDER
  },
  'Paris Train Station': {
    Paris:                 { tier_1_3: 45,  tier_4_6: 45,  tier_7_8: 55  }, // PLACEHOLDER
    Disneyland:            { tier_1_3: 80,  tier_4_6: 80,  tier_7_8: 90  }, // PLACEHOLDER
    CDG:                   { tier_1_3: 65,  tier_4_6: 65,  tier_7_8: 75  }, // PLACEHOLDER
    Orly:                  { tier_1_3: 60,  tier_4_6: 60,  tier_7_8: 70  }, // PLACEHOLDER
    Versailles:            { tier_1_3: 60,  tier_4_6: 60,  tier_7_8: 70  }, // PLACEHOLDER
    Beauvais:              { tier_1_3: 160, tier_4_6: 160, tier_7_8: 180 }, // PLACEHOLDER
  },
  Versailles: {
    CDG:                   { tier_1_3: 95,  tier_4_6: 95,  tier_7_8: 110 }, // PLACEHOLDER
    Orly:                  { tier_1_3: 55,  tier_4_6: 55,  tier_7_8: 65  }, // PLACEHOLDER
    Beauvais:              { tier_1_3: 170, tier_4_6: 170, tier_7_8: 190 }, // PLACEHOLDER
    Paris:                 { tier_1_3: 60,  tier_4_6: 60,  tier_7_8: 70  }, // PLACEHOLDER
    Disneyland:            { tier_1_3: 105, tier_4_6: 105, tier_7_8: 120 }, // PLACEHOLDER
    'Paris Train Station': { tier_1_3: 60,  tier_4_6: 60,  tier_7_8: 70  }, // PLACEHOLDER
  },
  // Paris as pickup — mirrors the Paris Train Station baseline (central-Paris zone).
  Paris: {
    Disneyland:            { tier_1_3: 80,  tier_4_6: 80,  tier_7_8: 90  }, // PLACEHOLDER
    Versailles:            { tier_1_3: 60,  tier_4_6: 60,  tier_7_8: 70  }, // PLACEHOLDER
    CDG:                   { tier_1_3: 65,  tier_4_6: 65,  tier_7_8: 75  }, // PLACEHOLDER
    Orly:                  { tier_1_3: 60,  tier_4_6: 60,  tier_7_8: 70  }, // PLACEHOLDER
    Beauvais:              { tier_1_3: 160, tier_4_6: 160, tier_7_8: 180 }, // PLACEHOLDER
    'Paris Train Station': { tier_1_3: 45,  tier_4_6: 45,  tier_7_8: 55  }, // PLACEHOLDER
  },
};

// Informational vehicle metadata. Pricing does NOT multiply by these — tier
// already encodes both capacity and effort. Used for human-readable summaries.
export const VEHICLE_CAPACITY = {
  car: { min: 1, max: 3, model: 'Tesla Model Y' },
  van: { min: 4, max: 8, model: 'Mercedes Vito / Renault Trafic' },
};

export const ROUND_TRIP_DISCOUNT = 0.10; // placeholder, update when client confirms
export const HOURLY_RATE = 50;
