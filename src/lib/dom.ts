/** HTML kaçışı — kullanıcı/dış kaynaklı metinleri innerHTML'e basmadan önce. */
export function esc(value: unknown): string {
  return String(value == null ? "" : value).replace(/[&<>"]/g, (c) => {
    return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c] as string;
  });
}

/** Tip güvenli querySelector (bulunamazsa hata fırlatır). */
export function qs<T extends Element = HTMLElement>(
  selector: string,
  root: ParentNode = document
): T {
  const el = root.querySelector<T>(selector);
  if (!el) throw new Error(`Element bulunamadı: ${selector}`);
  return el;
}

/** Tip güvenli querySelector (bulunamazsa null). */
export function qsOpt<T extends Element = HTMLElement>(
  selector: string,
  root: ParentNode = document
): T | null {
  return root.querySelector<T>(selector);
}

/** querySelectorAll sonucunu diziye çevirir. */
export function qsa<T extends Element = HTMLElement>(
  selector: string,
  root: ParentNode = document
): T[] {
  return Array.from(root.querySelectorAll<T>(selector));
}

export function prefersReducedMotion(): boolean {
  return !!window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}
