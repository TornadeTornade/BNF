import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getUserByCleSecrete } from "@/lib/users";

type Cheque = {
  id: string;
  code_unique: string;
  montant: number;
  emetteur_id: string;
  recepteur_id: string | null;
  utilise: boolean;
};

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

  const { cle_secrete, code_unique } = body as Record<string, unknown>;

  if (typeof cle_secrete !== "string" || cle_secrete.length === 0) {
    return NextResponse.json(
      { error: "cle_secrete est requise" },
      { status: 400 },
    );
  }

  if (typeof code_unique !== "string" || code_unique.trim().length === 0) {
    return NextResponse.json(
      { error: "code_unique est requis" },
      { status: 400 },
    );
  }

  try {
    const supabase = createAdminClient();

    const claimer = await getUserByCleSecrete(supabase, cle_secrete);
    if (!claimer) {
      return NextResponse.json(
        { error: "Clé secrète invalide" },
        { status: 401 },
      );
    }

    const { data: cheque, error: chequeError } = await supabase
      .from("cheques")
      .select("id, code_unique, montant, emetteur_id, recepteur_id, utilise")
      .eq("code_unique", code_unique.trim().toUpperCase())
      .eq("utilise", false)
      .single();

    if (chequeError || !cheque) {
      return NextResponse.json(
        { error: "Chèque introuvable ou déjà utilisé" },
        { status: 404 },
      );
    }

    const typedCheque = cheque as Cheque;
    const isNominal = typedCheque.recepteur_id !== null;
    const isRightfulClaimer =
      isNominal && claimer.id === typedCheque.recepteur_id;
    const isThief = isNominal && !isRightfulClaimer;

    const beneficiaryId = isNominal
      ? typedCheque.recepteur_id!
      : claimer.id;

    const { data: lockedCheque, error: lockError } = await supabase
      .from("cheques")
      .update({ utilise: true })
      .eq("id", typedCheque.id)
      .eq("utilise", false)
      .select("id")
      .single();

    if (lockError || !lockedCheque) {
      return NextResponse.json(
        { error: "Chèque introuvable ou déjà utilisé" },
        { status: 409 },
      );
    }

    const { data: beneficiary, error: beneficiaryError } = await supabase
      .from("users")
      .select("id, pseudo, solde")
      .eq("id", beneficiaryId)
      .single();

    if (beneficiaryError || !beneficiary) {
      await supabase
        .from("cheques")
        .update({ utilise: false })
        .eq("id", typedCheque.id);

      return NextResponse.json(
        { error: "Destinataire introuvable" },
        { status: 500 },
      );
    }

    const { data: credited, error: creditError } = await supabase
      .from("users")
      .update({ solde: beneficiary.solde + typedCheque.montant })
      .eq("id", beneficiary.id)
      .eq("solde", beneficiary.solde)
      .select("id")
      .single();

    if (creditError || !credited) {
      await supabase
        .from("cheques")
        .update({ utilise: false })
        .eq("id", typedCheque.id);

      console.error("Erreur crédit chèque:", creditError);
      return NextResponse.json(
        { error: "Impossible d'encaisser le chèque" },
        { status: 500 },
      );
    }

  // ─── 📝 AJOUTE CE BLOC ICI ──────────────────────────────────────────
    // 1. On récupère le pseudo de la personne qui a créé le chèque
    const { data: emitter } = await supabase
      .from("users")
      .select("pseudo")
      .eq("id", typedCheque.emetteur_id)
      .single();

    // 2. On insère la transaction dans l'historique
    const { error: transactionError } = await supabase
      .from("transactions")
      .insert([
        {
          sender_id: typedCheque.emetteur_id,
          receiver_id: beneficiary.id,
          sender_pseudo: emitter?.pseudo || "Inconnu",
          receiver_pseudo: beneficiary.pseudo,
          amount: typedCheque.montant,
          type: 'cheque'
        }
      ]);

    if (transactionError) {
      console.error("⚠ Erreur historique chèque:", transactionError);
    }
    // ───────────────────────────────────────────────────────────────────

    if (isThief) {
      return NextResponse.json(
        {
          error:
            "Ce chèque est nominatif. L'encaissement a été refusé, mais l'argent a été sécurisé au profit du destinataire.",
          secured: true,
          beneficiaire: beneficiary.pseudo,
          montant: typedCheque.montant,
        },
        { status: 403 },
      );
    }

    return NextResponse.json({
      code_unique: typedCheque.code_unique,
      montant: typedCheque.montant,
      beneficiaire: beneficiary.pseudo,
    });
  } catch (error) {
    console.error("Erreur serveur:", error);
    return NextResponse.json(
      { error: "Erreur de configuration serveur" },
      { status: 500 },
    );
  }
}
