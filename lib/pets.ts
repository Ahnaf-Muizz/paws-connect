import type { AgeGroup, Size, Species } from "./db/schema";

export const CITY_COORDS: Record<string, [number, number]> = {
  "Lubbock, TX": [33.5779, -101.8552],
  "Wolfforth, TX": [33.5059, -102.0091],
  "Shallowater, TX": [33.6884, -101.9982],
  "Slaton, TX": [33.4373, -101.6435],
  "Levelland, TX": [33.5873, -102.378],
  "Idalou, TX": [33.6665, -101.6829],
  "Ransom Canyon, TX": [33.5334, -101.6799],
  "Plainview, TX": [34.1848, -101.7068],
};

export const CITIES = Object.keys(CITY_COORDS);

export function cityCoords(city: string): [number, number] {
  return CITY_COORDS[city] ?? CITY_COORDS["Lubbock, TX"];
}

export function ageGroupFor(species: Species, age: number): AgeGroup {
  if (age < 1) return "baby";
  if (age < 3) return "young";
  const senior = species === "bird" ? 25 : species === "rabbit" ? 6 : 8;
  return age >= senior ? "senior" : "adult";
}

export function monthlyCostFor(species: Species, size: Size): number {
  if (species === "bird") return size === "large" ? 120 : 45;
  if (species === "rabbit") return 55;
  if (species === "cat") return 60;
  return size === "large" ? 140 : size === "medium" ? 105 : 80;
}

export function formatAge(years: number) {
  if (years < 1) {
    const months = Math.max(1, Math.round(years * 12));
    return `${months} month${months === 1 ? "" : "s"}`;
  }
  const y = Math.round(years * 10) / 10;
  return `${y} year${y === 1 ? "" : "s"}`;
}

export const SPECIES_LABEL: Record<Species, string> = { dog: "Dog", cat: "Cat", rabbit: "Rabbit", bird: "Bird" };
