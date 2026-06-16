import { qsOpt } from "@/lib/dom";
import { reviews } from "@/data/reviews";

/** Müşteri yorumları carousel (05 — Referanslar). */
export function initReviewsCarousel(): void {
  const grid = qsOpt<HTMLDivElement>("#reviewsGrid");
  if (!grid) return;

  const review = grid.querySelector<HTMLElement>(".rcard--review");
  const mini = qsOpt<HTMLElement>("#rvMini");
  const avatar = qsOpt<HTMLImageElement>("#rvAvatar");
  const name = qsOpt<HTMLElement>("#rvName");
  const title = qsOpt<HTMLElement>("#rvTitle");
  const stars = qsOpt<HTMLElement>("#rvStars");
  const quote = qsOpt<HTMLElement>("#rvQuote");
  const miniName = qsOpt<HTMLElement>("#rvMiniName");
  const miniTitle = qsOpt<HTMLElement>("#rvMiniTitle");
  const miniAvatar = qsOpt<HTMLImageElement>("#rvMiniAvatar");
  const nextBtn = qsOpt<HTMLButtonElement>("#rvNext");

  if (!review || !mini || !avatar || !name || !title || !stars || !quote ||
      !miniName || !miniTitle || !miniAvatar) {
    return;
  }

  const total = reviews.length;
  let index = 0;
  let timer: number | null = null;

  function starStr(s: number): string {
    const full = "★★★★★".slice(0, s);
    const off = 5 - s;
    return full + (off ? `<span class="star--off">${"★★★★★".slice(0, off)}</span>` : "");
  }

  function paint(): void {
    const c = reviews[index];
    const nx = reviews[(index + 1) % total];
    avatar!.src = c.img;
    name!.textContent = c.n;
    title!.textContent = c.t;
    stars!.innerHTML = starStr(c.s);
    stars!.setAttribute("aria-label", `${c.s}/5`);
    quote!.textContent = `“${c.q}”`;
    miniName!.textContent = nx.n;
    miniTitle!.textContent = nx.t;
    miniAvatar!.src = nx.img;
  }

  function go(i: number): void {
    index = (i + total) % total;
    review!.classList.add("is-fading");
    mini!.classList.add("is-fading");
    window.setTimeout(() => {
      paint();
      review!.classList.remove("is-fading");
      mini!.classList.remove("is-fading");
    }, 320);
  }

  function start(): void {
    timer = window.setInterval(() => go(index + 1), 5000);
  }
  function stop(): void {
    if (timer !== null) {
      clearInterval(timer);
      timer = null;
    }
  }

  if (nextBtn) nextBtn.addEventListener("click", () => { go(index + 1); stop(); start(); });
  mini.addEventListener("click", () => { go(index + 1); stop(); start(); });
  grid.addEventListener("mouseenter", stop);
  grid.addEventListener("mouseleave", start);

  paint();
  start();
}
