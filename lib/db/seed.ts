import bcrypt from "bcryptjs";
import { sql } from "drizzle-orm";
import type { DB } from "./index";
import * as s from "./schema";
import type { Experience, Level, Size, Species } from "./schema";
import { CITY_COORDS as CITIES, ageGroupFor as ageGroup, monthlyCostFor as monthlyCost } from "../pets";
import { SITE_PHOTOS, unsplash as photo } from "../photos";

export const DEMO_EMAIL = "demo@pawsconnect.org";
export const DEMO_PASSWORD = "paws1234";

function jitter(city: string, i: number): [number, number] {
  const [lat, lng] = CITIES[city];
  const a = ((i * 37) % 17) / 17 - 0.5;
  const b = ((i * 53) % 19) / 19 - 0.5;
  return [lat + a * 0.06, lng + b * 0.07];
}

const daysAgo = (n: number) => new Date(Date.now() - n * 86_400_000);
const daysFromNow = (n: number, hour = 10) => {
  const d = new Date(Date.now() + n * 86_400_000);
  d.setUTCHours(hour + 5, 0, 0, 0);
  return d;
};

const OWNERS: { name: string; city: string; bio: string; verified: boolean }[] = [
  { name: "Maria Gonzalez", city: "Lubbock, TX", bio: "Nurse at UMC and lifelong dog lover. Fostered 12 dogs for local rescues.", verified: true },
  { name: "James Whitaker", city: "Wolfforth, TX", bio: "Retired teacher with a big backyard and a soft spot for senior pets.", verified: true },
  { name: "Priya Patel", city: "Lubbock, TX", bio: "Texas Tech grad student. Cat mom to two rescued tabbies.", verified: true },
  { name: "Daniel Kim", city: "Shallowater, TX", bio: "Farm life with dogs, cats, and a very opinionated rabbit.", verified: false },
  { name: "Ashley Brooks", city: "Lubbock, TX", bio: "Groomer by trade. I help neighbors find safe homes for pets they can't keep.", verified: true },
  { name: "Carlos Mendoza", city: "Slaton, TX", bio: "Air Force veteran. Moving overseas and finding the best home for my crew.", verified: true },
  { name: "Emily Nguyen", city: "Lubbock, TX", bio: "Bird enthusiast and volunteer at local adoption events.", verified: true },
  { name: "Robert Hayes", city: "Levelland, TX", bio: "Rancher with working dogs. Occasionally rehome pups that aren't a fit for ranch life.", verified: false },
  { name: "Sarah Mitchell", city: "Ransom Canyon, TX", bio: "Mom of three. We love our pets and want the best for them.", verified: true },
  { name: "Tyler Johnson", city: "Lubbock, TX", bio: "Software developer who works from home. Big believer in adopt, don't shop.", verified: true },
  { name: "Grace Liu", city: "Idalou, TX", bio: "Small-animal lover. Rabbits are the most underrated pets!", verified: true },
  { name: "Marcus Bell", city: "Plainview, TX", bio: "Coach and dog trainer. Happy to help with behavior questions.", verified: false },
  { name: "Hannah Ortiz", city: "Lubbock, TX", bio: "Vet tech at a local clinic. I post pets that need a second chance.", verified: true },
  { name: "Ben Carter", city: "Wolfforth, TX", bio: "New dad, lifelong cat person.", verified: false },
];

type ShelterSeed = Omit<typeof s.shelters.$inferInsert, "id">;
const SHELTERS: ShelterSeed[] = [
  {
    name: "Lubbock Animal Services Adoption Center",
    slug: "lubbock-animal-services",
    description:
      "The City of Lubbock's public shelter and adoption center. Adoptions include spay/neuter, deworming, and vaccinations. Foster volunteers are always needed when the shelter is at capacity.",
    address: "3323 SE Loop 289, Lubbock, TX 79404",
    city: "Lubbock, TX",
    phone: "(806) 775-2057",
    email: "lubbockanimalservices@mylubbock.us",
    website: "https://www.mylubbock.us/animalservices",
    hours: "Mon-Sat 10am-7pm, Sun closed",
    capacity: 300,
    currentCount: 291,
    acceptsFosters: true,
    isReal: true,
    imageUrl: SITE_PHOTOS.heroDogs,
    lat: 33.5303,
    lng: -101.8057,
  },
  {
    name: "The Haven Animal Care Shelter",
    slug: "the-haven-acs",
    description:
      "A no-kill, non-profit sanctuary founded in 1977 on seven acres near Lubbock. Home to 100+ dogs and cats, including seniors and special-needs animals. Offers education and pet therapy programs.",
    address: "4501 N FM 1729, Lubbock, TX 79403",
    city: "Lubbock, TX",
    phone: "(806) 763-0092",
    email: "havenacs@gmail.com",
    website: "https://www.havenacs.org/",
    hours: "Call ahead for visiting hours",
    capacity: 110,
    currentCount: 106,
    acceptsFosters: true,
    isReal: true,
    imageUrl: SITE_PHOTOS.catHand,
    lat: 33.6355,
    lng: -101.7476,
  },
  {
    name: "South Plains SPCA",
    slug: "south-plains-spca",
    description:
      "A 501(c)(3) non-profit that promotes animal welfare and educates pet owners across the South Plains. Funds medical care for injured and sick animals.",
    address: "8901 Highway 87, Building 119, Lubbock, TX",
    city: "Lubbock, TX",
    phone: "(806) 445-6317",
    email: "adoptions.spspca@gmail.com",
    website: "https://www.facebook.com/SouthPlainsSpca/",
    hours: "Adoption events Sat: dogs 11am-2pm, cats 3-7pm",
    capacity: 80,
    currentCount: 77,
    acceptsFosters: true,
    isReal: true,
    imageUrl: SITE_PHOTOS.puppy,
    lat: 33.4789,
    lng: -101.8233,
  },
  {
    name: "Caprock Canine Rescue",
    slug: "caprock-canine-rescue",
    description: "Sample listing. A foster-based dog rescue focused on large breeds and working dogs from rural West Texas.",
    address: "1200 Main St, Wolfforth, TX 79382",
    city: "Wolfforth, TX",
    phone: "(806) 555-0141",
    email: "hello@caprockcanine.example",
    website: null,
    hours: "Sat 11am-3pm adoption hours",
    capacity: 40,
    currentCount: 38,
    acceptsFosters: true,
    isReal: false,
    imageUrl: SITE_PHOTOS.family,
    lat: 33.5071,
    lng: -102.0123,
  },
  {
    name: "Hub City Cat Haven",
    slug: "hub-city-cat-haven",
    description: "Sample listing. A cage-free cat sanctuary near Tech Terrace with a kitten nursery and senior cat lounge.",
    address: "2410 19th St, Lubbock, TX 79410",
    city: "Lubbock, TX",
    phone: "(806) 555-0152",
    email: "meow@hubcitycats.example",
    website: null,
    hours: "Tue-Sun 12pm-6pm",
    capacity: 60,
    currentCount: 59,
    acceptsFosters: true,
    isReal: false,
    imageUrl: SITE_PHOTOS.catHand,
    lat: 33.5772,
    lng: -101.8781,
  },
  {
    name: "Llano Estacado Pet Refuge",
    slug: "llano-estacado-pet-refuge",
    description: "Sample listing. Rural refuge that takes in dogs, cats, rabbits, and birds from across Hockley County.",
    address: "800 College Ave, Levelland, TX 79336",
    city: "Levelland, TX",
    phone: "(806) 555-0163",
    email: "info@llanorefuge.example",
    website: null,
    hours: "Wed-Sat 10am-4pm",
    capacity: 55,
    currentCount: 41,
    acceptsFosters: false,
    isReal: false,
    imageUrl: SITE_PHOTOS.heroDogs,
    lat: 33.5862,
    lng: -102.3712,
  },
  {
    name: "Slaton Small Animal Rescue",
    slug: "slaton-small-animal-rescue",
    description: "Sample listing. Specializes in rabbits, guinea pigs, and pet birds that are often turned away by full shelters.",
    address: "150 S 9th St, Slaton, TX 79364",
    city: "Slaton, TX",
    phone: "(806) 555-0174",
    email: "small@slatonrescue.example",
    website: null,
    hours: "Sat-Sun 10am-2pm",
    capacity: 30,
    currentCount: 22,
    acceptsFosters: true,
    isReal: false,
    imageUrl: SITE_PHOTOS.family,
    lat: 33.4382,
    lng: -101.6451,
  },
];

