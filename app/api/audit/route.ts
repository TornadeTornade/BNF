import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function GET() {
  try {
    // Initialisation correcte du client Supabase (comme dans ton autre route)
    const supabase = await createAdminClient();

    // 1. Récupérer tous les soldes pour calculer la masse totale
    const { data: tousLesJoueurs, error: errorMasse } = await supabase
      .from('users')
      .select('solde');

    if (errorMasse) {
      console.error("Erreur récupération masse monétaire:", errorMasse);
      return NextResponse.json({ success: false, message: "Erreur lors du calcul de la masse." }, { status: 500 });
    }

    // Calcul de la somme globale de l'économie
    const masseTotale = tousLesJoueurs ? tousLesJoueurs.reduce((sum, joueur) => sum + (joueur.solde || 0), 0) : 0;

    // 2. Récupérer le Top 3 des joueurs les plus riches
    const { data: top3, error: errorTop } = await supabase
      .from('users')
      .select('pseudo, solde')
      .order('solde', { ascending: false }) // Du plus riche au plus pauvre
      .limit(3); // Uniquement les 3 premiers

    if (errorTop) {
      console.error("Erreur récupération Top 3:", errorTop);
      return NextResponse.json({ success: false, message: "Erreur lors de la récupération du Top 3." }, { status: 500 });
    }

    // On renvoie les vraies données à l'interface
    return NextResponse.json({
      masseTotale,
      top3
    });

  } catch (error) {
    console.error("Erreur critique API Audit:", error);
    return NextResponse.json({ success: false, message: "Erreur interne du serveur." }, { status: 500 });
  }
}