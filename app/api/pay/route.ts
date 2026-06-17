import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function POST(request: Request) {
  try {
    // 1. Récupération et vérification du token (clé secrète)
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : null;

    if (!token) {
      return NextResponse.json({ success: false, message: "Authentification manquante." }, { status: 401 });
    }

    // 2. Récupération du destinataire et du montant
    const { receiver, amount } = await request.json();

    if (!receiver || !amount || amount <= 0) {
      return NextResponse.json({ success: false, message: "Montant ou destinataire invalide." }, { status: 400 });
    }

    const supabase = await createAdminClient();

    // 3. Trouver l'expéditeur grâce à sa clé (Corrigé : pseudo au lieu de username)
    const { data: sender, error: senderError } = await supabase
      .from('users')
      .select('id, pseudo, solde')
      .eq('cle_secrete', token)
      .single();

    if (senderError || !sender) {
      return NextResponse.json({ success: false, message: "Compte expéditeur introuvable." }, { status: 401 });
    }

    if (sender.solde < amount) {
      return NextResponse.json({ success: false, message: "Solde insuffisant pour ce virement." }, { status: 400 });
    }

    // 4. Trouver le destinataire par son pseudo (Corrigé : pseudo au lieu de username)
    const { data: targetUser, error: targetError } = await supabase
      .from('users')
      .select('id, solde')
      .eq('pseudo', receiver)
      .single();

    if (targetError || !targetUser) {
      return NextResponse.json({ success: false, message: `Le joueur ${receiver} n'existe pas.` }, { status: 404 });
    }

    if (sender.id === targetUser.id) {
      return NextResponse.json({ success: false, message: "Impossible de s'envoyer de l'argent à soi-même." }, { status: 400 });
    }

    // 5. Exécution du transfert (Débit de l'un, Crédit de l'autre)
    const { error: debitError } = await supabase
      .from('users')
      .update({ solde: sender.solde - amount })
      .eq('id', sender.id);

    if (debitError) throw debitError;

    const { error: creditError } = await supabase
      .from('users')
      .update({ solde: targetUser.solde + amount })
      .eq('id', targetUser.id);

    if (creditError) throw creditError;

    const { error: transactionError } = await supabase
        .from('transactions')
        .insert([
            {
            sender_id: sender.id,
            receiver_id: targetUser.id,
            sender_pseudo: sender.pseudo,
            receiver_pseudo: receiver,
            amount: amount,
            type: 'virement'
            }
        ]);

        if (transactionError) {
        console.error("⚠ Erreur historique:", transactionError);
        }
        // -------------------------

    return NextResponse.json({
      success: true,
      message: `Transféré ${amount} BNF à ${receiver} avec succès.`
    });

  } catch (error) {
    console.error("Erreur transaction:", error);
    return NextResponse.json({ success: false, message: "Erreur lors de la transaction." }, { status: 500 });
  }
}