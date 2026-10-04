import type { AgeGroup, Level, Size, Species } from "./db/schema";

export type CareTip = { title: string; body: string };
export type CareGuideLink = { slug: string; title: string };

export type PetCareGuide = {
  headline: string;
  summary: string;
  tips: CareTip[];
  guides: CareGuideLink[];
};

type PetCareInput = {
  name: string;
  breed: string;
  species: Species;
  size: Size;
  energy: Level;
  ageGroup: AgeGroup;
  needsYard: boolean;
  goodWithKids: boolean;
};

type BreedProfile = {
  match: RegExp;
  species?: Species;
  title: string;
  tips: CareTip[];
  guides?: CareGuideLink[];
};

const BREEDS: BreedProfile[] = [
  {
    match: /beagle/i,
    species: "dog",
    title: "Beagle",
    tips: [
      { title: "Scent work every day", body: "Beagles are nose-first. Hide treats, rotate sniff walks, and use a long line in open spaces so they can explore safely." },
      { title: "Watch the waistline", body: "This breed begs well. Measure meals and skip table scraps; extra weight stresses their long backs." },
      { title: "Secure fences and IDs", body: "A beagle who catches a scent will follow it. Microchip, collar tags, and a locked gate are not optional." },
    ],
    guides: [{ slug: "bringing-home-a-dog", title: "Bringing home a new dog" }],
  },
  {
    match: /french\s*bull|frenchie/i,
    species: "dog",
    title: "French Bulldog",
    tips: [
      { title: "Keep them cool", body: "Flat faces overheat fast in West Texas sun. Walk at dawn or dusk and never leave them in a parked car." },
      { title: "Watch breathing", body: "Snoring is common; gasping, blue gums, or collapse is an emergency. Use a harness instead of a collar." },
      { title: "Skip the water bowl dive", body: "Many Frenchies do poorly as swimmers. Supervise around pools." },
    ],
    guides: [{ slug: "west-texas-weather-safety", title: "West Texas weather safety" }],
  },
  {
    match: /australian\s*shepherd|aussie/i,
    species: "dog",
    title: "Australian Shepherd",
    tips: [
      { title: "Give them a job", body: "Herding breeds need a task: agility, trick training, or a long hike. A tired Aussie is a polite housemate." },
      { title: "Mental work counts", body: "Puzzle feeders and short training sessions prevent backyard boredom barking." },
      { title: "Watch herding nips", body: "Redirect circling kids or other pets into a toy or a trained 'place' cue." },
    ],
    guides: [{ slug: "active-dog-care", title: "Caring for an active dog" }],
  },
  {
    match: /retriever|golden|labrador|lab\b/i,
    species: "dog",
    title: "Retriever",
    tips: [
      { title: "Joints and growth", body: "Keep puppies on puppy food and skip forced long runs until growth plates close around 12–18 months." },
      { title: "Ear care", body: "Floppy ears trap moisture. Wipe weekly and dry after swims or baths." },
      { title: "They eat anything", body: "Use a slow feeder and keep trash, socks, and grapes out of reach." },
    ],
    guides: [{ slug: "bringing-home-a-dog", title: "Bringing home a new dog" }],
  },
  {
    match: /corgi/i,
    species: "dog",
    title: "Corgi",
    tips: [
      { title: "Protect the back", body: "Use ramps for couches and cars. Avoid repeated jumping off furniture." },
      { title: "Keep them lean", body: "A heavy corgi is a sore corgi. Measure kibble and add walks, not extra treats." },
      { title: "Channel the herding", body: "Teach a solid leave-it so they do not herd ankles or children." },
    ],
  },
  {
    match: /pug/i,
    species: "dog",
    title: "Pug",
    tips: [
      { title: "Air conditioning is care", body: "Pugs overheat quickly. Keep walks short in summer and offer water often." },
      { title: "Clean the face folds", body: "Wipe wrinkles daily so moisture does not turn into a skin infection." },
      { title: "Soft bedding for seniors", body: "Older pugs do well with orthopedic beds and a joint supplement after a vet check." },
    ],
    guides: [{ slug: "senior-pet-care", title: "Caring for a senior pet" }],
  },
  {
    match: /terrier/i,
    species: "dog",
    title: "Terrier",
    tips: [
      { title: "Hunt the energy", body: "Short, intense play and puzzle toys beat a single long walk for most terriers." },
      { title: "Recall around critters", body: "Practice come with a long line; many terriers will chase before they think." },
      { title: "Respect the bark", body: "Reward quiet, and give them a window perch so they are not bored sentries." },
    ],
  },
  {
    match: /doodle|maltipoo|poodle/i,
    species: "dog",
    title: "Poodle mix",
    tips: [
      { title: "Book grooming early", body: "Plan a full groom every 6–8 weeks. Mats against the skin are painful and expensive to shave out." },
      { title: "Brush between appointments", body: "A few minutes with a slicker brush a few times a week keeps the coat livable." },
      { title: "They still need training", body: "Low shedding is not low energy. Daily walks and manners class prevent zoomies in the house." },
    ],
  },
  {
    match: /samoyed|husky|malamute/i,
    species: "dog",
    title: "Northern breed",
    tips: [
      { title: "Summer is indoor time", body: "A double coat is insulation, not a reason to shave. Walk at sunrise and keep them in AC." },
      { title: "Brush through shed season", body: "An undercoat rake during blowouts keeps fur off the couch and skin healthy." },
      { title: "They need miles", body: "These dogs were bred to work. Plan a real outing most days, not a backyard pit stop." },
    ],
    guides: [
      { slug: "active-dog-care", title: "Caring for an active dog" },
      { slug: "west-texas-weather-safety", title: "West Texas weather safety" },
    ],
  },
  {
    match: /spaniel|cavalier/i,
    species: "dog",
    title: "Spaniel",
    tips: [
      { title: "Ears first", body: "Check and dry ears weekly. Long leather ears plus Lubbock dust is a recipe for infection." },
      { title: "Gentle exercise", body: "Cavaliers love laps and short walks. Skip intense jumping sports unless a vet clears them." },
      { title: "Watch the heart", body: "Ask your vet about a baseline heart listen; many spaniels benefit from earlier checkups." },
    ],
  },
  {
    match: /york|yorkshire|pomeranian|pom\b/i,
    species: "dog",
    title: "Toy breed",
    tips: [
      { title: "Handle like glass at first", body: "Small dogs break easily. Teach kids to sit on the floor for greetings and skip rough pickup." },
      { title: "Dental care matters", body: "Toy breeds tartar up fast. Daily chews or brushing and yearly dental checks save teeth." },
      { title: "Sweaters in winter, shade in summer", body: "Low body mass means they chill and overheat faster than a Lab." },
    ],
  },
  {
    match: /vizsla|pointer|weimaraner/i,
    species: "dog",
    title: "Sporting breed",
    tips: [
      { title: "Run, then rest", body: "These dogs want a running or hiking partner. A fenced yard alone will not tire them out." },
      { title: "Velcro is a feature", body: "They do poorly left alone all day. Plan crating practice and a midday break." },
      { title: "Soft mouths, hard zoomies", body: "Channel retrieve games into a structured fetch so they do not invent their own job." },
    ],
    guides: [{ slug: "active-dog-care", title: "Caring for an active dog" }],
  },
  {
    match: /maine\s*coon/i,
    species: "cat",
    title: "Maine Coon",
    tips: [
      { title: "Brush the mane", body: "A wide-tooth comb a few times a week prevents mats in the ruff and pants." },
      { title: "Tall territory", body: "Give them a sturdy cat tree. Large cats want to survey the room from above." },
      { title: "Watch the heart", body: "Ask your vet about a baseline heart exam; this breed can develop HCM as they age." },
    ],
    guides: [{ slug: "bringing-home-a-cat", title: "Bringing home a new cat" }],
  },
  {
    match: /persian|himalayan/i,
    species: "cat",
    title: "Persian",
    tips: [
      { title: "Daily coat care", body: "A metal comb every day is kinder than a monthly shave-down. Keep the face clean and dry." },
      { title: "Quiet rooms win", body: "Persians prefer calm adult homes and predictable routines." },
      { title: "Watch the eyes", body: "Tear staining is common. Wipe with a soft, damp cloth and call the vet if the eyes look painful." },
    ],
  },
  {
    match: /british\s*shorthair/i,
    species: "cat",
    title: "British Shorthair",
    tips: [
      { title: "Keep them moving", body: "This stocky breed gains weight easily. Use puzzle feeders and two short play sessions a day." },
      { title: "They like company on their terms", body: "Offer a lap, then let them leave. A window perch beats forced cuddles." },
    ],
  },
  {
    match: /siamese|oriental/i,
    species: "cat",
    title: "Siamese-type",
    tips: [
      { title: "Talk back", body: "Vocal cats do better with a person who is home or another cat friend so they are not shouting at empty rooms." },
      { title: "Climbing space", body: "Give vertical routes and interactive toys. Boredom becomes late-night zoomies." },
    ],
  },
  {
    match: /tuxedo|tabby|calico|domestic|dsh|dlh|orange/i,
    species: "cat",
    title: "Domestic cat",
    tips: [
      { title: "Play like a hunter", body: "Two 10-minute wand-toy sessions a day prevent 3 a.m. ankle attacks." },
      { title: "Litter math", body: "One box per cat, plus one extra, scooped daily. Most 'behavior' problems start in a dirty box." },
      { title: "Indoor is safer here", body: "Coyotes, cars, and summer heat make indoor living the kindest default on the South Plains." },
    ],
    guides: [{ slug: "bringing-home-a-cat", title: "Bringing home a new cat" }],
  },
  {
    match: /netherland|dwarf/i,
    species: "rabbit",
    title: "Dwarf rabbit",
    tips: [
      { title: "Hay first", body: "Unlimited timothy hay should be 80% of the diet. Pellets are a side, not the meal." },
      { title: "Handle low to the ground", body: "Dwarf rabbits have fragile spines. Sit on the floor for pets instead of scooping them up." },
    ],
    guides: [{ slug: "rabbit-care", title: "Rabbit care basics" }],
  },
  {
    match: /lop|lionhead|bunny|rabbit/i,
    species: "rabbit",
    title: "Rabbit",
    tips: [
      { title: "Bunny-proof the room", body: "Cover cords and give cardboard to chew. Free-roam time in a safe room beats an all-day cage." },
      { title: "Pairs and litter", body: "Many rabbits litter-train to a hay-topped box. A bonded friend often beats a lone bunny." },
      { title: "Heat is dangerous", body: "Rabbits overheat above the mid-70s. Keep them in AC during Lubbock summers." },
    ],
    guides: [{ slug: "rabbit-care", title: "Rabbit care basics" }],
  },
  {
    match: /macaw|parrot|cockatoo/i,
    species: "bird",
    title: "Large parrot",
    tips: [
      { title: "This is a decades-long roommate", body: "Macaws can live 50+ years. Plan for who cares for them if you move or cannot keep them." },
      { title: "Out-of-cage time", body: "A large cage is a bedroom, not a life. Budget several hours of supervised time on a play stand." },
      { title: "Foraging over seed cups", body: "Hide pellets in toys. All-seed diets cause fatty liver." },
    ],
    guides: [{ slug: "bird-care", title: "Bird care basics" }],
  },
  {
    match: /parakeet|ringneck|conure|cockatiel|budgie/i,
    species: "bird",
    title: "Companion parrot",
    tips: [
      { title: "Talk and train daily", body: "A few minutes of target training beats leaving the radio on and hoping for the best." },
      { title: "Sleep in the dark", body: "Cover the cage or move it to a quiet room for 10–12 hours. Tired birds scream less." },
      { title: "No Teflon, no avocado", body: "Overheated nonstick pans and several human foods are toxic. Keep them out of the kitchen during cooking." },
    ],
    guides: [{ slug: "bird-care", title: "Bird care basics" }],
  },
];

