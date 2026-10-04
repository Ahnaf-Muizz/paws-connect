import {
  boolean,
  index,
  integer,
  jsonb,
  pgTable,
  primaryKey,
  real,
  serial,
  text,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";

export type Species = "dog" | "cat" | "rabbit" | "bird";
export type Size = "small" | "medium" | "large";
export type AgeGroup = "baby" | "young" | "adult" | "senior";
export type Level = "low" | "medium" | "high";
export type Experience = "first-time" | "some" | "experienced";
export type HomeType = "apartment" | "house" | "condo" | "farm";
export type PetStatus = "available" | "pending" | "adopted";
export type ApplicationStatus = "submitted" | "screening" | "approved" | "declined" | "withdrawn";
export type ProductCategory = "insurance" | "food" | "clinic" | "groomer" | "medicine";
export type ApplicationKind = "long-term" | "short-term" | "emergency";
export type AppointmentKind = "meet-greet" | "video" | "home-visit";
export type AppointmentStatus = "requested" | "confirmed" | "cancelled";

const createdAt = () => timestamp("created_at", { withTimezone: true }).notNull().defaultNow();

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  name: text("name").notNull(),
  city: text("city").notNull().default("Lubbock, TX"),
  bio: text("bio"),
  phone: text("phone"),
  avatarUrl: text("avatar_url"),
  verified: boolean("verified").notNull().default(false),
  createdAt: createdAt(),
});

export const adopterProfiles = pgTable("adopter_profiles", {
  userId: integer("user_id")
    .primaryKey()
    .references(() => users.id, { onDelete: "cascade" }),
  homeType: text("home_type").$type<HomeType>().notNull(),
  hasYard: boolean("has_yard").notNull().default(false),
  hasKids: boolean("has_kids").notNull().default(false),
  hasDogs: boolean("has_dogs").notNull().default(false),
  hasCats: boolean("has_cats").notNull().default(false),
  experience: text("experience").$type<Experience>().notNull(),
  activityLevel: text("activity_level").$type<Level>().notNull(),
  hoursAlone: integer("hours_alone").notNull().default(4),
  species: jsonb("species").$type<Species[]>().notNull(),
  sizes: jsonb("sizes").$type<Size[]>().notNull(),
  ages: jsonb("ages").$type<AgeGroup[]>().notNull(),
  budgetMonthly: integer("budget_monthly").notNull().default(100),
  maxDistance: integer("max_distance").notNull().default(50),
  lat: real("lat").notNull().default(33.5779),
  lng: real("lng").notNull().default(-101.8552),
  notes: text("notes"),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const shelters = pgTable("shelters", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  description: text("description").notNull(),
  address: text("address").notNull(),
  city: text("city").notNull(),
  phone: text("phone"),
  email: text("email"),
  website: text("website"),
  hours: text("hours"),
  capacity: integer("capacity").notNull(),
  currentCount: integer("current_count").notNull(),
  acceptsFosters: boolean("accepts_fosters").notNull().default(true),
  isReal: boolean("is_real").notNull().default(false),
  imageUrl: text("image_url"),
  lat: real("lat").notNull(),
  lng: real("lng").notNull(),
});

export const vets = pgTable("vets", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  clinic: text("clinic").notNull(),
  address: text("address").notNull(),
  phone: text("phone").notNull(),
  website: text("website"),
  hours: text("hours").notNull(),
  specialties: jsonb("specialties").$type<string[]>().notNull(),
  species: jsonb("species").$type<Species[]>().notNull(),
  emergency: boolean("emergency").notNull().default(false),
  acceptsNewPatients: boolean("accepts_new_patients").notNull().default(true),
  priceLevel: integer("price_level").notNull().default(2),
  isReal: boolean("is_real").notNull().default(false),
  lat: real("lat").notNull(),
  lng: real("lng").notNull(),
});

