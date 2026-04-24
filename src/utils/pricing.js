import { PRICES, VEHICLE_CAPACITY, ROUND_TRIP_DISCOUNT } from '../data/routes.js';

/**
 * Look up a one-way route price for a given vehicle type.
 * Returns null if the route isn't priced yet (client hasn't confirmed it).
 */
export function getRoutePrice(from, to, vehicle = 'car') {
  if (!from || !to || from === to) return null;
  const row = PRICES[from];
  if (!row) return null;
  const cell = row[to];
  if (!cell) return null;
  const price = cell[vehicle];
  return typeof price === 'number' ? price : null;
}

/**
 * Decide which vehicles to send for `pax` passengers and return the total price.
 *
 * - 1–3 → one car
 * - 4–8 → one van
 * - 9+  → mix of vans + cars chosen to minimise total cost while covering pax
 *
 * Returns:
 *   { combo: [['van', N], ['car', N]], total: number, seats: number }
 *   or null if pricing is unavailable for the leg.
 */
export function computeVehicles(pax, carPrice, vanPrice) {
  if (!pax || pax < 1) return null;

  const CAR_SEATS = VEHICLE_CAPACITY.car.max;
  const VAN_SEATS = VEHICLE_CAPACITY.van.max;

  if (pax <= CAR_SEATS) {
    if (typeof carPrice !== 'number') return null;
    return { combo: [['car', 1]], total: carPrice, seats: CAR_SEATS };
  }
  if (pax <= VAN_SEATS) {
    if (typeof vanPrice !== 'number') return null;
    return { combo: [['van', 1]], total: vanPrice, seats: VAN_SEATS };
  }

  if (typeof carPrice !== 'number' || typeof vanPrice !== 'number') return null;

  let best = null;
  const maxVans = Math.ceil(pax / VAN_SEATS) + 1;
  for (let vans = 0; vans <= maxVans; vans++) {
    const remaining = Math.max(0, pax - vans * VAN_SEATS);
    const cars = Math.ceil(remaining / CAR_SEATS);
    const capacity = vans * VAN_SEATS + cars * CAR_SEATS;
    if (capacity < pax) continue;
    const total = vans * vanPrice + cars * carPrice;
    if (!best || total < best.total) {
      best = {
        combo: [['van', vans], ['car', cars]].filter(([, n]) => n > 0),
        total,
        seats: capacity,
      };
    }
  }
  return best;
}

/**
 * Convenience wrapper used by hero + form: given a from/to/pax/tripType, return
 * { total, vehicleSummary, combo } or null if not priceable yet.
 */
export function quote({ from, to, pax = 1, tripType = 'one-way' }) {
  const carPrice = getRoutePrice(from, to, 'car');
  const vanPrice = getRoutePrice(from, to, 'van');
  const computed = computeVehicles(pax, carPrice, vanPrice);
  if (!computed) return null;

  let total = computed.total;
  if (tripType === 'round-trip') {
    total = Math.round(total * 2 * (1 - ROUND_TRIP_DISCOUNT));
  }

  return {
    total,
    combo: computed.combo,
    seats: computed.seats,
    vehicleSummary: summariseCombo(computed.combo),
  };
}

function summariseCombo(combo) {
  return combo
    .map(([type, n]) => `${n}× ${VEHICLE_CAPACITY[type].model}`)
    .join(' + ');
}

/**
 * Minimum available car price for a given pickup — used by the hero picker's
 * "À partir de €X" teaser before the user has picked a drop-off.
 */
export function minCarPriceFrom(from) {
  const row = PRICES[from];
  if (!row) return null;
  let min = null;
  for (const to of Object.keys(row)) {
    const p = row[to]?.car;
    if (typeof p === 'number' && (min === null || p < min)) min = p;
  }
  return min;
}
