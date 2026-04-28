import { PRICES, VEHICLE_CAPACITY, ROUND_TRIP_DISCOUNT } from '../data/routes.js';

// ---------------------------------------------------------------------
// Per-passenger-count pricing.
//
// Routes carry explicit prices for: 1–3, 4, 5, 6, 7, 8, 12, 16, 20, 24 pax.
// In-between counts (9–11, 13–15, 17–19, 21–23) are resolved by the combo
// solver: it splits the group into the cheapest valid mix of sub-groups
// (each ≤ 8 pax) using the explicit prices above.
//
// Vehicle assignment is derived from pax count separately (capacity-based),
// not from how the solver split the group. Customers see a stable summary
// like "1× Tesla Model Y" or "2× Vito + 1× Tesla Y" regardless of the
// internal partition the solver picked to compute the cheapest total.
// ---------------------------------------------------------------------

export const VEHICLES = {
  car: { model: VEHICLE_CAPACITY.car.model, maxPax: VEHICLE_CAPACITY.car.max },
  van: { model: VEHICLE_CAPACITY.van.model, maxPax: VEHICLE_CAPACITY.van.max },
};

/**
 * Map a passenger count to the explicit price key in the data, or null
 * if it falls into a combo gap (the solver handles those).
 */
export function getExplicitPriceKey(pax) {
  if (pax >= 1 && pax <= 3) return 'p1to3';
  if (pax >= 4 && pax <= 8) return `p${pax}`;
  if (pax === 12) return 'p12';
  if (pax === 16) return 'p16';
  if (pax === 20) return 'p20';
  if (pax === 24) return 'p24';
  return null;
}

/**
 * Direct route → pax → price lookup. Returns null when the count is in
 * a combo gap or the route isn't priced.
 */
export function getExplicitPrice(from, to, pax) {
  const key = getExplicitPriceKey(pax);
  if (!key) return null;
  return PRICES[from]?.[to]?.[key] ?? null;
}

/**
 * Human-readable vehicle assignment for a pax count. Drives the booking
 * summary's "Véhicule" line. Capacity-based — independent of how the
 * combo solver internally split the group to compute the cheapest total.
 */
export function getVehicleSummary(pax) {
  if (pax <= 0) return '—';
  if (pax <= 3)  return '1× Tesla Model Y';
  if (pax <= 8)  return '1× Vito';
  if (pax <= 11) return '1× Vito + 1× Tesla Y';
  if (pax <= 16) return '2× Vito';
  if (pax <= 20) return '2× Vito + 1× Tesla Y';
  if (pax <= 24) return '3× Vito';
  return '—';
}

/**
 * Icon set for the booking-summary vehicle row. Each entry is 'car' (Tesla)
 * or 'van' (Vito) and matches the assignment in `getVehicleSummary`.
 */
export function getVehicleIcons(pax) {
  if (pax <= 0) return [];
  if (pax <= 3)  return ['car'];
  if (pax <= 8)  return ['van'];
  if (pax <= 11) return ['van', 'car'];
  if (pax <= 16) return ['van', 'van'];
  if (pax <= 20) return ['van', 'van', 'car'];
  if (pax <= 24) return ['van', 'van', 'van'];
  return [];
}

/**
 * Cheapest-combination solver for in-between pax counts.
 *
 * For pax ≥ 9, exhaustively partition `pax` into sub-groups whose sizes are
 * each ∈ [1, 8] and have an explicit price on the route, then return the
 * minimum total cost. Memoised DP — O(pax × 8) for typical bookings.
 *
 * For pax ≤ 8, returns the explicit price.
 */
export function computeComboPrice(from, to, pax) {
  if (pax <= 8) return getExplicitPrice(from, to, pax);

  const memo = new Map();
  function solve(remaining) {
    if (remaining === 0) return 0;
    if (memo.has(remaining)) return memo.get(remaining);
    let best = Infinity;
    for (let groupSize = 1; groupSize <= Math.min(8, remaining); groupSize++) {
      const groupPrice = getExplicitPrice(from, to, groupSize);
      if (groupPrice === null) continue;
      const restCost = solve(remaining - groupSize);
      if (restCost === Infinity) continue;
      const total = groupPrice + restCost;
      if (total < best) best = total;
    }
    memo.set(remaining, best);
    return best;
  }

  const result = solve(pax);
  return result === Infinity ? null : result;
}

/**
 * Top-level price lookup. Tries the explicit price first; falls back to
 * the combo solver for in-between counts.
 */
export function getRoutePrice(from, to, pax) {
  const explicit = getExplicitPrice(from, to, pax);
  if (explicit !== null) return explicit;
  return computeComboPrice(from, to, pax);
}

/** "From €X" starting price (1–3 pax) for a route. */
export function getStartingPrice(from, to) {
  if (!from || !to || from === to) return null;
  return PRICES[from]?.[to]?.p1to3 ?? null;
}

/** Cheapest 1–3 pax price across the entire matrix — Fleet Car card. */
export function minCarStarting() {
  let min = Infinity;
  for (const from of Object.keys(PRICES)) {
    const row = PRICES[from];
    for (const to of Object.keys(row)) {
      const price = row[to]?.p1to3;
      if (typeof price === 'number' && price < min) min = price;
    }
  }
  return min === Infinity ? null : min;
}

/** Cheapest 4-pax price across the entire matrix — Fleet Van card. */
export function minVanStarting() {
  let min = Infinity;
  for (const from of Object.keys(PRICES)) {
    const row = PRICES[from];
    for (const to of Object.keys(row)) {
      const price = row[to]?.p4;
      if (typeof price === 'number' && price < min) min = price;
    }
  }
  return min === Infinity ? null : min;
}

/**
 * Full quote — applies the round-trip 5% discount when applicable.
 * Returns { totalPrice, oneWayPrice, vehicleSummary, pax, tripType } or null.
 */
export function quote({ from, to, pax = 1, tripType = 'oneWay' }) {
  if (!from || !to || pax < 1) return null;
  const oneWayPrice = getRoutePrice(from, to, pax);
  if (oneWayPrice === null) return null;

  const total =
    tripType === 'roundTrip' || tripType === 'round-trip'
      ? Math.round(oneWayPrice * 2 * (1 - ROUND_TRIP_DISCOUNT))
      : oneWayPrice;

  return {
    totalPrice: total,
    oneWayPrice,
    vehicleSummary: getVehicleSummary(pax),
    pax,
    tripType,
  };
}