type VetSeed = Omit<typeof s.vets.$inferInsert, "id">;
const VETS: VetSeed[] = [
  {
    name: "PETS Clinic - Lubbock",
    clinic: "PETS Clinic (non-profit)",
    address: "2207 34th St, Lubbock, TX 79411",
    phone: "(806) 507-0836",
    website: "https://www.petsclinic.org/locations/lubbock",
    hours: "Mon 8am-12pm & 4pm-7pm, Tue-Thu 9am-2pm (walk-in wellness)",
    specialties: ["Low-cost spay/neuter", "Vaccines", "Microchips", "TNR for community cats"],
    species: ["dog", "cat"],
    emergency: false,
    acceptsNewPatients: true,
    priceLevel: 1,
    isReal: true,
    lat: 33.5605,
    lng: -101.8693,
  },
  {
    name: "Dr. Laura Chen, DVM",
    clinic: "Caprock Veterinary Hospital",
    address: "5502 82nd St, Lubbock, TX 79424",
    phone: "(806) 555-0110",
    website: null,
    hours: "Mon-Fri 7:30am-6pm, Sat 8am-12pm",
    specialties: ["General practice", "Surgery", "Dentistry"],
    species: ["dog", "cat"],
    emergency: false,
    acceptsNewPatients: true,
    priceLevel: 2,
    isReal: false,
    lat: 33.5179,
    lng: -101.9301,
  },
  {
    name: "South Plains Emergency Animal Hospital",
    clinic: "South Plains Emergency Animal Hospital",
    address: "4910 Slide Rd, Lubbock, TX 79414",
    phone: "(806) 555-0111",
    website: null,
    hours: "Open 24/7, including holidays",
    specialties: ["Emergency", "Critical care", "Toxicology"],
    species: ["dog", "cat", "rabbit", "bird"],
    emergency: true,
    acceptsNewPatients: true,
    priceLevel: 3,
    isReal: false,
    lat: 33.5466,
    lng: -101.9234,
  },
  {
    name: "Dr. Marcus Reed, DVM",
    clinic: "Tech Terrace Animal Clinic",
    address: "2701 23rd St, Lubbock, TX 79410",
    phone: "(806) 555-0112",
    website: null,
    hours: "Mon-Fri 8am-6pm",
    specialties: ["General practice", "Behavior", "Senior pets"],
    species: ["dog", "cat"],
    emergency: false,
    acceptsNewPatients: true,
    priceLevel: 2,
    isReal: false,
    lat: 33.5716,
    lng: -101.8822,
  },
  {
    name: "Dr. Olivia Grant, DVM",
    clinic: "Hub City Exotic & Avian Clinic",
    address: "6610 Indiana Ave, Lubbock, TX 79413",
    phone: "(806) 555-0113",
    website: null,
    hours: "Tue-Sat 9am-5pm",
    specialties: ["Exotics", "Avian medicine", "Rabbit care"],
    species: ["rabbit", "bird"],
    emergency: false,
    acceptsNewPatients: true,
    priceLevel: 2,
    isReal: false,
    lat: 33.5348,
    lng: -101.8742,
  },
  {
    name: "Wolfforth Family Veterinary",
    clinic: "Wolfforth Family Veterinary",
    address: "301 E Hwy 62/82, Wolfforth, TX 79382",
    phone: "(806) 555-0114",
    website: null,
    hours: "Mon-Fri 8am-5:30pm",
    specialties: ["General practice", "Large dogs", "Vaccines"],
    species: ["dog", "cat"],
    emergency: false,
    acceptsNewPatients: false,
    priceLevel: 2,
    isReal: false,
    lat: 33.5052,
    lng: -102.0047,
  },
  {
    name: "Kingsgate Cat Clinic",
    clinic: "Kingsgate Cat Clinic",
    address: "8201 Quaker Ave, Lubbock, TX 79424",
    phone: "(806) 555-0115",
    website: null,
    hours: "Mon-Fri 8am-6pm, Sat 9am-1pm",
    specialties: ["Feline-only", "Fear-free certified", "Dentistry"],
    species: ["cat"],
    emergency: false,
    acceptsNewPatients: true,
    priceLevel: 2,
    isReal: false,
    lat: 33.5175,
    lng: -101.9034,
  },
  {
    name: "Mobile Paws Vet Care",
    clinic: "Mobile Paws (house calls)",
    address: "Serves Lubbock County",
    phone: "(806) 555-0116",
    website: null,
    hours: "Mon-Sat by appointment",
    specialties: ["House calls", "End-of-life care", "Anxious pets"],
    species: ["dog", "cat", "rabbit"],
    emergency: false,
    acceptsNewPatients: true,
    priceLevel: 3,
    isReal: false,
    lat: 33.5779,
    lng: -101.8552,
  },
  {
    name: "Dr. Samuel Ortiz, DVM",
    clinic: "Slaton Animal Hospital",
    address: "605 W Garza St, Slaton, TX 79364",
    phone: "(806) 555-0117",
    website: null,
    hours: "Mon-Fri 8am-5pm",
    specialties: ["General practice", "Farm animals", "Low-cost vaccines"],
    species: ["dog", "cat", "rabbit"],
    emergency: false,
    acceptsNewPatients: true,
    priceLevel: 1,
    isReal: false,
    lat: 33.4376,
    lng: -101.6503,
  },
  {
    name: "Levelland Pet Urgent Care",
    clinic: "Levelland Pet Urgent Care",
    address: "1400 Houston St, Levelland, TX 79336",
    phone: "(806) 555-0118",
    website: null,
    hours: "Daily 8am-10pm",
    specialties: ["Urgent care", "X-ray", "Wound care"],
    species: ["dog", "cat"],
    emergency: true,
    acceptsNewPatients: true,
    priceLevel: 2,
    isReal: false,
    lat: 33.5876,
    lng: -102.3644,
  },
];

