import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { updateChronicle } from '@/lib/gemini';

export async function POST(request) {
  try {
    const { charId, playerInput, currentLevel } = await request.json();

    if (!charId || !playerInput) {
      return NextResponse.json({ success: false, error: 'Character ID and Player Input are required' }, { status: 400 });
    }

    // 1. Fetch character details from database
    let character;
    let timelineEvents = [];

    // Check if it's a sandbox run
    if (charId.startsWith('sandbox-')) {
      // Mock sandbox logic
      character = {
        name: 'Sandbox Capt. Barrett',
        background: 'Explorer',
        traits: 'Alien DNA',
        current_level: currentLevel || 1,
        biography_summary: 'An explorer navigating the sandbox universe.'
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

      // Fetch last 10 timeline events
      const { data: events } = await supabase
        .from('timeline_events')
        .select('*')
        .eq('character_id', charId)
        .order('created_at', { ascending: false })
        .limit(10);
      
      timelineEvents = events || [];
    }

    // 2. Call Gemini API to evolve chronicle
    const stats = {
      name: character.name,
      background: character.background,
      traits: character.traits,
      level: currentLevel || character.current_level
    };

    const supabaseUrl = request.headers.get('x-supabase-url');
    const supabaseKey = request.headers.get('x-supabase-key');

    const updateResult = await updateChronicle(
      character.biography_summary,
      stats,
      timelineEvents.map(e => ({ level: e.level, title: e.event_title, desc: e.event_description })),
      playerInput,
      supabaseUrl,
      supabaseKey
    );

    // 3. Save updates back to database if not sandbox
    if (!charId.startsWith('sandbox-')) {
      // Update character biography & level
      const { error: updateCharError } = await supabase
        .from('characters')
        .update({
          biography_summary: updateResult.biography_summary,
          current_level: currentLevel || character.current_level,
          updated_at: new Date().toISOString()
        })
        .eq('id', charId);

      if (updateCharError) console.error('Failed to update character bio:', updateCharError);

      // Insert timeline event
      const { error: insertEventError } = await supabase
        .from('timeline_events')
        .insert([
          {
            character_id: charId,
            level: currentLevel || character.current_level,
            event_title: updateResult.new_timeline_event.event_title,
            event_description: updateResult.new_timeline_event.event_description
          }
        ]);

      if (insertEventError) console.error('Failed to insert timeline event:', insertEventError);

      // Insert journal entry
      const { error: insertJournalError } = await supabase
        .from('journal_entries')
        .insert([
          {
            character_id: charId,
            player_input: playerInput,
            ai_generated_log: updateResult.ai_generated_log
          }
        ]);

      if (insertJournalError) console.error('Failed to insert journal log:', insertJournalError);
    }

    return NextResponse.json({
      success: true,
      biography_summary: updateResult.biography_summary,
      new_timeline_event: updateResult.new_timeline_event,
      ai_generated_log: updateResult.ai_generated_log
    });
  } catch (error) {
    console.error('Chronicle update API error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
