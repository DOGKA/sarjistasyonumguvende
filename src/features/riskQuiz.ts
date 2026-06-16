import { esc, qsOpt, prefersReducedMotion } from "@/lib/dom";
import { quizSections, quizIntroLines, quizResultTiers } from "@/data/quiz";
import type { QuizOption, QuizResultTier } from "@/types";
import { createRiskBackground } from "./riskBackground";

interface FlatQuestion {
  section: number;
  q: string;
  o: QuizOption[];
}

/** Risk Testi — interaktif test (intro → quiz → lead → sonuç). */
export function initRiskQuiz(): void {
  const overlay = qsOpt<HTMLDivElement>("#quizOverlay");
  const startBtn = qsOpt<HTMLButtonElement>("#riskStart");
  const stage = qsOpt<HTMLDivElement>("#quizStage");
  if (!overlay || !startBtn || !stage) return;

  const closeBtn = qsOpt<HTMLButtonElement>("#quizClose");
  const progressLabel = qsOpt<HTMLElement>("#quizProgressLabel");
  const reduced = prefersReducedMotion();

  // Soruları düz listeye çevir (puanlama ve ilerleme için)
  const flat: FlatQuestion[] = [];
  quizSections.forEach((s, si) => {
    s.questions.forEach((qq) => flat.push({ section: si, q: qq.q, o: qq.o }));
  });
  const TOTAL = flat.length; // 20
  const KEYS = "abcdefgh";

  let answers: number[] = [];
  let current = 0;
  const lead = { name: "", email: "" };

  // ----------------------------------------------------------- ARKA PLAN
  const launcherBg = createRiskBackground(qsOpt<HTMLCanvasElement>("#riskLauncherBg"));
  const launcherSection = qsOpt<HTMLElement>("#risk-testi");
  if ("IntersectionObserver" in window && launcherSection) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        if (en.isIntersecting) launcherBg.start();
        else launcherBg.stop();
      });
    }, { threshold: 0.05 });
    io.observe(launcherSection);
  } else {
    launcherBg.start();
  }
  const quizBg = createRiskBackground(qsOpt<HTMLCanvasElement>("#quizBg"));

  // ----------------------------------------------------------- RENDER
  function setProgress(text: string): void {
    if (progressLabel) progressLabel.textContent = text || "";
  }

  function renderIntro(done: () => void): void {
    setProgress("");
    if (reduced) {
      done();
      return;
    }
    stage!.innerHTML = '<div class="quiz-intro"></div>';
    const wrap = stage!.firstChild as HTMLElement;
    let i = 0;
    const next = (): void => {
      if (i >= quizIntroLines.length) {
        done();
        return;
      }
      const el = document.createElement("p");
      el.className = "quiz-intro__line";
      el.innerHTML = quizIntroLines[i];
      wrap.innerHTML = "";
      wrap.appendChild(el);
      requestAnimationFrame(() => el.classList.add("is-in"));
      window.setTimeout(() => {
        el.classList.remove("is-in");
        el.classList.add("is-out");
      }, 1700);
      window.setTimeout(() => {
        i++;
        next();
      }, 2300);
    };
    next();
  }

  function renderQuestion(): void {
    const item = flat[current];
    const sec = quizSections[item.section];
    const pct = (item.section + 1) * 20;
    setProgress(`Bölüm ${item.section + 1}/5 — ${sec.name} · %${pct}`);

    let stepsHtml = "";
    for (let si = 0; si < quizSections.length; si++) {
      let cls = "quiz-step";
      if (si < item.section) cls += " is-done";
      else if (si === item.section) cls += " is-active";
      stepsHtml += `<div class="${cls}">${si + 1}</div>`;
    }

    const optsHtml = item.o
      .map((opt, oi) => {
        const selected = answers[current] === oi ? " is-selected" : "";
        return `<button type="button" class="quiz-option${selected}" data-oi="${oi}">` +
          `<span class="quiz-option__key">${KEYS[oi]}</span>${esc(opt[0])}</button>`;
      })
      .join("");

    stage!.innerHTML =
      '<div class="quiz-panel">' +
        `<div class="quiz-steps">${stepsHtml}</div>` +
        '<div class="quiz-body">' +
          `<span class="quiz-section-tag">Soru ${current + 1} / ${TOTAL}</span>` +
          `<h3 class="quiz-question">${item.q}</h3>` +
          `<div class="quiz-options">${optsHtml}</div>` +
          '<div class="quiz-nav">' +
            `<button type="button" class="quiz-back"${current === 0 ? " hidden" : ""}>← Geri</button>` +
          "</div>" +
        "</div>" +
      "</div>";

    stage!.querySelectorAll<HTMLButtonElement>(".quiz-option").forEach((b) => {
      b.addEventListener("click", () => {
        answers[current] = parseInt(b.getAttribute("data-oi") ?? "0", 10);
        b.classList.add("is-selected");
        window.setTimeout(() => {
          if (current < TOTAL - 1) {
            current++;
            renderQuestion();
          } else {
            renderLead();
          }
        }, 220);
      });
    });

    const back = stage!.querySelector<HTMLButtonElement>(".quiz-back");
    if (back) {
      back.addEventListener("click", () => {
        if (current > 0) {
          current--;
          renderQuestion();
        }
      });
    }
  }

  function renderLead(): void {
    setProgress("Sonuç · Son adım");
    stage!.innerHTML =
      '<div class="quiz-lead">' +
        "<h3>Skorunuz hazır.</h3>" +
        "<p>Kişiselleştirilmiş risk skorunuzu görüntülemek için bilgilerinizi girin.</p>" +
        '<form class="quiz-lead__form" id="quizLeadForm" novalidate>' +
          '<div><label for="qlName">Ad Soyad</label>' +
          `<input type="text" id="qlName" name="name" placeholder="Adınız Soyadınız" value="${esc(lead.name)}" autocomplete="name" /></div>` +
          '<div><label for="qlEmail">E-posta</label>' +
          `<input type="email" id="qlEmail" name="email" placeholder="ornek@firma.com" value="${esc(lead.email)}" autocomplete="email" /></div>` +
          '<div class="quiz-lead__error" id="qlError"></div>' +
          '<button type="submit" class="quiz-lead__submit">Skorumu Göster</button>' +
          '<p class="quiz-lead__hint">Bilgileriniz yalnızca size dönüş yapmak için kullanılır.</p>' +
        "</form>" +
      "</div>";

    const form = stage!.querySelector<HTMLFormElement>("#quizLeadForm");
    const err = stage!.querySelector<HTMLElement>("#qlError");
    if (!form || !err) return;

    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const nameInput = form.elements.namedItem("name") as HTMLInputElement;
      const emailInput = form.elements.namedItem("email") as HTMLInputElement;
      const name = nameInput.value.trim();
      const email = emailInput.value.trim();
      if (name.length < 2) {
        err.textContent = "Lütfen adınızı girin.";
        nameInput.focus();
        return;
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        err.textContent = "Lütfen geçerli bir e-posta girin.";
        emailInput.focus();
        return;
      }
      lead.name = name;
      lead.email = email;
      renderResult();
    });
  }

  function computeScore(): number {
    let total = 0;
    flat.forEach((item, i) => {
      const oi = answers[i];
      if (typeof oi === "number" && item.o[oi]) total += item.o[oi][1];
    });
    return Math.round((total / (TOTAL * 5)) * 100);
  }

  function resultFor(score: number): QuizResultTier {
    for (const tier of quizResultTiers) {
      if (score >= tier.min) return tier;
    }
    return quizResultTiers[quizResultTiers.length - 1];
  }

  function renderResult(): void {
    const score = computeScore();
    const r = resultFor(score);
    setProgress("");
    stage!.innerHTML =
      `<div class="quiz-result ${r.cls}">` +
        `<div class="quiz-result__badge">${r.emoji}</div>` +
        `<div class="quiz-result__score">${score}<small>/100</small></div>` +
        `<div class="quiz-result__label">${esc(r.label)}</div>` +
        `<p class="quiz-result__desc">${esc(r.desc)}</p>` +
        '<div class="quiz-result__bar"><i style="width:0%;background:currentColor;"></i></div>' +
        '<div class="quiz-result__actions">' +
          '<a class="quiz-result__cta" href="#iletisim">Teklif Al</a>' +
          '<button type="button" class="quiz-result__retry">Testi Tekrarla</button>' +
        "</div>" +
      "</div>";

    const bar = stage!.querySelector<HTMLElement>(".quiz-result__bar i");
    if (bar) requestAnimationFrame(() => (bar.style.width = `${score}%`));

    const cta = stage!.querySelector<HTMLAnchorElement>(".quiz-result__cta");
    if (cta) cta.addEventListener("click", () => closeQuiz());
    const retry = stage!.querySelector<HTMLButtonElement>(".quiz-result__retry");
    if (retry) {
      retry.addEventListener("click", () => {
        answers = [];
        current = 0;
        renderIntro(renderQuestion);
      });
    }
  }

  // ----------------------------------------------------------- AÇ / KAPAT
  function openQuiz(): void {
    answers = [];
    current = 0;
    overlay!.classList.add("is-open");
    overlay!.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
    quizBg.start();
    renderIntro(renderQuestion);
  }

  function closeQuiz(): void {
    overlay!.classList.remove("is-open");
    overlay!.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
    quizBg.stop();
  }

  startBtn.addEventListener("click", openQuiz);
  if (closeBtn) closeBtn.addEventListener("click", closeQuiz);
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && overlay!.classList.contains("is-open")) closeQuiz();
  });
}
