import { z } from "zod";

export const SPECIES = ["dog", "cat", "rabbit", "bird"] as const;
export const SIZES = ["small", "medium", "large"] as const;
export const AGES = ["baby", "young", "adult", "senior"] as const;
export const LEVELS = ["low", "medium", "high"] as const;
export const EXPERIENCE = ["first-time", "some", "experienced"] as const;
export const HOME_TYPES = ["apartment", "house", "condo", "farm"] as const;

const photoUrl = z
  .string()
  .refine(
    (u) =>
      u.startsWith("/api/upload/local/") ||
      /^https:\/\/[a-z0-9-]+\.public\.blob\.vercel-storage\.com\//i.test(u) ||
      u.startsWith("https://images.unsplash.com/"),
    "Photos must be uploaded through PAWS Connect",
  );

export const ProfileInput = z.object({
  homeType: z.enum(HOME_TYPES),
  hasYard: z.boolean(),
  hasKids: z.boolean(),
  hasDogs: z.boolean(),
  hasCats: z.boolean(),
  experience: z.enum(EXPERIENCE),
  activityLevel: z.enum(LEVELS),
  hoursAlone: z.number().int().min(0).max(16),
  species: z.array(z.enum(SPECIES)).min(1, "Pick at least one kind of pet"),
  sizes: z.array(z.enum(SIZES)).min(1, "Pick at least one size"),
  ages: z.array(z.enum(AGES)).min(1, "Pick at least one age group"),
  budgetMonthly: z.number().int().min(10).max(2000),
  maxDistance: z.number().int().min(5).max(500),
  notes: z.string().max(1000).optional().nullable(),
});

export const PetInput = z.object({
  name: z.string().trim().min(1, "Name is required").max(40),
  species: z.enum(SPECIES),
  breed: z.string().trim().min(2, "Breed is required").max(80),
  ageYears: z.number().min(0).max(80),
  sex: z.enum(["male", "female"]),
  size: z.enum(SIZES),
  energy: z.enum(LEVELS),
  goodWithKids: z.boolean(),
  goodWithDogs: z.boolean(),
  goodWithCats: z.boolean(),
  needsYard: z.boolean(),
  experienceNeeded: z.enum(EXPERIENCE),
  houseTrained: z.boolean(),
  vaccinated: z.boolean(),
  spayedNeutered: z.boolean(),
  microchipped: z.boolean(),
  description: z.string().trim().min(20, "Tell families a bit more (20+ characters)").max(2000),
  rehomeReason: z.string().trim().max(500).optional().nullable(),
  photos: z.array(photoUrl).min(1, "Add at least one photo").max(6),
  city: z.string().trim().min(2).max(80),
});

export const APPLICATION_KINDS = ["long-term", "short-term", "emergency"] as const;
export const APPLICATION_KIND_META: Record<(typeof APPLICATION_KINDS)[number], { label: string; detail: string }> = {
  "long-term": { label: "Long-term", detail: "A forever home. You plan to keep this pet as part of your family." },
  "short-term": { label: "Short-term", detail: "Foster or temporary care while a permanent home is found." },
  emergency: { label: "Emergency shelter", detail: "A safe place right away if they cannot stay where they are tonight." },
};

export const ApplicationInput = z.object({
  petId: z.number().int().positive(),
  kind: z.enum(APPLICATION_KINDS),
  duration: z.string().trim().max(40).optional().nullable(),
  message: z.string().trim().min(20, "Tell the owner a little about your home (20+ characters)").max(2000),
});

export const AppointmentInput = z.object({
  petId: z.number().int().positive(),
  kind: z.enum(["meet-greet", "video", "home-visit"]),
  scheduledAt: z.string().refine((d) => !Number.isNaN(Date.parse(d)), "Pick a valid time"),
  notes: z.string().trim().max(500).optional().nullable(),
});

export const LostFoundInput = z.object({
  kind: z.enum(["lost", "found"]),
  species: z.enum(SPECIES),
  petName: z.string().trim().max(40).optional().nullable(),
  description: z.string().trim().min(10).max(1000),
  photoUrl: photoUrl.optional().nullable(),
  lastSeenLocation: z.string().trim().min(3).max(200),
  lastSeenAt: z.string().refine((d) => !Number.isNaN(Date.parse(d)), "Invalid date"),
  contactName: z.string().trim().min(2).max(80),
  contactPhone: z.string().trim().min(7).max(30),
});

export const ReviewInput = z.object({
  targetType: z.enum(["vet", "product"]),
  targetId: z.number().int().positive(),
  rating: z.number().int().min(1).max(5),
  body: z.string().trim().min(5).max(1000),
});

export const FosterInput = z.object({
  shelterId: z.number().int().positive(),
  species: z.array(z.enum(SPECIES)).min(1),
  duration: z.enum(["2 weeks", "1 month", "3 months", "Until adopted"]),
  capacity: z.number().int().min(1).max(10),
  notes: z.string().trim().max(1000).optional().nullable(),
});

export const CardInput = z.object({
  name: z.string().trim().min(2, "Name on card is required").max(80),
  number: z.string().transform((v) => v.replace(/\D/g, "")),
  expiry: z.string().trim(),
  cvc: z.string().trim(),
  zip: z.string().trim().regex(/^\d{5}$/, "Enter a 5-digit ZIP code"),
});
