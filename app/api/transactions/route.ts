import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : null;

    if (!token) {
      return NextResponse.json({ error: "Authentification manquante" }, { status: 401 });
    }

    const supabase = createAdminClient();

    // 1. Trouver l'utilisateur actuel grâce à son token
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('cle_secrete', token)
      .single();

    if (userError || !user) {
      return NextResponse.json({ error: "Utilisateur introuvable" }, { status: 401 });
    }

    // 2. Récupérer toutes les transactions de cet utilisateur (Expéditeur OU Destinataire)
    const { data: txs, error: txsError } = await supabase
      .from('transactions')
      .select('*')
      .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
      .order('created_at', { ascending: false });

    if (txsError) throw txsError;

    return NextResponse.json(txs);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}