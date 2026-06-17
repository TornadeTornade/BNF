import { NextResponse } from "next/server";
import { generateChequeCode } from "@/lib/cheque-code";
import { createAdminClient } from "@/lib/supabase/admin";
import { getUserByCleSecrete } from "@/lib/users";

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

  const { cle_secrete, montant, pseudo_recepteur } = body as Record<
    string,
    unknown
  >;

  if (typeof cle_secrete !== "string" || cle_secrete.length === 0) {
    return NextResponse.json(
      { error: "cle_secrete est requise" },
      { status: 400 },
    );
  }

  if (typeof montant !== "number" || !Number.isInteger(montant) || montant <= 0) {
    return NextResponse.json(
      { error: "Le montant doit être un entier positif" },
      { status: 400 },
    );
  }

  if (
    pseudo_recepteur !== undefined &&
    (typeof pseudo_recepteur !== "string" || pseudo_recepteur.trim().length === 0)
  ) {
    return NextResponse.json(
      { error: "pseudo_recepteur invalide" },
      { status: 400 },
    );
  }

  try {
    const supabase = createAdminClient();

    const emetteur = await getUserByCleSecrete(supabase, cle_secrete);
    if (!emetteur) {
      return NextResponse.json(
        { error: "Clé secrète invalide" },
        { status: 401 },
      );
    }

    if (emetteur.solde < montant) {
      return NextResponse.json(
        { error: "Solde insuffisant" },
        { status: 400 },
      );
    }

    let recepteur_id: string | null = null;

    if (typeof pseudo_recepteur === "string") {
      const { data: recepteur, error: recepteurError } = await supabase
        .from("users")
        .select("id")
        .eq("pseudo", pseudo_recepteur.trim())
        .single();

      if (recepteurError || !recepteur) {
        return NextResponse.json(
          { error: "Destinataire introuvable" },
          { status: 404 },
        );
      }

      recepteur_id = recepteur.id;
    }

    const { data: debited, error: debitError } = await supabase
      .from("users")
      .update({ solde: emetteur.solde - montant })
      .eq("id", emetteur.id)
      .eq("solde", emetteur.solde)
      .gte("solde", montant)
      .select("id")
      .single();

    if (debitError || !debited) {
      return NextResponse.json(
        { error: "Solde insuffisant" },
        { status: 400 },
      );
    }

    let code_unique: string | null = null;
    let insertError: { code?: string; message: string } | null = null;

    for (let attempt = 0; attempt < 5; attempt++) {
      code_unique = generateChequeCode();

      const { error } = await supabase.from("cheques").insert({
        code_unique,
        montant,
        emetteur_id: emetteur.id,
        recepteur_id,
        utilise: false,
      });

      if (!error) {
        insertError = null;
        break;
      }

      if (error.code === "23505") {
        continue;
      }

      insertError = error;
      break;
    }

    if (insertError || !code_unique) {
      await supabase
        .from("users")
        .update({ solde: emetteur.solde })
        .eq("id", emetteur.id);

      console.error("Erreur insertion chèque:", insertError);
      return NextResponse.json(
        { error: "Impossible de créer le chèque" },
        { status: 500 },
      );
    }

    return NextResponse.json({ code_unique, montant }, { status: 201 });
  } catch (error) {
    console.error("Erreur serveur:", error);
    return NextResponse.json(
      { error: "Erreur de configuration serveur" },
      { status: 500 },
    );
  }
}