type PetRow = [
  name: string,
  species: Species,
  breed: string,
  age: number,
  sex: "male" | "female",
  size: Size,
  energy: Level,
  photoId: string,
  traits: string,
  description: string,
];

// traits flags: k=good with kids, d=good with dogs, c=good with cats, y=needs yard,
// s=some experience, e=experienced, h=house-trained, v=vaccinated, n=spayed/neutered, m=microchipped
const PETS: PetRow[] = [
  ["Biscuit", "dog", "Beagle", 3, "male", "medium", "high", "1543466835-00a7907e9de1", "kdcyhvnm", "A happy-go-lucky beagle who greets everyone with a full-body wiggle. Loves sniff walks, puzzle toys, and napping in sunbeams."],
  ["Mango", "dog", "French Bulldog", 2, "male", "small", "medium", "1583337130417-3346a1be7dee", "kdchvn", "Couch potato with bursts of zoomies. Great apartment dog, snores softly, and loves sweaters in winter."],
  ["Juniper", "dog", "Australian Shepherd mix", 4, "female", "medium", "high", "1587300003388-59208cc962cb", "kdyshvnm", "Brilliant and eager to learn. Needs a job, daily exercise, and a family who loves hiking or agility."],
  ["Pepper", "dog", "Rat Terrier mix", 5, "female", "small", "medium", "1561037404-61cd46aa615b", "dhvn", "Sweet and loyal once she knows you. Prefers a calm home without small children."],
  ["Otis", "dog", "Pug", 9, "male", "small", "low", "1517849845537-4d257902454a", "kdchvnm", "A distinguished senior gentleman who wants a soft bed and a lap. Takes a daily joint supplement."],
  ["Sunny", "dog", "Golden Retriever", 0.3, "female", "medium", "high", "1552053831-71594a27632d", "kdcv", "A 4-month-old ray of sunshine. Learning sit and crate training. Will grow into a large dog."],
  ["Waffles", "dog", "Pembroke Welsh Corgi", 3, "male", "medium", "medium", "1537151608828-ea2b11777ee8", "kdchvnm", "Big personality on short legs. Knows sit, shake, and spin. Loves kids and herding the family cat (gently)."],
  ["Cocoa", "dog", "Labrador Retriever", 6, "female", "large", "medium", "1518717758536-85ae29035b6d", "kdcyhvnm", "Gentle, food-motivated, and great with kids. Her family is moving into housing that doesn't allow large dogs."],
  ["Snowball", "dog", "Maltipoo", 2, "male", "small", "high", "1534361960057-19889db9621e", "kdchvn", "Fluffy ball of energy who never sheds. Needs regular grooming and lots of playtime."],
  ["Rusty", "dog", "Vizsla mix", 4, "male", "large", "high", "1530281700549-e82e7bf110d6", "dyehvnm", "Athletic running buddy who loves water. Needs an experienced owner and a fenced yard."],
  ["Rosie", "dog", "Cavalier King Charles Spaniel", 0.5, "female", "small", "medium", "1560807707-8cc77767d783", "kdcv", "Affectionate puppy who wants to be wherever you are. Doing great with potty training."],
  ["Domino", "dog", "Pointer mix", 3, "male", "medium", "high", "1477884213360-7e9d7dcc1e48", "kdyshvn", "Playful and goofy. Best with an active family and another dog to play with."],
  ["Peanut", "dog", "Yorkshire Terrier", 0.4, "male", "small", "medium", "1546527868-ccb7ee7dfa6a", "dcv", "Tiny but brave. Best with older kids who can be gentle with a small puppy."],
  ["Honey", "dog", "Golden Retriever", 8, "female", "large", "low", "1558788353-f76d92427f16", "kdchvnm", "Calm, loving senior who adores people. Her owner passed away and she is looking for a quiet retirement home."],
  ["Ziggy", "dog", "Pomeranian", 2, "male", "small", "medium", "1505628346881-b72b27e84530", "dchvn", "A fashionable little guy with a big voice. Would love a home where someone is around most of the day."],
  ["Noodle", "dog", "Cocker Spaniel mix", 1, "female", "medium", "high", "1588943211346-0908a1fb0b01", "kdcyhv", "Bouncy young pup who loves fetch and rolling in the grass."],
  ["Luna", "dog", "Samoyed", 3, "female", "large", "high", "1596492784531-6e6eb5ea9993", "kdyehvnm", "The smiliest dog you'll meet. Heavy shedder, needs an experienced owner, lots of exercise, and brushing."],
  ["Bruno", "dog", "French Bulldog", 5, "male", "small", "low", "1583511655857-d19b40a7a54e", "kchvn", "Laid-back and loves car rides. Best as the only dog in the home."],
  ["Teddy", "dog", "Goldendoodle", 1.5, "male", "medium", "high", "1544568100-847a948585b9", "kdchvnm", "Low-shedding and very cuddly. Our new work schedule means Teddy is alone too much, so we're finding him a better fit."],
  ["Maple", "dog", "Golden Retriever", 0.25, "female", "medium", "high", "1576201836106-db1758fd1c97", "kdcv", "A 3-month-old puppy from an unexpected litter. Healthy, playful, and ready for puppy classes."],
  ["Oreo", "cat", "Domestic Shorthair (tuxedo)", 2, "male", "medium", "medium", "1514888286974-6c03e2ca1dba", "kdchvnm", "Chatty tuxedo who follows you room to room. Gets along with dogs and other cats."],
  ["Tiger", "cat", "Domestic Shorthair (tabby)", 3, "male", "medium", "medium", "1574158622682-e40e69881006", "kchvn", "Confident and curious. Loves window perches and wand toys."],
  ["Willow", "cat", "Domestic Shorthair (tabby)", 5, "female", "medium", "low", "1495360010541-f48722b34f7d", "chvn", "Shy at first but very loving. Prefers a quiet adult home."],
  ["Smokey", "cat", "British Shorthair", 6, "male", "medium", "low", "1533738363-b7f9aef128ce", "kdchvnm", "Plush, calm, and unbothered. The perfect roommate for a busy professional."],
  ["Leo", "cat", "Maine Coon", 4, "male", "large", "medium", "1573865526739-10659fec78a5", "kdchvnm", "A gentle giant with a magnificent mane. Loves to be brushed and plays fetch."],
  ["Peaches", "cat", "Domestic Longhair", 0.3, "female", "small", "high", "1592194996308-7b43878e84a6", "kdcv", "A curious kitten who climbs everything. Would love a kitten-proofed home and a playmate."],
  ["Duchess", "cat", "Persian", 10, "female", "medium", "low", "1513245543132-31f507417b26", "hvn", "A regal senior lady who needs daily brushing and a calm, adult-only home."],
  ["Bandit", "cat", "Domestic Shorthair", 1, "male", "medium", "high", "1543852786-1cf6624b9987", "kdchvn", "Playful young cat who wears his bandana with pride. Great with respectful kids."],
  ["Calypso", "cat", "Calico", 3, "female", "small", "medium", "1526336024174-e58f5cdd8e13", "kchvnm", "Sassy and sweet. Loves chasing feather toys and bugs in the garden."],
  ["Milo", "cat", "Domestic Shorthair (tabby)", 7, "male", "medium", "low", "1518791841217-8f162f1e1131", "kdchvnm", "Laid-back lap cat who has lived with dogs his whole life."],
  ["Ginger", "cat", "Domestic Shorthair (orange)", 2, "female", "medium", "medium", "1596854407944-bf87f6fdd49e", "kchvn", "A rare orange girl! Affectionate, playful, and food-motivated."],
  ["Pixel", "cat", "Domestic Shorthair (tabby)", 0.4, "male", "small", "high", "1529778873920-4da4926a72c2", "kdcv", "Tiny tabby kitten with huge eyes. Litter-trained and loves crinkle balls."],
  ["Marmalade", "cat", "Domestic Shorthair (orange)", 4, "male", "large", "medium", "1571566882372-1598d88abd90", "kdchvnm", "Stretchy, silly, and always ready for a chin scratch."],
  ["Shadow", "cat", "Domestic Shorthair (brown tabby)", 9, "male", "medium", "low", "1478098711619-5ab0b478d6e6", "chvn", "A wise old soul. Needs a special diet for his kidneys, which his owner will share with adopters."],
  ["Clover", "rabbit", "Netherland Dwarf", 1, "female", "small", "low", "1585110396000-c9ffd4e4b308", "khvn", "Petite and gentle. Litter-trained and loves fresh herbs."],
  ["Thumper", "rabbit", "Mixed breed", 2, "male", "medium", "medium", "1535241749838-299277b6305f", "khvn", "Loves to binky around the living room. Needs a bunny-proofed space to roam."],
  ["Hazel", "rabbit", "Holland Lop", 3, "female", "small", "low", "1452857297128-d9c29adba80b", "khvn", "Floppy-eared sweetheart who enjoys gentle pets and timothy hay."],
  ["Pearl", "rabbit", "Lionhead mix", 1, "female", "small", "medium", "1559214369-a6b1d7919865", "shvn", "Curious and independent. Best with an owner who has had rabbits before."],
  ["Biscotti", "rabbit", "Mini Lop", 0.5, "male", "small", "medium", "1591382386627-349b692688ff", "kv", "Young bun who is still learning to use the litter box. Very cuddly."],
  ["Kiwi", "bird", "Indian Ringneck Parakeet", 4, "male", "small", "medium", "1552728089-57bdde30beb3", "sv", "Talks up a storm and whistles the Texas Tech fight song. Needs daily out-of-cage time."],
  ["Ruby", "bird", "Scarlet Macaw", 15, "female", "large", "high", "1544923408-75c5cef46f14", "ev", "Stunning and smart. Macaws live 50+ years and need an experienced, committed caretaker."],
  ["Sky", "bird", "Blue-and-gold Macaw", 10, "male", "large", "high", "1612024782955-49fae79e42bb", "ev", "Social and loud in the best way. Comes with his large cage and play stand."],
];