const SPECIES_TIPS: Record<Species, CareTip[]> = {
  dog: [
    { title: "Same food at first", body: "Keep the current diet for a week, then transition over 5–7 days so their stomach can catch up." },
    { title: "The 3-3-3 rule", body: "Most rescue dogs need about 3 days to decompress, 3 weeks to learn your routine, and 3 months to feel at home." },
    { title: "Vet in week one", body: "Book a wellness visit, transfer the microchip, and ask about heartworm prevention used in this region." },
  ],
  cat: [
    { title: "Start in one room", body: "Set up a base camp with food, water, a litter box, and a hiding spot. Open the house when they come out to greet you." },
    { title: "Vertical space", body: "A tree or shelf gives shy cats an escape route, which prevents most dog-and-cat scuffles." },
    { title: "Keep them indoors", body: "Indoor cats live longer here. A catio or leash walk is safer than unsupervised outdoor time." },
  ],
  rabbit: [
    { title: "Hay, hay, hay", body: "Fresh timothy hay around the clock keeps teeth worn down and guts moving." },
    { title: "Find an exotic vet", body: "Not every clinic treats rabbits. Book a first exam before you have an emergency." },
    { title: "Cool and quiet", body: "Keep them out of direct sun and away from barking dogs until they settle." },
  ],
  bird: [
    { title: "Out every day", body: "Supervised time outside the cage is how companion birds stay sane." },
    { title: "Pellets over seeds", body: "A formulated pellet plus vegetables beats an all-seed bowl." },
    { title: "Avian vet on file", body: "Birds hide illness. Weigh them weekly and call an avian clinic if they fluff up or stop talking." },
  ],
};

