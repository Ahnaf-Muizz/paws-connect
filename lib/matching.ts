import type { AdopterProfile, Experience, Level, Pet, Size } from "./db/schema";

export type MatchResult = {
  score: number;
  reasons: string[];
  concerns: string[];
  distanceMiles: number;
};

const SIZE_ORDER: Size[] = ["small", "medium", "large"];
const LEVEL_ORDER: Level[] = ["low", "medium", "high"];
const EXPERIENCE_ORDER: Experience[] = ["first-time", "some", "experienced"];

export function distanceMiles(a: { lat: number; lng: number }, b: { lat: number; lng: number }) {
  const R = 3958.8;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

type ProfileInput = Pick<
  AdopterProfile,
  | "homeType"
  | "hasYard"
  | "hasKids"
  | "hasDogs"
  | "hasCats"
  | "experience"
  | "activityLevel"
  | "hoursAlone"
  | "species"
  | "sizes"
  | "ages"
  | "budgetMonthly"
  | "maxDistance"
  | "lat"
  | "lng"
>;

/**
 * Weighted compatibility score (0-100). Weights: species 20, energy 15, size 10, age 10,
 * kids 10, other pets 10, experience 10, yard 5, distance 5, budget 5.
 * Safety mismatches (kids, other pets, yard, experience) zero their weight and are surfaced as concerns.
 */
export function scoreMatch(profile: ProfileInput, pet: Pet): MatchResult {
  const reasons: string[] = [];
  const concerns: string[] = [];
  let score = 0;
  const species = pet.species === "bird" ? "birds" : `${pet.species}s`;

  if (profile.species.includes(pet.species)) {
    score += 20;
    reasons.push(`You're looking for ${species}`);
  } else {
    concerns.push(`You didn't list ${species} as a preference`);
  }

  const energyGap = Math.abs(LEVEL_ORDER.indexOf(pet.energy) - LEVEL_ORDER.indexOf(profile.activityLevel));
  if (energyGap === 0) {
    score += 15;
    reasons.push(`${cap(pet.energy)} energy matches your ${profile.activityLevel}-activity lifestyle`);
  } else if (energyGap === 1) {
    score += 8;
  } else {
    concerns.push(`${cap(pet.energy)}-energy pet vs. your ${profile.activityLevel}-activity lifestyle`);
  }

  if (profile.sizes.includes(pet.size)) {
    score += 10;
    reasons.push(`${cap(pet.size)} size fits your preference`);
  } else {
    const nearest = Math.min(
      ...profile.sizes.map((s) => Math.abs(SIZE_ORDER.indexOf(s) - SIZE_ORDER.indexOf(pet.size))),
    );
    if (nearest === 1) score += 4;
  }

  if (profile.ages.includes(pet.ageGroup)) {
    score += 10;
    reasons.push(`${cap(pet.ageGroup)} age is what you're after`);
  } else {
    score += 3;
  }

  if (profile.hasKids && !pet.goodWithKids) {
    concerns.push("Not recommended for homes with children");
  } else {
    score += 10;
    if (profile.hasKids) reasons.push("Good with kids");
  }

  const dogConflict = profile.hasDogs && !pet.goodWithDogs;
  const catConflict = profile.hasCats && !pet.goodWithCats;
  if (dogConflict || catConflict) {
    concerns.push(`May not get along with your ${dogConflict ? "dog" : "cat"}`);
  } else {
    score += 10;
    if (profile.hasDogs || profile.hasCats) reasons.push("Gets along with your other pets");
  }

  const expGap = EXPERIENCE_ORDER.indexOf(pet.experienceNeeded) - EXPERIENCE_ORDER.indexOf(profile.experience);
  if (expGap <= 0) {
    score += 10;
    if (pet.experienceNeeded !== "first-time") reasons.push("Your experience level is a fit");
  } else if (expGap === 1) {
    score += 4;
    concerns.push("Needs a bit more experience than you have");
  } else {
    concerns.push("Needs an experienced owner");
  }

  if (pet.needsYard && !profile.hasYard) {
    concerns.push("Needs a fenced yard");
  } else {
    score += 5;
    if (pet.needsYard) reasons.push("You have the yard this pet needs");
  }

  const miles = distanceMiles(profile, pet);
  if (miles <= profile.maxDistance) {
    score += 5;
    reasons.push(miles < 3 ? "Less than 3 miles away" : `About ${Math.round(miles)} miles away`);
  } else {
    concerns.push(`${Math.round(miles)} miles away, outside your ${profile.maxDistance}-mile range`);
  }

  if (pet.monthlyCost <= profile.budgetMonthly) {
    score += 5;
    reasons.push(`Estimated care cost ($${pet.monthlyCost}/mo) fits your budget`);
  } else {
    concerns.push(`Estimated care costs ~$${pet.monthlyCost}/mo, above your $${profile.budgetMonthly} budget`);
  }

  const needsCompany = pet.species === "dog" && (pet.ageGroup === "baby" || pet.energy === "high");
  if (profile.hoursAlone >= 8 && needsCompany) {
    score -= 8;
    concerns.push(`Would be alone ${profile.hoursAlone}+ hours a day`);
  }

  if (profile.homeType === "apartment" && pet.size === "large" && pet.energy === "high") {
    score -= 5;
    concerns.push("A large, high-energy pet can struggle in an apartment");
  }

  return { score: Math.max(0, Math.min(100, Math.round(score))), reasons, concerns, distanceMiles: miles };
}

export function matchLabel(score: number) {
  if (score >= 85) return "Excellent match";
  if (score >= 70) return "Great match";
  if (score >= 55) return "Good match";
  return "Possible match";
}

function cap(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}
