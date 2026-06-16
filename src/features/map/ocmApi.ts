import { OCM_API_KEY, OCM_BASE } from "@/config";
import type { LatLng, OcmPoi } from "@/types";

export interface BoundingBox {
  north: number;
  south: number;
  east: number;
  west: number;
}

async function fetchJson<T>(url: string): Promise<T> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return (await res.json()) as T;
}

/** Görünür alandaki (bbox) şarj istasyonları — serbest gezinme için. */
export function fetchPoisInBounds(box: BoundingBox, maxResults = 120): Promise<OcmPoi[]> {
  const url =
    `${OCM_BASE}?output=json&compact=true&verbose=false&maxresults=${maxResults}` +
    `&key=${encodeURIComponent(OCM_API_KEY)}` +
    `&boundingbox=(${box.north.toFixed(5)},${box.west.toFixed(5)}),` +
    `(${box.south.toFixed(5)},${box.east.toFixed(5)})`;
  return fetchJson<OcmPoi[]>(url);
}

/** Bir konuma en yakın istasyonlar (mesafeye göre sıralı). */
export async function fetchNearest(loc: LatLng, distanceKm = 80, maxResults = 20): Promise<OcmPoi[]> {
  const url =
    `${OCM_BASE}?output=json&compact=true&verbose=false&maxresults=${maxResults}` +
    `&distance=${distanceKm}&distanceunit=KM&latitude=${loc.lat}&longitude=${loc.lng}` +
    `&key=${encodeURIComponent(OCM_API_KEY)}`;
  const pois = await fetchJson<OcmPoi[]>(url);
  return (Array.isArray(pois) ? pois : []).sort((a, b) => {
    const da = a.AddressInfo?.Distance ?? Number.POSITIVE_INFINITY;
    const db = b.AddressInfo?.Distance ?? Number.POSITIVE_INFINITY;
    return da - db;
  });
}

/** POI yardımcıları. */
export function poiTitle(p: OcmPoi): string {
  return p.AddressInfo?.Title || "Şarj İstasyonu";
}

export function poiAddress(p: OcmPoi): string {
  const ai = p.AddressInfo;
  if (!ai) return "";
  return [ai.AddressLine1, ai.Town, ai.StateOrProvince].filter(Boolean).join(", ");
}

export function poiConnectors(p: OcmPoi): string {
  if (!p.Connections?.length) return "";
  const types = new Set<string>();
  p.Connections.forEach((c) => {
    if (c.ConnectionType?.Title) types.add(c.ConnectionType.Title);
  });
  return Array.from(types).join(", ");
}
