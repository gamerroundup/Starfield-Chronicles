import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { generateWhatsNext, generateDailyNews } from '@/lib/gemini';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const charId = searchParams.get('charId');
    const isRumorQuery = searchParams.get('rumor') === 'true';

    if (!charId) {
      return NextResponse.json({ success: false, error: 'Character ID is required' }, { status: 400 });
    }

    // 1. Fetch character details from database
    let character;
    let timelineEvents = [];

    if (charId.startsWith('sandbox-')) {
      character = {
        name: 'Sandbox Captain',
        background: 'Explorer',
        traits: 'Alien DNA',
        current_level: 5,
        biography_summary: 'An explorer navigating the sandbox.'
      };
    } else {
      const { data, error } = await supabase
        .from('characters')
        .select('*')
        .eq('id', charId)
        .single();

      if (error) {
        return NextResponse.json({ success: false, error: 'Character not found: ' + error.message }, { status: 404 });
      }
      character = data;

      // Fetch last 5 timeline events
      const { data: events } = await supabase
        .from('timeline_events')
        .select('*')
        .eq('character_id', charId)
        .order('created_at', { ascending: false })
        .limit(5);

      timelineEvents = events || [];
    }

    const supabaseUrl = request.headers.get('x-supabase-url');
    const supabaseKey = request.headers.get('x-supabase-key');
    const geminiKey = request.headers.get('x-gemini-key');

    // 2. Decide if generating personalized rumor or next session hooks
    if (isRumorQuery) {
      const newsResult = await generateDailyNews({
        name: character.name,
        background: character.background,
        level: character.current_level,
        biography_summary: character.biography_summary
      }, supabaseUrl, supabaseKey, geminiKey);
      return NextResponse.json({ success: true, rumor: newsResult.rumor });
    } else {
      const stats = {
        name: character.name,
        background: character.background,
        traits: character.traits,
        level: character.current_level
      };

      const hooksResult = await generateWhatsNext(
        character.biography_summary,
        stats,
        timelineEvents.map(e => ({ level: e.level, title: e.event_title })),
        supabaseUrl,
        supabaseKey,
        geminiKey
      );

      return NextResponse.json({ success: true, hooks: hooksResult.hooks });
    }
  } catch (error) {
    console.error('Whats Next API error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
