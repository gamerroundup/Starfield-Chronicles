'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Compass, Sparkles, AlertCircle, Save, Info } from 'lucide-react';
import { generateRandomCharacter, generateLocalBiography } from '@/lib/characterGenerator';

export default function NewCharacter() {
  const router = useRouter();
  
  // Character form state
  const [name, setName] = useState('');
  const [background, setBackground] = useState('');
  const [traits, setTraits] = useState('');
  const [visibility, setVisibility] = useState('private');
  const [bioSummary, setBioSummary] = useState('');
  
  // AI Assist state
  const [playstyle, setPlaystyle] = useState('Exploration');
  const [isGenerating, setIsGenerating] = useState(false);
  const [useAi, setUseAi] = useState(false);
  const [aiError, setAiError] = useState('');
  
  // General page state
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    async function checkUser() {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (!authUser) {
        const sandboxUser = localStorage.getItem('sb-sandbox-user');
        if (sandboxUser) {
          setUser(JSON.parse(sandboxUser));
        } else {
          router.push('/login');
        }
      } else {
        setUser(authUser);
      }
      setLoading(false);
    }
    checkUser();
  }, []);

  const handleResetForm = () => {
    setName('');
    setBackground('');
    setTraits('');
    setBioSummary('');
    setAiError('');
  };

  const handleAiAssist = async () => {
    setIsGenerating(true);
    setAiError('');

    // Always generate a fresh random character locally on every click
    const generated = generateRandomCharacter();
    const targetName = generated.name;
    const targetBackground = generated.background;
    const targetTraits = generated.traits;

    // Populate inputs in UI immediately
    setName(targetName);
    setBackground(targetBackground);
    setTraits(targetTraits);

    if (!useAi) {
      // Local RNG mode - generate biography instantly from templates
      const localBio = generateLocalBiography(targetName, targetBackground, targetTraits, playstyle);
      setBioSummary(localBio);
      setIsGenerating(false);
      return;
    }

    try {
      const actualRes = await fetch('/api/character/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ playstyle, name: targetName, background: targetBackground, traits: targetTraits })
      });

      const data = await actualRes.json();
      if (data.success && data.dossier) {
        setName(data.dossier.name || targetName);
        setBackground(data.dossier.background || targetBackground);
        setTraits(data.dossier.traits || targetTraits);
        setBioSummary(data.dossier.biography_summary || '');
      } else {
        // Quota reached or API error - fallback to local biography generation silently
        console.warn('API generation failed, falling back to local compiler:', data.error);
        const fallbackBio = generateLocalBiography(targetName, targetBackground, targetTraits, playstyle);
        setBioSummary(fallbackBio);
      }
    } catch (err) {
      console.warn('API connection failed, falling back to local compiler:', err);
      const fallbackBio = generateLocalBiography(targetName, targetBackground, targetTraits, playstyle);
      setBioSummary(fallbackBio);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    setSubmitting(true);
    try {
      const charData = {
        user_id: user?.id || null,
        name,
        background,
        traits,
        current_level: 1,
        biography_summary: bioSummary,
        visibility
      };

      const { data, error } = await supabase
        .from('characters')
        .insert([charData])
        .select()
        .single();

      if (error) {
        console.warn('Supabase save failed, saving to sandbox storage:', error);
        const sandboxId = 'sandbox-' + Math.random().toString(36).substr(2, 9);
        const mockSavedChar = { ...charData, id: sandboxId, created_at: new Date().toISOString() };
        
        const existing = JSON.parse(localStorage.getItem('sb-sandbox-characters') || '[]');
        existing.push(mockSavedChar);
        localStorage.setItem('sb-sandbox-characters', JSON.stringify(existing));

        router.push(`/character/${sandboxId}`);
      } else {
        router.push(`/character/${data.id}`);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-space-950">
        <div className="w-8 h-8 border-4 border-t-transparent border-constellation-cyan rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <main className="min-h-screen pt-24 pb-16 px-4 md:px-8 max-w-7xl mx-auto flex flex-col gap-8">
      {/* Header */}
      <div className="flex flex-col gap-2">
        <h2 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-slate-100 to-slate-400 bg-clip-text text-transparent flex items-center gap-2">
          <Compass className="w-8 h-8 text-constellation-cyan" /> CAPTAIN REGISTRY
        </h2>
        <p className="text-slate-400 text-sm max-w-2xl">
          Register a new star-faring profile manually, or use the constellation AI compiler to automatically build a lore-friendly identity.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Side: AI Generator Controls */}
        <div className="glass-panel p-6 rounded-lg border-white/5 flex flex-col gap-5 h-fit">
          <div className="flex items-center gap-2 border-b border-white/5 pb-2">
            <Sparkles className="w-5 h-5 text-constellation-cyan" />
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-200">AI Assist Compiler</h3>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-[10px] text-slate-400 font-bold tracking-widest uppercase">Preferred Playstyle</label>
            <select
              value={playstyle}
              onChange={(e) => setPlaystyle(e.target.value)}
              className="bg-space-900 border border-white/10 text-xs text-slate-200 rounded px-2.5 py-1.5 focus:border-constellation-cyan focus:outline-none uppercase tracking-wider font-semibold"
            >
              <option value="Exploration">Exploration & Discovery</option>
              <option value="Action">Action & Combat Operations</option>
              <option value="Survival">Survival & Resource Outposts</option>
              <option value="Bounty Hunter">Bounty Hunting & Frontier Law</option>
              <option value="Corporate">Ryujin Corporate Intrigue</option>
            </select>
          </div>

          <div className="flex items-center gap-2 mt-1">
            <input
              type="checkbox"
              id="useAiToggle"
              checked={useAi}
              onChange={(e) => setUseAi(e.target.checked)}
              className="w-3.5 h-3.5 rounded border-white/10 bg-space-900 text-constellation-cyan focus:ring-constellation-cyan focus:ring-offset-space-950"
            />
            <label htmlFor="useAiToggle" className="text-[10px] font-semibold text-slate-300 uppercase tracking-wider cursor-pointer select-none">
              Use Gemini AI Assist
            </label>
          </div>

          {aiError && (
            <div className="text-[11px] p-2.5 rounded bg-red-950/40 border border-red-500/25 text-red-300 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
              <span>{aiError}</span>
            </div>
          )}

          <div className="flex flex-col gap-2 mt-2">
            <button
              type="button"
              onClick={handleAiAssist}
              disabled={isGenerating}
              className="w-full py-2 px-4 bg-transparent hover:bg-constellation-cyan/15 border border-constellation-cyan text-constellation-cyan font-bold uppercase text-xs tracking-wider rounded transition-all flex items-center justify-center gap-1.5 shadow-glow-cyan/20"
            >
              {isGenerating ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-t-transparent border-constellation-cyan rounded-full animate-spin"></div>
                  Compiling...
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" /> {useAi ? 'Generate AI Dossier' : 'Generate Local Dossier'}
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handleResetForm}
              className="w-full py-1.5 px-4 bg-white/5 hover:bg-white/10 text-slate-300 font-bold uppercase text-[10px] tracking-wider rounded transition-all"
            >
              Reset / Clear Form
            </button>
          </div>
        </div>

        {/* Right Side: Character Manual Registry Form */}
        <form onSubmit={handleSubmit} className="lg:col-span-2 glass-panel p-6 rounded-lg border-white/5 flex flex-col gap-6">
          <h3 className="text-sm font-bold uppercase tracking-widest text-slate-100 border-b border-white/5 pb-2">
            Captain Dossier Registry Form
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] text-slate-400 font-bold tracking-widest uppercase">Captain Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Leave blank for AI, or enter name"
                required
                className="bg-space-900 border border-white/10 focus:border-constellation-cyan focus:outline-none rounded px-3 py-2 text-sm text-slate-200 uppercase tracking-wide"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] text-slate-400 font-bold tracking-widest uppercase">Background Category</label>
              <input
                type="text"
                value={background}
                onChange={(e) => setBackground(e.target.value)}
                placeholder="Leave blank for AI background, or enter custom"
                required
                className="bg-space-900 border border-white/10 focus:border-constellation-cyan focus:outline-none rounded px-3 py-2 text-sm text-slate-200"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] text-slate-400 font-bold tracking-widest uppercase">Character Traits (Comma Separated)</label>
            <input
              type="text"
              value={traits}
              onChange={(e) => setTraits(e.target.value)}
              placeholder="Leave blank for AI traits, or enter comma-separated list"
              className="bg-space-900 border border-white/10 focus:border-constellation-cyan focus:outline-none rounded px-3 py-2 text-sm text-slate-200"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] text-slate-400 font-bold tracking-widest uppercase">Biography & Origin summary</label>
            <textarea
              value={bioSummary}
              onChange={(e) => setBioSummary(e.target.value)}
              placeholder="Write a summary or use the AI Assist dossier generator on the left to compile one..."
              rows={6}
              className="bg-space-900 border border-white/10 focus:border-constellation-cyan focus:outline-none rounded px-3 py-2 text-sm text-slate-200 leading-relaxed"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center border-t border-white/5 pt-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] text-slate-400 font-bold tracking-widest uppercase">Transmission Visibility</label>
              <div className="flex gap-2">
                {['private', 'unlisted', 'public'].map((vis) => (
                  <button
                    key={vis}
                    type="button"
                    onClick={() => setVisibility(vis)}
                    className={`flex-1 py-1.5 text-[10px] font-bold tracking-widest uppercase rounded border transition-all ${
                      visibility === vis
                        ? 'bg-constellation-cyan/15 border-constellation-cyan text-constellation-cyan shadow-glow-cyan/20'
                        : 'bg-transparent border-white/10 text-slate-400 hover:text-slate-200 hover:bg-white/5'
                    }`}
                  >
                    {vis}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex justify-end mt-4 md:mt-0">
              <button
                type="submit"
                disabled={submitting}
                className="w-full md:w-auto py-2.5 px-6 bg-constellation-cyan text-space-950 font-bold uppercase text-xs tracking-widest rounded hover:bg-white transition-all flex items-center justify-center gap-1.5 shadow-glow-cyan"
              >
                <Save className="w-4 h-4" />
                {submitting ? 'Registry Syncing...' : 'Publish Dossier'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </main>
  );
}
