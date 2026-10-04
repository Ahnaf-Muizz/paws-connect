import { and, asc, avg, count, desc, eq, ilike, inArray, ne, or, sql, type SQL } from "drizzle-orm";
import { getDb, schema as s } from "./db";
import type { AgeGroup, Level, Pet, ProductCategory, Size, Species } from "./db/schema";
import { scoreMatch } from "./matching";
import { screeningState } from "./screening";

export type PetFilters = {
  q?: string;
  species?: Species[];
  size?: Size[];
  age?: AgeGroup[];
  energy?: Level[];
  kids?: boolean;
  dogs?: boolean;
  cats?: boolean;
  source?: "owner" | "shelter";
  breed?: string[];
  sort?: "newest" | "name" | "age" | "nearest";
  includeUnavailable?: boolean;
};

const ownerCols = { id: s.users.id, name: s.users.name, city: s.users.city, verified: s.users.verified };
const shelterCols = { id: s.shelters.id, name: s.shelters.name, slug: s.shelters.slug };

export async function listPets(f: PetFilters = {}) {
  const db = await getDb();
  const where: SQL[] = [];
  if (!f.includeUnavailable) where.push(ne(s.pets.status, "adopted"));
  if (f.q) where.push(or(ilike(s.pets.name, `%${f.q}%`), ilike(s.pets.breed, `%${f.q}%`))!);
  if (f.species?.length) where.push(inArray(s.pets.species, f.species));
  if (f.size?.length) where.push(inArray(s.pets.size, f.size));
  if (f.age?.length) where.push(inArray(s.pets.ageGroup, f.age));
  if (f.energy?.length) where.push(inArray(s.pets.energy, f.energy));
  if (f.kids) where.push(eq(s.pets.goodWithKids, true));
  if (f.dogs) where.push(eq(s.pets.goodWithDogs, true));
  if (f.cats) where.push(eq(s.pets.goodWithCats, true));
  if (f.source === "owner") where.push(sql`${s.pets.ownerId} is not null`);
  if (f.source === "shelter") where.push(sql`${s.pets.shelterId} is not null`);
  if (f.breed?.length) where.push(inArray(s.pets.breed, f.breed));
  const order =
    f.sort === "name" ? asc(s.pets.name) : f.sort === "age" ? asc(s.pets.ageYears) : desc(s.pets.createdAt);

  return db
    .select({ pet: s.pets, owner: ownerCols, shelter: shelterCols })
    .from(s.pets)
    .leftJoin(s.users, eq(s.pets.ownerId, s.users.id))
    .leftJoin(s.shelters, eq(s.pets.shelterId, s.shelters.id))
    .where(where.length ? and(...where) : undefined)
    .orderBy(order, asc(s.pets.id));
}

export type PetListItem = Awaited<ReturnType<typeof listPets>>[number];

export async function getPet(id: number) {
  const db = await getDb();
  const [row] = await db
    .select({
      pet: s.pets,
      owner: { ...ownerCols, bio: s.users.bio, phone: s.users.phone },
      shelter: { ...shelterCols, address: s.shelters.address, phone: s.shelters.phone, website: s.shelters.website, isReal: s.shelters.isReal },
    })
    .from(s.pets)
    .leftJoin(s.users, eq(s.pets.ownerId, s.users.id))
    .leftJoin(s.shelters, eq(s.pets.shelterId, s.shelters.id))
    .where(eq(s.pets.id, id))
    .limit(1);
  if (!row) return null;
  const health = await db.select().from(s.healthRecords).where(eq(s.healthRecords.petId, id)).orderBy(desc(s.healthRecords.date));
  return { ...row, health };
}

export async function listPetBreeds() {
  const db = await getDb();
  const rows = await db
    .selectDistinct({ breed: s.pets.breed })
    .from(s.pets)
    .where(ne(s.pets.status, "adopted"))
    .orderBy(asc(s.pets.breed));
  return rows.map((r) => r.breed);
}