const SPECIES_GUIDES: Record<Species, CareGuideLink[]> = {
  dog: [
    { slug: "bringing-home-a-dog", title: "Bringing home a new dog" },
    { slug: "active-dog-care", title: "Caring for an active dog" },
  ],
  cat: [{ slug: "bringing-home-a-cat", title: "Bringing home a new cat" }],
  rabbit: [{ slug: "rabbit-care", title: "Rabbit care basics" }],
  bird: [{ slug: "bird-care", title: "Bird care basics" }],
};

function extraTips(pet: PetCareInput): CareTip[] {
  const extra: CareTip[] = [];
  if (pet.energy === "high") {
    extra.push({
      title: "Burn the zoomies on purpose",
      body: `${pet.name} is high energy. Plan a real outing or a training game before you leave them home, or the house becomes the playground.`,
    });
  }
  if (pet.energy === "low" || pet.ageGroup === "senior") {
    extra.push({
      title: "Soft routine for a slower body",
      body: "Short walks, a warm bed, and a vet talk about joints beat pushing them to keep up with a puppy.",
    });
  }
  if (pet.needsYard) {
    extra.push({
      title: "Fence and shade",
      body: "They do best with a secure yard and a shaded spot. In summer, limit midday patio time and offer water outside.",
    });
  }
  if (pet.size === "large" && pet.species === "dog") {
    extra.push({
      title: "Budget for a big dog",
      body: "Large-breed food, heartworm prevention, and boarding cost more. Use the cost estimator so the first month is not a surprise.",
    });
  }
  if (pet.ageGroup === "baby") {
    extra.push({
      title: "Puppy / kitten proofing",
      body: "Cords, houseplants, and small toys go up and away. Potty or litter accidents are training, not spite.",
    });
  }
  if (!pet.goodWithKids) {
    extra.push({
      title: "Adult-only greetings",
      body: `${pet.name} prefers a calmer home. Ask visitors to ignore them until they approach, and skip chaotic kid hangouts at first.`,
    });
  }
  return extra;
}

