export type GuideSection = {
  heading: string;
  paragraphs?: string[];
  list?: string[];
  links?: { label: string; href: string }[];
};

export type Guide = {
  slug: string;
  title: string;
  summary: string;
  category: "Rehoming" | "New pet" | "Safety" | "Behavior";
  minutes: number;
  sections: GuideSection[];
};

export const GUIDES: Guide[] = [
  {
    slug: "cant-keep-my-pet",
    title: "Can't keep your pet? Try these first",
    summary: "Most surrenders happen because of cost, housing, or behavior, and many of those problems have fixes. Here's what to try before rehoming, and how to rehome safely if you must.",
    category: "Rehoming",
    minutes: 6,
    sections: [
      {
        heading: "If money is the problem",
        list: [
          "Ask your vet about payment plans or a lower-cost treatment option. Many clinics would rather adjust a plan than lose a patient.",
          "Low-cost spay/neuter and vaccine clinics cost a fraction of full-service prices. Check the clinic listings on the Resources page.",
          "Ask local shelters and rescues whether they run a pet food pantry or know of one nearby.",
          "Pet insurance won't cover pre-existing conditions, but it can prevent the next big bill. Compare plans before you need one.",
        ],
        links: [
          { label: "Low-cost clinics", href: "/resources?tab=clinic" },
          { label: "Compare insurance", href: "/resources?tab=insurance" },
          { label: "Estimate monthly costs", href: "/cost-estimator" },
        ],
      },
      {
        heading: "If housing is the problem",
        list: [
          "Ask your landlord about a pet addendum or an extra deposit instead of a flat no. A reference letter from a previous landlord or a training certificate helps.",
          "Search specifically for pet-friendly rentals. Breed and weight limits vary a lot between properties.",
          "If you're moving temporarily, ask friends or family, or a shelter's foster program, about short-term care.",
        ],
      },
      {
        heading: "If behavior is the problem",
        paragraphs: [
          "Sudden behavior changes are often medical, so start with a vet visit to rule out pain, thyroid issues, or urinary problems. Then consider a certified trainer who uses reward-based methods.",
        ],
        list: [
          "Destructive chewing or barking: more exercise, puzzle feeders, and a predictable routine fix more cases than people expect.",
          "Litter box problems: add a box, change the litter type, and clean more often before deciding it's behavioral.",
          "Conflict with another pet: separate them and reintroduce slowly. See the introductions guide.",
        ],
        links: [{ label: "Introducing pets guide", href: "/guides/introducing-pets" }],
      },
      {
        heading: "If you need to rehome",
        paragraphs: [
          "Rehoming directly from your home to a screened family is far less stressful for a pet than a shelter kennel. It also frees shelter space for animals with nowhere else to go.",
        ],
        list: [
          "Write an honest profile: quirks, medical needs, and what kind of home they'd do best in.",
          "Gather vet records, vaccination history, and the microchip number to transfer.",
          "Charge a modest rehoming fee. \u201CFree to good home\u201D ads attract people who resell or misuse animals.",
          "Meet applicants in a public place first, then do a home visit before handing over your pet.",
          "Ask the new family to return the pet to you, not to a shelter, if it doesn't work out.",
        ],
        links: [{ label: "Post a rehoming profile", href: "/rehome" }],
      },
      {
        heading: "Last resort: surrendering to a shelter",
        paragraphs: [
          "If you can't keep your pet and can't rehome them, contact the shelter before you arrive. Many need an appointment for owner surrenders. Never abandon a pet outdoors; in Texas, abandoning an animal can be a criminal offense.",
        ],
        links: [{ label: "Local shelters", href: "/shelters" }],
      },
    ],
  },
  {
    slug: "bringing-home-a-dog",
    title: "Bringing home a new dog",
    summary: "A shopping list, a first-week plan, and the 3-3-3 rule for helping a rescue dog settle in.",
    category: "New pet",
    minutes: 5,
    sections: [
      {
        heading: "Before they come home",
        list: [
          "Crate or a safe gated area, bed, food and water bowls",
          "Collar with an ID tag, a 6-foot leash, and a harness",
          "The same food the shelter or previous owner used, to avoid stomach upset",
          "Enzyme cleaner for accidents, poop bags, and a few chew toys",
          "A vet booked for the first week",
        ],
      },
      {
        heading: "The 3-3-3 rule",
        paragraphs: [
          "Rescue dogs often need about 3 days to decompress, 3 weeks to learn your routine, and 3 months to feel fully at home. Expect some hiding, low appetite, or accidents at first. That's normal and usually passes.",
        ],
      },
      {
        heading: "Your first week",
        list: [
          "Keep it quiet. Skip the dog park and big visits until they've settled.",
          "Feed, walk, and go to bed at the same times every day.",
          "Take them out after meals, naps, and play, and reward them for going outside.",
          "Update the microchip registration with your contact details.",
        ],
        links: [
          { label: "Find a vet", href: "/vets" },
          { label: "Shop dog food", href: "/resources?tab=food&species=dog" },
        ],
      },
    ],
  },
  {
    slug: "bringing-home-a-cat",
    title: "Bringing home a new cat",
    summary: "Set up a base camp room, choose the right litter setup, and let your cat set the pace.",
    category: "New pet",
    minutes: 4,
    sections: [
      {
        heading: "Set up a base camp",
        paragraphs: [
          "Start your cat in one quiet room with food, water, a litter box, a scratching post, and somewhere to hide. Once they're eating, using the box, and coming out to greet you, open up the rest of the house.",
        ],
      },
      {
        heading: "Litter box basics",
        list: [
          "Aim for one box per cat, plus one extra.",
          "Use unscented, clumping litter and scoop it daily.",
          "Keep boxes away from food and noisy appliances.",
        ],
      },
      {
        heading: "Health checklist",
        list: [
          "Schedule a vet visit within the first two weeks.",
          "Keep indoor cats indoors. Most adopted cats settle in fine without outdoor access.",
          "Register the microchip in your name.",
        ],
        links: [
          { label: "Find a vet", href: "/vets?species=cat" },
          { label: "Cat food and supplies", href: "/resources?tab=food&species=cat" },
        ],
      },
    ],
  },
  {
    slug: "west-texas-weather-safety",
    title: "West Texas weather safety for pets",
    summary: "Heat, dust storms, and sudden freezes: how to keep pets safe through South Plains weather.",
    category: "Safety",
    minutes: 3,
    sections: [
      {
        heading: "Summer heat",
        list: [
          "Test pavement with the back of your hand. If you can't hold it there for 7 seconds, it's too hot for paws.",
          "Walk dogs early in the morning or after sunset.",
          "Never leave a pet in a parked car. Interior temperatures can climb past 120\u00B0F within minutes.",
          "Signs of heatstroke include heavy panting, drooling, stumbling, and bright red gums. Cool your pet with lukewarm (not ice-cold) water and get to a vet.",
        ],
      },
      {
        heading: "Dust storms and wind",
        list: [
          "Bring pets inside. Flying debris and low visibility make it easy for frightened pets to bolt.",
          "Make sure ID tags and microchip details are current, especially before storm season.",
        ],
        links: [{ label: "Report a lost pet", href: "/lost-found/report" }],
      },
      {
        heading: "Winter freezes",
        list: [
          "Texas law requires adequate shelter for dogs kept outside. When temperatures drop, the safest choice is bringing them indoors.",
          "Check outdoor water bowls for ice several times a day.",
          "Antifreeze tastes sweet and is deadly. Clean up spills right away.",
        ],
      },
    ],
  },
  {
    slug: "introducing-pets",
    title: "Introducing a new pet to your other pets",
    summary: "Slow introductions prevent most fights. Here's a step-by-step plan for dogs and cats.",
    category: "Behavior",
    minutes: 4,
    sections: [
      {
        heading: "Dog to dog",
        list: [
          "Have them meet on neutral ground, on leashes, walking side by side.",
          "Pick up toys, food, and chews at home for the first couple of weeks.",
          "Watch for stiff bodies or hard stares, and give them breaks before tension builds.",
        ],
      },
      {
        heading: "Dog to cat",
        list: [
          "Start with scent swapping: trade bedding between them for a few days.",
          "Let them see each other through a baby gate while the dog is leashed, and reward calm behavior.",
          "Always give the cat escape routes and high perches the dog can't reach.",
        ],
      },
      {
        heading: "Cat to cat",
        paragraphs: [
          "Keep the newcomer in a separate room for 1 to 2 weeks. Feed both cats on either side of a closed door, then a cracked door, then a gate, before they share space.",
        ],
      },
    ],
  },
];

export const getGuide = (slug: string) => GUIDES.find((g) => g.slug === slug) ?? null;
