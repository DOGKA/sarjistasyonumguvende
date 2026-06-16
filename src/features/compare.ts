import { esc, qsOpt } from "@/lib/dom";
import { loadEvModels } from "@/data/evModels";
import type { EvBrand, EvModel, EvModelsData } from "@/types";

const SLOT_COUNT = 3;

const num = (v: number, d = 1) =>
  new Intl.NumberFormat("tr-TR", { maximumFractionDigits: d }).format(v);

/** Yandan araç silüeti — sütun kartı görseli (referans EV uygulamasından esinli). */
const CAR_SVG = /* html */ `
<svg class="cmp-col__car" viewBox="0 0 260 96" aria-hidden="true">
  <defs>
    <linearGradient id="cmpCarBody" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="var(--accent)" stop-opacity=".55" />
      <stop offset="1" stop-color="var(--accent)" stop-opacity=".05" />
    </linearGradient>
  </defs>
  <ellipse class="cmp-col__car-glow" cx="130" cy="84" rx="104" ry="9" />
  <path class="cmp-col__car-body" fill="url(#cmpCarBody)"
    d="M14 66 Q22 48 52 45 L92 27 Q120 18 158 21 L196 26 Q224 31 240 48 L250 54 Q256 57 254 65 L252 70 Q251 74 245 74 L214 74 A20 20 0 0 0 174 74 L104 74 A20 20 0 0 0 64 74 L20 74 Q12 73 14 66 Z" />
  <path class="cmp-col__car-glass" d="M96 30 Q120 23 152 25 L186 29 Q176 41 150 41 L108 41 Q96 41 96 30 Z" />
  <g class="cmp-col__car-wheel">
    <circle cx="84" cy="74" r="15" /><circle class="cmp-col__car-hub" cx="84" cy="74" r="6" />
  </g>
  <g class="cmp-col__car-wheel">
    <circle cx="194" cy="74" r="15" /><circle class="cmp-col__car-hub" cx="194" cy="74" r="6" />
  </g>
</svg>`;

/** Tek bir karşılaştırma yuvası (sütun) durumu. */
interface Slot {
  brandId: string | null;
  modelIdx: number;
}

/** Karşılaştırılacak teknik özellik tanımı. */
interface SpecDef {
  label: string;
  unit?: string;
  /** Hangi yön daha iyi: yüksek / düşük / vurgu yok. */
  better?: "high" | "low";
  /** Modelden sayısal değeri çıkarır (yoksa null). Metin satırlarında kullanılmaz. */
  value?: (m: EvModel) => number | null;
  /** Sayısal değeri biçimlendirir. */
  format?: (v: number) => string;
  /** Metinsel (kıyaslanmayan) özellik değeri. */
  text?: (m: EvModel) => string | null;
  /** Açıklama (opsiyonel). */
  hint?: string;
}

/** Bölüm başlığı veya özellik satırı. */
type Row = { group: string } | SpecDef;

const ROWS: Row[] = [
  { group: "Performans & Güç Aktarımı" },
  {
    label: "Motor Gücü",
    unit: "HP",
    better: "high",
    value: (m) => m.powerHp ?? null,
    format: (v) => num(v, 0),
  },
  {
    label: "0–100 km/s",
    unit: "sn",
    better: "low",
    value: (m) => m.accel0to100s ?? null,
    format: (v) => num(v, 1),
  },
  {
    label: "Maksimum Hız",
    unit: "km/s",
    better: "high",
    value: (m) => m.topSpeedKph ?? null,
    format: (v) => num(v, 0),
  },

  { group: "Batarya & Şarj" },
  {
    label: "Kullanılabilir Batarya",
    unit: "kWh",
    better: "high",
    value: (m) => m.usableBatteryKwh,
    format: (v) => num(v, 1),
  },
  {
    label: "WLTP Menzil",
    unit: "km",
    better: "high",
    value: (m) => m.wltpRangeKm ?? null,
    format: (v) => num(v, 0),
  },
  {
    label: "Ortalama Tüketim",
    unit: "kWh/100km",
    better: "low",
    value: (m) => m.avgConsumptionKwhPer100km,
    format: (v) => num(v, 1),
  },
  {
    label: "Verimlilik",
    unit: "km/kWh",
    better: "high",
    hint: "Menzil ÷ batarya",
    value: (m) => (m.wltpRangeKm ? m.wltpRangeKm / m.usableBatteryKwh : null),
    format: (v) => num(v, 2),
  },
  {
    label: "Maks. AC Şarj",
    unit: "kW",
    better: "high",
    value: (m) => m.maxAcKw,
    format: (v) => num(v, 0),
  },
  {
    label: "Maks. DC Şarj",
    unit: "kW",
    better: "high",
    value: (m) => m.maxDcKw,
    format: (v) => num(v, 0),
  },
  {
    label: "AC Tam Dolum",
    unit: "saat",
    better: "low",
    hint: "0→100% (~)",
    value: (m) => (m.maxAcKw > 0 ? m.usableBatteryKwh / m.maxAcKw : null),
    format: (v) => num(v, 1),
  },
  {
    label: "DC Hızlı Şarj",
    unit: "dk",
    better: "low",
    hint: "10→80% (~)",
    value: (m) => (m.maxDcKw > 0 ? ((m.usableBatteryKwh * 0.7) / m.maxDcKw) * 60 : null),
    format: (v) => num(v, 0),
  },

  { group: "Boyut & Kullanım" },
  {
    label: "Boş Ağırlık",
    unit: "kg",
    better: "low",
    value: (m) => m.weightKg ?? null,
    format: (v) => num(v, 0),
  },
  {
    label: "Bagaj Hacmi",
    unit: "L",
    better: "high",
    value: (m) => m.trunkL ?? null,
    format: (v) => num(v, 0),
  },
  {
    label: "Koltuk Sayısı",
    unit: "kişi",
    value: (m) => m.seats ?? null,
    format: (v) => num(v, 0),
  },

  { group: "Teknoloji & Konfor" },
  {
    label: "Multimedya Ekran",
    unit: "inç",
    better: "high",
    value: (m) => m.screenInch ?? null,
    format: (v) => num(v, 1),
  },
  {
    label: "Kamera Sistemi",
    text: (m) => m.camera ?? null,
  },
  {
    label: "Sürüş Asistanı",
    hint: "Sensör / ADAS",
    text: (m) => m.adas ?? null,
  },
];