function uniqueTips(tips: CareTip[]): CareTip[] {
  const seen = new Set<string>();
  return tips.filter((t) => {
    if (seen.has(t.title)) return false;
    seen.add(t.title);
    return true;
  });
}

function uniqueGuides(guides: CareGuideLink[]): CareGuideLink[] {
  const seen = new Set<string>();
  return guides.filter((g) => {
    if (seen.has(g.slug)) return false;
    seen.add(g.slug);
    return true;
  });
}

export function careForPet(pet: PetCareInput): PetCareGuide {
  const breedHit = BREEDS.find((b) => b.match.test(pet.breed) && (!b.species || b.species === pet.species));
  const headline = breedHit ? `Caring for a ${breedHit.title}` : `Caring for a ${pet.breed}`;
  const summary = breedHit
    ? `Breed-specific advice for ${pet.name}, plus what every ${pet.species} needs in a new home — including pets listed by other families.`
    : `${pet.name} is listed as a ${pet.breed}. We do not have a custom page for that exact mix, so here is solid ${pet.species} care plus tips from size, energy, and age.`;

  const tips = uniqueTips([...(breedHit?.tips ?? []), ...extraTips(pet), ...SPECIES_TIPS[pet.species]]).slice(0, 7);
  const guides = uniqueGuides([
    ...(breedHit?.guides ?? []),
    ...SPECIES_GUIDES[pet.species],
    { slug: "west-texas-weather-safety", title: "West Texas weather safety" },
    { slug: "introducing-pets", title: "Introducing pets" },
    { slug: "first-week-home", title: "First week home" },
  ]).slice(0, 4);

  return { headline, summary, tips, guides };
}
