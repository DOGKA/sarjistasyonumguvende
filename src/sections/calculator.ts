/** 05 — ŞARJ MALİYET HESAPLAYICI. İşlevsellik: features/calculator.ts */
export function renderCalculator(): string {
  // Sol kadranın boşluğuna (alt) yerleşen radyal ölçek çentikleri
  const dialTicks = Array.from({ length: 13 }, (_, i) => {
    const a = ((140 + (i / 12) * 260) * Math.PI) / 180;
    const r1 = 92;
    const r2 = i >= 9 ? 78 : 84;
    const x1 = (100 + r1 * Math.cos(a)).toFixed(1);
    const y1 = (100 + r1 * Math.sin(a)).toFixed(1);
    const x2 = (100 + r2 * Math.cos(a)).toFixed(1);
    const y2 = (100 + r2 * Math.sin(a)).toFixed(1);
    const cls = i >= 11 ? "hud__tick is-hot" : "hud__tick";
    return `<line class="${cls}" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" />`;
  }).join("");

  // Sağ "radyo" kadranının altındaki frekans (cetvel) çubukları —
  // yuvarlağın alt yarısını dolduran kavisli bir cetvel: kenarlara
  // doğru çubuklar kısalır, ortada uzar (daire şekline uyar).
  const freqCount = 31;
  const freqBars = Array.from({ length: freqCount }, (_, i) => {
    const t = (i / (freqCount - 1)) * 2 - 1; // -1 → +1 (kenarlar / merkez)
    const arc = Math.sqrt(Math.max(0, 1 - t * t)); // daire kavisi
    const tick = i % 4 === 0 ? 4 : 0; // her 4'te bir uzun çentik
    const h = (7 + arc * 22 + tick).toFixed(1);
    return `<span class="hud__freq-bar" style="height:${h}px"></span>`;
  }).join("");

  return /* html */ `
  <section class="calc" id="hesaplayici">
    <div class="container">
      <div class="section-head">
        <span class="eyebrow">05 &nbsp;·&nbsp; Maliyet Hesaplayıcı</span>
        <a href="/#harita" class="link-arrow">Şarj Haritası</a>
      </div>

      <div class="calc__head">
        <h2>EV Şarj Maliyeti<br />Hesaplayıcı</h2>
        <div class="calc__head-sub">
          <p>Aracınızı seçin, şarj aralığını belirleyin; operatörlere göre tahmini şarj maliyetini anında karşılaştırın.</p>
          <span class="calc__updated" id="calcUpdated">Fiyatlar yükleniyor…</span>
        </div>
      </div>

      <div class="calc__layout" id="calcRoot">
        <!-- SOL: KONTROLLER -->
        <div class="calc__controls">
          <div class="calc__field">
            <div class="calc__field-head">
              <span class="calc__label">Tüm markalar</span>
              <span class="calc__hint" id="calcBrandHint"></span>
            </div>
            <div class="calc__brands" id="calcBrands" role="tablist" aria-label="Araç markaları">
              <div class="calc__brands-skeleton">Markalar yükleniyor…</div>
            </div>
          </div>

          <div class="calc__field" id="calcModelField">
            <label class="calc__label" for="calcModel">Model</label>
            <div class="calc__select">
              <select id="calcModel" aria-label="Araç modeli">
                <option value="">Önce marka seçin</option>
              </select>
            </div>
            <p class="calc__spec" id="calcSpec"></p>
          </div>

          <div class="calc__field calc__manual" hidden id="calcManualFields">
            <div class="calc__manual-grid">
              <div>
                <label class="calc__label" for="calcManualBattery">Batarya (kWh)</label>
                <input class="calc__input" id="calcManualBattery" type="number" min="1" max="250" step="0.1" placeholder="örn. 75" />
              </div>
              <div>
                <label class="calc__label" for="calcManualCons">Tüketim (kWh/100km)</label>
                <input class="calc__input" id="calcManualCons" type="number" min="5" max="40" step="0.1" placeholder="örn. 16" />
              </div>
            </div>
          </div>

          <div class="calc__field">
            <div class="calc__toggle">
              <label class="calc__switch">
                <input type="checkbox" id="calcManualToggle" />
                <span class="calc__switch-track" aria-hidden="true"></span>
              </label>
              <span>Manuel giriş (özel batarya / fiyat)</span>
            </div>
          </div>

          <div class="calc__field">
            <div class="calc__sliders">
              <div class="calc__slider">
                <div class="calc__field-head">
                  <label class="calc__label" for="calcCurrent">Mevcut şarj</label>
                  <span class="calc__val" id="calcCurrentVal">20%</span>
                </div>
                <input type="range" id="calcCurrent" min="0" max="100" step="1" value="20" />
              </div>
              <div class="calc__slider">
                <div class="calc__field-head">
                  <label class="calc__label" for="calcTarget">Hedef şarj</label>
                  <span class="calc__val" id="calcTargetVal">80%</span>
                </div>
                <input type="range" id="calcTarget" min="0" max="100" step="1" value="80" />
              </div>
            </div>
          </div>

          <div class="calc__field calc__op-grid">
            <div>
              <label class="calc__label" for="calcOperator">Operatör</label>
              <div class="calc__select">
                <select id="calcOperator" aria-label="Şarj operatörü"></select>
              </div>
            </div>
            <div>
              <label class="calc__label" for="calcTariff">Tarife</label>
              <div class="calc__select">
                <select id="calcTariff" aria-label="Tarife kademesi"></select>
              </div>
            </div>
          </div>

          <div class="calc__field calc__manual-price" hidden id="calcManualPriceField">
            <label class="calc__label" for="calcManualPrice">Özel fiyat (₺/kWh)</label>
            <input class="calc__input" id="calcManualPrice" type="number" min="0" max="100" step="0.01" placeholder="örn. 9.99" />
          </div>
        </div>

        <!-- SAĞ: SONUÇ PANELİ (HUD) + KARŞILAŞTIRMA -->
        <aside class="calc__result">
          <div class="hud" aria-label="Şarj özeti">
            <!-- Üst durum şeridi -->
            <div class="hud__top">
              <div class="hud__top-stat">
                <span class="hud__top-label">Enerji</span>
                <span class="hud__top-num" id="calcEnergy">—</span>
                <span class="hud__top-unit">kWh</span>
              </div>
              <div class="hud__top-center">
                <span class="hud__cost-label">Tahmini Şarj Maliyeti</span>
                <span class="hud__cost-val" id="calcCost">—</span>
                <span class="hud__cost-meta" id="calcCostMeta">Araç ve tarife seçin</span>
              </div>
              <div class="hud__top-stat hud__top-stat--right">
                <span class="hud__top-num" id="calcPer100">—</span>
                <span class="hud__top-unit">₺/100 km</span>
              </div>
            </div>

            <!-- Gövde: sol kadran · orta yön · sağ kadran -->
            <div class="hud__body">
              <!-- SOL: hedef doluluk -->
              <div class="hud__dial">
                <svg class="hud__dial-svg" viewBox="0 0 200 200" aria-hidden="true">
                  <circle class="hud__dial-track" cx="100" cy="100" r="82"
                    transform="rotate(135 100 100)" stroke-dasharray="386.4 128.8" />
                  <circle class="hud__dial-prog" id="calcBatteryArc" cx="100" cy="100" r="82"
                    transform="rotate(135 100 100)" stroke-dasharray="0 515.2" />
                  <g class="hud__dial-ticks">${dialTicks}</g>
                </svg>
                <div class="hud__dial-center">
                  <span class="hud__dial-val" id="calcBatteryPct">80</span>
                  <span class="hud__dial-cap">hedef doluluk</span>
                </div>
              </div>

              <!-- ORTA: yön oku (3D) -->
              <div class="hud__nav" aria-hidden="true">
                <svg class="hud__nav-svg" viewBox="0 0 160 200" preserveAspectRatio="xMidYMax meet">
                  <defs>
                    <linearGradient id="hudRoad" x1="0" y1="1" x2="0" y2="0">
                      <stop offset="0" stop-color="#5ad11d" stop-opacity=".95" />
                      <stop offset=".55" stop-color="#62de1f" stop-opacity=".55" />
                      <stop offset="1" stop-color="#7dee2a" stop-opacity="0" />
                    </linearGradient>
                    <filter id="hudRoadBlur" x="-40%" y="-10%" width="180%" height="120%">
                      <feGaussianBlur stdDeviation="2.4" />
                    </filter>
                  </defs>
                  <!-- kenar perspektif çizgileri -->
                  <g class="hud__lanes">
                    <line x1="4" y1="200" x2="75" y2="4" />
                    <line x1="40" y1="200" x2="78" y2="4" />
                    <line x1="156" y1="200" x2="85" y2="4" />
                    <line x1="120" y1="200" x2="82" y2="4" />
                  </g>
                  <!-- yeşil yol -->
                  <polygon class="hud__road-poly" points="44,200 116,200 88,4 72,4" filter="url(#hudRoadBlur)" />
                  <!-- 3D ok: alt V kenarlarına bağlı yan duvarlar + üst yüzey -->
                  <g class="hud__arrow3d" transform="translate(80 102)">
                    <polygon class="hud__arrow-side" points="-34,28 0,12 0,21 -34,37" />
                    <polygon class="hud__arrow-side" points="0,12 34,28 34,37 0,21" />
                    <polygon class="hud__arrow-face" points="0,-38 34,28 0,12 -34,28" />
                  </g>
                </svg>
              </div>

              <!-- SAĞ: eklenen menzil -->
              <div class="hud__radio">
                <span class="hud__radio-label">Eklenen Menzil</span>
                <span class="hud__radio-val"><b id="calcRange">—</b><i>km</i></span>
                <div class="hud__freq is-off" id="calcRangeMeter" aria-hidden="true">
                  <div class="hud__freq-bars">${freqBars}</div>
                  <span class="hud__freq-needle" id="calcRangeNeedle"></span>
                </div>
              </div>
            </div>

            <!-- Alt rozetler -->
            <div class="hud__badges" aria-hidden="true">
              <span class="hud__limit">80</span>
              <span class="hud__gear">D</span>
            </div>
          </div>

          <div class="calc__compare">
            <div class="calc__compare-head">
              <h3>Operatör karşılaştırması</h3>
              <span class="calc__compare-sub" id="calcCompareSub">en uygundan pahalıya</span>
            </div>
            <div class="calc__compare-list" id="calcCompare">
              <p class="calc__compare-empty">Karşılaştırma için araç ve şarj aralığı seçin.</p>
            </div>
          </div>
        </aside>
      </div>

      <p class="calc__disclaimer">
        Hesaplamalar yaklaşık değerlerdir; gerçek maliyet sıcaklık, sürüş tarzı ve operatör kampanyalarına göre değişebilir.
        Tarifeler için her operatörün resmî sayfası esas alınmalıdır.
      </p>
    </div>
  </section>`;
}
