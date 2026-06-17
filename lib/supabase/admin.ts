import { createClient } from "@supabase/supabase-js";

function resolveSupabaseUrl(): string {
  const candidates = [
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_URL,
  ].filter(Boolean) as string[];

  for (const value of candidates) {
    if (value.startsWith("http://") || value.startsWith("https://")) {
      return value;
    }
  }

  throw new Error(
    "URL Supabase invalide. Définissez NEXT_PUBLIC_SUPABASE_URL avec l'URL du projet (ex: https://xxx.supabase.co), pas une clé API.",
  );
}

function resolveServiceRoleKey(): string {
  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY ??
    process.env.SUPABASE_SECRET_KEY;

  if (!key) {
    throw new Error(
      "Clé secrète Supabase manquante. Définissez SUPABASE_SERVICE_ROLE_KEY ou SUPABASE_SECRET_KEY.",
    );
  }

  return key;
}

export function createAdminClient() {
  const url = resolveSupabaseUrl();
  const serviceRoleKey = resolveServiceRoleKey();

  return createClient(url, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
