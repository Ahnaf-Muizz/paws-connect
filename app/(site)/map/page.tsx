import type { Metadata } from "next";
import { MapExplorer, type Place } from "@/components/map/map-explorer";
import { PageHeader } from "@/components/ui";
import { readSimulatedLocation } from "@/lib/location-server";
import { listMapPlaces } from "@/lib/queries";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Map",
  description: "Find shelters, veterinarians, and 24/7 emergency animal hospitals around Lubbock on one map.",
};

export default async function MapPage() {
  const [{ shelters, vets }, origin] = await Promise.all([listMapPlaces(), readSimulatedLocation()]);
  const places: Place[] = [
    ...shelters.map((s) => ({ key: `s${s.id}`, kind: "shelter" as const, name: s.name, address: s.address, phone: s.phone, lat: s.lat, lng: s.lng, href: `/shelters/${s.slug}`, isReal: s.isReal })),
    ...vets.map((v) => ({
      key: `v${v.id}`,
      kind: v.emergency ? ("emergency" as const) : ("vet" as const),
      name: v.name,
      address: v.address,
      phone: v.phone,
      lat: v.lat,
      lng: v.lng,
      href: `/vets/${v.id}`,
      isReal: v.isReal,
    })),
  ];
  return (
    <div className="container-page pb-10">
      <PageHeader title="Map" description="Shelters, vets, and emergency hospitals across Lubbock and the South Plains." className="py-4 sm:py-8" />
      <MapExplorer places={places} origin={origin} />
    </div>
  );
}
