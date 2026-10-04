export const LOCATION_COOKIE = "paws_here";

export type SimulatedLocation = {
  id: string;
  label: string;
  city: string;
  lat: number;
  lng: number;
};

export const SIMULATED_LOCATIONS: SimulatedLocation[] = [
  { id: "ttu", label: "Texas Tech campus", city: "Lubbock, TX", lat: 33.5843, lng: -101.8783 },
  { id: "downtown", label: "Downtown Lubbock", city: "Lubbock, TX", lat: 33.585, lng: -101.845 },
  { id: "south", label: "South Lubbock", city: "Lubbock, TX", lat: 33.52, lng: -101.89 },
  { id: "wolfforth", label: "Wolfforth", city: "Wolfforth, TX", lat: 33.5059, lng: -102.0091 },
  { id: "shallowater", label: "Shallowater", city: "Shallowater, TX", lat: 33.6884, lng: -101.9982 },
  { id: "slaton", label: "Slaton", city: "Slaton, TX", lat: 33.4373, lng: -101.6435 },
  { id: "levelland", label: "Levelland", city: "Levelland, TX", lat: 33.5873, lng: -102.378 },
  { id: "idalou", label: "Idalou", city: "Idalou, TX", lat: 33.6665, lng: -101.6829 },
  { id: "ransom", label: "Ransom Canyon", city: "Ransom Canyon, TX", lat: 33.5334, lng: -101.6799 },
  { id: "plainview", label: "Plainview", city: "Plainview, TX", lat: 34.1848, lng: -101.7068 },
];

export const DEFAULT_LOCATION = SIMULATED_LOCATIONS[0];

export function locationFromId(id?: string | null): SimulatedLocation {
  return SIMULATED_LOCATIONS.find((l) => l.id === id) ?? DEFAULT_LOCATION;
}

export function haversineMiles(a: { lat: number; lng: number }, b: { lat: number; lng: number }): number {
  const R = 3958.8;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const x =
    Math.sin(dLat / 2) ** 2 + Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.min(1, Math.sqrt(x)));
}

export function formatMiles(miles: number): string {
  if (miles < 0.5) return "Nearby";
  if (miles < 10) return `${miles.toFixed(1)} mi away`;
  return `${Math.round(miles)} mi away`;
}

export function withMiles<T extends { pet: { lat: number; lng: number } }>(
  rows: T[],
  origin: { lat: number; lng: number },
): (T & { miles: number })[] {
  return rows.map((row) => ({ ...row, miles: haversineMiles(origin, row.pet) }));
}
