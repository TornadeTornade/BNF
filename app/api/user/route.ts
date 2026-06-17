import { randomBytes } from "crypto";
import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

const INITIAL_BALANCE = 100;

export async function POST(request: Request) {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Corps de requête JSON invalide" },
      { status: 400 },
    );
  }

  if (!body || typeof body !== "object") {
    return NextResponse.json(
      { error: "Corps de requête invalide" },
      { status: 400 },
    );
  }

  const { pseudo } = body as Record<string, unknown>;

  if (typeof pseudo !== "string" || pseudo.trim().length === 0) {
    return NextResponse.json(
      { error: "Le pseudo est requis" },
      { status: 400 },
    );
  }

  if (pseudo.trim().length > 16) {
    return NextResponse.json(
      { error: "Le pseudo ne peut pas dépasser 16 caractères" },
      { status: 400 },
    );
  }

  const cle_secrete = randomBytes(32).toString("hex");

  try {
    const supabase = createAdminClient();

    const { data, error } = await supabase
      .from("users")
      .insert({
        pseudo: pseudo.trim(),
        cle_secrete,
        solde: INITIAL_BALANCE,
      })
      .select("id, pseudo, solde, cle_secrete")
      .single();

    if (error) {
      if (error.code === "23505") {
        return NextResponse.json(
          { error: "Ce pseudo est déjà utilisé" },
          { status: 409 },
        );
      }

      console.error("Erreur Supabase:", error);
      return NextResponse.json(
        { error: "Impossible d'enregistrer le joueur" },
        { status: 500 },
      );
    }

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error("Erreur serveur:", error);

    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(
      { error: "Erreur de configuration serveur" },
      { status: 500 },
    );
  }
}
