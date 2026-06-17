import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin'; // Adapte l'import selon ton projet

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  
    // ✅ On récupère le header "Authorization: Bearer <clé>" envoyé par Minecraft
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : null;

    // La clé sera soit celle de l'URL (?key=), soit celle du mod Minecraft (token)
    const key = searchParams.get('key') || token;

    if (!key) {
    return NextResponse.json({ success: false, message: "Clé manquante." }, { status: 400 });
    }

  const supabase = await createAdminClient();

  // Chercher le solde de l'utilisateur avec cette clé secrète
  const { data: user, error } = await supabase
    .from('users')
    .select('solde')
    .eq('cle_secrete', key)
    .single();

  if (error || !user) {
    return NextResponse.json({ success: false, message: "Clé secrète invalide." }, { status: 401 });
  }

  return NextResponse.json({
    success: true,
    message: "Solde récupéré.",
    solde: user.solde
  });
}