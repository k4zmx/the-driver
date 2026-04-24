import { PRICES, VEHICLE_CAPACITY, ROUND_TRIP_DISCOUNT } from '../data/routes.js';

// ---------------------------------------------------------------------
// Tier-based pricing helpers.
//
// A trip is priced by passenger count, not by vehicle type. The vehicle
// is derived from the tier (car for 1–3, van for 4–8). For 9+ pax the
// combo solver splits the group into sub-groups whose sizes each fall
// into a valid tier, and returns the cheapest total.
// ---------------------------------------------------------------------

export const VEHICLES = {
  car: { model: VEHICLE_CAPACITY.car.model, maxPax: VEHICLE_CAPACITY.car.max },
  van: { model: VEHICLE_CAPACITY.van.model, maxPax: VEHICLE_CAPACITY.van.max },
};

export const TIER_KEYS = ['tier_1_3', 'tier_4_6', 'tier_7_8'];

/**
 * Pax count → tier key, or null for invalid/9+ counts (combo case).
 */
export function getTier(pax) {
  if (pax >= 1 && pax <= 3) return 'tier_1_3';
  if (pax >= 4 && pax <= 6) return 'tier_4_6';
  if (pax >= 7 && pax <= 8) return 'tier_7_8';
  return null;
}

/**
 * Tier key → vehicle key. 1–3 rides in the car, everything else in the van.
 */
export function getVehicleForTier(tier) {
  return tier === 'tier_1_3' ? 'car' : 'van';
}

/**
 * One-way route price at a specific tier. Returns null if the route or tier
 * isn't priced yet.
 */
export function getRoutePrice(from, to, tier) {
  if (!from || !to || from === to) return null;
  const row = PRICES[from];
  if (!row) return null;
  const cell = row[to];
  if (!cell) return null;
  const price = cell[tier];
  return typeof price === 'number' ? price : null;
}

/**
 * Cheapest starting price for a route — used by "À partir de €X" teasers
 * before the user picks a passenger count. Walks tiers in order and returns
 * the first real number.
 */
export function getStartingPrice(from, to) {
  for (const tier of TIER_KEYS) {
    const p = getRoutePrice(from, to, tier);
    if (typeof p === 'number') return p;
  }
  return null;
}

/**
 * Minimum starting price from `from` across every drop-off in the matrix.
 * Used by the hero's "à partir de €X" pill when only pickup is selected.
 */
export function minStartingPriceFrom(from) {
  const row = PRICES[from];
  if (!row) return null;
  let min = null;
  for (const to of Object.keys(row)) {
    const p = getStartingPrice(from, to);
    if (typeof p === 'number' && (min === null || p < min)) min = p;
  }
  return min;
}

/**
 * Scan the whole price matrix and return the cheapest price at the given tier.
 * Used by Fleet cards to show an honest "À partir de €X" derived from real data.
 */
function minTierAcrossMatrix(tier) {
  let min = null;
  for (const from of Object.keys(PRICES)) {
    const row = PRICES[from];
    for (const to of Object.keys(row)) {
      const p = row[to]?.[tier];
      if (typeof p === 'number' && (min === null || p < min)) min = p;
    }
  }
  return min;
}

/** Cheapest tier_1_3 (car) price across the whole matrix. */
export function minCarStarting() {
  return minTierAcrossMatrix('tier_1_3');
}

/** Cheapest tier_4_6 (van) price across the whole matrix. */
export function minVanStarting() {
  return minTierAcrossMatrix('tier_4_6');
}

/**
 * Compute the cheapest combination of sub-groups for `pax` on a given route.
 *
 * For pax ≤ 8: the group fits in a single vehicle — return that tier's price.
 *
 * For pax ≥ 9: exhaustive memoised search over all integer partitions where
 * every part is ∈ [1, 8] (each sub-group must fit one vehicle and match a
 * valid tier). The search is DP keyed by remaining pax, so cost is O(pax·8).
 *
 * A remainder of 4 can't share a car (car max = 3), so the solver naturally
 * assigns it a van at tier_4_6. We also compare "stuff into big vans vs
 * split more evenly into mid-tier vans" — the cheaper wins.
 *
 * Returns { combo, totalPrice } or null if the route isn't priced.
 *   combo = [{ vehicle, pax, tier, price }, ...]
 */
export function computeCombo(from, to, pax) {
  if (!pax || pax < 1) return null;

  // Single-vehicle case
  if (pax <= 8) {
    const tier = getTier(pax);
    if (!tier) return null;
    const price = getRoutePrice(from, to, tier);
    if (price === null) return null;
    return {
      combo: [{ vehicle: getVehicleForTier(tier), pax, tier, price }],
      totalPrice: price,
    };
  }

  // 9+ — pre-fetch the three tier prices; we'll need them repeatedly.
  const p1 = getRoutePrice(from, to, 'tier_1_3');
  const p2 = getRoutePrice(from, to, 'tier_4_6');
  const p3 = getRoutePrice(from, to, 'tier_7_8');
  if (p1 === null || p2 === null || p3 === null) return null;

  function priceForSize(size) {
    if (size <= 3) return p1;
    if (size <= 6) return p2;
    return p3;
  }

  // DP: solve(n) = { total, parts[] } for the cheapest way to carry n pax.
  const memo = new Map();
  function solve(n) {
    if (n <= 0) return { total: 0, parts: [] };
    if (memo.has(n)) return memo.get(n);
    let best = null;
    for (let size = 1; size <= Math.min(n, 8); size++) {
      const sub = solve(n - size);
      if (!sub) continue;
      const total = sub.total + priceForSize(size);
      if (!best || total < best.total) {
        best = { total, parts: [size, ...sub.parts] };
      }
    }
    memo.set(n, best);
    return best;
  }

  const solved = solve(pax);
  if (!solved) return null;

  // Group consecutive equal sizes so the breakdown reads cleanly.
  const combo = solved.parts
    .slice()
    .sort((a, b) => b - a) // big first — van(s) before car
    .map((size) => {
      const tier = getTier(size);
      return {
        vehicle: getVehicleForTier(tier),
        pax: size,
        tier,
        price: priceForSize(size),
      };
    });

  return { combo, totalPrice: solved.total };
}

/**
 * Format a combo as a human-readable breakdown, e.g. "2× Mercedes Vito /
 * Renault Trafic + 1× Tesla Model Y".
 */
export function summariseCombo(combo) {
  const counts = new Map();
  for (const entry of combo) {
    const key = entry.vehicle;
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }
  return [...counts.entries()]
    .map(([v, n]) => `${n}× ${VEHICLES[v].model}`)
    .join(' + ');
}

/**
 * Full quote. Returns { totalPrice, combo, vehicleSummary, tier } or null.
 * Tier is the tier of the FIRST (largest) sub-group for single-vehicle
 * trips; for multi-vehicle combos it's still useful for showing a label.
 */
export function quote({ from, to, pax = 1, tripType = 'one-way' }) {
  if (!from || !to || pax < 1) return null;
  const result = computeCombo(from, to, pax);
  if (!result) return null;

  let total = result.totalPrice;
  if (tripType === 'round-trip') {
    total = Math.round(total * 2 * (1 - ROUND_TRIP_DISCOUNT));
  }

  return {
    totalPrice: total,
    combo: result.combo,
    vehicleSummary: summariseCombo(result.combo),
    tier: result.combo[0]?.tier ?? null,
  };
}