const REHOME_REASONS = [
  "We're moving into military housing that doesn't allow pets of this size.",
  "A new family member has severe allergies.",
  "Our landlord changed the pet policy and we must rehome within 60 days.",
  "Her owner passed away and family members can't take her in.",
  "Our new work schedules mean he's alone 10+ hours a day.",
  "We had an unexpected litter and are finding each puppy a great home.",
  "I'm deploying overseas for a year.",
  "Our older dog doesn't get along with him, and we want both to be safe and happy.",
];

type ProductSeed = Omit<typeof s.products.$inferInsert, "id">;
const PRODUCTS: ProductSeed[] = [
  { category: "insurance", name: "Accident & Illness Plan", provider: "PawShield Insurance", description: "Covers emergencies, surgeries, cancer, and chronic conditions. 90% reimbursement, $250 deductible.", priceCents: 3200, salePct: 10, unit: "per month", species: ["dog", "cat"], tags: ["Most popular", "90% reimbursement"], featured: true },
  { category: "insurance", name: "Accident-Only Basic", provider: "Lone Star Pet Protect", description: "Affordable coverage for injuries like broken bones, bite wounds, and swallowed objects.", priceCents: 1200, unit: "per month", species: ["dog", "cat"], tags: ["Budget"] },
  { category: "insurance", name: "Wellness Add-On", provider: "PawShield Insurance", description: "Reimburses routine care: annual exams, vaccines, dental cleanings, and flea/heartworm prevention.", priceCents: 1800, salePct: 20, unit: "per month", species: ["dog", "cat"], tags: ["Routine care"] },
  { category: "insurance", name: "Senior Pet Care Plus", provider: "Golden Years Pet Health", description: "Designed for pets 8+. Includes arthritis, kidney disease, and senior bloodwork coverage.", priceCents: 4900, unit: "per month", species: ["dog", "cat"], tags: ["Seniors"] },
  { category: "insurance", name: "Exotic Companion Cover", provider: "Feather & Fur Mutual", description: "Accident and illness coverage for rabbits and birds, including avian vet visits.", priceCents: 1500, unit: "per month", species: ["rabbit", "bird"], tags: ["Exotics"] },
  { category: "insurance", name: "New Adopter 60-Day Starter", provider: "Lone Star Pet Protect", description: "Free-feeling first step: low-cost coverage for your first 60 days home, then cancel or upgrade.", priceCents: 900, unit: "per month", species: ["dog", "cat", "rabbit"], tags: ["New adopters"], featured: true },
  { category: "food", name: "Prairie Harvest Adult Dog Kibble, 30 lb", provider: "Prairie Harvest", description: "Chicken and brown rice recipe with glucosamine. Made in Texas.", priceCents: 5499, salePct: 15, unit: "bag", species: ["dog"], tags: ["Best seller"], featured: true },
  { category: "food", name: "Puppy Growth Formula, 15 lb", provider: "Prairie Harvest", description: "DHA for brain development and calcium for strong bones.", priceCents: 3899, unit: "bag", species: ["dog"], tags: ["Puppy"] },
  { category: "food", name: "Senior Joint Support Dog Food, 24 lb", provider: "Golden Bowl", description: "Lower calorie with omega-3s and green-lipped mussel for aging joints.", priceCents: 5299, unit: "bag", species: ["dog"], tags: ["Senior"] },
  { category: "food", name: "Grain-Free Salmon Cat Food, 12 lb", provider: "Whisker Kitchen", description: "Wild-caught salmon as the first ingredient. Supports skin and coat.", priceCents: 3499, unit: "bag", species: ["cat"], tags: ["Grain-free"] },
  { category: "food", name: "Kitten Pate Variety Pack, 24 cans", provider: "Whisker Kitchen", description: "High-protein wet food made for growing kittens.", priceCents: 2799, salePct: 10, unit: "case", species: ["cat"], tags: ["Kitten"] },
  { category: "food", name: "Timothy Hay, 5 lb", provider: "Meadow Bunny", description: "Second-cut, hand-sorted hay. Should make up 80% of a rabbit's diet.", priceCents: 1899, salePct: 15, unit: "box", species: ["rabbit"], tags: ["Essential"] },
  { category: "food", name: "Adult Rabbit Pellets, 10 lb", provider: "Meadow Bunny", description: "Timothy-based pellets with no added sugar or seeds.", priceCents: 2299, unit: "bag", species: ["rabbit"], tags: [] },
  { category: "food", name: "Parrot Pellet & Fruit Blend, 4 lb", provider: "Tropic Wing", description: "Balanced nutrition for medium and large parrots.", priceCents: 2699, unit: "bag", species: ["bird"], tags: [] },
  { category: "food", name: "Freeze-Dried Training Treats", provider: "Good Pup Co.", description: "Single-ingredient chicken liver bites, perfect for training.", priceCents: 1299, salePct: 25, unit: "pouch", species: ["dog", "cat"], tags: ["Training"] },
  { category: "clinic", name: "Wellness Exam (walk-in)", provider: "PETS Clinic - Lubbock", description: "Low-cost wellness exam at the non-profit PETS Clinic. Price shown is a simulated booking deposit.", priceCents: 2500, unit: "visit", species: ["dog", "cat"], tags: ["Non-profit", "Low cost"], address: "2207 34th St, Lubbock, TX 79411", phone: "(806) 507-0836", featured: true },
  { category: "clinic", name: "Core Vaccine Package", provider: "Caprock Veterinary Hospital", description: "Rabies, DHPP or FVRCP, plus a nose-to-tail exam.", priceCents: 6500, unit: "visit", species: ["dog", "cat"], tags: ["Vaccines"], address: "5502 82nd St, Lubbock, TX 79424", phone: "(806) 555-0110" },
  { category: "clinic", name: "Microchip + Registration", provider: "Tech Terrace Animal Clinic", description: "Lifetime registration included. Takes 5 minutes, no anesthesia needed.", priceCents: 3500, unit: "visit", species: ["dog", "cat", "rabbit"], tags: ["Safety"], address: "2701 23rd St, Lubbock, TX 79410", phone: "(806) 555-0112" },
  { category: "clinic", name: "Dental Cleaning", provider: "Caprock Veterinary Hospital", description: "Anesthetic cleaning with full-mouth X-rays and polishing.", priceCents: 18900, unit: "procedure", species: ["dog", "cat"], tags: [], address: "5502 82nd St, Lubbock, TX 79424", phone: "(806) 555-0110" },
  { category: "clinic", name: "Senior Bloodwork Panel", provider: "Tech Terrace Animal Clinic", description: "CBC, chemistry, and thyroid screening for pets 7+.", priceCents: 12000, unit: "visit", species: ["dog", "cat"], tags: ["Senior"], address: "2701 23rd St, Lubbock, TX 79410", phone: "(806) 555-0112" },
  { category: "clinic", name: "Exotic Pet Checkup", provider: "Hub City Exotic & Avian Clinic", description: "Exam for rabbits and birds, including nail and beak trims.", priceCents: 5500, unit: "visit", species: ["rabbit", "bird"], tags: ["Exotics"], address: "6610 Indiana Ave, Lubbock, TX 79413", phone: "(806) 555-0113" },
  { category: "clinic", name: "Video Telehealth Consult", provider: "Mobile Paws Vet Care", description: "15-minute video call with a licensed vet for non-emergency questions.", priceCents: 2900, unit: "call", species: ["dog", "cat", "rabbit", "bird"], tags: ["Online"] },
  { category: "groomer", name: "Full Groom - Small Dog", provider: "Hub City Pet Spa", description: "Bath, haircut, nail trim, ear cleaning, and a bandana.", priceCents: 5500, salePct: 10, unit: "appointment", species: ["dog"], tags: ["Popular"], address: "4414 82nd St, Lubbock, TX 79424", phone: "(806) 555-0120", featured: true },
  { category: "groomer", name: "Full Groom - Large Dog", provider: "Hub City Pet Spa", description: "Everything in the full groom, sized for dogs over 50 lb.", priceCents: 8500, unit: "appointment", species: ["dog"], tags: [], address: "4414 82nd St, Lubbock, TX 79424", phone: "(806) 555-0120" },
  { category: "groomer", name: "Bath & Brush", provider: "Caprock Clippers", description: "Hydrating bath, blow-dry, and brush-out. No haircut.", priceCents: 3500, salePct: 20, unit: "appointment", species: ["dog", "cat"], tags: ["Quick"], address: "1500 Broadway, Lubbock, TX 79401", phone: "(806) 555-0121" },
  { category: "groomer", name: "Nail Trim", provider: "Caprock Clippers", description: "Walk-in nail trim and file for dogs, cats, and rabbits.", priceCents: 1500, salePct: 15, unit: "visit", species: ["dog", "cat", "rabbit"], tags: ["Walk-in"], address: "1500 Broadway, Lubbock, TX 79401", phone: "(806) 555-0121" },
  { category: "groomer", name: "Cat Lion Cut", provider: "Hub City Pet Spa", description: "Gentle shave for long-haired cats with matting. Fear-free handling.", priceCents: 7500, unit: "appointment", species: ["cat"], tags: [], address: "4414 82nd St, Lubbock, TX 79424", phone: "(806) 555-0120" },
  { category: "groomer", name: "Mobile Grooming Visit", provider: "Suds on Wheels", description: "A full groom in our van, parked in your driveway. Great for anxious pets.", priceCents: 9500, unit: "visit", species: ["dog", "cat"], tags: ["Comes to you"] },
  { category: "groomer", name: "De-Shedding Treatment", provider: "Suds on Wheels", description: "Undercoat removal for double-coated breeds like huskies and Samoyeds.", priceCents: 4500, unit: "add-on", species: ["dog"], tags: [] },
  { category: "medicine", name: "Monthly Heartworm Preventive (6 doses)", provider: "VetDirect Pharmacy", description: "Chewable heartworm prevention. Simulated purchase; real prescriptions require vet approval.", priceCents: 5999, salePct: 15, unit: "6-pack", species: ["dog"], tags: ["Rx (simulated)"], featured: true },
  { category: "medicine", name: "Flea & Tick Chewable (3 months)", provider: "VetDirect Pharmacy", description: "Kills fleas and ticks for 12 weeks. Weight-based dosing.", priceCents: 4999, unit: "3-pack", species: ["dog"], tags: ["Rx (simulated)"] },
  { category: "medicine", name: "Feline Flea Topical (6 months)", provider: "VetDirect Pharmacy", description: "Monthly topical for cats over 8 weeks old.", priceCents: 4499, unit: "6-pack", species: ["cat"], tags: [] },
  { category: "medicine", name: "Hip & Joint Supplement Chews", provider: "Good Pup Co.", description: "Glucosamine, chondroitin, and MSM for mobility.", priceCents: 2799, unit: "90 chews", species: ["dog"], tags: ["Senior"] },
  { category: "medicine", name: "Probiotic Powder", provider: "Good Pup Co.", description: "Supports digestion during food transitions and stressful moves to a new home.", priceCents: 2199, salePct: 10, unit: "30 scoops", species: ["dog", "cat"], tags: ["New home"] },
  { category: "medicine", name: "Calming Chews", provider: "Whisker Kitchen", description: "L-theanine and chamomile for car rides, fireworks, and adoption day jitters.", priceCents: 1899, unit: "60 chews", species: ["dog", "cat"], tags: [] },
  { category: "medicine", name: "Ear Cleaning Solution", provider: "VetDirect Pharmacy", description: "Gentle, vet-formulated cleanser for floppy-eared breeds.", priceCents: 1299, unit: "8 oz", species: ["dog", "cat"], tags: [] },
  { category: "medicine", name: "Critical Care Recovery Food", provider: "Meadow Bunny", description: "Syringe-feedable formula for rabbits recovering from illness.", priceCents: 2499, unit: "box", species: ["rabbit"], tags: ["Exotics"] },
];

