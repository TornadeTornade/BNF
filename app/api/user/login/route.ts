import { NextResponse } from "next/server";
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

  const { pseudo, cle_secrete } = body as Record<string, unknown>;

  if (typeof pseudo !== "string" || pseudo.trim().length === 0) {
    return NextResponse.json(
      { error: "Le pseudo est requis" },
      { status: 400 },
    );
  }

  if (typeof cle_secrete !== "string" || cle_secrete.length === 0) {
    return NextResponse.json(
      { error: "La clé secrète est requise" },
      { status: 400 },
    );
  }

  try {
    const supabase = createAdminClient();
    const user = await getUserByCleSecrete(supabase, cle_secrete);

    if (!user || user.pseudo.toLowerCase() !== pseudo.trim().toLowerCase()) {
      return NextResponse.json(
        { error: "Pseudo ou clé secrète incorrect" },
        { status: 401 },
      );
    }

    return NextResponse.json({
      pseudo: user.pseudo,
      solde: user.solde,
      cle_secrete: user.cle_secrete,
    });
  } catch (error) {
    console.error("Erreur serveur:", error);
    return NextResponse.json(
      { error: "Erreur de configuration serveur" },
      { status: 500 },
    );
  }
}