function isGroup(r: Row): r is { group: string } {
  return "group" in r;
}

/**
 * Elektrikli araç karşılaştırma aracı (07).
 * Hesaplayıcıdaki tüm marka/modeller; aynı anda 3 araç teknik özelliklerine
 * göre dikey (satır bazlı) kıyaslanır, her satırda en iyi değer vurgulanır.
 */
export function initCompare(): void {
  const boardEl = qsOpt<HTMLElement>("#cmpBoard");
  if (!boardEl) return;
  const board: HTMLElement = boardEl;

  const updated = qsOpt<HTMLElement>("#cmpUpdated");
  let brands: EvBrand[] = [];
  const slots: Slot[] = Array.from({ length: SLOT_COUNT }, () => ({
    brandId: null,
    modelIdx: 0,
  }));

  loadEvModels()
    .then((data) => init(data))
    .catch((err) => {
      console.error("Karşılaştırma verileri yüklenemedi:", err);
      if (updated) updated.textContent = "Veriler yüklenemedi.";
      board.innerHTML =
        '<div class="cmp__board-skeleton">Veriler yüklenemedi. Lütfen sayfayı yenileyin.</div>';
    });

  function init(data: EvModelsData): void {
    brands = data.brands ?? [];
    if (!brands.length) {
      board.innerHTML = '<div class="cmp__board-skeleton">Gösterilecek araç bulunamadı.</div>';
      return;
    }

    const total = brands.reduce((n, b) => n + b.models.length, 0);
    if (updated) updated.textContent = `${brands.length} marka · ${total} model`;

    // İlk açılışta farklı markalardan 3 örnek araçla doldur.
    prefillSlots();

    board.addEventListener("change", onChange);
    board.addEventListener("click", onClick);
    render();
  }

  function prefillSlots(): void {
    for (let i = 0; i < SLOT_COUNT && i < brands.length; i++) {
      slots[i] = { brandId: brands[i].id, modelIdx: 0 };
    }
  }

  function findBrand(id: string | null): EvBrand | null {
    return id ? (brands.find((b) => b.id === id) ?? null) : null;
  }

  function slotModel(slot: Slot): EvModel | null {
    const brand = findBrand(slot.brandId);
    if (!brand) return null;
    return brand.models[slot.modelIdx] ?? brand.models[0] ?? null;
  }

  function modelLabel(m: EvModel): string {
    return m.variant ? `${m.model} · ${m.variant}` : m.model;
  }

  /* ------------------------------------------------------------- olaylar */
  function onChange(e: Event): void {
    const t = e.target as HTMLSelectElement;
    if (!t.matches("select[data-role]")) return;
    const slotIdx = Number(t.dataset.slot);
    const slot = slots[slotIdx];
    if (!slot) return;

    if (t.dataset.role === "brand") {
      slot.brandId = t.value || null;
      slot.modelIdx = 0;
    } else if (t.dataset.role === "model") {
      slot.modelIdx = Number(t.value) || 0;
    }
    render();
  }

  function onClick(e: Event): void {
    const btn = (e.target as HTMLElement).closest<HTMLButtonElement>("[data-clear]");
    if (!btn) return;
    const slotIdx = Number(btn.dataset.clear);
    if (slots[slotIdx]) {
      slots[slotIdx] = { brandId: null, modelIdx: 0 };
      render();
    }
  }

  /* -------------------------------------------------------------- render */
  function render(): void {
    const models = slots.map(slotModel);

    board.innerHTML =
      renderPickerRow() +
      ROWS.map((r) => (isGroup(r) ? renderGroupRow(r.group) : renderSpecRow(r, models))).join("");
  }

  function renderPickerRow(): string {
    const cells = slots
      .map((slot, i) => {
        const brand = findBrand(slot.brandId);
        const model = slotModel(slot);

        const brandOpts =
          `<option value="">Marka seçin…</option>` +
          brands
            .map(
              (b) =>
                `<option value="${esc(b.id)}"${b.id === slot.brandId ? " selected" : ""}>${esc(
                  b.name
                )}</option>`
            )
            .join("");

        const modelOpts = brand
          ? brand.models
              .map(
                (m, mi) =>
                  `<option value="${mi}"${mi === slot.modelIdx ? " selected" : ""}>${esc(
                    modelLabel(m)
                  )}</option>`
              )
              .join("")
          : `<option value="">Önce marka seçin</option>`;

        const accent = brand?.color || "#5ad11d";
        const title = model
          ? `<span class="cmp-col__brand">${esc(brand!.name)}</span><span class="cmp-col__model">${esc(
              modelLabel(model)
            )}</span>`
          : `<span class="cmp-col__brand cmp-col__brand--empty">Araç ${i + 1}</span><span class="cmp-col__model cmp-col__model--empty">Karşılaştırmak için seçin</span>`;

        const range =
          model && model.wltpRangeKm
            ? `<span class="cmp-col__stat"><b>${esc(num(model.wltpRangeKm, 0))}</b> km menzil</span>`
            : `<span class="cmp-col__stat cmp-col__stat--empty">—</span>`;

        const clear = brand
          ? `<button type="button" class="cmp-col__clear" data-clear="${i}" aria-label="Aracı kaldır">×</button>`
          : "";

        return /* html */ `
          <div class="cmp-col${model ? "" : " is-empty"}" role="columnheader" style="--accent:${esc(
            accent
          )}">
            ${clear}
            <div class="cmp-col__stage">
              ${CAR_SVG}
              ${range}
            </div>
            <div class="cmp-col__title">${title}</div>
            <div class="cmp-col__selects">
              <div class="cmp-col__select">
                <select data-role="brand" data-slot="${i}" aria-label="Araç ${i + 1} markası">${brandOpts}</select>
              </div>
              <div class="cmp-col__select">
                <select data-role="model" data-slot="${i}" aria-label="Araç ${i + 1} modeli"${
                  brand ? "" : " disabled"
                }>${modelOpts}</select>
              </div>
            </div>
          </div>`;
      })
      .join("");

    return /* html */ `
      <div class="cmp__row cmp__row--head" role="row">
        <div class="cmp__corner" role="rowheader">
          <span class="cmp__corner-title">Teknik Özellik</span>
          <span class="cmp__corner-sub">${SLOT_COUNT} araca kadar kıyaslayın</span>
        </div>
        ${cells}
      </div>`;
  }

  function renderGroupRow(title: string): string {
    return /* html */ `<div class="cmp__group" role="row"><span>${esc(title)}</span></div>`;
  }

  function renderSpecRow(spec: SpecDef, models: (EvModel | null)[]): string {
    const cells = spec.text
      ? renderTextCells(spec, models)
      : renderNumberCells(spec, models);

    return /* html */ `
      <div class="cmp__row" role="row">
        <div class="cmp__label" role="rowheader">
          <span class="cmp__label-text">${esc(spec.label)}</span>
          ${spec.hint ? `<span class="cmp__label-hint">${esc(spec.hint)}</span>` : ""}
          ${spec.unit ? `<span class="cmp__label-unit">${esc(spec.unit)}</span>` : ""}
        </div>
        ${cells}
      </div>`;
  }

  function renderNumberCells(spec: SpecDef, models: (EvModel | null)[]): string {
    const values = models.map((m) => (m && spec.value ? spec.value(m) : null));
    const present = values.filter((v): v is number => v != null);

    let best: number | null = null;
    if (spec.better && present.length >= 2) {
      best = spec.better === "high" ? Math.max(...present) : Math.min(...present);
    }

    return values
      .map((v) => {
        if (v == null) {
          return `<div class="cmp__cell cmp__cell--na" role="cell"><span class="cmp__na">—</span></div>`;
        }
        const isBest = best != null && Math.abs(v - best) < 1e-6;
        const fmt = spec.format ? spec.format(v) : num(v);
        return /* html */ `
          <div class="cmp__cell${isBest ? " is-best" : ""}" role="cell">
            <span class="cmp__val">${esc(fmt)}</span>
            ${spec.unit ? `<span class="cmp__unit">${esc(spec.unit)}</span>` : ""}
            ${isBest ? '<span class="cmp__best-tag">En iyi</span>' : ""}
          </div>`;
      })
      .join("");
  }

  function renderTextCells(spec: SpecDef, models: (EvModel | null)[]): string {
    return models
      .map((m) => {
        const val = m && spec.text ? spec.text(m) : null;
        if (!val) {
          return `<div class="cmp__cell cmp__cell--na" role="cell"><span class="cmp__na">—</span></div>`;
        }
        return /* html */ `
          <div class="cmp__cell cmp__cell--text" role="cell">
            <span class="cmp__text">${esc(val)}</span>
          </div>`;
      })
      .join("");
  }
}
