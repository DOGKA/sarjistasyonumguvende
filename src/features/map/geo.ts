import { NOMINATIM_BASE } from "@/config";
import type { LatLng } from "@/types";

interface NominatimRow {
  lat: string;
  lon: string;
}

/** Şehir/adres metnini koordinata çevirir (OpenStreetMap Nominatim, TR). */
export async function geocode(query: string): Promise<LatLng> {
  const url = `${NOMINATIM_BASE}?format=json&limit=1&countrycodes=tr&q=${encodeURIComponent(query)}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const rows = (await res.json()) as NominatimRow[];
  if (!rows.length) throw new Error("not-found");
  return { lat: parseFloat(rows[0].lat), lng: parseFloat(rows[0].lon) };
}

/** Tarayıcı konumunu döndürür. */
export function geolocate(): Promise<LatLng> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("no-geo"));
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => reject(new Error("denied")),
      { enableHighAccuracy: true, timeout: 9000, maximumAge: 60000 }
    );
  });
}
