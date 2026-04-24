export const PICKUP_POINTS = ['CDG', 'Orly', 'Beauvais', 'Disneyland', 'Paris Train Station', 'Versailles'];
export const DROP_POINTS = ['Paris', 'Disneyland', 'Versailles', 'Paris Train Station', 'CDG', 'Orly', 'Beauvais'];

// Price matrix: PRICES[from][to] = { car: €, van: € }
// CDG → Paris is the only confirmed entry. Everything else marked PLACEHOLDER
// until the client hands over real numbers. Prices are per-trip, one-way.
export const PRICES = {
  CDG: {
    Paris: { car: 60, van: 80 }, // CONFIRMED
    Disneyland: { car: 75, van: 95 }, // PLACEHOLDER
    Versailles: { car: 95, van: 130 }, // PLACEHOLDER
    'Paris Train Station': { car: 60, van: 80 }, // PLACEHOLDER
    Orly: { car: 95, van: 125 }, // PLACEHOLDER
    Beauvais: { car: 160, van: 210 }, // PLACEHOLDER
  },
  Orly: {
    Paris: { car: 55, van: 75 }, // PLACEHOLDER
    Disneyland: { car: 80, van: 105 }, // PLACEHOLDER
    Versailles: { car: 65, van: 85 }, // PLACEHOLDER
    'Paris Train Station': { car: 55, van: 75 }, // PLACEHOLDER
    CDG: { car: 95, van: 125 }, // PLACEHOLDER
    Beauvais: { car: 180, van: 230 }, // PLACEHOLDER
  },
  Beauvais: {
    Paris: { car: 130, van: 170 }, // PLACEHOLDER
    Disneyland: { car: 160, van: 210 }, // PLACEHOLDER
    Versailles: { car: 150, van: 200 }, // PLACEHOLDER
    'Paris Train Station': { car: 130, van: 170 }, // PLACEHOLDER
    CDG: { car: 160, van: 210 }, // PLACEHOLDER
    Orly: { car: 180, van: 230 }, // PLACEHOLDER
  },
  Disneyland: {
    Paris: { car: 75, van: 95 }, // PLACEHOLDER
    Versailles: { car: 110, van: 140 }, // PLACEHOLDER
    'Paris Train Station': { car: 75, van: 95 }, // PLACEHOLDER
    CDG: { car: 75, van: 95 }, // PLACEHOLDER
    Orly: { car: 80, van: 105 }, // PLACEHOLDER
    Beauvais: { car: 160, van: 210 }, // PLACEHOLDER
  },
  'Paris Train Station': {
    Paris: { car: 25, van: 40 }, // PLACEHOLDER
    Disneyland: { car: 75, van: 95 }, // PLACEHOLDER
    Versailles: { car: 70, van: 90 }, // PLACEHOLDER
    CDG: { car: 60, van: 80 }, // PLACEHOLDER
    Orly: { car: 55, van: 75 }, // PLACEHOLDER
    Beauvais: { car: 130, van: 170 }, // PLACEHOLDER
  },
  Versailles: {
    Paris: { car: 70, van: 90 }, // PLACEHOLDER
    Disneyland: { car: 110, van: 140 }, // PLACEHOLDER
    'Paris Train Station': { car: 70, van: 90 }, // PLACEHOLDER
    CDG: { car: 95, van: 130 }, // PLACEHOLDER
    Orly: { car: 65, van: 85 }, // PLACEHOLDER
    Beauvais: { car: 150, van: 200 }, // PLACEHOLDER
  },
};

export const VEHICLE_CAPACITY = {
  car: { min: 1, max: 3, model: 'Tesla Model Y' },
  van: { min: 4, max: 8, model: 'Mercedes Vito / Renault Trafic' }
};

export const ROUND_TRIP_DISCOUNT = 0.10; // placeholder, update when client confirms
export const HOURLY_RATE = 50;
