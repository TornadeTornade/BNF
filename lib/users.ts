import type { SupabaseClient } from "@supabase/supabase-js";

export type User = {
  id: string;
  pseudo: string;
  solde: number;
  cle_secrete: string;
};

export async function getUserByCleSecrete(
  supabase: SupabaseClient,
  cle_secrete: string,
): Promise<User | null> {
  const { data, error } = await supabase
    .from("users")
    .select("id, pseudo, solde, cle_secrete")
    .eq("cle_secrete", cle_secrete)
    .single();

  if (error || !data) {
    return null;
  }

  return data;
}
