export type NavItem = { href: string; label: string; description?: string };

export const PRIMARY_NAV: NavItem[] = [
  { href: "/pets", label: "Pets" },
  { href: "/shelters", label: "Shelters" },
  { href: "/vets", label: "Vets" },
  { href: "/owners", label: "Owners" },
  { href: "/resources", label: "Resources" },
  { href: "/nonprofits", label: "Nonprofits" },
];

export const MORE_NAV: NavItem[] = [
  { href: "/lost-found", label: "Lost & Found", description: "Report or search for missing pets" },
  { href: "/events", label: "Events", description: "Adoption days, clinics, and classes" },
  { href: "/foster", label: "Foster", description: "Help shelters that are at capacity" },
  { href: "/donate", label: "Donate", description: "Support a local shelter" },
  { href: "/map", label: "Map", description: "Shelters and vets near you" },
  { href: "/guides", label: "Care guides", description: "New-pet checklists and rehoming help" },
  { href: "/cost-estimator", label: "Cost estimator", description: "Plan your monthly pet budget" },
];

export const ACCOUNT_NAV: NavItem[] = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/matches", label: "My matches" },
  { href: "/favorites", label: "Favorites" },
  { href: "/messages", label: "Messages" },
  { href: "/profile", label: "Adopter profile" },
  { href: "/rehome", label: "Rehome a pet" },
];
