import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { esc, qsOpt } from "@/lib/dom";
import { MAP_DEFAULT_CENTER, MAP_DEFAULT_ZOOM, OCM_API_KEY } from "@/config";
import type { LatLng, OcmPoi } from "@/types";
import {
  fetchNearest,
  fetchPoisInBounds,
  poiAddress,
  poiConnectors,
  poiTitle,
} from "./ocmApi";
import { geocode, geolocate } from "./geo";

function chargerIcon(isUser: boolean): L.DivIcon {
  return L.divIcon({
    className: `ocm-pin${isUser ? " ocm-pin--user" : ""}`,
    html: `<span class="ocm-pin__dot"><span>${isUser ? "●" : "⚡"}</span></span>`,
    iconSize: [30, 30],
    iconAnchor: [15, 30],
    popupAnchor: [0, -30],
  });
}

/** Google Haritalar yol tarifi bağlantısı (başlangıç = kullanıcının anlık konumu). */
function directionsUrl(lat: number, lng: number): string {
  return `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&travelmode=driving`;
}

function popupHtml(p: OcmPoi): string {
  const conn = poiConnectors(p);
  const addr = poiAddress(p);
  const ai = p.AddressInfo;
  const dir = ai ? directionsUrl(ai.Latitude, ai.Longitude) : null;
  return (
    `<strong>${esc(poiTitle(p))}</strong>` +
    (addr ? `<div>${esc(addr)}</div>` : "") +
    (conn ? `<div style="margin-top:6px;color:#737370">${esc(conn)}</div>` : "") +
    (dir
      ? `<a class="ocm-popup__dir" href="${dir}" target="_blank" rel="noopener noreferrer">Yol tarifi ➜</a>`
      : "")
  );
}

/**
 * Şarj istasyonu haritası — OpenChargeMap + Leaflet.
 * Gezinme (zoom/kaydırma) serbesttir; "en yakın istasyonu bul" araması
 * için kullanıcıdan yalnızca e-posta istenir.
 */