export async function getProfile(userId: number) {
  const db = await getDb();
  const [profile] = await db.select().from(s.adopterProfiles).where(eq(s.adopterProfiles.userId, userId)).limit(1);
  return profile ?? null;
}

export async function getMatches(userId: number, { includeReacted = false } = {}) {
  const db = await getDb();
  const profile = await getProfile(userId);
  if (!profile) return { profile: null, matches: [] };
  const [pets, reactions, favs] = await Promise.all([
    listPets(),
    db.select().from(s.petReactions).where(eq(s.petReactions.userId, userId)),
    db.select({ petId: s.favorites.petId }).from(s.favorites).where(eq(s.favorites.userId, userId)),
  ]);
  const reactionByPet = new Map(reactions.map((r) => [r.petId, r.reaction]));
  const favSet = new Set(favs.map((f) => f.petId));
  const matches = pets
    .filter(({ pet }) => pet.status === "available" && pet.ownerId !== userId)
    .filter(({ pet }) => includeReacted || !reactionByPet.has(pet.id))
    .map((row) => ({
      ...row,
      match: scoreMatch(profile, row.pet),
      reaction: reactionByPet.get(row.pet.id) ?? null,
      favorite: favSet.has(row.pet.id),
    }))
    .sort((a, b) => b.match.score - a.match.score);
  return { profile, matches };
}

export async function scoreForUser(userId: number, pet: Pet) {
  const profile = await getProfile(userId);
  return profile ? scoreMatch(profile, pet) : null;
}

export async function listShelters() {
  const db = await getDb();
  const counts = db
    .select({ shelterId: s.pets.shelterId, n: count().as("n") })
    .from(s.pets)
    .where(eq(s.pets.status, "available"))
    .groupBy(s.pets.shelterId)
    .as("counts");
  return db
    .select({ shelter: s.shelters, listed: sql<number>`coalesce(${counts.n}, 0)`.mapWith(Number) })
    .from(s.shelters)
    .leftJoin(counts, eq(counts.shelterId, s.shelters.id))
    .orderBy(desc(s.shelters.isReal), asc(s.shelters.name));
}

export async function getShelter(slug: string) {
  const db = await getDb();
  const [shelter] = await db.select().from(s.shelters).where(eq(s.shelters.slug, slug)).limit(1);
  if (!shelter) return null;
  const [pets, events] = await Promise.all([
    db.select().from(s.pets).where(and(eq(s.pets.shelterId, shelter.id), ne(s.pets.status, "adopted"))).orderBy(asc(s.pets.name)),
    db.select().from(s.events).where(eq(s.events.shelterId, shelter.id)).orderBy(asc(s.events.startsAt)),
  ]);
  return { shelter, pets, events };
}

function ratingSubquery(targetType: "vet" | "product") {
  return getDb().then((db) =>
    db
      .select({
        targetId: s.reviews.targetId,
        rating: avg(s.reviews.rating).as("rating"),
        reviews: count().as("reviews"),
      })
      .from(s.reviews)
      .where(eq(s.reviews.targetType, targetType))
      .groupBy(s.reviews.targetId)
      .as(`${targetType}_ratings`),
  );
}

export async function listVets() {
  const db = await getDb();
  const r = await ratingSubquery("vet");
  return db
    .select({
      vet: s.vets,
      rating: sql<number>`coalesce(${r.rating}, 0)`.mapWith(Number),
      reviews: sql<number>`coalesce(${r.reviews}, 0)`.mapWith(Number),
    })
    .from(s.vets)
    .leftJoin(r, eq(r.targetId, s.vets.id))
    .orderBy(desc(s.vets.isReal), asc(s.vets.clinic));
}

export async function getVet(id: number) {
  const db = await getDb();
  const [vet] = await db.select().from(s.vets).where(eq(s.vets.id, id)).limit(1);
  if (!vet) return null;
  const reviews = await listReviews("vet", id);
  return { vet, reviews };
}

