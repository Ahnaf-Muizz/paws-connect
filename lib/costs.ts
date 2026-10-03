import type { AgeGroup, Size, Species } from "./db/schema";

export type CostLine = { key: string; label: string; monthly: number; optional?: boolean; scales?: boolean; vet?: boolean };
export type OneTimeLine = { key: string; label: string; amount: number; skipIf?: "fixed" | "chipped" | "adult" };

/** Rough US averages in dollars for a medium-sized animal; size factors apply to lines marked `scales`. */
export const MONTHLY: Record<Species, CostLine[]> = {
  dog: [
    { key: "food", label: "Food", monthly: 45, scales: true },
    { key: "prevent", label: "Flea, tick & heartworm prevention", monthly: 30, scales: true },
    { key: "vet", label: "Routine vet care (annual exam, vaccines)", monthly: 25, vet: true },
    { key: "treats", label: "Treats, toys & chews", monthly: 15 },
    { key: "insurance", label: "Pet insurance", monthly: 40, optional: true, scales: true },
    { key: "grooming", label: "Professional grooming", monthly: 45, optional: true, scales: true },
    { key: "care", label: "Daycare or dog walker", monthly: 120, optional: true },
  ],
  cat: [
    { key: "food", label: "Food", monthly: 30, scales: true },
    { key: "litter", label: "Litter", monthly: 20 },
    { key: "prevent", label: "Flea prevention", monthly: 15 },
    { key: "vet", label: "Routine vet care (annual exam, vaccines)", monthly: 20, vet: true },
    { key: "treats", label: "Treats & toys", monthly: 10 },
    { key: "insurance", label: "Pet insurance", monthly: 25, optional: true },
    { key: "care", label: "Pet sitter when traveling", monthly: 30, optional: true },
  ],
  rabbit: [
    { key: "food", label: "Hay, pellets & fresh greens", monthly: 45, scales: true },
    { key: "litter", label: "Litter & bedding", monthly: 20 },
    { key: "vet", label: "Exotic vet care", monthly: 20, vet: true },
    { key: "treats", label: "Chew toys", monthly: 10 },
    { key: "insurance", label: "Exotic pet insurance", monthly: 15, optional: true },
    { key: "care", label: "Pet sitter when traveling", monthly: 25, optional: true },
  ],
  bird: [
    { key: "food", label: "Seed, pellets & produce", monthly: 20, scales: true },
    { key: "vet", label: "Avian vet care", monthly: 15, vet: true },
    { key: "treats", label: "Toys & perches (birds shred them)", monthly: 15 },
    { key: "insurance", label: "Exotic pet insurance", monthly: 12, optional: true },
    { key: "care", label: "Pet sitter when traveling", monthly: 20, optional: true },
  ],
};

export const ONE_TIME: Record<Species, OneTimeLine[]> = {
  dog: [
    { key: "supplies", label: "Crate, bed, leash, bowls", amount: 250 },
    { key: "spay", label: "Spay / neuter", amount: 300, skipIf: "fixed" },
    { key: "chip", label: "Microchip", amount: 50, skipIf: "chipped" },
    { key: "puppy", label: "Puppy vaccine series", amount: 150, skipIf: "adult" },
    { key: "training", label: "Basic training class", amount: 150 },
  ],
  cat: [
    { key: "supplies", label: "Litter box, carrier, scratching post", amount: 150 },
    { key: "spay", label: "Spay / neuter", amount: 200, skipIf: "fixed" },
    { key: "chip", label: "Microchip", amount: 50, skipIf: "chipped" },
    { key: "kitten", label: "Kitten vaccine series", amount: 120, skipIf: "adult" },
  ],
  rabbit: [
    { key: "supplies", label: "Enclosure, litter box, hay rack", amount: 200 },
    { key: "spay", label: "Spay / neuter (exotic vet)", amount: 250, skipIf: "fixed" },
  ],
  bird: [
    { key: "supplies", label: "Cage, perches, cover", amount: 250 },
    { key: "wellness", label: "First avian wellness exam", amount: 100 },
  ],
};

export const SIZE_FACTOR: Record<Species, Record<Size, number>> = {
  dog: { small: 0.6, medium: 1, large: 1.6 },
  cat: { small: 0.85, medium: 1, large: 1.2 },
  rabbit: { small: 0.8, medium: 1, large: 1.3 },
  bird: { small: 0.6, medium: 1, large: 2 },
};

export const VET_AGE_FACTOR: Record<AgeGroup, number> = { baby: 1.2, young: 1, adult: 1, senior: 1.8 };

export const LIFESPAN: Record<Species, string> = {
  dog: "10 to 13 years",
  cat: "12 to 18 years",
  rabbit: "8 to 12 years",
  bird: "5 to 80 years, depending on species",
};
