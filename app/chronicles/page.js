'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { Compass, BookOpen, User, Star, ChevronRight } from 'lucide-react';

export default function Chronicles() {
  const [characters, setCharacters] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPublicCharacters() {
      try {
        // 1. Fetch public characters from Supabase
        const { data, error } = await supabase
          .from('characters')
          .select('*')
          .eq('visibility', 'public')
          .order('updated_at', { ascending: false });

        let list = data || [];

        // 2. Fetch local sandbox characters if any
        const sandboxCharsStr = localStorage.getItem('sb-sandbox-characters');
        if (sandboxCharsStr) {
          const sandboxChars = JSON.parse(sandboxCharsStr).filter(c => c.visibility === 'public');
          list = [...sandboxChars, ...list];
        }

        // De-duplicate in case of duplicate IDs
        const uniqueList = list.filter((char, index, self) =>
          self.findIndex(t => t.id === char.id) === index
        );

        setCharacters(uniqueList);
      } catch (err) {
        console.error('Chronicles loading error:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchPublicCharacters();
  }, []);

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="border-b border-white/10 pb-4">
        <h1 className="text-3xl font-black uppercase tracking-wider text-slate-100 flex items-center gap-2">
          <BookOpen className="w-8 h-8 text-constellation-cyan" />
          Public Chronicles Directory
        </h1>
        <p className="text-xs text-slate-400 mt-1 uppercase tracking-wider">
          Galactic database: Broadcasting active Captain logs
        </p>
      </div>

      {loading ? (
        <div className="flex flex-col gap-2 justify-center items-center py-20 text-slate-500 uppercase tracking-widest text-xs">
          <div className="w-8 h-8 border-2 border-t-transparent border-constellation-cyan rounded-full animate-spin"></div>
          <span>Retrieving terminal records...</span>
        </div>
      ) : characters.length === 0 ? (
        <div className="text-center py-16 glass-panel rounded-lg border-white/5">
          <Compass className="w-12 h-12 text-slate-600 mx-auto mb-4" />
          <p className="text-sm text-slate-400">No public Captain Chronicles discovered in the sector relay.</p>
          <Link href="/character/new" className="inline-block mt-4 py-2 px-6 bg-constellation-cyan text-space-950 font-bold uppercase text-xs tracking-wider rounded transition-all">
            Be the First to Register
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {characters.map((char) => (
            <div key={char.id} className="glass-panel p-6 rounded-lg border-white/5 hover:border-constellation-cyan/30 transition-all flex flex-col justify-between gap-4">
              <div className="flex flex-col gap-2">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-black uppercase tracking-wide text-slate-100">
                      {char.name}
                    </h3>
                    <p className="text-[10px] text-constellation-cyan font-bold tracking-widest uppercase mt-0.5">
                      {char.background} • LEVEL {char.current_level}
                    </p>
                  </div>
                  <span className="text-[9px] text-slate-500 font-semibold bg-white/5 border border-white/10 px-2 py-0.5 rounded uppercase tracking-wider">
                    {char.visibility}
                  </span>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed line-clamp-3 mt-1 italic">
                  "{char.biography_summary || 'No biography summary generated yet. The Captain has just registered their dossier.'}"
                </p>
              </div>

              <div className="flex justify-between items-center border-t border-white/5 pt-3">
                <span className="text-[9px] text-slate-500 font-semibold uppercase tracking-wider">
                  Registered: {new Date(char.created_at || Date.now()).toLocaleDateString()}
                </span>
                <Link href={`/character/${char.id}`} className="text-xs font-bold text-constellation-cyan uppercase hover:text-slate-100 transition-colors flex items-center gap-0.5">
                  Access Log Slate <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