export async function listReviews(targetType: "vet" | "product", targetId: number) {
  const db = await getDb();
  return db
    .select({ review: s.reviews, author: { id: s.users.id, name: s.users.name } })
    .from(s.reviews)
    .innerJoin(s.users, eq(s.reviews.userId, s.users.id))
    .where(and(eq(s.reviews.targetType, targetType), eq(s.reviews.targetId, targetId)))
    .orderBy(desc(s.reviews.createdAt));
}

export async function listProducts(category?: ProductCategory) {
  const db = await getDb();
  const r = await ratingSubquery("product");
  return db
    .select({
      product: s.products,
      rating: sql<number>`coalesce(${r.rating}, 0)`.mapWith(Number),
      reviews: sql<number>`coalesce(${r.reviews}, 0)`.mapWith(Number),
    })
    .from(s.products)
    .leftJoin(r, eq(r.targetId, s.products.id))
    .where(category ? eq(s.products.category, category) : undefined)
    .orderBy(desc(s.products.featured), asc(s.products.priceCents));
}

export async function listOwners() {
  const db = await getDb();
  const counts = db
    .select({ ownerId: s.pets.ownerId, n: count().as("n") })
    .from(s.pets)
    .where(ne(s.pets.status, "adopted"))
    .groupBy(s.pets.ownerId)
    .as("owner_counts");
  return db
    .select({
      owner: { ...ownerCols, bio: s.users.bio, createdAt: s.users.createdAt },
      pets: sql<number>`coalesce(${counts.n}, 0)`.mapWith(Number),
    })
    .from(s.users)
    .innerJoin(counts, eq(counts.ownerId, s.users.id))
    .orderBy(desc(s.users.verified), asc(s.users.name));
}

export async function getOwner(id: number) {
  const db = await getDb();
  const [owner] = await db
    .select({ ...ownerCols, bio: s.users.bio, createdAt: s.users.createdAt })
    .from(s.users)
    .where(eq(s.users.id, id))
    .limit(1);
  if (!owner) return null;
  const pets = await db.select().from(s.pets).where(eq(s.pets.ownerId, id)).orderBy(desc(s.pets.createdAt));
  return { owner, pets };
}

const applicantCols = { id: s.users.id, name: s.users.name, city: s.users.city, verified: s.users.verified };

export async function listMyApplications(userId: number) {
  const db = await getDb();
  const rows = await db
    .select({ application: s.applications, pet: s.pets })
    .from(s.applications)
    .innerJoin(s.pets, eq(s.applications.petId, s.pets.id))
    .where(eq(s.applications.applicantId, userId))
    .orderBy(desc(s.applications.createdAt));
  return rows.map((r) => ({ ...r, screening: screeningState(r.application) }));
}

export async function listReceivedApplications(userId: number) {
  const db = await getDb();
  const rows = await db
    .select({ application: s.applications, pet: s.pets, applicant: applicantCols })
    .from(s.applications)
    .innerJoin(s.pets, eq(s.applications.petId, s.pets.id))
    .innerJoin(s.users, eq(s.applications.applicantId, s.users.id))
    .where(eq(s.pets.ownerId, userId))
    .orderBy(desc(s.applications.createdAt));
  return rows.map((r) => ({ ...r, screening: screeningState(r.application) }));
}

export async function listAppointmentsForUser(userId: number) {
  const db = await getDb();
  return db
    .select({
      appointment: s.appointments,
      pet: s.pets,
      requester: { id: s.users.id, name: s.users.name, city: s.users.city },
    })
    .from(s.appointments)
    .innerJoin(s.pets, eq(s.appointments.petId, s.pets.id))
    .innerJoin(s.users, eq(s.appointments.requesterId, s.users.id))
    .where(or(eq(s.appointments.requesterId, userId), eq(s.pets.ownerId, userId)))
    .orderBy(desc(s.appointments.scheduledAt));
}

export async function listOrders(userId: number) {
  const db = await getDb();
  return db.select().from(s.orders).where(eq(s.orders.userId, userId)).orderBy(desc(s.orders.createdAt));
}

