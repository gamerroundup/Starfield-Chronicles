'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Sparkles, ArrowUpRight, Calendar, ShieldCheck, Layers, BookOpen } from 'lucide-react';

export default function CreatorHub() {
  const [mods, setMods] = useState([]);
  const [projects, setProjects] = useState([]);
  const [activeTab, setActiveTab] = useState('mods'); // 'mods' or 'projects'
  const [loading, setLoading] = useState(true);
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    if (activeTab !== 'mods' || mods.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % mods.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [mods, activeTab]);

  // Settings states
  const [bioText, setBioText] = useState('Welcome to my Starfield Creator Hub. My development philosophy is rooted in expanding Bethesda\'s incredible framework to its limits. I focus on creating deep, emergent looter-shooter mechanics, tactical frontier-ops storytelling, and richer economics in the Settled Systems.');
  const [bioImg, setBioImg] = useState('');

  const defaultMods = [
    {
      id: 'default-1',
      title: 'Trade Wars: Merchant Intelligence Division (MID)',
      description: 'Expands the mercantile mechanics of Starfield with a dynamic trading economy, new corporate espionage missions, and high-stakes smuggling runs. Focuses on deep looter-shooter mechanics and resource distribution.',
      download_url: 'https://creations.bethesda.net/en/starfield/all',
      release_date: '2026-02-15',
      image_url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=600&auto=format&fit=crop'
    },
    {
      id: 'default-2',
      title: 'Aegis: Gates of Janus',
      description: 'A complete frontier-ops storytelling expansion introducing custom-voiced companions, base-building defenses, and tactical faction combat in the outer rims.',
      download_url: 'https://creations.bethesda.net/en/starfield/all',
      release_date: '2026-05-10',
      image_url: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=600&auto=format&fit=crop'
    }
  ];

  const defaultProjects = [
    {
      id: 'proj-1',
      title: 'Starfield Outpost Network Planner (PWA)',
      description: 'A mobile-first planning companion app allowing explorers to map extraction nodes, calculate resource assembly lines, and balance crew distributions across systems.',
      category: 'PWA',
      url: 'https://github.com',
      image_url: 'https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?q=80&w=600&auto=format&fit=crop'
    }
  ];

  useEffect(() => {
    async function fetchCreatorData() {
      try {
        // 1. Fetch settings
        const { data: dbSettings } = await supabase.from('settings').select('*');
        const localSettings = JSON.parse(localStorage.getItem('sb-sandbox-settings') || '{}');
        const settingsMap = {};
        dbSettings?.forEach(s => { settingsMap[s.key] = s.value; });

        if (settingsMap['creator_bio'] || localSettings['creator_bio']) {
          setBioText(settingsMap['creator_bio'] || localSettings['creator_bio']);
        }
        if (settingsMap['creator_image_url'] || localSettings['creator_image_url']) {
          setBioImg(settingsMap['creator_image_url'] || localSettings['creator_image_url']);
        }

        // 2. Fetch mods
        const { data: mdData } = await supabase.from('mods').select('*').order('release_date', { ascending: false });
        const localMods = JSON.parse(localStorage.getItem('sb-sandbox-mods') || '[]');
        setMods(mdData && mdData.length > 0 ? mdData : (localMods.length > 0 ? localMods : defaultMods));

        // 3. Fetch projects
        const { data: projData } = await supabase.from('projects').select('*').order('created_at', { ascending: false });
        const localProjs = JSON.parse(localStorage.getItem('sb-sandbox-projects') || '[]');
        setProjects(projData && projData.length > 0 ? projData : (localProjs.length > 0 ? localProjs : defaultProjects));

      } catch (err) {
        console.error('Failed to fetch creator data:', err);
        setMods(defaultMods);
        setProjects(defaultProjects);
      } finally {
        setLoading(false);
      }
    }

    fetchCreatorData();
  }, []);

  return (
    <div className="flex flex-col gap-10">
      {/* Biography Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-center border-b border-white/10 pb-10">
        <div className="lg:col-span-2 flex flex-col gap-4">
          <span className="text-[10px] text-constellation-cyan font-bold tracking-widest uppercase bg-constellation-cyan/10 px-3 py-1 rounded-full w-max border border-constellation-cyan/20">
            Verified Creator Hub
          </span>
          <h1 className="text-4xl md:text-5xl font-black uppercase tracking-wider text-slate-100">
            Gamerroundup
          </h1>
          <p className="text-slate-300 text-sm md:text-base leading-relaxed max-w-2xl whitespace-pre-line italic">
            "{bioText}"
          </p>
          <div className="flex flex-wrap gap-4 mt-2">
            <div className="flex items-center gap-1.5 text-xs text-slate-400">
              <ShieldCheck className="w-4 h-4 text-constellation-cyan" />
              <span>Bethesda Creations Author</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-slate-400">
              <Sparkles className="w-4 h-4 text-constellation-orange" />
              <span>Specializing in Mechanics & Systems Expansion</span>
            </div>
          </div>
        </div>

        {/* Dynamic Bio Photo */}
        <div className="lg:col-span-1 flex justify-center">
          {bioImg ? (
            <div className="relative w-48 h-48 rounded-full border border-constellation-cyan shadow-glow-cyan/20 overflow-hidden bg-space-900">
              <img src={bioImg} alt="Gamerroundup" className="w-full h-full object-cover" />
            </div>
          ) : (
            <div className="relative w-48 h-48 rounded-full border border-white/10 flex items-center justify-center bg-space-900 overflow-hidden shadow-inner group">
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
          )}
        </div>
      </div>

      {/* Tabs Switcher */}
      <div className="flex border-b border-white/10 gap-4">
        <button
          onClick={() => setActiveTab('mods')}
          className={`pb-3 text-sm font-bold uppercase tracking-wider transition-all border-b-2 ${
            activeTab === 'mods'
              ? 'border-constellation-orange text-constellation-orange font-black'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          Creations Mods ({mods.length})
        </button>
        <button
          onClick={() => setActiveTab('projects')}
          className={`pb-3 text-sm font-bold uppercase tracking-wider transition-all border-b-2 ${
            activeTab === 'projects'
              ? 'border-constellation-violet text-constellation-violet font-black'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          PWAs & Special Projects ({projects.length})
        </button>
      </div>

      {/* Display Mods Tab */}
      {activeTab === 'mods' && (
        <div className="flex flex-col gap-8">
          {loading ? (
            <div className="flex flex-col gap-2 justify-center items-center py-10 text-slate-500 uppercase tracking-widest text-xs">
              <div className="w-6 h-6 border border-t-transparent border-constellation-orange rounded-full animate-spin"></div>
              <span>Scanning Creations logs...</span>
            </div>
          ) : (
            <>
              {/* Rotating Mod Cover Banner */}
              {mods.length > 0 && (
                <div className="relative w-full h-64 md:h-96 rounded-lg overflow-hidden glass-panel border-constellation-orange/20 shadow-glow-orange/10 group">
                  {mods.map((slide, idx) => (
                    <div
                      key={slide.id}
                      className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
                        idx === currentSlide ? 'opacity-100 z-10' : 'opacity-0 z-0'
                      }`}
                    >
                      <img
                        src={slide.image_url || 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=600&auto=format&fit=crop'}
                        alt={slide.title}
                        className="w-full h-full object-cover opacity-60"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-space-950 via-space-950/30 to-transparent"></div>
                      <div className="absolute bottom-6 left-6 right-6 z-20 flex flex-col gap-1.5 md:gap-3">
                        <span className="text-[10px] text-constellation-orange font-bold tracking-widest uppercase bg-space-950/90 border border-constellation-orange/30 px-3 py-1 rounded w-max">
                          Featured Creation Blueprint
                        </span>
                        <h2 className="text-xl md:text-3xl font-black uppercase tracking-wide text-white drop-shadow-md">
                          {slide.title}
                        </h2>
                        <p className="text-xs text-slate-300 md:text-sm max-w-2xl line-clamp-2 leading-relaxed drop-shadow">
                          {slide.description}
                        </p>
                      </div>
                    </div>
                  ))}

                  {/* Dot Indicators */}
                  <div className="absolute bottom-4 right-6 z-25 flex gap-2">
                    {mods.map((_, idx) => (
                      <button
                        key={idx}
                        onClick={() => setCurrentSlide(idx)}
                        className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                          idx === currentSlide
                            ? 'bg-constellation-orange scale-125 shadow-glow-orange'
                            : 'bg-white/30 hover:bg-white/60'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Title Header */}
              <div className="border-b border-white/5 pb-2 mt-4">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Creations Catalog</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {mods.map((mod) => (
                <div key={mod.id} className="glass-panel rounded-lg border-white/5 overflow-hidden flex flex-col group hover:border-constellation-orange/20 transition-all duration-300">
                  <div className="h-48 w-full bg-space-900 relative overflow-hidden">
                    <img
                      src={mod.image_url || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=600&auto=format&fit=crop'}
                      alt={mod.title}
                      className="w-full h-full object-cover opacity-75 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-space-950 via-space-950/20 to-transparent"></div>
                    <span className="absolute bottom-4 left-4 text-[10px] text-constellation-orange font-bold tracking-widest uppercase bg-space-950/90 border border-constellation-orange/30 px-2.5 py-0.5 rounded">
                      Bethesda Creations
                    </span>
                  </div>

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
                        Creations Link <ArrowUpRight className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            </>
          )}
        </div>
      )}

      {/* Display Projects/PWAs Tab */}
      {activeTab === 'projects' && (
        <div className="flex flex-col gap-6">
          {loading ? (
            <div className="flex flex-col gap-2 justify-center items-center py-10 text-slate-500 uppercase tracking-widest text-xs">
              <div className="w-6 h-6 border border-t-transparent border-constellation-violet rounded-full animate-spin"></div>
              <span>Retrieving blueprint codes...</span>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {projects.map((proj) => (
                <div key={proj.id} className="glass-panel rounded-lg border-white/5 overflow-hidden flex flex-col group hover:border-constellation-violet/20 transition-all duration-300">
                  <div className="h-48 w-full bg-space-900 relative overflow-hidden">
                    <img
                      src={proj.image_url || 'https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?q=80&w=600&auto=format&fit=crop'}
                      alt={proj.title}
                      className="w-full h-full object-cover opacity-75 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-space-950 via-space-950/20 to-transparent"></div>
                    <span className="absolute bottom-4 left-4 text-[10px] text-constellation-violet font-bold tracking-widest uppercase bg-space-950/90 border border-constellation-violet/30 px-2.5 py-0.5 rounded">
                      {proj.category}
                    </span>
                  </div>

                  <div className="p-6 flex-1 flex flex-col justify-between gap-4">
                    <div className="flex flex-col gap-2">
                      <h3 className="text-lg font-black uppercase tracking-wide text-slate-100 group-hover:text-constellation-violet transition-colors">
                        {proj.title}
                      </h3>
                      <p className="text-xs text-slate-400 leading-relaxed">
                        {proj.description}
                      </p>
                    </div>

                    <div className="flex items-center justify-end border-t border-white/5 pt-4 mt-2">
                      <a
                        href={proj.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="py-1.5 px-4 bg-constellation-violet text-space-950 font-bold uppercase text-[10px] tracking-wider rounded hover:bg-white transition-all flex items-center gap-1 shadow-glow-violet/20"
                      >
                        Launch App <ArrowUpRight className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
