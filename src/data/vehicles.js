// Vehicle definitions. Keep keys in sync with VEHICLE_CAPACITY keys in routes.js.
export const VEHICLES = [
  {
    id: 'car',
    model: 'Tesla Model Y',
    capacity: { min: 1, max: 3 },
    luggage: 3,
    image: '/images/vehicles/tesla-model-y.jpg',
  },
  {
    id: 'van',
    model: 'Mercedes Vito / Renault Trafic',
    capacity: { min: 4, max: 8 },
    luggage: 8,
    image: '/images/vehicles/van.jpg',
  },
];