const VET_REVIEWS: [vetIndex: number, rating: number, body: string][] = [
  [0, 5, "Affordable and kind. They spayed our rescue for a fraction of the usual cost."],
  [0, 4, "Walk-in wellness was quick. Arrive early because the line gets long."],
  [1, 5, "Dr. Chen caught a dental issue our old vet missed. Highly recommend."],
  [1, 4, "Great surgeons, a bit pricey for routine care."],
  [2, 5, "Saved our dog after he ate grapes at 2am. Compassionate staff."],
  [2, 4, "Expensive, but they were honest about every option."],
  [3, 5, "Dr. Reed is amazing with anxious dogs."],
  [4, 5, "Finally a vet who actually knows rabbits!"],
  [4, 5, "Our macaw loves Dr. Grant. Very thorough."],
  [5, 3, "Good care but not accepting new patients right now."],
  [6, 5, "Cats-only waiting room makes such a difference."],
  [7, 5, "House calls for our senior cat were a blessing."],
  [8, 4, "Small-town feel, fair prices."],
  [9, 4, "Saw us on a Sunday evening. Glad they exist."],
];

const SALE_BY_NAME: Record<string, number> = {
  "Accident & Illness Plan": 10,
  "Wellness Add-On": 20,
  "Prairie Harvest Adult Dog Kibble, 30 lb": 15,
  "Kitten Pate Variety Pack, 24 cans": 10,
  "Timothy Hay, 5 lb": 15,
  "Freeze-Dried Training Treats": 25,
  "Full Groom - Small Dog": 10,
  "Bath & Brush": 20,
  "Nail Trim": 15,
  "Monthly Heartworm Preventive (6 doses)": 15,
  "Probiotic Powder": 10,
};

