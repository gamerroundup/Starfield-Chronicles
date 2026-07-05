'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Compass, Sparkles, Send, Copy, Twitter, Share2, Award, Calendar, List, Eye } from 'lucide-react';

export default function CharacterProfile() {
  const { id } = useParams();
  const router = useRouter();

  // Character Data
  const [character, setCharacter] = useState(null);
  const [logs, setLogs] = useState([]);
  const [events, setEvents] = useState([]);
  const [hooks, setHooks] = useState([]);
  
  // States
  const [loading, setLoading] = useState(true);
  const [sessionInput, setSessionInput] = useState('');
  const [newLevel, setNewLevel] = useState(1);
  const [submittingLog, setSubmittingLog] = useState(false);
  const [loadingHooks, setLoadingHooks] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isOwner, setIsOwner] = useState(false);

  useEffect(() => {
    async function loadCharacterData() {
      try {
        let charData = null;
        let logEntries = [];
        let timelineEvents = [];

        // 1. Check if sandbox character
        if (id.startsWith('sandbox-')) {
          const sandboxChars = JSON.parse(localStorage.getItem('sb-sandbox-characters') || '[]');
          charData = sandboxChars.find(c => c.id === id);
          
          if (charData) {
            setIsOwner(true);
            setNewLevel(charData.current_level || 1);
            // Fetch logs & events from localStorage
            const localLogs = JSON.parse(localStorage.getItem(`sb-logs-${id}`) || '[]');
            const localEvents = JSON.parse(localStorage.getItem(`sb-events-${id}`) || '[]');
            logEntries = localLogs;
            timelineEvents = localEvents;
          }
        } else {
          // 2. Fetch from Supabase
          const { data: char, error } = await supabase
            .from('characters')
            .select('*')
            .eq('id', id)
            .single();

          if (error) {
            console.error('Character fetch error:', error);
          } else {
            charData = char;
            setNewLevel(char.current_level);
            
            // Check ownership
            const { data: { user } } = await supabase.auth.getUser();
            const sandboxUser = localStorage.getItem('sb-sandbox-user');
            const sandboxUserId = sandboxUser ? JSON.parse(sandboxUser).id : null;
            if (user && char.user_id === user.id) {
              setIsOwner(true);
            } else if (sandboxUserId && char.user_id === sandboxUserId) {
              setIsOwner(true);
            }

            // Fetch timeline milestones
            const { data: evts } = await supabase
              .from('timeline_events')
              .select('*')
              .eq('character_id', id)
              .order('created_at', { ascending: false });
            
            // Fetch journal logs
            const { data: jrnl } = await supabase
              .from('journal_entries')
              .select('*')
              .eq('character_id', id)
              .order('created_at', { ascending: false });

            logEntries = jrnl || [];
            timelineEvents = evts || [];
          }
        }

        if (!charData) {
          router.push('/chronicles');
          return;
        }

        setCharacter(charData);
        setLogs(logEntries);
        setEvents(timelineEvents);

        // Fetch quest hooks
        fetchHooks(charData.id);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    loadCharacterData();
  }, [id]);

  const fetchHooks = async (charId) => {
    setLoadingHooks(true);
    const localSettings = JSON.parse(localStorage.getItem('sb-sandbox-settings') || '{}');
    const headers = {};
    if (localSettings.supabase_url) headers['x-supabase-url'] = localSettings.supabase_url;
    if (localSettings.supabase_anon_key) headers['x-supabase-key'] = localSettings.supabase_anon_key;

    try {
      const res = await fetch(`/api/chronicle/whats-next?charId=${charId}`, { headers });
      const json = await res.json();
      if (json.success && json.hooks) {
        setHooks(json.hooks);
      }
    } catch (err) {
      console.error('Failed to fetch RP hooks:', err);
    } finally {
      setLoadingHooks(false);
    }
  };

  const handleLogSubmit = async (e) => {
    e.preventDefault();
    if (!sessionInput.trim() || submittingLog) return;

    setSubmittingLog(true);
    const localSettings = JSON.parse(localStorage.getItem('sb-sandbox-settings') || '{}');
    const headers = { 'Content-Type': 'application/json' };
    if (localSettings.supabase_url) headers['x-supabase-url'] = localSettings.supabase_url;
    if (localSettings.supabase_anon_key) headers['x-supabase-key'] = localSettings.supabase_anon_key;

    try {
      const res = await fetch('/api/chronicle/update', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          charId: id,
          playerInput: sessionInput,
          currentLevel: newLevel
        })
      });

      const data = await res.json();
      if (data.success) {
        const updatedBio = data.biography_summary;
        const newLog = {
          id: Math.random().toString(),
          player_input: sessionInput,
          ai_generated_log: data.ai_generated_log,
          created_at: new Date().toISOString()
        };
        const newEvt = {
          id: Math.random().toString(),
          level: newLevel,
          event_title: data.new_timeline_event.event_title,
          event_description: data.new_timeline_event.event_description,
          created_at: new Date().toISOString()
        };

        // Update local memory state
        setCharacter(prev => ({
          ...prev,
          biography_summary: updatedBio,
          current_level: newLevel
        }));
        setLogs(prev => [newLog, ...prev]);
        setEvents(prev => [newEvt, ...prev]);
        setSessionInput('');

        // If sandbox, sync changes to localStorage
        if (id.startsWith('sandbox-')) {
          const sandboxChars = JSON.parse(localStorage.getItem('sb-sandbox-characters') || '[]');
          const idx = sandboxChars.findIndex(c => c.id === id);
          if (idx !== -1) {
            sandboxChars[idx].biography_summary = updatedBio;
            sandboxChars[idx].current_level = newLevel;
            localStorage.setItem('sb-sandbox-characters', JSON.stringify(sandboxChars));
          }
          
          const localLogs = JSON.parse(localStorage.getItem(`sb-logs-${id}`) || '[]');
          localLogs.unshift(newLog);
          localStorage.setItem(`sb-logs-${id}`, JSON.stringify(localLogs));

          const localEvents = JSON.parse(localStorage.getItem(`sb-events-${id}`) || '[]');
          localEvents.unshift(newEvt);
          localStorage.setItem(`sb-events-${id}`, JSON.stringify(localEvents));
        }

        // Refresh hooks
        fetchHooks(id);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmittingLog(false);
    }
  };

  const handleVisibilityChange = async (newVis) => {
    setCharacter(prev => ({ ...prev, visibility: newVis }));

    if (id.startsWith('sandbox-')) {
      const sandboxChars = JSON.parse(localStorage.getItem('sb-sandbox-characters') || '[]');
      const idx = sandboxChars.findIndex(c => c.id === id);
      if (idx !== -1) {
        sandboxChars[idx].visibility = newVis;
        localStorage.setItem('sb-sandbox-characters', JSON.stringify(sandboxChars));
      }
    } else {
      await supabase
        .from('characters')
        .update({ visibility: newVis })
        .eq('id', id);
    }
  };

  const shareLink = typeof window !== 'undefined' ? window.location.href : '';

  const copyToClipboard = () => {
    navigator.clipboard.writeText(shareLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="flex flex-col gap-2 justify-center items-center py-20 text-slate-500 uppercase tracking-widest text-xs">
        <div className="w-8 h-8 border-2 border-t-transparent border-constellation-cyan rounded-full animate-spin"></div>
        <span>Accessing pilot logs...</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 md:gap-10">
      {/* 1. Header Board */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-white/10 pb-4 gap-4">
        <div>
          <h1 className="text-3xl font-black uppercase tracking-wider text-slate-100 flex items-center gap-2">
            <Compass className="w-8 h-8 text-constellation-cyan" />
            Dossier: {character.name}
          </h1>
          <p className="text-xs text-slate-400 mt-1 uppercase tracking-wider font-semibold">
            Status: {character.background} • Level {character.current_level}
          </p>
        </div>

        {/* Sharing options */}
        <div className="flex items-center gap-2">
          <button
            onClick={copyToClipboard}
            className="p-2 bg-white/5 border border-white/10 hover:bg-white/10 text-slate-300 hover:text-slate-100 rounded text-xs uppercase font-bold flex items-center gap-1.5 transition-all"
          >
            <Copy className="w-3.5 h-3.5" />
            {copied ? 'Copied!' : 'Copy Link'}
          </button>
          <a
            href={`https://twitter.com/intent/tweet?text=Check out my Starfield Captain profile: ${character.name}!&url=${encodeURIComponent(shareLink)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 bg-white/5 border border-white/10 hover:bg-white/10 text-slate-300 hover:text-slate-100 rounded transition-all"
            title="Share on X"
          >
            <Twitter className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Left Column: Character Stats & Hooks */}
        <div className="flex flex-col gap-6 lg:col-span-1">
          {/* Character Stats Card */}
          <div className="glass-panel p-6 rounded-lg border-white/5 flex flex-col gap-4">
            <h3 className="text-xs font-bold uppercase tracking-widest text-constellation-cyan border-b border-white/5 pb-2">
              Captain Specifications
            </h3>
            
            <div className="flex flex-col gap-3">
              <div>
                <span className="text-[10px] text-slate-500 uppercase tracking-widest block font-bold">Class Background</span>
                <span className="text-sm font-semibold text-slate-200">{character.background}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 uppercase tracking-widest block font-bold">Traits Psyche</span>
                <span className="text-sm font-semibold text-slate-200">{character.traits || 'None'}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 uppercase tracking-widest block font-bold">Current Sector Level</span>
                <span className="text-sm font-semibold text-slate-200">Level {character.current_level}</span>
              </div>
            </div>

            {/* Visibility Settings (If Owner) */}
            {isOwner && (
              <div className="border-t border-white/5 pt-4 mt-2">
                <span className="text-[10px] text-slate-500 uppercase tracking-widest block font-bold mb-2">Comms Visibility</span>
                <div className="flex gap-1.5 bg-space-900 border border-white/10 rounded p-1">
                  {['private', 'unlisted', 'public'].map((vis) => (
                    <button
                      key={vis}
                      onClick={() => handleVisibilityChange(vis)}
                      className={`flex-1 py-1 rounded text-[9px] uppercase tracking-wider font-bold transition-all ${
                        character.visibility === vis
                          ? 'bg-constellation-cyan text-space-950 font-black shadow-glow-cyan'
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {vis}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Biography summary */}
          <div className="glass-panel p-6 rounded-lg border-white/5 flex flex-col gap-4">
            <h3 className="text-xs font-bold uppercase tracking-widest text-constellation-cyan border-b border-white/5 pb-2">
              Explorer Record (Biography)
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-line italic">
              {character.biography_summary || 'No biography compiled yet.'}
            </p>
          </div>

          {/* What's Next Quest Hooks */}
          <div className="glass-panel p-6 rounded-lg border-white/5 flex flex-col gap-4">
            <h3 className="text-xs font-bold uppercase tracking-widest text-constellation-orange border-b border-white/5 pb-2 flex items-center justify-between">
              <span>Constellation Hooks ("What's Next?")</span>
              {isOwner && (
                <button
                  onClick={() => fetchHooks(character.id)}
                  disabled={loadingHooks}
                  className="text-[9px] text-constellation-orange border border-constellation-orange/30 px-1.5 py-0.5 rounded hover:bg-constellation-orange/10 uppercase tracking-widest"
                >
                  Refresh
                </button>
              )}
            </h3>

            {loadingHooks ? (
              <div className="flex justify-center items-center py-6 text-slate-500 text-xs">
                <div className="w-4 h-4 border border-t-transparent border-constellation-orange rounded-full animate-spin mr-2"></div>
                <span>Scanning quest-boards...</span>
              </div>
            ) : hooks.length === 0 ? (
              <p className="text-[11px] text-slate-500 italic">No hooks active. Try logging a session first.</p>
            ) : (
              <div className="flex flex-col gap-3">
                {hooks.map((hook, i) => (
                  <div key={i} className="bg-space-900 border border-white/5 p-3 rounded flex flex-col gap-1">
                    <span className="text-[10px] font-bold text-constellation-orange uppercase tracking-wide">
                      {hook.title}
                    </span>
                    <p className="text-[11px] text-slate-300 leading-relaxed">
                      {hook.description}
                    </p>
                    <span className="text-[9px] text-slate-500 uppercase tracking-wider font-semibold mt-1">
                      Sector: {hook.faction_or_system}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Middle/Right Column: Journal & Timeline */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          {/* Form to log a session */}
          {isOwner && (
            <div className="glass-panel p-6 rounded-lg border-white/5 flex flex-col gap-4">
              <h3 className="text-sm font-bold uppercase tracking-widest text-slate-100 border-b border-white/5 pb-2">
                Log New Game Session
              </h3>
              <form onSubmit={handleLogSubmit} className="flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] text-slate-400 font-bold tracking-widest uppercase">What did you achieve in this session?</label>
                  <textarea
                    value={sessionInput}
                    onChange={(e) => setSessionInput(e.target.value)}
                    placeholder="e.g. Completed UC Vanguard mission on Tau Ceti II, leveled up to 26, constructed a mining outpost on Jemison for Iron extraction."
                    required
                    rows={3}
                    className="bg-space-900 border border-white/10 focus:border-constellation-cyan focus:outline-none rounded px-3 py-2 text-sm text-slate-200 leading-relaxed"
                  />
                </div>

                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <label className="text-[10px] text-slate-400 font-bold tracking-widest uppercase">New Level</label>
                    <input
                      type="number"
                      value={newLevel}
                      onChange={(e) => setNewLevel(parseInt(e.target.value) || 1)}
                      min={1}
                      className="w-16 bg-space-900 border border-white/10 focus:border-constellation-cyan focus:outline-none rounded px-2 py-1 text-sm text-center text-slate-200"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={submittingLog}
                    className="py-2 px-5 bg-constellation-cyan text-space-950 font-bold uppercase text-xs tracking-widest rounded hover:bg-white transition-all flex items-center justify-center gap-1.5 shadow-glow-cyan"
                  >
                    {submittingLog ? (
                      <>
                        <div className="w-3.5 h-3.5 border-2 border-t-transparent border-constellation-cyan rounded-full animate-spin"></div>
                        Syncing Comms Log...
                      </>
                    ) : (
                      <>
                        <Send className="w-3.5 h-3.5" />
                        Log Session
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Captain Logs (Journal Logs generated by AI) */}
          <div className="glass-panel p-6 rounded-lg border-white/5 flex flex-col gap-4">
            <h3 className="text-sm font-bold uppercase tracking-widest text-slate-100 border-b border-white/5 pb-2 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-constellation-cyan" />
              Captain's Log Transmissions
            </h3>

            {logs.length === 0 ? (
              <p className="text-xs text-slate-500 py-6 italic text-center">No logs transmitted yet. Complete your first session log above.</p>
            ) : (
              <div className="flex flex-col gap-6">
                {logs.map((log) => (
                  <div key={log.id} className="border-b border-white/5 pb-6 last:border-0 last:pb-0 flex flex-col gap-3">
                    <div className="flex justify-between items-center bg-space-900/50 p-2 border border-white/5 rounded">
                      <span className="text-[10px] text-constellation-cyan font-bold tracking-widest uppercase">
                        Transmission Relay Logs
                      </span>
                      <span className="text-[9px] text-slate-500 font-semibold">
                        {new Date(log.created_at).toLocaleDateString()}
                      </span>
                    </div>

                    <div className="flex flex-col gap-2">
                      <div className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Player Session Action:</div>
                      <p className="text-xs text-slate-400 bg-space-900/30 p-2 border border-white/5 rounded">
                        {log.player_input}
                      </p>
                    </div>

                    <div className="flex flex-col gap-2 mt-1">
                      <div className="text-[10px] text-constellation-cyan uppercase tracking-widest font-bold flex items-center gap-1">
                        <Sparkles className="w-3 h-3" /> Transcoded Captain Log:
                      </div>
                      <p className="text-xs text-slate-200 leading-relaxed whitespace-pre-line bg-space-900/60 p-4 border border-constellation-cyan/10 rounded shadow-inner italic">
                        {log.ai_generated_log}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Timeline events */}
          <div className="glass-panel p-6 rounded-lg border-white/5 flex flex-col gap-4">
            <h3 className="text-sm font-bold uppercase tracking-widest text-slate-100 border-b border-white/5 pb-2 flex items-center gap-2">
              <List className="w-4 h-4 text-constellation-orange" />
              Timeline Milestones
            </h3>

            {events.length === 0 ? (
              <p className="text-xs text-slate-500 py-6 italic text-center">No milestones reached yet.</p>
            ) : (
              <div className="relative border-l border-white/10 ml-3 pl-6 flex flex-col gap-6 my-2">
                {events.map((evt) => (
                  <div key={evt.id} className="relative">
                    <span className="absolute -left-[31px] top-1.5 w-3.5 h-3.5 rounded-full border-2 border-constellation-orange bg-space-950 flex items-center justify-center">
                      <span className="w-1 h-1 rounded-full bg-constellation-orange"></span>
                    </span>
                    
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold text-constellation-orange bg-constellation-orange/10 px-1.5 py-0.5 border border-constellation-orange/20 rounded uppercase tracking-wider">
                        LVL {evt.level}
                      </span>
                      <h4 className="text-xs font-bold text-slate-100 uppercase tracking-wide">
                        {evt.event_title}
                      </h4>
                    </div>
                    <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                      {evt.event_description}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
