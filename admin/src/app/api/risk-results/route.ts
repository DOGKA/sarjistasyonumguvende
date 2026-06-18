import { NextResponse, type NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import type { RiskAnswer } from "@/lib/types";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * Public risk testi sonuç gönderimi.
 * Halka açık site (Vite) bu uç noktaya POST eder; kayıt SERVICE_ROLE
 * istemcisiyle yapıldığından RLS'ye takılmaz.
 */

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

interface RiskPayload {
  name?: unknown;
  email?: unknown;
  score?: unknown;
  tier?: unknown;
  tier_label?: unknown;
  answers?: unknown;
  total_questions?: unknown;
}

function cleanAnswers(input: unknown): RiskAnswer[] {
  if (!Array.isArray(input)) return [];
  return input.slice(0, 100).map((a) => {
    const o = (a ?? {}) as Record<string, unknown>;
    return {
      section: typeof o.section === "string" ? o.section : "",
      question: typeof o.question === "string" ? o.question : "",
      answer: typeof o.answer === "string" ? o.answer : "",
      points: typeof o.points === "number" ? o.points : 0,
    };
  });
}

export async function POST(request: NextRequest) {
  if (!isSupabaseConfigured() || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return json({ error: "Sunucu yapılandırılmamış." }, 503);
  }

  let payload: RiskPayload;
  try {
    payload = (await request.json()) as RiskPayload;
  } catch {
    return json({ error: "Geçersiz JSON." }, 400);
  }

  const score = Number(payload.score);
  if (!Number.isFinite(score) || score < 0 || score > 100) {
    return json({ error: "Geçersiz skor." }, 400);
  }

  const name =
    typeof payload.name === "string" && payload.name.trim()
      ? payload.name.trim().slice(0, 200)
      : null;
  const email =
    typeof payload.email === "string" && payload.email.trim()
      ? payload.email.trim().slice(0, 200)
      : null;
  const tier = typeof payload.tier === "string" ? payload.tier.slice(0, 80) : null;
  const tierLabel =
    typeof payload.tier_label === "string"
      ? payload.tier_label.slice(0, 200)
      : null;
  const answers = cleanAnswers(payload.answers);
  const totalQuestions =
    typeof payload.total_questions === "number"
      ? payload.total_questions
      : answers.length || null;

  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from("risk_results")
    .insert({
      name,
      email,
      score: Math.round(score),
      tier,
      tier_label: tierLabel,
      answers,
      total_questions: totalQuestions,
    })
    .select("id")
    .single();

  if (error) {
    return json({ error: error.message }, 500);
  }

  // İç analitik olayı (best-effort; başarısız olsa da sonucu döndür)
  await supabase
    .from("page_events")
    .insert({ type: "quiz_complete", path: "/", meta: { score: Math.round(score), tier } });

  return json({ ok: true, id: data?.id ?? null }, 201);
}
