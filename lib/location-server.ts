import { cookies } from "next/headers";
import { LOCATION_COOKIE, locationFromId, type SimulatedLocation } from "./location";

export async function readSimulatedLocation(): Promise<SimulatedLocation> {
  const jar = await cookies();
  return locationFromId(jar.get(LOCATION_COOKIE)?.value);
}
