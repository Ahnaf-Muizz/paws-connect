export const unsplash = (id: string) => `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=1200&q=80`;

export const SITE_PHOTOS = {
  heroDogs: unsplash("1548199973-03cce0bbc87b"),
  family: unsplash("1601758124510-52d02ddb7cbd"),
  catHand: unsplash("1450778869180-41d0601e046e"),
  vet: unsplash("1628009368231-7bb7cfcb0def"),
  vetPortrait: unsplash("1612531386530-97286d97c2d2"),
  food: unsplash("1589924691995-400dc9ecc119"),
  foodDelivery: unsplash("1601758228041-f3b2795255f1"),
  grooming: unsplash("1516734212186-a967f81ad0d7"),
  dental: unsplash("1591946614720-90a587da4a36"),
  puppy: unsplash("1576201836106-db1758fd1c97"),
};

export const HERO_SLIDES = [
  { src: "/hero/adoption-day.jpg", alt: "Two adopters carrying their new rescue dogs over their shoulders in a sunny park" },
  { src: "/hero/family-walk.jpg", alt: "A smiling couple looking at their Italian greyhound standing in a window" },
  { src: "/hero/cat-cuddle.jpg", alt: "A fluffy tabby cat nuzzling a golden retriever in the grass" },
  { src: "/hero/puppy-hug.jpg", alt: "A golden retriever puppy sitting outdoors holding a white tulip" },
  { src: "/hero/senior-dog.jpg", alt: "A golden retriever looking at the camera against a blue background" },
];
