'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Sparkles, ArrowUpRight, Github, Calendar, ShieldCheck } from 'lucide-react';

export default function CreatorHub() {
  const [mods, setMods] = useState([]);
  const [loading, setLoading] = useState(true);

  const defaultMods = [
    {
      id: 'default-1',
      title: 'Trade Wars: Merchant Intelligence Division (MID)',
      description: 'Expands the mercantile mechanics of Starfield with a dynamic trading economy, new corporate espionage missions, and high-stakes smuggling runs. Focuses on deep looter-shooter mechanics and resource distribution.',
      download_url: 'https://nexusmods.com',
      release_date: '2026-02-15',
      image_url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=600&auto=format&fit=crop'
    },
    {
      id: 'default-2',
      title: 'Aegis: Gates of Janus',
      description: 'A complete frontier-ops storytelling expansion introducing custom-voiced companions, base-building defenses, and tactical faction combat in the outer rims.',
      download_url: 'https://nexusmods.com',
      release_date: '2026-05-10',
      image_url: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=600&auto=format&fit=crop'
    }
  ];

  useEffect(() => {
    async function fetchMods() {
      try {
        const { data, error } = await supabase
          .from('mods')
          .select('*')
          .order('release_date', { ascending: false });

        if (data && data.length > 0) {
          setMods(data);
        } else {
          setMods(defaultMods);
        }
      } catch (err) {
        console.error('Failed to fetch mods:', err);
        setMods(defaultMods);
      } finally {
        setLoading(false);
      }
    }

    fetchMods();
  }, []);

  return (
    <div className="flex flex-col gap-10">
      {/* Bio Page */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-center border-b border-white/10 pb-10">
        <div className="lg:col-span-2 flex flex-col gap-4">
          <span className="text-[10px] text-constellation-cyan font-bold tracking-widest uppercase bg-constellation-cyan/10 px-3 py-1 rounded-full w-max border border-constellation-cyan/20">
            Mod Author Spotlight
          </span>
          <h1 className="text-4xl md:text-5xl font-black uppercase tracking-wider text-slate-100">
            Gamerroundup
          </h1>
          <p className="text-slate-300 text-sm md:text-base leading-relaxed max-w-2xl">
            Welcome to my Starfield Creator Hub. My development philosophy is rooted in expanding Bethesda's incredible framework to its limits. I focus on creating deep, emergent looter-shooter mechanics, tactical frontier-ops storytelling, and richer economics in the Settled Systems.
          </p>
          <div className="flex flex-wrap gap-4 mt-2">
            <div className="flex items-center gap-1.5 text-xs text-slate-400">
              <ShieldCheck className="w-4 h-4 text-constellation-cyan" />
              <span>Bethesda Verified Creator</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-slate-400">
              <Sparkles className="w-4 h-4 text-constellation-orange" />
              <span>Specializing in Mechanics & Systems Expansion</span>
            </div>
          </div>
        </div>

        {/* Constellation Seal Visual */}
        <div className="lg:col-span-1 flex justify-center">
          <div className="relative w-48 h-48 rounded-full border border-white/10 flex items-center justify-center bg-space-900 overflow-hidden shadow-inner group">
            {/* Constellation Seal graphics */}
            <div className="absolute inset-0 flex flex-col justify-between opacity-30 group-hover:opacity-50 transition-opacity">
              <div className="h-6 bg-constellation-orange w-full"></div>
              <div className="h-6 bg-constellation-yellow w-full"></div>
              <div className="h-6 bg-constellation-cyan w-full"></div>
              <div className="h-6 bg-constellation-violet w-full"></div>
            </div>
            <div className="relative text-center z-10 flex flex-col items-center">
              <span className="text-2xl font-black tracking-widest uppercase text-slate-100">GR</span>
              <span className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-1">FRONTIER OPS</span>
            </div>
          </div>
        </div>
      </div>

      {/* Dynamic Mod Showcase */}
      <div className="flex flex-col gap-6">
        <div>
          <h2 className="text-2xl font-black uppercase tracking-wider text-slate-100 flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-constellation-orange" />
            Dynamic Mod Showcase
          </h2>
          <p className="text-xs text-slate-400 mt-1 uppercase tracking-wider">
            Access blueprints and downloads directly from Nexus
          </p>
        </div>

        {loading ? (
          <div className="flex flex-col gap-2 justify-center items-center py-10 text-slate-500 uppercase tracking-widest text-xs">
            <div className="w-6 h-6 border border-t-transparent border-constellation-orange rounded-full animate-spin"></div>
            <span>Fetching mod index...</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {mods.map((mod) => (
              <div key={mod.id} className="glass-panel rounded-lg border-white/5 overflow-hidden flex flex-col group hover:border-constellation-orange/20 transition-all duration-300">
                {/* Mod Image */}
                <div className="h-48 w-full bg-space-900 relative overflow-hidden">
                  <img
                    src={mod.image_url || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=600&auto=format&fit=crop'}
                    alt={mod.title}
                    className="w-full h-full object-cover opacity-75 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-space-950 via-space-950/20 to-transparent"></div>
                  <span className="absolute bottom-4 left-4 text-[10px] text-constellation-orange font-bold tracking-widest uppercase bg-space-950/90 border border-constellation-orange/30 px-2 py-0.5 rounded">
                    Operational
                  </span>
                </div>

                {/* Mod Info */}
                <div className="p-6 flex-1 flex flex-col justify-between gap-4">
                  <div className="flex flex-col gap-2">
                    <h3 className="text-lg font-black uppercase tracking-wide text-slate-100 group-hover:text-constellation-orange transition-colors">
                      {mod.title}
                    </h3>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      {mod.description}
                    </p>
                  </div>

                  <div className="flex items-center justify-between border-t border-white/5 pt-4 mt-2">
                    <div className="flex items-center gap-1 text-[10px] text-slate-500 uppercase tracking-wider font-semibold">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>Released: {new Date(mod.release_date).toLocaleDateString()}</span>
                    </div>

                    <a
                      href={mod.download_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="py-1.5 px-4 bg-constellation-orange text-space-950 font-bold uppercase text-[10px] tracking-wider rounded hover:bg-white transition-all flex items-center gap-1 shadow-glow-orange/20"
                    >
                      Download <ArrowUpRight className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
