import { esc, qsOpt, qsa } from "@/lib/dom";
import { loadChargingPrices, loadEvModels } from "@/data/evModels";
import type {
  ChargingOperator,
  ChargingPricesData,
  ChargingTariff,
  EvBrand,
  EvModel,
  EvModelsData,
} from "@/types";

const tl = new Intl.NumberFormat("tr-TR", {
  style: "currency",
  currency: "TRY",
  maximumFractionDigits: 2,
});
const num = (v: number, d = 1) =>
  new Intl.NumberFormat("tr-TR", { maximumFractionDigits: d }).format(v);

interface CalcState {
  brand: EvBrand | null;
  model: EvModel | null;
  operator: ChargingOperator | null;
  tariff: ChargingTariff | null;
  manual: boolean;
}

/**
 * Şarj maliyet hesaplayıcısı (05).
 * EV model veritabanı + günlük operatör tarifeleri JSON'dan yüklenir;
 * seçilen araç ve şarj aralığına göre maliyet hesaplanır ve operatörler
 * en uygundan pahalıya doğru karşılaştırılır.
 */
export function initCalculator(): void {
  const root = qsOpt<HTMLElement>("#calcRoot");
  if (!root) return;

  const els = {
    updated: qsOpt<HTMLElement>("#calcUpdated"),
    brands: qsOpt<HTMLElement>("#calcBrands"),
    brandHint: qsOpt<HTMLElement>("#calcBrandHint"),
    model: qsOpt<HTMLSelectElement>("#calcModel"),
    spec: qsOpt<HTMLElement>("#calcSpec"),
    manualToggle: qsOpt<HTMLInputElement>("#calcManualToggle"),
    manualFields: qsOpt<HTMLElement>("#calcManualFields"),
    manualBattery: qsOpt<HTMLInputElement>("#calcManualBattery"),
    manualCons: qsOpt<HTMLInputElement>("#calcManualCons"),
    manualPriceField: qsOpt<HTMLElement>("#calcManualPriceField"),
    manualPrice: qsOpt<HTMLInputElement>("#calcManualPrice"),
    current: qsOpt<HTMLInputElement>("#calcCurrent"),
    currentVal: qsOpt<HTMLElement>("#calcCurrentVal"),
    target: qsOpt<HTMLInputElement>("#calcTarget"),
    targetVal: qsOpt<HTMLElement>("#calcTargetVal"),
    operator: qsOpt<HTMLSelectElement>("#calcOperator"),
    tariff: qsOpt<HTMLSelectElement>("#calcTariff"),
    batteryArc: qsOpt<SVGCircleElement>("#calcBatteryArc"),
    batteryPct: qsOpt<HTMLElement>("#calcBatteryPct"),
    energy: qsOpt<HTMLElement>("#calcEnergy"),
    range: qsOpt<HTMLElement>("#calcRange"),
    per100: qsOpt<HTMLElement>("#calcPer100"),
    cost: qsOpt<HTMLElement>("#calcCost"),
    costMeta: qsOpt<HTMLElement>("#calcCostMeta"),
    compare: qsOpt<HTMLElement>("#calcCompare"),
  };

  const state: CalcState = {
    brand: null,
    model: null,
    operator: null,
    tariff: null,
    manual: false,
  };

  let priceData: ChargingPricesData | null = null;

  Promise.all([loadEvModels(), loadChargingPrices()])
    .then(([models, prices]) => init(models, prices))
    .catch((err) => {
      console.error("Hesaplayıcı verileri yüklenemedi:", err);
      if (els.updated) els.updated.textContent = "Veriler yüklenemedi.";
      if (els.brands)
        els.brands.innerHTML =
          '<div class="calc__brands-skeleton">Veriler yüklenemedi. Lütfen sayfayı yenileyin.</div>';
    });

  function init(models: EvModelsData, prices: ChargingPricesData): void {
    priceData = prices;

    if (els.updated) {
      const d = new Date(prices.lastUpdated);
      const f = new Intl.DateTimeFormat("tr-TR", {
        day: "numeric",
        month: "long",
        year: "numeric",
      }).format(d);
      els.updated.textContent = `Fiyatlar en son ${f} tarihinde güncellendi`;
    }

    renderBrands(models.brands);
    renderOperators(prices.operators);

    if (models.brands.length) selectBrand(models.brands[0]);
    if (prices.operators.length) selectOperator(prices.operators[0]);

    bindControls();
    recalc();
  }

  /* ------------------------------------------------------------ markalar */
  function renderBrands(brands: EvBrand[]): void {
    if (!els.brands) return;
    els.brands.innerHTML = "";
    brands.forEach((b) => {
      const chip = document.createElement("button");
      chip.type = "button";
      chip.className = "calc-chip";
      chip.dataset.id = b.id;
      const initials = b.name.replace(/[^A-Za-zÇĞİÖŞÜ]/g, "").slice(0, 2).toUpperCase();
      chip.style.setProperty("--chip", b.color || "#161616");
      chip.innerHTML =
        `<span class="calc-chip__badge">${esc(initials)}</span>` +
        `<span class="calc-chip__name">${esc(b.name)}</span>`;
      chip.addEventListener("click", () => selectBrand(b));
      els.brands!.appendChild(chip);
    });
  }

  function selectBrand(brand: EvBrand): void {
    state.brand = brand;
    qsa<HTMLButtonElement>(".calc-chip", els.brands ?? document).forEach((c) =>
      c.classList.toggle("is-active", c.dataset.id === brand.id)
    );
    if (els.brandHint) els.brandHint.textContent = `${brand.models.length} model`;

    if (els.model) {
      els.model.innerHTML = "";
      brand.models.forEach((m, i) => {
        const opt = document.createElement("option");
        opt.value = String(i);
        opt.textContent = m.variant ? `${m.model} · ${m.variant}` : m.model;
        els.model!.appendChild(opt);
      });
    }
    selectModel(brand.models[0] ?? null);
  }

  function selectModel(model: EvModel | null): void {
    state.model = model;
    if (els.spec) {
      els.spec.textContent = model
        ? `${num(model.usableBatteryKwh)} kWh · ${num(model.avgConsumptionKwhPer100km)} kWh/100km` +
          (model.wltpRangeKm ? ` · WLTP ${num(model.wltpRangeKm, 0)} km` : "") +
          ` · AC ${num(model.maxAcKw, 0)} / DC ${num(model.maxDcKw, 0)} kW`
        : "";
    }
    recalc();
  }

  /* ----------------------------------------------------------- operatör */
  function renderOperators(operators: ChargingOperator[]): void {
    if (!els.operator) return;
    els.operator.innerHTML = "";
    operators.forEach((o, i) => {
      const opt = document.createElement("option");
      opt.value = String(i);
      opt.textContent = o.source === "manual" ? `${o.name} (manuel)` : o.name;
      els.operator!.appendChild(opt);
    });
  }

  function selectOperator(operator: ChargingOperator): void {
    state.operator = operator;
    if (els.tariff) {
      els.tariff.innerHTML = "";
      operator.tariffs.forEach((t, i) => {
        const opt = document.createElement("option");
        opt.value = String(i);
        opt.textContent = `${t.label} — ${num(t.pricePerKwh, 2)} ₺/kWh`;
        els.tariff!.appendChild(opt);
      });
    }
    selectTariff(operator.tariffs[0] ?? null);
  }

  function selectTariff(tariff: ChargingTariff | null): void {
    state.tariff = tariff;
    recalc();
  }

  /* ----------------------------------------------------------- kontrol */
  function bindControls(): void {
    els.model?.addEventListener("change", () => {
      const i = parseInt(els.model!.value, 10);
      selectModel(state.brand?.models[i] ?? null);
    });
    els.operator?.addEventListener("change", () => {
      const i = parseInt(els.operator!.value, 10);
      const op = priceData?.operators[i];
      if (op) selectOperator(op);
    });
    els.tariff?.addEventListener("change", () => {
      const i = parseInt(els.tariff!.value, 10);
      selectTariff(state.operator?.tariffs[i] ?? null);
    });

    els.current?.addEventListener("input", () => {
      // hedef daima mevcut şarjdan büyük/eşit olmalı
      if (els.current && els.target) {
        const c = +els.current.value;
        if (c > +els.target.value) els.target.value = String(c);
      }
      recalc();
    });
    els.target?.addEventListener("input", () => {
      if (els.current && els.target) {
        const t = +els.target.value;
        if (t < +els.current.value) els.current.value = String(t);
      }
      recalc();
    });

    els.manualToggle?.addEventListener("change", () => {
      state.manual = !!els.manualToggle?.checked;
      els.manualFields?.toggleAttribute("hidden", !state.manual);
      els.manualPriceField?.toggleAttribute("hidden", !state.manual);
      recalc();
    });
    [els.manualBattery, els.manualCons, els.manualPrice].forEach((inp) =>
      inp?.addEventListener("input", recalc)
    );
  }

  /* --------------------------------------------------------- hesaplama */
  function activeBattery(): number | null {
    if (state.manual) {
      const v = parseFloat(els.manualBattery?.value ?? "");
      if (Number.isFinite(v) && v > 0) return v;
    }
    return state.model?.usableBatteryKwh ?? null;
  }
  function activeConsumption(): number | null {
    if (state.manual) {
      const v = parseFloat(els.manualCons?.value ?? "");
      if (Number.isFinite(v) && v > 0) return v;
    }
    return state.model?.avgConsumptionKwhPer100km ?? null;
  }
  function activePrice(): number | null {
    if (state.manual) {
      const v = parseFloat(els.manualPrice?.value ?? "");
      if (Number.isFinite(v) && v > 0) return v;
    }
    return state.tariff?.pricePerKwh ?? null;
  }

  function recalc(): void {
    const current = els.current ? +els.current.value : 20;
    const target = els.target ? +els.target.value : 80;
    if (els.currentVal) els.currentVal.textContent = `${current}%`;
    if (els.targetVal) els.targetVal.textContent = `${target}%`;
    if (els.current) els.current.style.setProperty("--fill", `${current}%`);
    if (els.target) els.target.style.setProperty("--fill", `${target}%`);
    if (els.batteryPct) els.batteryPct.textContent = String(target);
    if (els.batteryArc) {
      // 270° yay (yarıçap 82 → çevre ≈ 515.2; yay payı 0.75)
      const prog = 386.4 * (target / 100);
      els.batteryArc.style.strokeDasharray = `${prog.toFixed(1)} ${(515.2 - prog).toFixed(1)}`;
    }

    const battery = activeBattery();
    const consumption = activeConsumption();
    const price = activePrice();
    const delta = Math.max(0, target - current);

    if (battery == null || delta === 0) {
      setOutputs(null, null, null, null);
      if (els.costMeta)
        els.costMeta.textContent =
          delta === 0 ? "Hedef şarj, mevcut şarjdan yüksek olmalı" : "Araç veya batarya bilgisi girin";
      renderCompare(null, current, target);
      return;
    }

    const energy = (battery * delta) / 100;
    const cost = price != null ? energy * price : null;
    const rangeAdded = consumption ? (energy / consumption) * 100 : null;
    const per100 = price != null && consumption ? price * consumption : null;

    setOutputs(energy, rangeAdded, per100, cost);
    if (els.costMeta) {
      els.costMeta.textContent =
        state.manual && price != null
          ? `${num(energy)} kWh × ${num(price, 2)} ₺ (manuel)`
          : state.tariff && state.operator
            ? `${state.operator.name} · ${state.tariff.label}`
            : "Tarife seçin";
    }
    renderCompare(energy, current, target);
  }

  function setOutputs(
    energy: number | null,
    range: number | null,
    per100: number | null,
    cost: number | null
  ): void {
    if (els.energy) els.energy.textContent = energy != null ? num(energy) : "—";
    if (els.range) els.range.textContent = range != null ? num(range, 0) : "—";
    if (els.per100) els.per100.textContent = per100 != null ? num(per100, 0) : "—";
    if (els.cost) els.cost.textContent = cost != null ? tl.format(cost) : "—";
  }

  /* ------------------------------------------------- karşılaştırma listesi */
  function renderCompare(energy: number | null, current: number, target: number): void {
    if (!els.compare) return;
    if (energy == null || !priceData) {
      els.compare.innerHTML =
        '<p class="calc__compare-empty">Karşılaştırma için araç ve şarj aralığı seçin.</p>';
      return;
    }

    const rows = priceData.operators
      .map((op) => {
        const cheapest = op.tariffs.reduce<ChargingTariff | null>(
          (min, t) => (min == null || t.pricePerKwh < min.pricePerKwh ? t : min),
          null
        );
        if (!cheapest) return null;
        return { op, tariff: cheapest, cost: energy * cheapest.pricePerKwh };
      })
      .filter((r): r is { op: ChargingOperator; tariff: ChargingTariff; cost: number } => r != null)
      .sort((a, b) => a.cost - b.cost);

    if (!rows.length) {
      els.compare.innerHTML =
        '<p class="calc__compare-empty">Operatör verisi bulunamadı.</p>';
      return;
    }

    const cheapestCost = rows[0].cost;
    const maxCost = rows[rows.length - 1].cost;
    els.compare.innerHTML = rows
      .map((r, i) => {
        const diff = r.cost - cheapestCost;
        const tag =
          i === 0
            ? '<span class="calc-row__tag calc-row__tag--best">En uygun</span>'
            : `<span class="calc-row__tag">+${tl.format(diff)}</span>`;
        const manual = r.op.source === "manual" ? '<span class="calc-row__manual">manuel</span>' : "";
        const pct = maxCost > 0 ? Math.max(8, Math.round((r.cost / maxCost) * 100)) : 100;
        return /* html */ `
          <div class="calc-row${i === 0 ? " is-best" : ""}">
            <span class="calc-row__rank">${i + 1}</span>
            <div class="calc-row__main">
              <span class="calc-row__name">${esc(r.op.name)}${manual}</span>
              <span class="calc-row__tariff">${esc(r.tariff.label)} · ${num(r.tariff.pricePerKwh, 2)} ₺/kWh</span>
              <span class="calc-row__bar"><i style="width:${pct}%"></i></span>
            </div>
            <div class="calc-row__right">
              <span class="calc-row__cost">${tl.format(r.cost)}</span>
              ${tag}
            </div>
          </div>`;
      })
      .join("");

    const sub = qsOpt<HTMLElement>("#calcCompareSub");
    if (sub) sub.textContent = `${current}% → ${target}% · en uygundan pahalıya`;
  }
}
