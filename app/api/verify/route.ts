import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin'; // Adapte l'import selon ton projet

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const key = searchParams.get('key');

  if (!key) {
    return NextResponse.json({ success: false, message: "Clé manquante." }, { status: 400 });
  }

  const supabase = await createAdminClient();

  // Chercher l'utilisateur avec cette clé secrète
  const { data: user, error } = await supabase
    .from('users')
    .select('pseudo')
    .eq('cle_secrete', key)
    .single();

  if (error || !user) {
    return NextResponse.json({ success: false, message: "Clé secrète invalide." }, { status: 401 });
  }

  return NextResponse.json({
    success: true,
    message: "Connexion réussie !",
    pseudo: user.pseudo
  });
}