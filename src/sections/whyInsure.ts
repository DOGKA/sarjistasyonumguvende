/** NEDEN SİGORTA? — açıklama + en sık karşılaşılan hasarlar istatistik kutusu. */
export function renderWhyInsure(): string {
  const damages = [
    {
      label: "Araç çarpması",
      level: 94,
      icon: /* html */ `<path d="M4 13l1.6-4.3A2 2 0 0 1 7.5 7.4h9a2 2 0 0 1 1.9 1.3L20 13v5h-2.2v-1.8H6.2V18H4v-5Z"/><circle cx="7.3" cy="15.2" r="1.1"/><circle cx="16.7" cy="15.2" r="1.1"/>`,
    },
    {
      label: "Elektronik kart arızaları",
      level: 82,
      icon: /* html */ `<rect x="7.5" y="7.5" width="9" height="9" rx="1.5"/><path d="M10 7.5V4.5M14 7.5V4.5M10 19.5v-3M14 19.5v-3M7.5 10H4.5M7.5 14H4.5M19.5 10h-3M19.5 14h-3"/>`,
    },
    {
      label: "Kablo hasarları",
      level: 71,
      icon: /* html */ `<path d="M9 7.2V3.5M15 7.2V3.5M7 7.2h10v3a5 5 0 0 1-10 0v-3ZM12 15.2V21"/>`,
    },
    {
      label: "Hırsızlık ve vandalizm",
      level: 63,
      icon: /* html */ `<path d="M12 3 5 6v5c0 4 3 6.5 7 8 4-1.5 7-4 7-8V6l-7-3Z"/><path d="M12 8.5v4M12 15.5h.01"/>`,
    },
    {
      label: "Yangın kaynaklı ekipman kayıpları",
      level: 55,
      icon: /* html */ `<path d="M12 3c.4 3-3.8 4.2-3.8 8.2A3.8 3.8 0 0 0 16 11.2c0-2-1.4-3-1.4-5 0 0-2.6 1-2.6-3.2Z"/>`,
    },
  ];

  return /* html */ `
  <section class="why" id="neden-sigorta">
    <div class="container why__inner">
      <div class="why__copy">
        <span class="eyebrow">Neden sigorta yaptırmalıyım?</span>
        <h2 class="why__title">Yatırımınızı Beklenmedik<br />Risklere Karşı Koruyun</h2>
        <p class="why__lead">Şarj istasyonlarınızı yangın, hırsızlık, araç çarpması, elektriksel hasarlar ve üçüncü şahıs sorumluluk risklerine karşı koruyun. Ev tipi, ticari ve hızlı şarj istasyonlarına özel sigorta çözümleriyle yatırımınızı güvence altına alın.</p>
      </div>

      <aside class="why__stat" aria-label="En sık karşılaşılan hasarlar">
        <div class="why__stat-head">
          <span class="why__stat-eyebrow">İstatistik</span>
          <h3 class="why__stat-title">Şarj istasyonlarında en sık karşılaşılan hasarlar</h3>
        </div>
        <ul class="why__stat-list">
          ${damages
            .map(
              (d) => /* html */ `
          <li class="why__stat-item">
            <span class="why__stat-icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">${d.icon}</svg>
            </span>
            <div class="why__stat-body">
              <span class="why__stat-label">${d.label}</span>
              <span class="why__stat-bar"><i style="width:${d.level}%"></i></span>
            </div>
          </li>`,
            )
            .join("")}
        </ul>
      </aside>
    </div>
  </section>`;
}
