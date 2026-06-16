import { qsOpt } from "@/lib/dom";
import { reviews } from "@/data/reviews";
import type { Review } from "@/types";

const GAP = 22; // .reviews__track gap (px) — CSS ile eşleşmeli
const VISIBLE = 2; // aynı anda görünen sütun (her sütun 2 kart)

/** Müşteri yorumları — 2'li (2×2) kayan carousel (05 — Referanslar). */
export function initReviewsCarousel(): void {
  const grid = qsOpt<HTMLDivElement>("#reviewsGrid");
  const track = qsOpt<HTMLDivElement>("#reviewsTrack");
  if (!grid || !track) return;

  const nextBtn = qsOpt<HTMLButtonElement>("#rvNext");

  function starStr(s: number): string {
    const full = "★★★★★".slice(0, s);
    const off = 5 - s;
    return full + (off ? `<span class="star--off">${"★★★★★".slice(0, off)}</span>` : "");
  }

  function makeCard(r: Review): HTMLElement {
    const el = document.createElement("article");
    el.className = "rcard rcard--review";

    const top = document.createElement("div");
    top.className = "rcard__top";
    const reviewer = document.createElement("div");
    reviewer.className = "reviewer";
    const img = document.createElement("img");
    img.className = "avatar avatar--lg";
    img.src = r.img;
    img.alt = "Müşteri";
    img.loading = "lazy";
    const meta = document.createElement("div");
    const name = document.createElement("strong");
    name.textContent = r.n;
    const title = document.createElement("small");
    title.textContent = r.t;
    meta.append(name, title);
    reviewer.append(img, meta);
    top.append(reviewer);

    const stars = document.createElement("div");
    stars.className = "stars";
    stars.innerHTML = starStr(r.s);
    stars.setAttribute("aria-label", `${r.s}/5`);

    const quote = document.createElement("p");
    quote.className = "rcard__quote";
    quote.textContent = `“${r.q}”`;

    el.append(top, stars, quote);
    return el;
  }

  function makePair(a: Review, b: Review | undefined): HTMLElement {
    const pair = document.createElement("div");
    pair.className = "reviews__pair";
    pair.appendChild(makeCard(a));
    if (b) pair.appendChild(makeCard(b));
    return pair;
  }

  // Yorumları 2'şerli sütunlara böl
  const pairs: HTMLElement[] = [];
  for (let i = 0; i < reviews.length; i += 2) {
    pairs.push(makePair(reviews[i], reviews[i + 1]));
  }
  const realCount = pairs.length;
  if (!realCount) return;

  pairs.forEach((p) => track.appendChild(p));
  // Sonsuz döngü için baştaki sütunları sona klonla
  for (let i = 0; i < Math.min(VISIBLE, realCount); i++) {
    track.appendChild(pairs[i].cloneNode(true));
  }

  let index = 0;
  let step = 0; // bir sütunun kayma mesafesi (genişlik + gap)
  let timer: number | null = null;

  function measure(): void {
    const first = track!.firstElementChild as HTMLElement | null;
    step = first ? first.getBoundingClientRect().width + GAP : 0;
  }

  function apply(animate: boolean): void {
    track!.style.transition = animate
      ? "transform .55s cubic-bezier(.22,.61,.36,1)"
      : "none";
    track!.style.transform = `translate3d(${-index * step}px,0,0)`;
  }

  function next(): void {
    index += 1;
    apply(true);
  }

  track.addEventListener("transitionend", () => {
    if (index >= realCount) {
      index -= realCount;
      apply(false);
    }
  });

  function start(): void {
    timer = window.setInterval(next, 5000);
  }
  function stop(): void {
    if (timer !== null) {
      clearInterval(timer);
      timer = null;
    }
  }
  function advance(): void {
    next();
    stop();
    start();
  }

  if (nextBtn) nextBtn.addEventListener("click", advance);
  grid.addEventListener("mouseenter", stop);
  grid.addEventListener("mouseleave", start);
  window.addEventListener("resize", () => {
    measure();
    apply(false);
  });

  // Görseller yüklendikçe ölçüyü tazele (yükseklik/oturma değişebilir)
  measure();
  apply(false);
  window.requestAnimationFrame(() => {
    measure();
    apply(false);
  });

  start();
}
