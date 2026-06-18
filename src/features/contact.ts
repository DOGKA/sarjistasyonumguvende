import { qsOpt } from "@/lib/dom";
import { getSupabase } from "@/lib/supabase";
import { CONTACT_API_URL } from "@/config";
import { trackEvent } from "@/features/analytics";

const MAX_FILE_BYTES = 2 * 1024 * 1024; // 2 MB

/** İnsan okunur dosya boyutu ("1,4 MB"). */
function formatSize(bytes: number): string {
  const mb = bytes / (1024 * 1024);
  if (mb >= 1) return `${mb.toLocaleString("tr-TR", { maximumFractionDigits: 1 })} MB`;
  const kb = bytes / 1024;
  return `${kb.toLocaleString("tr-TR", { maximumFractionDigits: 0 })} KB`;
}

/**
 * İletişim formu (iletisim.html).
 * Alanları doğrular, en fazla 2 MB belge ekine izin verir ve
 * gönderimde geri bildirim gösterir (sunucu entegrasyonu için hazır iskele).
 */
export function initContact(): void {
  const form = qsOpt<HTMLFormElement>("#contactForm");
  if (!form) return;

  const file = qsOpt<HTMLInputElement>("#cfFile");
  const fileText = qsOpt<HTMLElement>("#cfFileText");
  const fileDrop = qsOpt<HTMLElement>("#cfFileDrop");
  const fileClear = qsOpt<HTMLButtonElement>("#cfFileClear");
  const status = qsOpt<HTMLElement>("#cfStatus");
  const submit = qsOpt<HTMLButtonElement>("#cfSubmit");

  const defaultFileText = fileText?.textContent ?? "Dosya seçin veya buraya sürükleyin";

  function setStatus(msg: string, kind: "" | "ok" | "error"): void {
    if (!status) return;
    status.textContent = msg;
    status.dataset.kind = kind;
  }

  function resetFile(): void {
    if (file) file.value = "";
    if (fileText) fileText.textContent = defaultFileText;
    fileDrop?.classList.remove("has-file", "is-invalid");
    if (fileClear) fileClear.hidden = true;
  }

  /** Seçilen dosyayı doğrular; geçersizse temizler ve false döner. */
  function validateFile(): boolean {
    const picked = file?.files?.[0];
    if (!picked) {
      resetFile();
      return true;
    }
    if (picked.size > MAX_FILE_BYTES) {
      fileDrop?.classList.add("is-invalid");
      if (fileText) fileText.textContent = `Dosya çok büyük (${formatSize(picked.size)}) — en fazla 2 MB`;
      if (fileClear) fileClear.hidden = false;
      setStatus("Eklenen belge 2 MB sınırını aşıyor. Lütfen daha küçük bir dosya seçin.", "error");
      return false;
    }
    fileDrop?.classList.remove("is-invalid");
    fileDrop?.classList.add("has-file");
    if (fileText) fileText.textContent = `${picked.name} · ${formatSize(picked.size)}`;
    if (fileClear) fileClear.hidden = false;
    return true;
  }

  file?.addEventListener("change", () => {
    if (validateFile()) setStatus("", "");
  });

  fileClear?.addEventListener("click", () => {
    resetFile();
    setStatus("", "");
  });

  // Sürükle-bırak desteği
  if (fileDrop && file) {
    ["dragenter", "dragover"].forEach((ev) =>
      fileDrop.addEventListener(ev, (e) => {
        e.preventDefault();
        fileDrop.classList.add("is-drag");
      })
    );
    ["dragleave", "drop"].forEach((ev) =>
      fileDrop.addEventListener(ev, (e) => {
        e.preventDefault();
        fileDrop.classList.remove("is-drag");
      })
    );
    fileDrop.addEventListener("drop", (e) => {
      const dt = (e as DragEvent).dataTransfer;
      if (dt?.files?.length) {
        file.files = dt.files;
        if (validateFile()) setStatus("", "");
      }
    });
  }

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    if (!form.checkValidity()) {
      form.reportValidity();
      setStatus("Lütfen zorunlu alanları (*) eksiksiz doldurun.", "error");
      return;
    }
    if (!validateFile()) return;

    if (submit) submit.disabled = true;
    setStatus("Talebiniz gönderiliyor…", "");

    void submitForm()
      .then(() => {
        form.reset();
        resetFile();
        trackEvent("contact_submit");
        setStatus(
          "Teşekkürler! Talebiniz alındı, en kısa sürede dönüş yapacağız.",
          "ok"
        );
      })
      .catch(() => {
        setStatus(
          "Üzgünüz, talebiniz gönderilemedi. Lütfen daha sonra tekrar deneyin.",
          "error"
        );
      })
      .finally(() => {
        if (submit) submit.disabled = false;
      });
  });

  /** Formu kaydeder: önce admin API, yoksa Supabase, o da yoksa simüle eder. */
  async function submitForm(): Promise<void> {
    const data = new FormData(form!);
    const name = String(data.get("name") ?? "").trim();
    const email = String(data.get("email") ?? "").trim();
    const phone = String(data.get("phone") ?? "").trim();
    const subject = String(data.get("subject") ?? "").trim();
    const message = String(data.get("message") ?? "").trim();
    const picked = file?.files?.[0];

    // 1) Tercih: admin sunucu API'si (service role; RLS'ye takılmaz)
    if (CONTACT_API_URL) {
      const payload = new FormData();
      payload.set("name", name);
      payload.set("email", email);
      payload.set("phone", phone);
      payload.set("subject", subject);
      payload.set("message", message);
      if (picked) payload.set("file", picked);

      const res = await fetch(CONTACT_API_URL, {
        method: "POST",
        body: payload,
      });
      if (!res.ok) throw new Error(`Sunucu hatası (${res.status})`);
      return;
    }

    // 2) Geri düşüş: doğrudan Supabase (anon). RLS insert politikası gerekir.
    const supabase = getSupabase();
    if (!supabase) {
      // Yapılandırma yoksa eski davranış: kısa bir gecikmeyle başarı.
      await new Promise((r) => window.setTimeout(r, 700));
      return;
    }

    // Belge eki varsa Storage'a yükle
    let fileUrl: string | null = null;
    let fileName: string | null = null;
    if (picked) {
      const safeName = picked.name.replace(/[^\w.\-]+/g, "_");
      const path = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}-${safeName}`;
      const up = await supabase.storage
        .from("contact-files")
        .upload(path, picked, { upsert: false });
      if (up.error) throw up.error;
      fileUrl = up.data.path;
      fileName = picked.name;
    }

    const { error } = await supabase.from("contact_submissions").insert({
      name,
      email,
      phone: phone || null,
      subject: subject || null,
      message,
      file_url: fileUrl,
      file_name: fileName,
    });
    if (error) throw error;

    void supabase
      .from("page_events")
      .insert({ type: "contact_submit", path: location.pathname });
  }
}