export function initOcmMap(): void {
  const mapEl = qsOpt<HTMLDivElement>("#ocmMap");
  if (!mapEl) return;

  if (!OCM_API_KEY) {
    console.warn("VITE_OCM_API_KEY tanımlı değil — şarj istasyonu verisi yüklenmeyecek.");
  }

  const map = L.map(mapEl, { scrollWheelZoom: true }).setView(
    MAP_DEFAULT_CENTER,
    MAP_DEFAULT_ZOOM
  );

  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "&copy; OpenStreetMap",
    maxZoom: 19,
  }).addTo(map);

  const markerLayer = L.layerGroup().addTo(map);
  const markersById = new Map<number, L.Marker>();
  let userMarker: L.Marker | null = null;

  const listEl = qsOpt<HTMLElement>("#stationList");

  function addPois(pois: OcmPoi[]): void {
    if (!Array.isArray(pois)) return;
    pois.forEach((p) => {
      const ai = p.AddressInfo;
      if (!ai || typeof ai.Latitude !== "number" || typeof ai.Longitude !== "number") return;
      if (markersById.has(p.ID)) return;
      const m = L.marker([ai.Latitude, ai.Longitude], { icon: chargerIcon(false) });
      m.bindPopup(popupHtml(p));
      markerLayer.addLayer(m);
      markersById.set(p.ID, m);
    });
  }

  // ----------------------------------------------------- SERBEST GEZİNME
  let browseTimer: number | null = null;
  function loadForView(): void {
    if (map.getZoom() < 6) return;
    const b = map.getBounds();
    fetchPoisInBounds({
      north: b.getNorth(),
      south: b.getSouth(),
      east: b.getEast(),
      west: b.getWest(),
    })
      .then(addPois)
      .catch(() => {});
  }
  map.on("moveend", () => {
    if (browseTimer !== null) clearTimeout(browseTimer);
    browseTimer = window.setTimeout(loadForView, 450);
  });
  window.setTimeout(loadForView, 300);

  // ----------------------------------------------------- EN YAKIN ARAMA
  const form = qsOpt<HTMLFormElement>("#stationSearch");
  const cityInput = qsOpt<HTMLInputElement>("#stCity");
  const submitBtn = qsOpt<HTMLButtonElement>("#stSubmit");
  const errEl = qsOpt<HTMLElement>("#stError");

  function setError(msg: string): void {
    if (errEl) errEl.textContent = msg;
  }
  function setBusy(busy: boolean, label = "Aranıyor…"): void {
    if (!submitBtn) return;
    submitBtn.disabled = busy;
    submitBtn.textContent = busy ? label : "En Yakın İstasyonu Bul";
  }

  function showUser(loc: LatLng): void {
    if (userMarker) markerLayer.removeLayer(userMarker);
    userMarker = L.marker([loc.lat, loc.lng], { icon: chargerIcon(true) });
    userMarker.bindPopup("<strong>Konumunuz</strong>");
    markerLayer.addLayer(userMarker);
  }

  function renderList(pois: OcmPoi[]): void {
    if (!listEl) return;
    if (!pois.length) {
      listEl.innerHTML =
        '<p class="stations__list-empty">Bu konum çevresinde kayıtlı şarj istasyonu bulunamadı. Lütfen farklı bir konum deneyin.</p>';
      return;
    }
    listEl.innerHTML = "";
    pois.forEach((p) => {
      const ai = p.AddressInfo;
      if (!ai) return;
      const row = document.createElement("div");
      row.className = "st-item";
      row.setAttribute("role", "button");
      row.tabIndex = 0;
      const dist = typeof ai.Distance === "number" ? `${ai.Distance.toFixed(1)} km` : "";
      row.innerHTML =
        `<span class="st-item__name">${esc(poiTitle(p))}</span>` +
        (poiAddress(p) ? `<span class="st-item__meta">${esc(poiAddress(p))}</span>` : "") +
        (poiConnectors(p) ? `<span class="st-item__meta">${esc(poiConnectors(p))}</span>` : "") +
        `<span class="st-item__foot">` +
        (dist ? `<span class="st-item__dist">${dist}</span>` : "<span></span>") +
        `<a class="st-item__dir" href="${directionsUrl(
          ai.Latitude,
          ai.Longitude
        )}" target="_blank" rel="noopener noreferrer">Yol tarifi ➜</a>` +
        `</span>`;
      const select = (): void => {
        Array.from(listEl.children).forEach((c) => c.classList.remove("is-active"));
        row.classList.add("is-active");
        map.setView([ai.Latitude, ai.Longitude], 15);
        markersById.get(p.ID)?.openPopup();
      };
      row.addEventListener("click", (e) => {
        // "Yol tarifi" bağlantısına tıklamada seçim/odak tetiklenmesin
        if ((e.target as HTMLElement).closest(".st-item__dir")) return;
        select();
      });
      row.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          select();
        }
      });
      listEl.appendChild(row);
    });
  }

  async function searchNearest(loc: LatLng): Promise<void> {
    showUser(loc);
    const pois = await fetchNearest(loc);
    addPois(pois);
    renderList(pois);
    if (pois.length && pois[0].AddressInfo) {
      const ai = pois[0].AddressInfo;
      map.setView([ai.Latitude, ai.Longitude], 13);
    } else {
      map.setView([loc.lat, loc.lng], 12);
    }
  }

  if (form && cityInput) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      setError("");

      const city = cityInput.value.trim();
      setBusy(true);

      const locator = city ? geocode(city) : geolocate();
      locator
        .then(searchNearest)
        .catch((err: Error) => {
          if (city) {
            setError("Konum bulunamadı. Lütfen şehir veya adresi kontrol edin.");
          } else if (err.message === "denied") {
            setError("Konum izni verilmedi. Yukarıdaki alana bir şehir/adres yazıp tekrar deneyin.");
          } else {
            setError("Arama sırasında bir sorun oluştu. Lütfen tekrar deneyin.");
          }
        })
        .finally(() => setBusy(false));
    });
  }
}