export async function ensureCatalogDeals(db: DB) {
  for (const [name, salePct] of Object.entries(SALE_BY_NAME)) {
    await db.update(s.products).set({ salePct }).where(sql`${s.products.name} = ${name}`);
  }
}

export async function seed(db: DB, { reset = false } = {}) {
  if (reset) {
    await db.execute(sql`TRUNCATE TABLE
      messages, conversations, health_records, reviews, event_rsvps, events, foster_applications,
      lost_found, order_items, orders, cart_items, appointments, applications, favorites, pet_reactions,
      pets, products, vets, shelters, adopter_profiles, users RESTART IDENTITY CASCADE`);
  } else {
    const existing = await db.select({ id: s.users.id }).from(s.users).limit(1);
    if (existing.length) {
      await ensureCatalogDeals(db);
      return;
    }
  }

  const passwordHash = bcrypt.hashSync(DEMO_PASSWORD, 10);

  const [demo] = await db
    .insert(s.users)
    .values({
      email: DEMO_EMAIL,
      passwordHash,
      name: "Alex Rivera",
      city: "Lubbock, TX",
      bio: "Texas Tech staff member with a fenced backyard, looking for an active companion.",
      phone: "(806) 555-0100",
      verified: true,
    })
    .returning();

  const owners = await db
    .insert(s.users)
    .values(
      OWNERS.map((o, i) => ({
        email: `${o.name.split(" ")[0].toLowerCase()}@pawsconnect.org`,
        passwordHash,
        name: o.name,
        city: o.city,
        bio: o.bio,
        verified: o.verified,
        phone: `(806) 555-02${String(i + 10).padStart(2, "0")}`,
      })),
    )
    .returning();

  await db.insert(s.adopterProfiles).values({
    userId: demo.id,
    homeType: "house",
    hasYard: true,
    hasKids: false,
    hasDogs: false,
    hasCats: true,
    experience: "some",
    activityLevel: "high",
    hoursAlone: 5,
    species: ["dog", "cat"],
    sizes: ["medium", "large"],
    ages: ["young", "adult"],
    budgetMonthly: 150,
    maxDistance: 40,
    lat: 33.5779,
    lng: -101.8552,
    notes: "I run three mornings a week and would love a jogging partner.",
  });

  const shelters = await db.insert(s.shelters).values(SHELTERS).returning();
  const vets = await db.insert(s.vets).values(VETS).returning();

  const ownerFor = (i: number) => owners[i % owners.length];
  const petValues = PETS.map(([name, species, breed, age, sex, size, energy, photoId, traits, description], i) => {
    const t = (c: string) => traits.includes(c);
    // Every other pet is rehomed directly by an owner; the rest are listed by shelters.
    const byOwner = i % 2 === 0 || name === "Cocoa" || name === "Honey";
    const isDemoPet = name === "Teddy";
    const owner = isDemoPet ? demo : byOwner ? ownerFor(i) : null;
    const shelter = owner ? null : shelters.filter((sh) => species === "dog" || sh.slug !== "caprock-canine-rescue")[i % 6];
    const city = owner ? owner.city : shelter!.city;
    const [lat, lng] = shelter && !owner ? [shelter.lat, shelter.lng] : jitter(city in CITIES ? city : "Lubbock, TX", i);
    return {
      name,
      species,
      breed,
      ageYears: age,
      ageGroup: ageGroup(species, age),
      sex,
      size,
      energy,
      goodWithKids: t("k"),
      goodWithDogs: t("d"),
      goodWithCats: t("c"),
      needsYard: t("y"),
      experienceNeeded: (t("e") ? "experienced" : t("s") ? "some" : "first-time") as Experience,
      houseTrained: t("h"),
      vaccinated: t("v"),
      spayedNeutered: t("n"),
      microchipped: t("m"),
      monthlyCost: monthlyCost(species, size),
      adoptionFee: owner ? 0 : species === "dog" ? 75 : species === "cat" ? 40 : 25,
      description,
      rehomeReason: owner ? (name === "Teddy" ? REHOME_REASONS[4] : REHOME_REASONS[i % REHOME_REASONS.length]) : null,
      photos: [photo(photoId)],
      status: (name === "Bruno" ? "pending" : name === "Duchess" ? "adopted" : "available") as s.PetStatus,
      ownerId: owner?.id ?? null,
      shelterId: shelter?.id ?? null,
      city,
      lat,
      lng,
      createdAt: daysAgo((i * 3) % 40),
    };
  });
  const pets = await db.insert(s.pets).values(petValues).returning();
  const pet = (name: string) => pets.find((p) => p.name === name)!;

  await db.insert(s.products).values(PRODUCTS);
  const products = await db.select().from(s.products);

  await db.insert(s.reviews).values([
    ...VET_REVIEWS.map(([vi, rating, body], i) => ({
      targetType: "vet" as const,
      targetId: vets[vi].id,
      userId: owners[i % owners.length].id,
      rating,
      body,
      createdAt: daysAgo(5 + i * 4),
    })),
    ...products.slice(0, 16).map((p, i) => ({
      targetType: "product" as const,
      targetId: p.id,
      userId: owners[(i + 3) % owners.length].id,
      rating: 4 + (i % 2),
      body: ["Exactly what we needed.", "Great value and fast service.", "My pet loves it!", "Would buy again."][i % 4],
      createdAt: daysAgo(3 + i),
    })),
  ]);

  const cocoa = pet("Cocoa");
  const teddy = pet("Teddy");
  await db.insert(s.applications).values([
    {
      petId: cocoa.id,
      applicantId: demo.id,
      message: "I have a fenced yard and run three mornings a week. Cocoa sounds like a perfect fit!",
      kind: "long-term",
      status: "screening",
      matchScore: 88,
      createdAt: new Date(Date.now() - 20 * 60_000),
    },
    {
      petId: teddy.id,
      applicantId: owners[8].id,
      message: "Our kids are 8 and 11 and we've been looking for a low-shedding dog. We'd love to meet Teddy.",
      kind: "short-term",
      duration: "1–3 months",
      status: "submitted",
      matchScore: 91,
      createdAt: daysAgo(1),
    },
    {
      petId: pet("Bruno").id,
      applicantId: owners[9].id,
      message: "I work from home and Bruno would be my only dog.",
      kind: "emergency",
      duration: "A few weeks",
      status: "approved",
      matchScore: 84,
      decidedAt: daysAgo(2),
      decisionNote: "Home check complete. Meet-and-greet went great!",
      createdAt: daysAgo(6),
    },
  ]);

  await db.insert(s.favorites).values(
    ["Biscuit", "Juniper", "Leo"].map((n) => ({ userId: demo.id, petId: pet(n).id })),
  );

  const cocoaOwner = owners.find((o) => o.id === cocoa.ownerId)!;
  const [convo] = await db
    .insert(s.conversations)
    .values({ petId: cocoa.id, userAId: demo.id, userBId: cocoaOwner.id, lastMessageAt: daysAgo(0) })
    .returning();
  await db.insert(s.messages).values([
    { conversationId: convo.id, senderId: demo.id, body: "Hi! I just applied for Cocoa. Is she okay with cats? I have one calm adult cat.", createdAt: new Date(Date.now() - 50 * 60_000), readAt: new Date() },
    { conversationId: convo.id, senderId: cocoaOwner.id, body: "Hi Alex! Yes, she lived with two cats at my sister's place and ignored them completely.", createdAt: new Date(Date.now() - 40 * 60_000), readAt: new Date() },
    { conversationId: convo.id, senderId: cocoaOwner.id, body: "Would you be free for a meet-and-greet at Mae Simmons Park this weekend?", createdAt: new Date(Date.now() - 38 * 60_000) },
  ]);

  const food = products.find((p) => p.category === "food")!;
  const groom = products.find((p) => p.category === "groomer")!;
  const subtotal = food.priceCents + groom.priceCents;
  const tax = Math.round(subtotal * 0.0825);
  const [order] = await db
    .insert(s.orders)
    .values({
      userId: demo.id,
      subtotalCents: subtotal,
      taxCents: tax,
      totalCents: subtotal + tax,
      cardBrand: "Visa",
      cardLast4: "4242",
      billingName: "Alex Rivera",
      billingZip: "79409",
      confirmation: "PC-DEMO01",
      createdAt: daysAgo(12),
    })
    .returning();
  await db.insert(s.orderItems).values([
    { orderId: order.id, productId: food.id, name: food.name, unit: food.unit, priceCents: food.priceCents, quantity: 1 },
    { orderId: order.id, productId: groom.id, name: groom.name, unit: groom.unit, priceCents: groom.priceCents, quantity: 1 },
  ]);

  const las = shelters[0];
  const haven = shelters[1];
  await db.insert(s.events).values([
    { title: "Fall Adoption Event", kind: "adoption", description: "Meet dozens of adoptable dogs and cats from local shelters. Reduced adoption fees all day.", startsAt: daysFromNow(4, 10), endsAt: daysFromNow(4, 16), location: "Lubbock Animal Services", address: las.address, shelterId: las.id },
    { title: "Low-Cost Vaccine & Microchip Clinic", kind: "clinic", description: "Rabies vaccines, DHPP/FVRCP, and microchips at reduced prices. First come, first served.", startsAt: daysFromNow(9, 9), endsAt: daysFromNow(9, 13), location: "PETS Clinic - Lubbock", address: "2207 34th St, Lubbock, TX 79411", shelterId: null },
    { title: "Foster Orientation Night", kind: "training", description: "Learn how short-term fostering frees up shelter space and saves lives. Supplies provided.", startsAt: daysFromNow(12, 18), endsAt: daysFromNow(12, 20), location: "The Haven ACS", address: haven.address, shelterId: haven.id },
    { title: "Paws on the Plaza Fundraiser", kind: "fundraiser", description: "Food trucks, live music, and a dog costume contest benefiting South Plains rescues.", startsAt: daysFromNow(18, 11), endsAt: daysFromNow(18, 17), location: "Texas Tech University, Memorial Circle", address: "2500 Broadway, Lubbock, TX 79409", shelterId: null },
    { title: "Kitten Season Adoption Day", kind: "adoption", description: "Adopt a kitten (or two!) with free first-vet-visit vouchers.", startsAt: daysFromNow(23, 12), endsAt: daysFromNow(23, 17), location: "Hub City Cat Haven", address: shelters[4].address, shelterId: shelters[4].id },
    { title: "New Owner Training Basics", kind: "training", description: "A free class on crate training, leash manners, and settling a new pet into your home.", startsAt: daysFromNow(30, 18), endsAt: daysFromNow(30, 19), location: "Caprock Canine Rescue", address: shelters[3].address, shelterId: shelters[3].id },
  ]);

  await db.insert(s.lostFound).values([
    { kind: "lost", species: "dog", petName: "Buster", description: "Brown and white boxer mix, red collar, very friendly. Microchipped.", lastSeenLocation: "Near 50th St & Indiana Ave", lastSeenAt: daysAgo(1), contactName: "Lena P.", contactPhone: "(806) 555-0301" },
    { kind: "found", species: "cat", petName: null, description: "Gray tabby with white paws, no collar, found hiding under a car. Safe indoors with me.", photoUrl: SITE_PHOTOS.catHand, lastSeenLocation: "Overton Park, Lubbock", lastSeenAt: daysAgo(2), contactName: "Chris D.", contactPhone: "(806) 555-0302" },
    { kind: "lost", species: "bird", petName: "Mango", description: "Green cockatiel with orange cheeks. Escaped through an open door. Whistles 'Mary Had a Little Lamb'.", lastSeenLocation: "Tech Terrace neighborhood", lastSeenAt: daysAgo(3), contactName: "Jordan S.", contactPhone: "(806) 555-0303" },
    { kind: "found", species: "dog", petName: null, description: "Small black terrier mix, blue harness, no tags. Scanned at vet: no microchip.", lastSeenLocation: "Wolfforth, near Frenship HS", lastSeenAt: daysAgo(1), contactName: "Amanda R.", contactPhone: "(806) 555-0304" },
    { kind: "lost", species: "cat", petName: "Nala", description: "Orange female cat, indoor-only, very shy. Reward offered.", lastSeenLocation: "Kingsgate area, 82nd St", lastSeenAt: daysAgo(5), contactName: "Kevin M.", contactPhone: "(806) 555-0305", resolved: true },
  ]);

  await db.insert(s.healthRecords).values([
    { petId: cocoa.id, kind: "vaccine", title: "Rabies (3-year)", date: daysAgo(200), nextDue: daysFromNow(895) },
    { petId: cocoa.id, kind: "vaccine", title: "DHPP booster", date: daysAgo(200), nextDue: daysFromNow(165) },
    { petId: cocoa.id, kind: "checkup", title: "Annual wellness exam", date: daysAgo(200), notes: "Healthy weight, mild tartar." },
    { petId: cocoa.id, kind: "procedure", title: "Spay surgery", date: daysAgo(1800) },
    { petId: teddy.id, kind: "vaccine", title: "Rabies (1-year)", date: daysAgo(90), nextDue: daysFromNow(275) },
    { petId: teddy.id, kind: "medication", title: "Monthly heartworm preventive", date: daysAgo(10), nextDue: daysFromNow(20) },
    { petId: pet("Otis").id, kind: "medication", title: "Joint supplement (daily)", date: daysAgo(30), notes: "Glucosamine chew with breakfast." },
    { petId: pet("Shadow").id, kind: "checkup", title: "Kidney panel", date: daysAgo(45), notes: "Stage 1 CKD. Renal diet recommended.", nextDue: daysFromNow(135) },
    { petId: pet("Honey").id, kind: "vaccine", title: "Rabies (3-year)", date: daysAgo(400), nextDue: daysFromNow(695) },
  ]);

  await db.insert(s.appointments).values({
    petId: cocoa.id,
    requesterId: demo.id,
    kind: "meet-greet",
    scheduledAt: daysFromNow(3, 10),
    notes: "Mae Simmons Park if the weather is good.",
    status: "confirmed",
  });

  await ensureCatalogDeals(db);
}
