"use client";

import { useRef, useState, useTransition, useEffect } from "react";
import { useRouter } from "next/navigation";
import type { BlogPost, BlogPostInput, BlogStatus } from "@/lib/types";
import { slugify, estimateReadMin, htmlToText, postUrl } from "@/lib/blog";
import {
  createPost,
  updatePost,
  deletePost,
  isSlugAvailable,
  uploadBlogImage,
} from "./actions";

/* ------------------------------------------------------------------ sabitler */

const META_TITLE_MAX = 60;
const META_DESC_MAX = 160;

// Public sitedeki kategori sekmeleriyle (src/data/blog.ts → BLOG_CATEGORIES)
// aynı tutulmalıdır. Serbest metin alanıdır: listeden seçebilir veya yeni
// bir kategori yazabilirsiniz.
const CATEGORIES = [
  "Risk Yönetimi",
  "Sigorta Rehberleri",
  "İşletmeciler İçin",
  "Teknik Bilgiler",
  "Güncel ve SEO Odaklı",
  "Vaka Analizleri",
];

/* --------------------------------------------------------------- yardımcılar */

function cls(...xs: (string | false | undefined)[]) {
  return xs.filter(Boolean).join(" ");
}

/* ============================================================== ANA BILEŞEN */

export default function BlogEditor({ post }: { post?: BlogPost }) {
  const router = useRouter();
  const editing = Boolean(post);

  const [title, setTitle] = useState(post?.title ?? "");
  const [slug, setSlug] = useState(post?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(Boolean(post));
  const [category, setCategory] = useState(post?.category ?? "");
  const [author, setAuthor] = useState(post?.author ?? "");
  const [tags, setTags] = useState((post?.tags ?? []).join(", "));
  const [excerpt, setExcerpt] = useState(post?.excerpt ?? "");
  const [coverUrl, setCoverUrl] = useState(post?.cover_url ?? "");
  const [coverAlt, setCoverAlt] = useState(post?.cover_alt ?? "");
  const [content, setContent] = useState(post?.content ?? "");

  const [metaTitle, setMetaTitle] = useState(post?.meta_title ?? "");
  const [metaDescription, setMetaDescription] = useState(
    post?.meta_description ?? ""
  );
  const [metaKeywords, setMetaKeywords] = useState(post?.meta_keywords ?? "");
  const [canonical, setCanonical] = useState(post?.canonical_url ?? "");
  const [ogImage, setOgImage] = useState(post?.og_image_url ?? "");
  const [noindex, setNoindex] = useState(post?.noindex ?? false);

  const [tab, setTab] = useState<"edit" | "seo" | "preview" | "help">("edit");
  const [slugFree, setSlugFree] = useState<boolean | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  /* Slug'ı başlıktan otomatik üret (kullanıcı elle değiştirmediyse). */
  useEffect(() => {
    if (!slugTouched) setSlug(slugify(title));
  }, [title, slugTouched]);

  /* Slug benzersizlik kontrolü (debounce). */
  useEffect(() => {
    if (!slug) {
      setSlugFree(null);
      return;
    }
    const t = setTimeout(async () => {
      const res = await isSlugAvailable(slug, post?.id);
      setSlugFree(res.available);
    }, 400);
    return () => clearTimeout(t);
  }, [slug, post?.id]);

  const readMin = estimateReadMin(content);
  const wordCount = htmlToText(content).split(" ").filter(Boolean).length;

  function buildInput(status: BlogStatus): BlogPostInput {
    return {
      title,
      slug,
      category: category || null,
      excerpt: excerpt || null,
      content: content || null,
      cover_url: coverUrl || null,
      cover_alt: coverAlt || null,
      author: author || null,
      tags: tags.split(",").map((t) => t.trim()).filter(Boolean),
      status,
      read_min: readMin,
      meta_title: metaTitle || null,
      meta_description: metaDescription || null,
      meta_keywords: metaKeywords || null,
      canonical_url: canonical || null,
      og_image_url: ogImage || null,
      noindex,
    };
  }

  function save(status: BlogStatus) {
    setError(null);
    if (!title.trim()) {
      setError("Başlık zorunludur.");
      setTab("edit");
      return;
    }
    startTransition(async () => {
      const input = buildInput(status);
      const res = editing
        ? await updatePost(post!.id, input)
        : await createPost(input);
      if ("error" in res && res.error) {
        setError(res.error);
        return;
      }
      router.push("/blog");
      router.refresh();
    });
  }

  function remove() {
    if (!post) return;
    if (!confirm("Bu yazı kalıcı olarak silinsin mi?")) return;
    startTransition(async () => {
      const res = await deletePost(post.id);
      if ("error" in res && res.error) {
        setError(res.error);
        return;
      }
      router.push("/blog");
      router.refresh();
    });
  }

  return (
    <div className="flex flex-col">
      <PreviewStyles />

      {/* Üst bar */}
      <div className="sticky top-0 z-10 flex flex-wrap items-center justify-between gap-3 border-b border-[var(--border)] bg-[var(--background)]/90 px-8 py-4 backdrop-blur">
        <div className="min-w-0">
          <button
            onClick={() => router.push("/blog")}
            className="text-xs text-[var(--muted)] transition hover:text-[var(--foreground)]"
          >
            ← Blog listesi
          </button>
          <h1 className="truncate text-lg font-semibold">
            {editing ? "Yazıyı düzenle" : "Yeni yazı"}
          </h1>
        </div>
        <div className="flex items-center gap-2">
          {editing && (
            <button
              onClick={remove}
              disabled={pending}
              className="rounded-lg border border-red-200 px-3 py-2 text-sm text-red-600 transition hover:bg-red-50 disabled:opacity-60"
            >
              Sil
            </button>
          )}
          <button
            onClick={() => save("draft")}
            disabled={pending}
            className="rounded-lg border border-[var(--border)] px-4 py-2 text-sm transition hover:bg-[var(--surface-2)] disabled:opacity-60"
          >
            Taslak kaydet
          </button>
          <button
            onClick={() => save("published")}
            disabled={pending}
            className="rounded-lg bg-[var(--accent)] px-4 py-2 text-sm font-semibold text-[#06210f] transition hover:opacity-90 disabled:opacity-60"
          >
            {pending ? "Kaydediliyor…" : "Yayınla"}
          </button>
        </div>
      </div>

      {error && (
        <div className="mx-8 mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      )}

      {/* Sekmeler */}
      <div className="flex gap-1 px-8 pt-4">
        {([
          ["edit", "İçerik"],
          ["seo", "SEO"],
          ["preview", "Önizleme"],
          ["help", "Şablon & Rehber"],
        ] as const).map(([id, label]) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={cls(
              "rounded-t-lg px-4 py-2 text-sm transition",
              tab === id
                ? "bg-[var(--surface)] font-medium text-[var(--foreground)]"
                : "text-[var(--muted)] hover:text-[var(--foreground)]"
            )}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="grid gap-6 p-8 pt-4 lg:grid-cols-3">
        {/* SOL: aktif sekme */}
        <div className="lg:col-span-2">
          {tab === "edit" && (
            <EditTab
              title={title}
              setTitle={setTitle}
              excerpt={excerpt}
              setExcerpt={setExcerpt}
              content={content}
              setContent={setContent}
            />
          )}
          {tab === "seo" && (
            <SeoTab
              slug={slug}
              metaTitle={metaTitle}
              setMetaTitle={setMetaTitle}
              metaDescription={metaDescription}
              setMetaDescription={setMetaDescription}
              metaKeywords={metaKeywords}
              setMetaKeywords={setMetaKeywords}
              canonical={canonical}
              setCanonical={setCanonical}
              ogImage={ogImage}
              setOgImage={setOgImage}
              coverUrl={coverUrl}
              noindex={noindex}
              setNoindex={setNoindex}
              title={title}
              excerpt={excerpt}
            />
          )}
          {tab === "preview" && (
            <Preview
              title={title}
              category={category}
              author={author}
              readMin={readMin}
              coverUrl={coverUrl}
              coverAlt={coverAlt}
              excerpt={excerpt}
              content={content}
            />
          )}
          {tab === "help" && <TemplateHelp />}
        </div>

        {/* SAĞ: meta yan panel (her zaman görünür) */}
        <aside className="space-y-5">
          <Card title="Yayın bilgileri">
            <Labeled label="Slug (URL)" hint={postUrl(slug || "ornek-yazi")}>
              <input
                value={slug}
                onChange={(e) => {
                  setSlugTouched(true);
                  setSlug(slugify(e.target.value));
                }}
                placeholder="otomatik-uretilir"
                className="adm-input"
              />
              {slug && slugFree === false && (
                <p className="mt-1 text-xs text-amber-600">
                  Bu slug zaten kullanımda — kaydederken çakışır.
                </p>
              )}
              {slug && slugFree === true && (
                <p className="mt-1 text-xs text-emerald-600">Slug uygun.</p>
              )}
            </Labeled>

            <Labeled label="Kategori">
              <input
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                list="blog-categories"
                placeholder="örn. Rehber"
                className="adm-input"
              />
              <datalist id="blog-categories">
                {CATEGORIES.map((c) => (
                  <option key={c} value={c} />
                ))}
              </datalist>
            </Labeled>

            <Labeled label="Yazar (byline)">
              <input
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                placeholder="örn. Şarj İstasyonum Ekibi"
                className="adm-input"
              />
            </Labeled>

            <Labeled label="Etiketler" hint="Virgülle ayırın">
              <input
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                placeholder="şarj, sigorta, ev"
                className="adm-input"
              />
            </Labeled>

            <div className="flex justify-between border-t border-[var(--border)] pt-3 text-xs text-[var(--muted)]">
              <span>{wordCount} kelime</span>
              <span>~{readMin} dk okuma</span>
            </div>
          </Card>

          <Card title="Kapak görseli">
            <ImageField
              value={coverUrl}
              onChange={setCoverUrl}
              onError={setError}
            />
            {coverUrl && (
              <div className="mt-3 overflow-hidden rounded-lg border border-[var(--border)]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={coverUrl}
                  alt={coverAlt || "Kapak önizleme"}
                  className="aspect-[16/9] w-full object-cover"
                />
              </div>
            )}
            <Labeled label="Kapak alt metni (SEO)">
              <input
                value={coverAlt}
                onChange={(e) => setCoverAlt(e.target.value)}
                placeholder="Görseli betimleyen kısa metin"
                className="adm-input"
              />
            </Labeled>
          </Card>
        </aside>
      </div>
    </div>
  );
}

/* ===================================================== İÇERİK SEKMESİ */

function EditTab({
  title,
  setTitle,
  excerpt,
  setExcerpt,
  content,
  setContent,
}: {
  title: string;
  setTitle: (v: string) => void;
  excerpt: string;
  setExcerpt: (v: string) => void;
  content: string;
  setContent: (v: string) => void;
}) {
  return (
    <div className="space-y-5">
      <Card title="Başlık & Özet">
        <Labeled label="Başlık (H1)">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Yazı başlığı…"
            className="adm-input text-base font-medium"
          />
        </Labeled>
        <Labeled
          label="Özet (excerpt)"
          hint="Liste kartlarında ve arama sonuçlarında görünür"
        >
          <textarea
            value={excerpt}
            onChange={(e) => setExcerpt(e.target.value)}
            rows={3}
            placeholder="Yazının 1-2 cümlelik özeti…"
            className="adm-input resize-y"
          />
        </Labeled>
      </Card>

      <Card title="Gövde (zengin HTML)">
        <RichEditor html={content} onChange={setContent} />
      </Card>
    </div>
  );
}

/* ===================================================== ZENGIN HTML EDITÖR */

function RichEditor({
  html,
  onChange,
}: {
  html: string;
  onChange: (v: string) => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const [source, setSource] = useState(false);
  const [uploading, setUploading] = useState(false);

  /* İlk yüklemede / kaynak modundan dönüşte içeriği editöre bas. */
  useEffect(() => {
    if (!source && ref.current && ref.current.innerHTML !== html) {
      ref.current.innerHTML = html;
    }
  }, [source]); // eslint-disable-line react-hooks/exhaustive-deps

  function exec(cmd: string, value?: string) {
    ref.current?.focus();
    document.execCommand(cmd, false, value);
    sync();
  }

  function sync() {
    if (ref.current) onChange(ref.current.innerHTML);
  }

  function addLink() {
    const url = prompt("Bağlantı adresi (https://…):");
    if (url) exec("createLink", url);
  }

  async function pickImage(file: File) {
    setUploading(true);
    const fd = new FormData();
    fd.append("file", file);
    const res = await uploadBlogImage(fd);
    setUploading(false);
    if (res.url) {
      const figure = `<figure><img src="${res.url}" alt="" /><figcaption>Açıklama…</figcaption></figure><p><br/></p>`;
      exec("insertHTML", figure);
    } else {
      alert(res.error ?? "Görsel yüklenemedi");
    }
  }

  const tools: { label: string; title: string; run: () => void }[] = [
    { label: "B", title: "Kalın", run: () => exec("bold") },
    { label: "I", title: "İtalik", run: () => exec("italic") },
    { label: "U", title: "Altı çizili", run: () => exec("underline") },
    { label: "H2", title: "Başlık 2", run: () => exec("formatBlock", "<h2>") },
    { label: "H3", title: "Başlık 3", run: () => exec("formatBlock", "<h3>") },
    { label: "¶", title: "Paragraf", run: () => exec("formatBlock", "<p>") },
    { label: "“ ”", title: "Alıntı", run: () => exec("formatBlock", "<blockquote>") },
    { label: "• Liste", title: "Madde listesi", run: () => exec("insertUnorderedList") },
    { label: "1. Liste", title: "Sıralı liste", run: () => exec("insertOrderedList") },
    { label: "🔗", title: "Bağlantı", run: addLink },
    { label: "✕ format", title: "Biçimi temizle", run: () => exec("removeFormat") },
  ];

  return (
    <div className="rounded-lg border border-[var(--border)]">
      <div className="flex flex-wrap items-center gap-1 border-b border-[var(--border)] bg-[var(--surface-2)] p-2">
        {tools.map((t) => (
          <button
            key={t.label}
            type="button"
            title={t.title}
            onClick={t.run}
            className="rounded px-2 py-1 text-xs text-[var(--muted)] transition hover:bg-[var(--surface)] hover:text-[var(--foreground)]"
          >
            {t.label}
          </button>
        ))}
        <button
          type="button"
          title="Görsel ekle"
          onClick={() => fileRef.current?.click()}
          disabled={uploading}
          className="rounded px-2 py-1 text-xs text-[var(--muted)] transition hover:bg-[var(--surface)] hover:text-[var(--foreground)] disabled:opacity-60"
        >
          {uploading ? "Yükleniyor…" : "🖼 Görsel"}
        </button>
        <span className="mx-1 h-4 w-px bg-[var(--border)]" />
        <button
          type="button"
          onClick={() => setSource((s) => !s)}
          className={cls(
            "rounded px-2 py-1 text-xs transition",
            source
              ? "bg-[var(--accent)]/15 text-[var(--accent)]"
              : "text-[var(--muted)] hover:bg-[var(--surface)]"
          )}
        >
          {"</>"} HTML
        </button>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          hidden
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) void pickImage(f);
            e.target.value = "";
          }}
        />
      </div>

      {source ? (
        <textarea
          value={html}
          onChange={(e) => onChange(e.target.value)}
          rows={18}
          spellCheck={false}
          className="block w-full resize-y bg-[var(--background)] p-4 font-mono text-xs leading-relaxed text-[var(--foreground)] outline-none"
          placeholder="<p>HTML kaynağı…</p>"
        />
      ) : (
        <div
          ref={ref}
          contentEditable
          suppressContentEditableWarning
          onInput={sync}
          onBlur={sync}
          data-placeholder="Yazınızı buraya girin…"
          className="adm-prose min-h-[360px] p-4 outline-none"
        />
      )}
    </div>
  );
}

/* ===================================================== SEO SEKMESİ */

function SeoTab(props: {
  slug: string;
  metaTitle: string;
  setMetaTitle: (v: string) => void;
  metaDescription: string;
  setMetaDescription: (v: string) => void;
  metaKeywords: string;
  setMetaKeywords: (v: string) => void;
  canonical: string;
  setCanonical: (v: string) => void;
  ogImage: string;
  setOgImage: (v: string) => void;
  coverUrl: string;
  noindex: boolean;
  setNoindex: (v: boolean) => void;
  title: string;
  excerpt: string;
}) {
  const {
    slug, metaTitle, setMetaTitle, metaDescription, setMetaDescription,
    metaKeywords, setMetaKeywords, canonical, setCanonical, ogImage,
    setOgImage, coverUrl, noindex, setNoindex, title, excerpt,
  } = props;

  const effTitle = (metaTitle || title || "Başlıksız yazı").trim();
  const effDesc = (metaDescription || excerpt || "").trim();
  const effImg = ogImage || coverUrl;

  const issues = seoIssues({ title: effTitle, desc: effDesc, slug, img: effImg });

  return (
    <div className="space-y-5">
      <Card title="Arama motoru (Google) önizlemesi">
        <div className="rounded-lg border border-[var(--border)] bg-white p-4">
          <p className="truncate text-xs text-[#202124]">
            sarjistasyonumguvende.com › blog
          </p>
          <p className="truncate text-lg text-[#1a0dab]">
            {effTitle.slice(0, META_TITLE_MAX) ||
              "Yazı başlığı burada görünür"}
          </p>
          <p className="mt-0.5 line-clamp-2 text-sm text-[#4d5156]">
            {effDesc.slice(0, META_DESC_MAX) ||
              "Meta açıklama yazılmadığında özet kullanılır. Bu metin arama sonuçlarında görünür."}
          </p>
        </div>
      </Card>

      <Card title="Meta etiketleri">
        <Labeled
          label="Meta başlık"
          hint={`${effTitle.length}/${META_TITLE_MAX} karakter${
            metaTitle ? "" : " · boşsa yazı başlığı kullanılır"
          }`}
        >
          <input
            value={metaTitle}
            onChange={(e) => setMetaTitle(e.target.value)}
            maxLength={120}
            placeholder={title || "Aramada görünecek başlık"}
            className="adm-input"
          />
          <Meter value={effTitle.length} max={META_TITLE_MAX} />
        </Labeled>

        <Labeled
          label="Meta açıklama"
          hint={`${effDesc.length}/${META_DESC_MAX} karakter${
            metaDescription ? "" : " · boşsa özet kullanılır"
          }`}
        >
          <textarea
            value={metaDescription}
            onChange={(e) => setMetaDescription(e.target.value)}
            rows={3}
            maxLength={320}
            placeholder={excerpt || "Arama sonuçlarında görünecek açıklama"}
            className="adm-input resize-y"
          />
          <Meter value={effDesc.length} max={META_DESC_MAX} />
        </Labeled>

        <Labeled label="Anahtar kelimeler" hint="Virgülle ayırın">
          <input
            value={metaKeywords}
            onChange={(e) => setMetaKeywords(e.target.value)}
            placeholder="şarj istasyonu sigortası, ev şarj, ..."
            className="adm-input"
          />
        </Labeled>

        <Labeled
          label="Canonical URL"
          hint="Boşsa slug'dan otomatik üretilir"
        >
          <input
            value={canonical}
            onChange={(e) => setCanonical(e.target.value)}
            placeholder={postUrl(slug || "ornek-yazi")}
            className="adm-input"
          />
        </Labeled>
      </Card>

      <Card title="Sosyal paylaşım (Open Graph / Twitter)">
        <Labeled label="OG görsel URL" hint="Boşsa kapak görseli kullanılır">
          <input
            value={ogImage}
            onChange={(e) => setOgImage(e.target.value)}
            placeholder="https://… (1200×630 önerilir)"
            className="adm-input"
          />
        </Labeled>
        <div className="overflow-hidden rounded-lg border border-[var(--border)] bg-[var(--surface-2)]">
          {effImg ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={effImg}
              alt="OG önizleme"
              className="aspect-[1200/630] w-full object-cover"
            />
          ) : (
            <div className="grid aspect-[1200/630] w-full place-items-center text-xs text-[var(--muted)]">
              Görsel yok
            </div>
          )}
          <div className="border-t border-[var(--border)] p-3">
            <p className="text-[11px] uppercase text-[var(--muted)]">
              sarjistasyonumguvende.com
            </p>
            <p className="truncate text-sm font-medium">{effTitle}</p>
            <p className="line-clamp-2 text-xs text-[var(--muted)]">
              {effDesc}
            </p>
          </div>
        </div>
      </Card>

      <Card title="İndeksleme">
        <label className="flex items-center gap-3 text-sm">
          <input
            type="checkbox"
            checked={noindex}
            onChange={(e) => setNoindex(e.target.checked)}
            className="h-4 w-4 accent-[var(--accent)]"
          />
          <span>
            <span className="font-medium">noindex</span>
            <span className="ml-2 text-[var(--muted)]">
              Arama motorları bu yazıyı dizine eklemesin
            </span>
          </span>
        </label>
      </Card>

      <Card title="SEO kontrol listesi">
        <ul className="space-y-2 text-sm">
          {issues.map((i) => (
            <li key={i.label} className="flex items-start gap-2">
              <span className={i.ok ? "text-emerald-600" : "text-amber-600"}>
                {i.ok ? "✓" : "!"}
              </span>
              <span className={i.ok ? "" : "text-[var(--muted)]"}>
                {i.label}
              </span>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}

function seoIssues(p: { title: string; desc: string; slug: string; img: string }) {
  return [
    {
      label: "Meta başlık 30–60 karakter arasında",
      ok: p.title.length >= 30 && p.title.length <= META_TITLE_MAX,
    },
    {
      label: "Meta açıklama 70–160 karakter arasında",
      ok: p.desc.length >= 70 && p.desc.length <= META_DESC_MAX,
    },
    { label: "Slug tanımlı", ok: p.slug.length > 0 },
    { label: "Sosyal paylaşım görseli mevcut", ok: Boolean(p.img) },
  ];
}

/* ===================================================== ÖNİZLEME (şablon) */

function Preview(props: {
  title: string;
  category: string;
  author: string;
  readMin: number;
  coverUrl: string;
  coverAlt: string;
  excerpt: string;
  content: string;
}) {
  const today = new Date().toLocaleDateString("tr-TR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  return (
    <div className="rounded-xl border border-[var(--border)] bg-white text-[#1a1a1a]">
      <article className="adm-preview mx-auto max-w-2xl px-6 py-8">
        {props.category && (
          <span className="inline-block rounded-full bg-emerald-100 px-3 py-1 text-xs font-medium text-emerald-700">
            {props.category}
          </span>
        )}
        <h1 className="mt-3 text-3xl font-extrabold leading-tight">
          {props.title || "Yazı başlığı"}
        </h1>
        <p className="mt-2 text-sm text-gray-500">
          {props.author || "Yazar"} · {today} · {props.readMin} dk okuma
        </p>
        {props.coverUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={props.coverUrl}
            alt={props.coverAlt}
            className="mt-5 aspect-[16/9] w-full rounded-xl object-cover"
          />
        )}
        {props.excerpt && (
          <p className="mt-5 text-lg font-medium text-gray-700">
            {props.excerpt}
          </p>
        )}
        <div
          className="adm-prose adm-prose--light mt-5"
          dangerouslySetInnerHTML={{
            __html: props.content || "<p>İçerik henüz yok…</p>",
          }}
        />
      </article>
    </div>
  );
}

/* ===================================================== ŞABLON & REHBER */

function TemplateHelp() {
  return (
    <div className="space-y-5">
      <Card title="Blog şablonu nasıl çalışır?">
        <div className="space-y-3 text-sm leading-relaxed text-[var(--muted)]">
          <p>
            Her yazı public sitede{" "}
            <code className="adm-code">blog.html?p=SLUG</code> adresinde,
            aşağıdaki düzenle yayınlanır:
          </p>
          <ol className="ml-4 list-decimal space-y-1.5">
            <li>
              <b className="text-[var(--foreground)]">Kategori etiketi</b> — üstte
              küçük rozet.
            </li>
            <li>
              <b className="text-[var(--foreground)]">Başlık (H1)</b> — yazının
              ana başlığı. Sayfada tek H1 olur.
            </li>
            <li>
              <b className="text-[var(--foreground)]">Byline</b> — yazar · tarih ·
              okuma süresi (otomatik hesaplanır).
            </li>
            <li>
              <b className="text-[var(--foreground)]">Kapak görseli</b> — 16:9,
              alt metniyle birlikte.
            </li>
            <li>
              <b className="text-[var(--foreground)]">Özet</b> — giriş paragrafı
              olarak vurgulu gösterilir.
            </li>
            <li>
              <b className="text-[var(--foreground)]">Gövde (HTML)</b> — aşağıdaki
              etiketler stillenir.
            </li>
            <li>
              <b className="text-[var(--foreground)]">Paylaşım + Diğer yazılar</b>{" "}
              — otomatik eklenir.
            </li>
          </ol>
        </div>
      </Card>

      <Card title="Desteklenen HTML etiketleri">
        <div className="grid gap-2 text-sm sm:grid-cols-2">
          {[
            ["<h2>, <h3>", "Ara başlıklar"],
            ["<p>", "Paragraf"],
            ["<strong>, <em>", "Kalın / italik"],
            ["<ul>, <ol>, <li>", "Listeler"],
            ["<blockquote>", "Alıntı bloğu"],
            ["<a href>", "Bağlantı"],
            ["<figure><img><figcaption>", "Görsel + açıklama"],
            ["<table>", "Tablo (basit)"],
          ].map(([tag, desc]) => (
            <div
              key={tag}
              className="rounded-lg border border-[var(--border)] p-3"
            >
              <code className="adm-code">{tag}</code>
              <p className="mt-1 text-xs text-[var(--muted)]">{desc}</p>
            </div>
          ))}
        </div>
        <p className="mt-3 text-xs text-[var(--muted)]">
          İpucu: Araç çubuğundaki{" "}
          <code className="adm-code">{"</>"} HTML</code> düğmesiyle kaynağı elle
          düzenleyebilirsiniz.
        </p>
      </Card>

      <Card title="İyi SEO için öneriler">
        <ul className="ml-4 list-disc space-y-1.5 text-sm text-[var(--muted)]">
          <li>
            Anahtar kelimeyi <b className="text-[var(--foreground)]">başlıkta</b>,{" "}
            <b className="text-[var(--foreground)]">ilk paragrafta</b> ve en az bir{" "}
            <code className="adm-code">&lt;h2&gt;</code> içinde kullanın.
          </li>
          <li>Meta başlığı 60, açıklamayı 160 karakteri aşmayın.</li>
          <li>
            Her görsele <b className="text-[var(--foreground)]">alt metni</b>{" "}
            ekleyin.
          </li>
          <li>Slug kısa ve okunur olsun (3–6 kelime).</li>
          <li>
            Sosyal paylaşım için 1200×630 px bir{" "}
            <b className="text-[var(--foreground)]">OG görseli</b> belirleyin.
          </li>
          <li>İçeriği ara başlıklarla (H2/H3) bölün; uzun paragraflardan kaçının.</li>
        </ul>
      </Card>
    </div>
  );
}

/* ===================================================== ORTAK UI PARÇALARI */

function Card({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5">
      <h2 className="mb-4 text-sm font-semibold">{title}</h2>
      <div className="space-y-4">{children}</div>
    </section>
  );
}

function Labeled({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs text-[var(--muted)]">{label}</span>
      {children}
      {hint && <span className="mt-1 block text-[11px] text-[var(--muted)]">{hint}</span>}
    </label>
  );
}

function Meter({ value, max }: { value: number; max: number }) {
  const pct = Math.min(100, (value / max) * 100);
  const over = value > max;
  return (
    <div className="mt-1 h-1 w-full overflow-hidden rounded bg-[var(--surface-2)]">
      <div
        className={cls(
          "h-full transition-all",
          over ? "bg-amber-400" : "bg-[var(--accent)]"
        )}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

function ImageField({
  value,
  onChange,
  onError,
}: {
  value: string;
  onChange: (v: string) => void;
  onError: (v: string | null) => void;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  async function upload(file: File) {
    onError(null);
    setUploading(true);
    const fd = new FormData();
    fd.append("file", file);
    const res = await uploadBlogImage(fd);
    setUploading(false);
    if (res.url) onChange(res.url);
    else onError(res.error ?? "Görsel yüklenemedi");
  }

  return (
    <div className="space-y-2">
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Görsel URL yapıştırın veya yükleyin"
        className="adm-input"
      />
      <button
        type="button"
        onClick={() => fileRef.current?.click()}
        disabled={uploading}
        className="w-full rounded-lg border border-dashed border-[var(--border)] py-2 text-xs text-[var(--muted)] transition hover:bg-[var(--surface-2)] disabled:opacity-60"
      >
        {uploading ? "Yükleniyor…" : "↑ Bilgisayardan yükle"}
      </button>
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        hidden
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) void upload(f);
          e.target.value = "";
        }}
      />
    </div>
  );
}

/* ===================================================== GÖMÜLÜ STILLER */

function PreviewStyles() {
  return (
    <style>{`
      .adm-input{width:100%;border-radius:.5rem;border:1px solid var(--border);background:var(--background);padding:.5rem .75rem;font-size:.875rem;color:var(--foreground);outline:none}
      .adm-input:focus{border-color:var(--accent)}
      .adm-code{background:var(--surface-2);border-radius:.25rem;padding:.05rem .35rem;font-size:.8em;font-family:ui-monospace,monospace}
      .adm-prose{font-size:.95rem;line-height:1.7}
      .adm-prose:empty:before{content:attr(data-placeholder);color:var(--muted)}
      .adm-prose h2{font-size:1.4rem;font-weight:700;margin:1.4em 0 .5em}
      .adm-prose h3{font-size:1.15rem;font-weight:700;margin:1.2em 0 .4em}
      .adm-prose p{margin:0 0 1em}
      .adm-prose ul{list-style:disc;margin:0 0 1em;padding-left:1.4em}
      .adm-prose ol{list-style:decimal;margin:0 0 1em;padding-left:1.4em}
      .adm-prose li{margin:.25em 0}
      .adm-prose a{color:var(--accent-2);text-decoration:underline}
      .adm-prose blockquote{border-left:3px solid var(--accent);margin:1em 0;padding:.25em 1em;color:var(--muted);font-style:italic}
      .adm-prose img{max-width:100%;border-radius:.5rem}
      .adm-prose figure{margin:1.2em 0}
      .adm-prose figcaption{font-size:.8rem;color:var(--muted);margin-top:.4em;text-align:center}
      .adm-prose table{width:100%;border-collapse:collapse;margin:1em 0}
      .adm-prose th,.adm-prose td{border:1px solid var(--border);padding:.5em .75em;text-align:left}
      .adm-prose--light{color:#1a1a1a}
      .adm-prose--light a{color:#0b6b3a}
      .adm-prose--light blockquote{color:#555;border-left-color:#0b6b3a}
      .adm-prose--light figcaption{color:#777}
      .adm-prose--light th,.adm-prose--light td{border-color:#e5e5e5}
    `}</style>
  );
}
