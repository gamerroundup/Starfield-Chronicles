'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Compass, Sparkles, LogIn, ChevronRight, HelpCircle } from 'lucide-react';
import { supabase } from '@/lib/supabase';

export default function Home() {
  const [dailySlate, setDailySlate] = useState(null);
  const [announcements, setAnnouncements] = useState([]);
  const [user, setUser] = useState(null);
  const [character, setCharacter] = useState(null);
  const [personalRumor, setPersonalRumor] = useState('');
  const [generatingRumor, setGeneratingRumor] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function initHome() {
      try {
        // 1. Get auth user
        const { data: { user: authUser } } = await supabase.auth.getUser();
        setUser(authUser);

        // 2. Fetch announcements (SSNN marquee banner)
        const { data: annData } = await supabase
          .from('announcements')
          .select('content')
          .eq('active', true)
          .order('created_at', { ascending: false });
        
        if (annData && annData.length > 0) {
          setAnnouncements(annData.map(a => a.content));
        } else {
          // Default announcements
          setAnnouncements([
            "SSNN Alert: United Colonies Vanguard launches recruitment campaign in New Atlantis.",
            "Freestar Ranger patrol reports increased Spacer activity near Akila City outskirts.",
            "Constellation reports anomalous gravitational readings in deep space.",
          ]);
        }

        // 3. Fetch Daily News Slate
        const localSettings = JSON.parse(localStorage.getItem('sb-sandbox-settings') || '{}');
        const headers = {};
        if (localSettings.supabase_url) headers['x-supabase-url'] = localSettings.supabase_url;
        if (localSettings.supabase_anon_key) headers['x-supabase-key'] = localSettings.supabase_anon_key;

        const res = await fetch('/api/daily-slate', { headers });
        const slateJson = await res.json();
        if (slateJson.success && slateJson.data) {
          const parsedContent = JSON.parse(slateJson.data.global_news_content);
          setDailySlate(parsedContent);
        }

        // 4. If logged in, fetch user's active character to generate personal rumor
        if (authUser) {
          const { data: chars } = await supabase
            .from('characters')
            .select('*')
            .eq('user_id', authUser.id)
            .order('updated_at', { ascending: false })
            .limit(1);

          if (chars && chars.length > 0) {
            const activeChar = chars[0];
            setCharacter(activeChar);

            // Fetch personalized rumor
            setGeneratingRumor(true);
            try {
              // Trigger a fast prompt for personal rumor referencing the character
              const rumorRes = await fetch(`/api/chronicle/whats-next?charId=${activeChar.id}&rumor=true`, { headers });
              const rumorJson = await rumorRes.json();
              if (rumorJson.success && rumorJson.rumor) {
                setPersonalRumor(rumorJson.rumor);
              } else {
                setPersonalRumor(`Rumors are spreading that Captain ${activeChar.name} was recently spotted orbiting Jemison, planning their next move.`);
              }
            } catch (err) {
              setPersonalRumor(`Rumors are spreading that Captain ${activeChar.name} was recently spotted orbiting Jemison.`);
            } finally {
              setGeneratingRumor(false);
            }
          }
        }
      } catch (err) {
        console.error('Home Page loading error:', err);
      } finally {
        setLoading(false);
      }
    }

    initHome();
  }, []);

  return (
    <div className="flex flex-col gap-6 md:gap-10">
      {/* 1. SSNN Rolling Marquee Banner */}
      <div className="w-full bg-slate-950 border border-constellation-cyan/20 rounded-md overflow-hidden py-2 px-4 shadow-glow-cyan/10">
        <div className="flex items-center gap-3">
          <span className="text-xs font-bold text-constellation-cyan bg-constellation-cyan/10 px-2 py-0.5 border border-constellation-cyan/30 rounded uppercase tracking-widest shrink-0 animate-pulse">
            SSNN Live
          </span>
          <div className="relative flex-1 overflow-hidden h-5">
            <div className="absolute whitespace-nowrap animate-marquee text-xs font-medium text-slate-300 flex gap-10">
              {announcements.map((ann, i) => (
                <span key={i} className="flex items-center gap-2">
                  <Compass className="w-3.5 h-3.5 text-constellation-orange inline" />
                  {ann}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 2. Hero Header */}
      <div className="text-center max-w-3xl mx-auto flex flex-col gap-4 py-6">
        <h1 className="text-4xl md:text-6xl font-black uppercase tracking-wider bg-gradient-to-r from-slate-100 via-constellation-cyan to-slate-100 bg-clip-text text-transparent">
          The Settled Systems Daily Slate
        </h1>
        <p className="text-slate-400 text-sm md:text-lg max-w-2xl mx-auto font-medium">
          Your portal to the frontier. Record your Captain's logs, track your milestones, review community logs, and explore custom mods.
        </p>
      </div>

      {/* 3. Action Hub Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Card 1: Chronicles Player Experience */}
        <div className="glass-panel hover:border-constellation-cyan/40 transition-all duration-300 p-6 rounded-lg flex flex-col gap-4 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-constellation-cyan/5 rounded-full blur-2xl group-hover:bg-constellation-cyan/15 transition-all"></div>
          <h3 className="text-lg font-bold uppercase tracking-wider text-slate-100 flex items-center gap-2">
            <Compass className="w-5 h-5 text-constellation-cyan" />
            Captain's Chronicle
          </h3>
          <p className="text-xs text-slate-400 leading-relaxed flex-1">
            Build your character, write session logs, let AI generate immersive Captain's logs, and track timeline milestones.
          </p>
          <Link href="/character/new" className="mt-2 w-full text-center py-2 px-4 bg-constellation-cyan text-space-950 font-bold uppercase text-xs tracking-wider rounded hover:bg-white transition-all flex items-center justify-center gap-1 shadow-glow-cyan">
            Begin Log <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Card 2: Creator Showcase */}
        <div className="glass-panel hover:border-constellation-orange/40 transition-all duration-300 p-6 rounded-lg flex flex-col gap-4 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-constellation-orange/5 rounded-full blur-2xl group-hover:bg-constellation-orange/15 transition-all"></div>
          <h3 className="text-lg font-bold uppercase tracking-wider text-slate-100 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-constellation-orange" />
            Gamerroundup Hub
          </h3>
          <p className="text-xs text-slate-400 leading-relaxed flex-1">
            Browse my custom Starfield mods focusing on looter-shooter mechanics, frontier-ops stories, and expanded systems.
          </p>
          <Link href="/creator" className="mt-2 w-full text-center py-2 px-4 bg-constellation-orange text-space-950 font-bold uppercase text-xs tracking-wider rounded hover:bg-white transition-all flex items-center justify-center gap-1 shadow-glow-orange">
            Browse Mods <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Card 3: Community Logs */}
        <div className="glass-panel hover:border-constellation-violet/40 transition-all duration-300 p-6 rounded-lg flex flex-col gap-4 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-constellation-violet/5 rounded-full blur-2xl group-hover:bg-constellation-violet/15 transition-all"></div>
          <h3 className="text-lg font-bold uppercase tracking-wider text-slate-100 flex items-center gap-2">
            <LogIn className="w-5 h-5 text-constellation-violet" />
            Galactic Directory
          </h3>
          <p className="text-xs text-slate-400 leading-relaxed flex-1">
            Explore the public directory of other captains exploring the galaxy, their histories, and their active ships.
          </p>
          <Link href="/chronicles" className="mt-2 w-full text-center py-2 px-4 bg-transparent border border-constellation-violet/50 hover:border-constellation-violet text-constellation-violet font-bold uppercase text-xs tracking-wider rounded transition-all flex items-center justify-center gap-1">
            Explore Feed <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* 4. Daily News Feed & Personal Rumors */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Global News Section (2/3 width on desktop) */}
        <div className="lg:col-span-2 glass-panel p-6 rounded-lg border-white/5 flex flex-col gap-4">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <h2 className="text-xl font-bold uppercase tracking-wider text-slate-100 flex items-center gap-2">
              <Compass className="w-5 h-5 text-constellation-cyan" />
              Settled Systems Broadcast
            </h2>
            <span className="text-xs text-slate-500 font-semibold tracking-wider uppercase">
              Broadcast Date: {new Date().toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
            </span>
          </div>

          {loading ? (
            <div className="flex flex-col gap-2 py-8 justify-center items-center text-slate-500 text-xs tracking-wider uppercase">
              <div className="w-6 h-6 border-2 border-t-transparent border-constellation-cyan rounded-full animate-spin"></div>
              <span>Connecting to SSNN relay...</span>
            </div>
          ) : dailySlate?.global_news ? (
            <div className="text-slate-300 text-sm leading-relaxed whitespace-pre-line py-2">
              {dailySlate.global_news}
            </div>
          ) : (
            <p className="text-slate-500 text-sm py-4 italic">
              Broadcast offline. Relays are currently experiencing electromagnetic interference.
            </p>
          )}
        </div>

        {/* Rumor Mill (1/3 width) */}
        <div className="glass-panel p-6 rounded-lg border-white/5 flex flex-col gap-4">
          <div className="border-b border-white/10 pb-3">
            <h2 className="text-xl font-bold uppercase tracking-wider text-slate-100 flex items-center gap-2">
              <HelpCircle className="w-5 h-5 text-constellation-orange" />
              Frontier Rumor Mill
            </h2>
          </div>

          {loading ? (
            <p className="text-slate-500 text-xs py-4 italic">Scanning local nodes...</p>
          ) : !user ? (
            <div className="py-4 text-center">
              <p className="text-xs text-slate-400 mb-4 leading-relaxed">
                Log in with your pilot credentials to scan personalized space rumors referencing your captain.
              </p>
              <Link href="/login" className="inline-block py-1.5 px-4 bg-white/5 hover:bg-white/10 border border-white/10 text-slate-200 text-xs font-bold uppercase tracking-wider rounded transition-all">
                Sign In
              </Link>
            </div>
          ) : !character ? (
            <div className="py-4 text-center">
              <p className="text-xs text-slate-400 mb-4 leading-relaxed">
                You haven't registered a Captain yet. Build a dossier to see rumors about your adventures.
              </p>
              <Link href="/character/new" className="inline-block py-1.5 px-4 bg-constellation-cyan/20 border border-constellation-cyan/40 hover:bg-constellation-cyan/30 text-constellation-cyan text-xs font-bold uppercase tracking-wider rounded transition-all">
                Create Captain
              </Link>
            </div>
          ) : generatingRumor ? (
            <div className="flex flex-col gap-2 py-4 items-center justify-center text-slate-500 text-xs uppercase tracking-wider">
              <div className="w-4 h-4 border-2 border-t-transparent border-constellation-orange rounded-full animate-spin"></div>
              <span>Scanning tavern nodes...</span>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              <div className="bg-space-900 border border-constellation-orange/20 rounded p-4 text-slate-300 text-xs leading-relaxed italic shadow-inner">
                "{personalRumor || `A mysterious pilot matching Captain ${character.name}'s description was reportedly seen searching for ancient relics near the outpost sectors.`}"
              </div>
              <p className="text-[10px] text-slate-500 text-center uppercase tracking-widest font-semibold">
                References: Captain {character.name} (LVL {character.current_level})
              </p>
              <Link href={`/character/${character.id}`} className="text-center py-2 bg-white/5 hover:bg-white/10 text-slate-200 text-xs font-bold uppercase tracking-wider rounded transition-all">
                Access Log Slate
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
