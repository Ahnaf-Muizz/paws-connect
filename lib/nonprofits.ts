export type Nonprofit = {
  name: string;
  url: string;
  description: string;
  focus: string[];
};

export type NonprofitGroup = { key: string; title: string; blurb: string; orgs: Nonprofit[] };

export const NONPROFITS: NonprofitGroup[] = [
  {
    key: "lubbock",
    title: "Lubbock & the South Plains",
    blurb: "Local shelters and volunteer rescues serving Lubbock County and the surrounding area.",
    orgs: [
      {
        name: "Lubbock Animal Services & Adoption Center",
        url: "https://www.mylubbock.us/animalservices",
        description: "The city's open-admission shelter on SE Loop 289. Adoption, lost & found, and foster programs.",
        focus: ["Dogs", "Cats", "Lost & found"],
      },
      {
        name: "The Haven Animal Care Shelter",
        url: "https://www.havenacs.org/",
        description: "No-kill sanctuary for dogs and cats north of Lubbock, caring for animals until they're adopted.",
        focus: ["Dogs", "Cats", "No-kill"],
      },
      {
        name: "South Plains SPCA",
        url: "https://www.facebook.com/SouthPlainsSpca/",
        description: "Nonprofit SPCA rescuing and rehoming dogs and cats across the South Plains.",
        focus: ["Dogs", "Cats"],
      },
      {
        name: "PETS Clinic",
        url: "https://www.petsclinic.org/",
        description: "Nonprofit clinic offering affordable spay/neuter and wellness care to reduce pet overpopulation.",
        focus: ["Spay/neuter", "Low-cost care"],
      },
      {
        name: "Saving Grace Rescue LBK",
        url: "https://www.savinggracelbk.org/",
        description: "Founded in 2009 to advocate for pit bulls; now rescues every breed and partners with the city shelter.",
        focus: ["Dogs", "Bully breeds"],
      },
      {
        name: "Dusty Puddles Dachshund Rescue",
        url: "https://bestfriends.org/partners/dusty-puddles-dachshund-rescue",
        description: "Rescue for dachshunds and dachshund mixes, including seniors with medical needs.",
        focus: ["Dachshunds", "Seniors"],
      },
      {
        name: "A Place for Us Greyhounds",
        url: "https://aplaceforusgreyhounds.org/",
        description: "Places retired racing greyhounds with families in West Texas.",
        focus: ["Greyhounds"],
      },
      {
        name: "Easy R Equine Rescue",
        url: "https://www.easyrequinerescue.org/",
        description: "Rescues, rehabilitates, and rehomes neglected and unwanted horses.",
        focus: ["Horses"],
      },
      {
        name: "Rescued Animals Second Chance",
        url: "https://www.rasclubbock.org/",
        description: "Lubbock nonprofit giving rescued horses a second chance through rehabilitation and adoption.",
        focus: ["Horses"],
      },
    ],
  },
  {
    key: "texas",
    title: "Across Texas",
    blurb: "Statewide and big-city organizations with adoption, foster, and education programs.",
    orgs: [
      {
        name: "Houston SPCA",
        url: "https://houstonspca.org/",
        description: "One of the largest animal-protection agencies in the Southwest, serving more than 62,000 animals a year.",
        focus: ["Adoption", "Cruelty investigations", "Wildlife"],
      },
      {
        name: "SPCA of Texas",
        url: "https://spca.org/",
        description: "Dallas-Fort Worth nonprofit offering adoption, low-cost clinics, and pet-owner assistance.",
        focus: ["Adoption", "Clinics"],
      },
      {
        name: "Austin Pets Alive!",
        url: "https://www.austinpetsalive.org/",
        description: "Pioneer of no-kill programs that help shelters nationwide save more lives.",
        focus: ["No-kill", "Foster"],
      },
      {
        name: "Humane Society of North Texas",
        url: "https://www.hsnt.org/",
        description: "Fort Worth shelter providing adoption, rescue, and community vaccine clinics.",
        focus: ["Adoption", "Vaccines"],
      },
    ],
  },
  {
    key: "national",
    title: "National resources",
    blurb: "Trusted national nonprofits and adoption networks.",
    orgs: [
      {
        name: "ASPCA",
        url: "https://www.aspca.org/",
        description: "National animal welfare nonprofit with pet care guides, grants, and the Animal Poison Control Center.",
        focus: ["Education", "Poison control"],
      },
      {
        name: "Best Friends Animal Society",
        url: "https://bestfriends.org/",
        description: "Working to make every U.S. shelter no-kill, with shelter data and adoption centers nationwide.",
        focus: ["No-kill", "Shelter data"],
      },
      {
        name: "Humane World for Animals",
        url: "https://www.humaneworld.org/",
        description: "Formerly the Humane Society of the United States. Advocacy, rescue, and pet-owner resources.",
        focus: ["Advocacy", "Rescue"],
      },
      {
        name: "Petfinder",
        url: "https://www.petfinder.com/",
        description: "Searchable database of adoptable pets from thousands of shelters and rescues.",
        focus: ["Adoption search"],
      },
      {
        name: "Adopt-a-Pet",
        url: "https://www.adoptapet.com/",
        description: "Adoption listings plus a free tool for owners to rehome pets directly without a shelter.",
        focus: ["Adoption search", "Rehoming"],
      },
      {
        name: "24Petconnect",
        url: "https://24petconnect.com/",
        description: "Shelter-connected search for adoptable and lost pets, used by many Texas municipal shelters.",
        focus: ["Lost pets", "Adoption search"],
      },
      {
        name: "Petco Love Lost",
        url: "https://petcolove.org/lost/",
        description: "Free photo-matching search to reunite lost pets with their families.",
        focus: ["Lost pets"],
      },
    ],
  },
];