export async function getOrder(userId: number, id: number) {
  const db = await getDb();
  const [order] = await db
    .select()
    .from(s.orders)
    .where(and(eq(s.orders.id, id), eq(s.orders.userId, userId)))
    .limit(1);
  if (!order) return null;
  const items = await db.select().from(s.orderItems).where(eq(s.orderItems.orderId, id));
  let shelter = null;
  if (order.shelterId) {
    [shelter] = await db.select().from(s.shelters).where(eq(s.shelters.id, order.shelterId));
  }
  return { order, items, shelter };
}

export async function listFavorites(userId: number) {
  const db = await getDb();
  return db
    .select({ pet: s.pets, owner: ownerCols, shelter: shelterCols })
    .from(s.favorites)
    .innerJoin(s.pets, eq(s.favorites.petId, s.pets.id))
    .leftJoin(s.users, eq(s.pets.ownerId, s.users.id))
    .leftJoin(s.shelters, eq(s.pets.shelterId, s.shelters.id))
    .where(eq(s.favorites.userId, userId))
    .orderBy(desc(s.favorites.createdAt));
}

export async function listEvents(userId?: number | null) {
  const db = await getDb();
  const counts = db
    .select({ eventId: s.eventRsvps.eventId, n: count().as("n") })
    .from(s.eventRsvps)
    .groupBy(s.eventRsvps.eventId)
    .as("rsvp_counts");
  const [rows, mine] = await Promise.all([
    db
      .select({ event: s.events, shelter: shelterCols, going: sql<number>`coalesce(${counts.n}, 0)`.mapWith(Number) })
      .from(s.events)
      .leftJoin(s.shelters, eq(s.events.shelterId, s.shelters.id))
      .leftJoin(counts, eq(counts.eventId, s.events.id))
      .where(sql`${s.events.endsAt} >= now()`)
      .orderBy(asc(s.events.startsAt)),
    userId ? db.select({ eventId: s.eventRsvps.eventId }).from(s.eventRsvps).where(eq(s.eventRsvps.userId, userId)) : [],
  ]);
  const mineSet = new Set(mine.map((m) => m.eventId));
  return rows.map((r) => ({ ...r, attending: mineSet.has(r.event.id) }));
}

export async function listLostFound(kind?: "lost" | "found", species?: Species) {
  const db = await getDb();
  const where: SQL[] = [eq(s.lostFound.resolved, false)];
  if (kind) where.push(eq(s.lostFound.kind, kind));
  if (species) where.push(eq(s.lostFound.species, species));
  return db
    .select()
    .from(s.lostFound)
    .where(and(...where))
    .orderBy(desc(s.lostFound.lastSeenAt));
}

export async function listMapPlaces() {
  const db = await getDb();
  const [shelters, vets] = await Promise.all([
    db.select({ id: s.shelters.id, name: s.shelters.name, slug: s.shelters.slug, address: s.shelters.address, phone: s.shelters.phone, lat: s.shelters.lat, lng: s.shelters.lng, isReal: s.shelters.isReal }).from(s.shelters),
    db.select({ id: s.vets.id, name: s.vets.clinic, address: s.vets.address, phone: s.vets.phone, lat: s.vets.lat, lng: s.vets.lng, emergency: s.vets.emergency, isReal: s.vets.isReal }).from(s.vets),
  ]);
  return { shelters, vets };
}

export async function getStats() {
  const db = await getDb();
  const [[pets], [adopted], [shelters], [families]] = await Promise.all([
    db.select({ n: count() }).from(s.pets).where(eq(s.pets.status, "available")),
    db.select({ n: count() }).from(s.applications).where(eq(s.applications.status, "approved")),
    db.select({ n: count() }).from(s.shelters),
    db.select({ n: count() }).from(s.users),
  ]);
  return { pets: pets.n, matches: adopted.n, shelters: shelters.n, families: families.n };
}
