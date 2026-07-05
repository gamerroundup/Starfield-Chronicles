import { GoogleGenerativeAI } from '@google/generative-ai';

import { createClient } from '@supabase/supabase-js';
import { supabase } from './supabase';

// Helper to dynamically get Gemini key from environment or settings table
async function getApiKey(urlOverride, keyOverride, geminiKeyOverride) {
  let key = process.env.GEMINI_API_KEY || geminiKeyOverride || '';
  if (!key) {
    try {
      let client = supabase;
      if (urlOverride && keyOverride) {
        client = createClient(urlOverride, keyOverride);
      }
      const { data } = await client
        .from('settings')
        .select('value')
        .eq('key', 'gemini_api_key')
        .single();
      if (data?.value) {
        key = data.value;
      }
    } catch (err) {
      console.warn('Could not read gemini_api_key from settings table:', err);
    }
  }
  return key;
}

// Helper to get Gemini model
async function getModel(urlOverride, keyOverride, geminiKeyOverride) {
  const apiKey = await getApiKey(urlOverride, keyOverride, geminiKeyOverride);
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not configured in environment variables, database settings, or headers.');
  }
  const genAI = new GoogleGenerativeAI(apiKey);
  return genAI.getGenerativeModel({ 
    model: 'gemini-2.5-flash',
    generationConfig: { responseMimeType: 'application/json' }
  });
}


// 1. Generate Character Dossier
export async function generateCharacterDossier(playstyle, name, background, traits, urlOverride = null, keyOverride = null, geminiKeyOverride = null) {
  const model = await getModel(urlOverride, keyOverride, geminiKeyOverride);
  const prompt = `
    You are a Starfield RPG lore expert. Generate a complete, immersive, lore-friendly Captain's Dossier for a character.
    Given inputs:
    - Name: ${name || 'Unknown Explorer'}
    - Background: ${background || 'Any Background'}
    - Selected Traits: ${traits || 'None'}
    - Playstyle Preference: ${playstyle}

    Respond ONLY with a JSON object in this exact format:
    {
      "name": "Character Name",
      "background": "Lore-friendly background classification (e.g. Explorer, Bounty Hunter, etc.)",
      "traits": "Detailed narrative description of the traits and how they affect the character's psyche",
      "biography_summary": "A 2-3 paragraph biography detailing their origin, their current motivations in the Settled Systems, and how they ended up in the space lanes."
    }
  `;

  const result = await model.generateContent(prompt);
  return JSON.parse(result.response.text());
}

// 2. Update Chronicle and generate new Captain's Log
export async function updateChronicle(biography, stats, lastEvents, playerInput, urlOverride = null, keyOverride = null, geminiKeyOverride = null) {
  const model = await getModel(urlOverride, keyOverride, geminiKeyOverride);
  
  const statsStr = JSON.stringify(stats);
  const eventsStr = JSON.stringify(lastEvents);

  const prompt = `
    You are a Starfield RPG lore compiler. You update a captain's log and timeline.
    Current character state:
    - Biography Summary: ${biography}
    - Stats (Name, Background, Traits, Level): ${statsStr}
    - Last 5-10 Timeline Events: ${eventsStr}
    
    New Game Session Updates logged by player:
    "${playerInput}"

    Based on the player's session updates, you must evolve their biography, generate a new timeline milestone (timeline event) for their current level, and write an immersive "Captain's Log" written from the character's perspective. Keep the tone realistic, space-faring, and matching the Starfield universe.

    Respond ONLY with a JSON object in this exact format:
    {
      "biography_summary": "Updated 2-3 paragraph biography incorporating the new event seamlessly, keeping older important aspects intact but evolving their journey.",
      "new_timeline_event": {
        "event_title": "Short title of the milestone (e.g. Joined the Vanguard, Built Jemison Outpost)",
        "event_description": "A 1-2 sentence description of the achievement/milestone."
      },
      "ai_generated_log": "Immersive, first-person Captain's Log entry detailing the session events in character, matching their traits and background. Start with a Starfield date tag (e.g. 'SD 2330.10.15 - Jemison orbit')."
    }
  `;

  const result = await model.generateContent(prompt);
  return JSON.parse(result.response.text());
}

// 3. Generate "What's Next?" Roleplay hooks
export async function generateWhatsNext(biography, stats, lastEvents, urlOverride = null, keyOverride = null, geminiKeyOverride = null) {
  const model = await getModel(urlOverride, keyOverride, geminiKeyOverride);
  
  const statsStr = JSON.stringify(stats);
  const eventsStr = JSON.stringify(lastEvents);

  const prompt = `
    You are a Starfield RPG quest generator. Read the current status of this explorer and suggest 3-4 lore-friendly, specific roleplay hooks/activities for their next game session.
    
    Character Details:
    - Stats: ${statsStr}
    - Biography: ${biography}
    - Recent Milestones: ${eventsStr}

    Ensure the ideas match their Background/Traits. For example, a Bounty Hunter might track a runaway smuggler in the Cheyenne system, while an Explorer might investigate a strange gravitational anomaly in the Narion system. Keep hooks grounded in Starfield lore (mentioning factions, systems, planets, or gameplay mechanics).

    Respond ONLY with a JSON object in this exact format:
    {
      "hooks": [
        {
          "title": "Short title of prompt (e.g., The Akila Runaway)",
          "description": "Specific story hook and instructions on what the player should do/aim to achieve in their next session.",
          "faction_or_system": "System/Faction name (e.g., Freestar Collective / Cheyenne)"
        }
      ]
    }
  `;

  const result = await model.generateContent(prompt);
  return JSON.parse(result.response.text());
}

// 4. Generate Daily News Slate (Global News)
export async function generateDailyNews(optionalCharacterInfo = null, urlOverride = null, keyOverride = null, geminiKeyOverride = null) {
  const model = await getModel(urlOverride, keyOverride, geminiKeyOverride);
  
  let characterContext = '';
  if (optionalCharacterInfo) {
    characterContext = `Include a personalized rumor or short news snippet referencing this character's exploits: Name: ${optionalCharacterInfo.name}, Background: ${optionalCharacterInfo.background}, Level: ${optionalCharacterInfo.level}, Bio: ${optionalCharacterInfo.biography_summary}`;
  }

  const prompt = `
    You are the lead anchor for the Settled Systems News Network (SSNN) in Starfield.
    Generate a daily, lore-centric global news report.
    It should contain 3 stories:
    1. A major political/economic update in the United Colonies or Freestar Collective.
    2. A scientific, exploratory, or outpost colony update.
    3. A frontier rumor or space hazard warning (Smugglers, Crimson Fleet, Spacers, or Starborn mystery).

    ${characterContext ? `\nPersonalized rumored snippet to include:\n${characterContext}` : ''}

    Respond ONLY with a JSON object in this exact format:
    {
      "global_news": "A fully formatted news report, with sections separated by system-broadcast markers (e.g., [SSNN - NEW ATLANTIS]). Make it sound realistic, professional, and dramatic.",
      "rumor": "A short, 1-2 sentence rumor or snippet suitable for the personal rumor board${optionalCharacterInfo ? ` referencing ${optionalCharacterInfo.name}` : ''}."
    }
  `;

  const result = await model.generateContent(prompt);
  return JSON.parse(result.response.text());
}
