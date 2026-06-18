import { NextResponse, type NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * Public iletişim formu gönderimi.
 * Halka açık site (Vite) bu uç noktaya POST eder; kayıt SERVICE_ROLE
 * istemcisiyle yapıldığından RLS'ye takılmaz. Belge eki (multipart) varsa
 * sunucu tarafında `contact-files` bucket'ına yüklenir.
 */

const MAX_FILE_BYTES = 2 * 1024 * 1024; // 2 MB

const CORS_HEADERS: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
  "Access-Control-Max-Age": "86400",
};

function json(body: unknown, status = 200) {
  return NextResponse.json(body, { status, headers: CORS_HEADERS });
}

export function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS_HEADERS });
}

function str(value: unknown, max: number): string {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

export async function POST(request: NextRequest) {
  if (!isSupabaseConfigured() || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return json({ error: "Sunucu yapılandırılmamış." }, 503);
  }

  let name = "";
  let email = "";
  let phone = "";
  let subject = "";
  let message = "";
  let file: File | null = null;

  const contentType = request.headers.get("content-type") ?? "";

  try {
    if (contentType.includes("multipart/form-data")) {
      const form = await request.formData();
      name = str(form.get("name"), 200);
      email = str(form.get("email"), 200);
      phone = str(form.get("phone"), 60);
      subject = str(form.get("subject"), 200);
      message = str(form.get("message"), 5000);
      const f = form.get("file");
      if (f instanceof File && f.size > 0) file = f;
    } else {
      const body = (await request.json()) as Record<string, unknown>;
      name = str(body.name, 200);
      email = str(body.email, 200);
      phone = str(body.phone, 60);
      subject = str(body.subject, 200);
      message = str(body.message, 5000);
    }
  } catch {
    return json({ error: "Geçersiz istek." }, 400);
  }

  if (!name || !email || !message) {
    return json({ error: "Zorunlu alanlar eksik." }, 400);
  }

  const supabase = createAdminClient();

  let fileUrl: string | null = null;
  let fileName: string | null = null;
  if (file) {
    if (file.size > MAX_FILE_BYTES) {
      return json({ error: "Dosya 2 MB sınırını aşıyor." }, 400);
    }
    const safeName = file.name.replace(/[^\w.\-]+/g, "_");
    const path = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}-${safeName}`;
    const buffer = Buffer.from(await file.arrayBuffer());
    const up = await supabase.storage
      .from("contact-files")
      .upload(path, buffer, {
        upsert: false,
        contentType: file.type || "application/octet-stream",
      });
    if (up.error) {
      return json({ error: up.error.message }, 500);
    }
    fileUrl = up.data.path;
    fileName = file.name;
  }

  const { data, error } = await supabase
    .from("contact_submissions")
    .insert({
      name,
      email,
      phone: phone || null,
      subject: subject || null,
      message,
      file_url: fileUrl,
      file_name: fileName,
    })
    .select("id")
    .single();

  if (error) {
    return json({ error: error.message }, 500);
  }

  // İç analitik olayı (best-effort)
  await supabase
    .from("page_events")
    .insert({ type: "contact_submit", path: "/iletisim" });

  return json({ ok: true, id: data?.id ?? null }, 201);
}
