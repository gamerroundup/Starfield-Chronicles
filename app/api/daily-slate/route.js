import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { generateDailyNews } from '@/lib/gemini';

export async function GET(request) {
  try {
    const today = new Date().toISOString().split('T')[0];

    // 1. Try fetching today's news from Supabase
    let { data: slate, error } = await supabase
      .from('daily_slates')
      .select('*')
      .eq('date', today)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Supabase query error:', error);
    }

    const supabaseUrl = request.headers.get('x-supabase-url');
    const supabaseKey = request.headers.get('x-supabase-key');
    const geminiKey = request.headers.get('x-gemini-key');

    // 2. If no slate exists, generate via Gemini and save it
    if (!slate) {
      console.log('No daily slate for today, generating via Gemini...');
      try {
        const generated = await generateDailyNews(null, supabaseUrl, supabaseKey, geminiKey);
        
        // Insert into database
        const { data: newSlate, error: insertError } = await supabase
          .from('daily_slates')
          .insert([
            {
              date: today,
              global_news_content: JSON.stringify(generated)
            }
          ])
          .select()
          .single();

        if (insertError) {
          console.error('Failed to save generated daily slate:', insertError);
          // Return generated anyways
          slate = { date: today, global_news_content: JSON.stringify(generated) };
        } else {
          slate = newSlate;
        }
      } catch (geminiError) {
        console.error('Failed to generate daily news via Gemini, using fallback:', geminiError);
        // Fallback static news
        const fallbackNews = {
          global_news: "[SSNN - NEW ATLANTIS] United Colonies Mast Division reports increased activity in the Mast District as Councilors debate outpost security.\n\n[SSNN - AKILA CITY] Freestar Rangers warn cargo vessels to double shields when traversing Cheyenne space due to rumored Spacer wolfpacks.\n\n[SSNN - CYDONIA] Mining operations reach new depths, uncovering mineral formations that could revolutionize shield fabrication.",
          rumor: "Whispers in the Astral Lounge suggest Neon's Ryujin Industries is seeking field operatives for classified frontier tests."
        };
        slate = { date: today, global_news_content: JSON.stringify(fallbackNews) };
      }
    }

    return NextResponse.json({ success: true, data: slate });
  } catch (error) {
    console.error('Daily slate API error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