export const pets = pgTable(
  "pets",
  {
    id: serial("id").primaryKey(),
    name: text("name").notNull(),
    species: text("species").$type<Species>().notNull(),
    breed: text("breed").notNull(),
    ageYears: real("age_years").notNull(),
    ageGroup: text("age_group").$type<AgeGroup>().notNull(),
    sex: text("sex").$type<"male" | "female">().notNull(),
    size: text("size").$type<Size>().notNull(),
    energy: text("energy").$type<Level>().notNull(),
    goodWithKids: boolean("good_with_kids").notNull().default(true),
    goodWithDogs: boolean("good_with_dogs").notNull().default(true),
    goodWithCats: boolean("good_with_cats").notNull().default(true),
    needsYard: boolean("needs_yard").notNull().default(false),
    experienceNeeded: text("experience_needed").$type<Experience>().notNull().default("first-time"),
    houseTrained: boolean("house_trained").notNull().default(true),
    vaccinated: boolean("vaccinated").notNull().default(true),
    spayedNeutered: boolean("spayed_neutered").notNull().default(true),
    microchipped: boolean("microchipped").notNull().default(false),
    monthlyCost: integer("monthly_cost").notNull().default(80),
    adoptionFee: integer("adoption_fee").notNull().default(0),
    description: text("description").notNull(),
    rehomeReason: text("rehome_reason"),
    photos: jsonb("photos").$type<string[]>().notNull(),
    status: text("status").$type<PetStatus>().notNull().default("available"),
    ownerId: integer("owner_id").references(() => users.id, { onDelete: "cascade" }),
    shelterId: integer("shelter_id").references(() => shelters.id, { onDelete: "set null" }),
    city: text("city").notNull().default("Lubbock, TX"),
    lat: real("lat").notNull(),
    lng: real("lng").notNull(),
    createdAt: createdAt(),
  },
  (t) => [index("pets_species_idx").on(t.species), index("pets_owner_idx").on(t.ownerId)],
);

