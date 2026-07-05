import { NextResponse } from 'next/server';
import { generateCharacterDossier } from '@/lib/gemini';

export async function POST(request) {
  try {
    const { playstyle, name, background, traits } = await request.json();

    if (!playstyle) {
      return NextResponse.json({ success: false, error: 'Playstyle is required' }, { status: 400 });
    }

    const supabaseUrl = request.headers.get('x-supabase-url');
    const supabaseKey = request.headers.get('x-supabase-key');
    const geminiKey = request.headers.get('x-gemini-key');

    const dossier = await generateCharacterDossier(playstyle, name, background, traits, supabaseUrl, supabaseKey, geminiKey);

    return NextResponse.json({ success: true, dossier });
  } catch (error) {
    console.error('Character Dossier generation error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
