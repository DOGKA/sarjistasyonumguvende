"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import type { ChargingTariff, TariffType } from "@/lib/types";

const PRICE_MIN = 0.01;
const PRICE_MAX = 1000;

/** Form/JSON'dan gelen ham tarifeleri doğrular ve temizler. */
function sanitizeTariffs(raw: unknown): ChargingTariff[] {
  if (!Array.isArray(raw)) return [];
  const out: ChargingTariff[] = [];
  for (const item of raw) {
    const t = item as Partial<ChargingTariff>;
    const type: TariffType = t.type === "DC" ? "DC" : "AC";
    const price = Number(t.pricePerKwh);
    if (!Number.isFinite(price) || price < PRICE_MIN || price > PRICE_MAX) continue;
    const label = String(t.label ?? "").trim() || type;
    out.push({ type, label, pricePerKwh: Math.round(price * 100) / 100 });
  }
  return out;
}

async function requireUser() {
  const auth = await createClient();
  const {
    data: { user },
  } = await auth.auth.getUser();
  return user;
}

/** Bir operatör için tarife değerlerini kaydeder (statik JSON'un üzerine uygulanır). */
export async function saveOverride(input: {
  operatorId: string;
  name: string;
  tariffs: ChargingTariff[];
}) {
  const operatorId = String(input.operatorId ?? "").trim();
  if (!operatorId) return { error: "Operatör seçilmedi." };

  if (!(await requireUser())) return { error: "Oturum bulunamadı." };

  const tariffs = sanitizeTariffs(input.tariffs);
  if (!tariffs.length) {
    return { error: "En az bir geçerli tarife (AC/DC ve fiyat) girin." };
  }

  const admin = createAdminClient();
  const { error } = await admin.from("charging_overrides").upsert(
    {
      operator_id: operatorId,
      name: String(input.name ?? "").trim() || null,
      tariffs,
    },
    { onConflict: "operator_id" }
  );
  if (error) return { error: `Kayıt hatası: ${error.message}` };

  revalidatePath("/tarifeler");
  return { ok: true };
}

/** Bir operatörün elle girilen değerlerini siler (otomatik çekime döner). */
export async function resetOverride(operatorId: string) {
  const id = String(operatorId ?? "").trim();
  if (!id) return { error: "Operatör seçilmedi." };

  if (!(await requireUser())) return { error: "Oturum bulunamadı." };

  const admin = createAdminClient();
  const { error } = await admin.from("charging_overrides").delete().eq("operator_id", id);
  if (error) return { error: `Silme hatası: ${error.message}` };

  revalidatePath("/tarifeler");
  return { ok: true };
}
