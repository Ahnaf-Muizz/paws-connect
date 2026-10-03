"use client";

import { useEffect, useMemo, useRef } from "react";
import Link from "next/link";
import L from "leaflet";
import { CircleMarker, MapContainer, Marker, Popup, TileLayer, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import type { Place, PlaceKind } from "./map-explorer";

const LUBBOCK: [number, number] = [33.5779, -101.8552];

const PIN_COLOR: Record<PlaceKind, string> = { shelter: "#3c7f89", vet: "#e8834a", emergency: "#e11d48" };

const icons = Object.fromEntries(
  (Object.keys(PIN_COLOR) as PlaceKind[]).map((k) => [
    k,
    L.divIcon({
      className: "",
      html: `<span style="display:block;width:26px;height:26px;border-radius:50% 50% 50% 0;transform:rotate(-45deg);background:${PIN_COLOR[k]};border:3px solid #fff;box-shadow:0 2px 6px rgba(0,0,0,.35)"></span>`,
      iconSize: [26, 26],
      iconAnchor: [13, 26],
      popupAnchor: [0, -26],
    }),
  ]),
) as Record<PlaceKind, L.DivIcon>;

function FlyTo({ place, me, markers }: { place: Place | null; me: { lat: number; lng: number } | null; markers: React.RefObject<Map<string, L.Marker>> }) {
  const map = useMap();
  useEffect(() => {
    if (!place) return;
    map.flyTo([place.lat, place.lng], Math.max(map.getZoom(), 14), { duration: 0.6 });
    markers.current.get(place.key)?.openPopup();
  }, [map, place, markers]);
  useEffect(() => {
    if (me) map.flyTo([me.lat, me.lng], 12, { duration: 0.6 });
  }, [map, me]);
  return null;
}

export default function LeafletMap({
  places,
  selected,
  onSelect,
  me,
}: {
  places: Place[];
  selected: string | null;
  onSelect: (key: string) => void;
  me: { lat: number; lng: number } | null;
}) {
  const markers = useRef(new Map<string, L.Marker>());
  const selectedPlace = useMemo(() => places.find((p) => p.key === selected) ?? null, [places, selected]);

  return (
    <MapContainer center={LUBBOCK} zoom={11} scrollWheelZoom className="h-full w-full" aria-label="Map of shelters and vets">
      <TileLayer attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors' url="https://tile.openstreetmap.org/{z}/{x}/{y}.png" />
      {places.map((p) => (
        <Marker
          key={p.key}
          position={[p.lat, p.lng]}
          icon={icons[p.kind]}
          title={p.name}
          eventHandlers={{ click: () => onSelect(p.key) }}
          ref={(m) => {
            if (m) markers.current.set(p.key, m);
            else markers.current.delete(p.key);
          }}
        >
          <Popup>
            <strong className="block text-sm">{p.name}</strong>
            <span className="block text-xs text-slate-600">{p.address}</span>
            <Link href={p.href} className="mt-1 inline-block text-xs font-semibold text-primary-700">
              View details
            </Link>
          </Popup>
        </Marker>
      ))}
      {me && <CircleMarker center={[me.lat, me.lng]} radius={8} pathOptions={{ color: "#fff", weight: 3, fillColor: "#2563eb", fillOpacity: 1 }} />}
      <FlyTo place={selectedPlace} me={me} markers={markers} />
    </MapContainer>
  );
}