export const petReactions = pgTable(
  "pet_reactions",
  {
    userId: integer("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    petId: integer("pet_id")
      .notNull()
      .references(() => pets.id, { onDelete: "cascade" }),
    reaction: text("reaction").$type<"like" | "pass">().notNull(),
    createdAt: createdAt(),
  },
  (t) => [primaryKey({ columns: [t.userId, t.petId] })],
);

export const favorites = pgTable(
  "favorites",
  {
    userId: integer("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    petId: integer("pet_id")
      .notNull()
      .references(() => pets.id, { onDelete: "cascade" }),
    createdAt: createdAt(),
  },
  (t) => [primaryKey({ columns: [t.userId, t.petId] })],
);

export const applications = pgTable(
  "applications",
  {
    id: serial("id").primaryKey(),
    petId: integer("pet_id")
      .notNull()
      .references(() => pets.id, { onDelete: "cascade" }),
    applicantId: integer("applicant_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    message: text("message").notNull(),
    kind: text("kind").$type<ApplicationKind>().notNull().default("long-term"),
    duration: text("duration"),
    status: text("status").$type<ApplicationStatus>().notNull().default("submitted"),
    matchScore: integer("match_score"),
    decisionNote: text("decision_note"),
    decidedAt: timestamp("decided_at", { withTimezone: true }),
    createdAt: createdAt(),
  },
  (t) => [uniqueIndex("applications_pet_applicant_idx").on(t.petId, t.applicantId)],
);

export const products = pgTable("products", {
  id: serial("id").primaryKey(),
  category: text("category").$type<ProductCategory>().notNull(),
  name: text("name").notNull(),
  provider: text("provider").notNull(),
  description: text("description").notNull(),
  priceCents: integer("price_cents").notNull(),
  salePct: integer("sale_pct").notNull().default(0),
  unit: text("unit").notNull(),
  species: jsonb("species").$type<Species[]>().notNull(),
  tags: jsonb("tags").$type<string[]>().notNull().default([]),
  address: text("address"),
  phone: text("phone"),
  featured: boolean("featured").notNull().default(false),
});

export const cartItems = pgTable(
  "cart_items",
  {
    userId: integer("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    productId: integer("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),
    quantity: integer("quantity").notNull().default(1),
  },
  (t) => [primaryKey({ columns: [t.userId, t.productId] })],
);

export const orders = pgTable("orders", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  kind: text("kind").$type<"purchase" | "donation">().notNull().default("purchase"),
  shelterId: integer("shelter_id").references(() => shelters.id, { onDelete: "set null" }),
  subtotalCents: integer("subtotal_cents").notNull(),
  taxCents: integer("tax_cents").notNull(),
  totalCents: integer("total_cents").notNull(),
  cardBrand: text("card_brand").notNull(),
  cardLast4: text("card_last4").notNull(),
  billingName: text("billing_name").notNull(),
  billingZip: text("billing_zip").notNull(),
  confirmation: text("confirmation").notNull(),
  createdAt: createdAt(),
});

export const orderItems = pgTable("order_items", {
  id: serial("id").primaryKey(),
  orderId: integer("order_id")
    .notNull()
    .references(() => orders.id, { onDelete: "cascade" }),
  productId: integer("product_id").references(() => products.id, { onDelete: "set null" }),
  name: text("name").notNull(),
  unit: text("unit").notNull(),
  priceCents: integer("price_cents").notNull(),
  quantity: integer("quantity").notNull(),
});

export const conversations = pgTable("conversations", {
  id: serial("id").primaryKey(),
  petId: integer("pet_id").references(() => pets.id, { onDelete: "set null" }),
  userAId: integer("user_a_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  userBId: integer("user_b_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  lastMessageAt: timestamp("last_message_at", { withTimezone: true }).notNull().defaultNow(),
  createdAt: createdAt(),
});

export const messages = pgTable(
  "messages",
  {
    id: serial("id").primaryKey(),
    conversationId: integer("conversation_id")
      .notNull()
      .references(() => conversations.id, { onDelete: "cascade" }),
    senderId: integer("sender_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    body: text("body").notNull(),
    readAt: timestamp("read_at", { withTimezone: true }),
    createdAt: createdAt(),
  },
  (t) => [index("messages_conversation_idx").on(t.conversationId)],
);

export const lostFound = pgTable("lost_found", {
  id: serial("id").primaryKey(),
  kind: text("kind").$type<"lost" | "found">().notNull(),
  species: text("species").$type<Species>().notNull(),
  petName: text("pet_name"),
  description: text("description").notNull(),
  photoUrl: text("photo_url"),
  lastSeenLocation: text("last_seen_location").notNull(),
  lastSeenAt: timestamp("last_seen_at", { withTimezone: true }).notNull(),
  contactName: text("contact_name").notNull(),
  contactPhone: text("contact_phone").notNull(),
  reporterId: integer("reporter_id").references(() => users.id, { onDelete: "set null" }),
  resolved: boolean("resolved").notNull().default(false),
  createdAt: createdAt(),
});

export const fosterApplications = pgTable("foster_applications", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  shelterId: integer("shelter_id")
    .notNull()
    .references(() => shelters.id, { onDelete: "cascade" }),
  species: jsonb("species").$type<Species[]>().notNull(),
  duration: text("duration").notNull(),
  capacity: integer("capacity").notNull().default(1),
  notes: text("notes"),
  status: text("status").$type<"pending" | "approved">().notNull().default("pending"),
  createdAt: createdAt(),
});

export const events = pgTable("events", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  kind: text("kind").$type<"adoption" | "clinic" | "fundraiser" | "training">().notNull(),
  description: text("description").notNull(),
  startsAt: timestamp("starts_at", { withTimezone: true }).notNull(),
  endsAt: timestamp("ends_at", { withTimezone: true }).notNull(),
  location: text("location").notNull(),
  address: text("address").notNull(),
  shelterId: integer("shelter_id").references(() => shelters.id, { onDelete: "set null" }),
});

export const eventRsvps = pgTable(
  "event_rsvps",
  {
    userId: integer("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    eventId: integer("event_id")
      .notNull()
      .references(() => events.id, { onDelete: "cascade" }),
    createdAt: createdAt(),
  },
  (t) => [primaryKey({ columns: [t.userId, t.eventId] })],
);

export const reviews = pgTable(
  "reviews",
  {
    id: serial("id").primaryKey(),
    targetType: text("target_type").$type<"vet" | "product">().notNull(),
    targetId: integer("target_id").notNull(),
    userId: integer("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    rating: integer("rating").notNull(),
    body: text("body").notNull(),
    createdAt: createdAt(),
  },
  (t) => [index("reviews_target_idx").on(t.targetType, t.targetId)],
);

export const healthRecords = pgTable("health_records", {
  id: serial("id").primaryKey(),
  petId: integer("pet_id")
    .notNull()
    .references(() => pets.id, { onDelete: "cascade" }),
  kind: text("kind").$type<"vaccine" | "checkup" | "medication" | "procedure">().notNull(),
  title: text("title").notNull(),
  date: timestamp("date", { withTimezone: true }).notNull(),
  nextDue: timestamp("next_due", { withTimezone: true }),
  notes: text("notes"),
});

export type User = typeof users.$inferSelect;
export type AdopterProfile = typeof adopterProfiles.$inferSelect;
export type Shelter = typeof shelters.$inferSelect;
export type Vet = typeof vets.$inferSelect;
export type Pet = typeof pets.$inferSelect;
export type Application = typeof applications.$inferSelect;
export type Product = typeof products.$inferSelect;
export type Order = typeof orders.$inferSelect;
export type OrderItem = typeof orderItems.$inferSelect;
export type LostFound = typeof lostFound.$inferSelect;
export type Event = typeof events.$inferSelect;
export type Review = typeof reviews.$inferSelect;
export type HealthRecord = typeof healthRecords.$inferSelect;
