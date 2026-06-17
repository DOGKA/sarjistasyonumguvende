"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export interface LoginState {
  error?: string;
}

/** E-posta + şifre ile admin girişi. */
export async function login(
  _prev: LoginState,
  formData: FormData
): Promise<LoginState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const redirectTo = String(formData.get("redirect") ?? "/dashboard");

  if (!email || !password) {
    return { error: "E-posta ve şifre zorunludur." };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    return { error: "Giriş başarısız. E-posta veya şifre hatalı." };
  }

  redirect(redirectTo.startsWith("/") ? redirectTo : "/dashboard");
}
