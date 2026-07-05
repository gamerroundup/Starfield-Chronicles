'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { ShieldCheck, Plus, Trash2, Edit, Save, PlusCircle } from 'lucide-react';

export default function AdminPortal() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [loading, setLoading] = useState(true);

  // Announcements CRUD states
  const [announcements, setAnnouncements] = useState([]);
  const [newAnn, setNewAnn] = useState('');

  // Mods CRUD states
  const [mods, setMods] = useState([]);
  const [editingMod, setEditingMod] = useState(null);
  const [modTitle, setModTitle] = useState('');
  const [modDesc, setModDesc] = useState('');
  const [modImg, setModImg] = useState('');
  const [modUrl, setModUrl] = useState('');
  const [modDate, setModDate] = useState('');

  useEffect(() => {
    async function checkAdmin() {
      const { data: { user } } = await supabase.auth.getUser();
      const sandboxUser = localStorage.getItem('sb-sandbox-user');
      
      // Allow bypass if email matches admin@gamerroundup.com or sandbox mode is active
      if (user?.email === 'admin@gamerroundup.com' || sandboxUser) {
        setIsAdmin(true);
        fetchData();
      }
      setLoading(false);
    }
    checkAdmin();
  }, []);

  const handleAdminLogin = async (e) => {
    e.preventDefault();
    setAuthError('');

    const { data, error } = await supabase.auth.signInWithPassword({
      email: adminEmail,
      password: adminPassword,
    });

    if (error) {
      // Sandbox bypass check for local testing
      if (adminEmail === 'admin@gamerroundup.com' && adminPassword === 'Admin123!') {
        setIsAdmin(true);
        localStorage.setItem('sb-sandbox-user', JSON.stringify({
          id: 'admin-uuid-00000',
          email: 'admin@gamerroundup.com',
          user_metadata: { role: 'admin' }
        }));
        fetchData();
      } else {
        setAuthError(error.message);
      }
    } else if (data?.user?.email === 'admin@gamerroundup.com') {
      setIsAdmin(true);
      fetchData();
    } else {
      setAuthError('Unauthorized: Access Restricted to Administrator.');
    }
  };

  const fetchData = async () => {
    // 1. Fetch announcements
    const { data: ann } = await supabase
      .from('announcements')
      .select('*')
      .order('created_at', { ascending: false });
    
    // Fallback if local sandbox
    const localAnn = JSON.parse(localStorage.getItem('sb-sandbox-announcements') || '[]');
    setAnnouncements(ann && ann.length > 0 ? ann : localAnn);

    // 2. Fetch mods
    const { data: mdData } = await supabase
      .from('mods')
      .select('*')
      .order('release_date', { ascending: false });

    const localMods = JSON.parse(localStorage.getItem('sb-sandbox-mods') || '[]');
    setMods(mdData && mdData.length > 0 ? mdData : localMods);
  };

  // SSNN Announcements Actions
  const addAnnouncement = async () => {
    if (!newAnn.trim()) return;

    const annItem = { content: newAnn, active: true };
    const { data, error } = await supabase.from('announcements').insert([annItem]).select();

    if (error) {
      // Sandbox save
      const local = JSON.parse(localStorage.getItem('sb-sandbox-announcements') || '[]');
      const mockAnn = { ...annItem, id: 'sb-ann-' + Date.now(), created_at: new Date().toISOString() };
      local.unshift(mockAnn);
      localStorage.setItem('sb-sandbox-announcements', JSON.stringify(local));
      setAnnouncements(local);
    } else if (data) {
      setAnnouncements(prev => [data[0], ...prev]);
    }
    setNewAnn('');
  };

  const deleteAnnouncement = async (annId) => {
    const { error } = await supabase.from('announcements').delete().eq('id', annId);

    if (error || annId.startsWith('sb-ann-')) {
      const local = JSON.parse(localStorage.getItem('sb-sandbox-announcements') || '[]');
      const filtered = local.filter(a => a.id !== annId);
      localStorage.setItem('sb-sandbox-announcements', JSON.stringify(filtered));
      setAnnouncements(filtered);
    } else {
      setAnnouncements(prev => prev.filter(a => a.id !== annId));
    }
  };

  // Mods CRUD Actions
  const saveMod = async (e) => {
    e.preventDefault();
    if (!modTitle.trim() || !modUrl.trim()) return;

    const modData = {
      title: modTitle,
      description: modDesc,
      image_url: modImg || null,
      download_url: modUrl,
      release_date: modDate || new Date().toISOString().split('T')[0]
    };

    if (editingMod) {
      // Update operation
      const { error } = await supabase.from('mods').update(modData).eq('id', editingMod.id);

      if (error || editingMod.id.startsWith('sb-mod-')) {
        const local = JSON.parse(localStorage.getItem('sb-sandbox-mods') || '[]');
        const idx = local.findIndex(m => m.id === editingMod.id);
        if (idx !== -1) {
          local[idx] = { ...local[idx], ...modData };
          localStorage.setItem('sb-sandbox-mods', JSON.stringify(local));
          setMods(local);
        }
      } else {
        setMods(prev => prev.map(m => m.id === editingMod.id ? { ...m, ...modData } : m));
      }
    } else {
      // Create operation
      const { data, error } = await supabase.from('mods').insert([modData]).select();

      if (error) {
        const local = JSON.parse(localStorage.getItem('sb-sandbox-mods') || '[]');
        const mockNewMod = { ...modData, id: 'sb-mod-' + Date.now(), created_at: new Date().toISOString() };
        local.unshift(mockNewMod);
        localStorage.setItem('sb-sandbox-mods', JSON.stringify(local));
        setMods(local);
      } else if (data) {
        setMods(prev => [data[0], ...prev]);
      }
    }

    clearModForm();
  };

  const editMod = (mod) => {
    setEditingMod(mod);
    setModTitle(mod.title);
    setModDesc(mod.description);
    setModImg(mod.image_url || '');
    setModUrl(mod.download_url);
    setModDate(mod.release_date);
  };

  const deleteMod = async (modId) => {
    const { error } = await supabase.from('mods').delete().eq('id', modId);

    if (error || modId.startsWith('sb-mod-')) {
      const local = JSON.parse(localStorage.getItem('sb-sandbox-mods') || '[]');
      const filtered = local.filter(m => m.id !== modId);
      localStorage.setItem('sb-sandbox-mods', JSON.stringify(filtered));
      setMods(filtered);
    } else {
      setMods(prev => prev.filter(m => m.id !== modId));
    }
  };

  const clearModForm = () => {
    setEditingMod(null);
    setModTitle('');
    setModDesc('');
    setModImg('');
    setModUrl('');
    setModDate('');
  };

  if (loading) {
    return (
      <div className="flex flex-col gap-2 justify-center items-center py-20 text-slate-500 uppercase tracking-widest text-xs">
        <div className="w-8 h-8 border-2 border-t-transparent border-constellation-cyan rounded-full animate-spin"></div>
        <span>Opening secure security gate...</span>
      </div>
    );
  }

  // Admin Login Screen
  if (!isAdmin) {
    return (
      <div className="max-w-md mx-auto py-10">
        <div className="glass-panel p-8 rounded-lg border-white/10 flex flex-col gap-6 relative">
          <div className="text-center">
            <ShieldCheck className="w-10 h-10 text-constellation-orange mx-auto mb-2 animate-pulse" />
            <h2 className="text-2xl font-bold uppercase tracking-wider text-slate-100">SSNN Decrypt Console</h2>
            <p className="text-xs text-slate-400 mt-1 uppercase tracking-wider">Authorized Developers Only</p>
          </div>

          <form onSubmit={handleAdminLogin} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] text-slate-400 font-bold tracking-widest uppercase">Admin Username</label>
              <input
                type="email"
                value={adminEmail}
                onChange={(e) => setAdminEmail(e.target.value)}
                placeholder="admin@gamerroundup.com"
                required
                className="bg-space-900 border border-white/10 focus:border-constellation-orange focus:outline-none rounded px-3 py-2 text-sm text-slate-200"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] text-slate-400 font-bold tracking-widest uppercase">Decryption Cipher</label>
              <input
                type="password"
                value={adminPassword}
                onChange={(e) => setAdminPassword(e.target.value)}
                placeholder="Admin123!"
                required
                className="bg-space-900 border border-white/10 focus:border-constellation-orange focus:outline-none rounded px-3 py-2 text-sm text-slate-200"
              />
            </div>

            {authError && (
              <p className="text-xs text-red-400 bg-red-950/20 border border-red-500/20 p-2 rounded">
                {authError}
              </p>
            )}

            <button
              type="submit"
              className="w-full py-2.5 px-4 mt-2 bg-constellation-orange text-space-950 font-bold uppercase text-xs tracking-wider rounded hover:bg-white transition-all flex items-center justify-center gap-1 shadow-glow-orange"
            >
              Sign In Admin
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      {/* Header */}
      <div className="border-b border-white/10 pb-4">
        <h1 className="text-3xl font-black uppercase tracking-wider text-slate-100 flex items-center gap-2">
          <ShieldCheck className="w-8 h-8 text-constellation-orange" />
          Hidden Admin Command Panel
        </h1>
        <p className="text-xs text-slate-400 mt-1 uppercase tracking-wider">
          Registry control module: Update announcements and database items
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: SSNN Announcements Marquee Control */}
        <div className="lg:col-span-1 glass-panel p-6 rounded-lg border-white/5 flex flex-col gap-4">
          <h3 className="text-sm font-bold uppercase tracking-widest text-constellation-cyan border-b border-white/5 pb-2">
            SSNN Live Broadcast Ticker
          </h3>
          
          <div className="flex gap-2">
            <input
              type="text"
              value={newAnn}
              onChange={(e) => setNewAnn(e.target.value)}
              placeholder="e.g. Relays warn of starborn anomaly..."
              className="flex-1 bg-space-900 border border-white/10 focus:border-constellation-cyan focus:outline-none rounded px-2.5 py-1.5 text-xs text-slate-200"
            />
            <button
              onClick={addAnnouncement}
              className="p-2 bg-constellation-cyan text-space-950 font-bold rounded hover:bg-white transition-all"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          <div className="flex flex-col gap-2 mt-2 max-h-[300px] overflow-y-auto">
            {announcements.map((ann) => (
              <div key={ann.id} className="flex justify-between items-center gap-3 bg-space-900 border border-white/5 p-2.5 rounded">
                <span className="text-[11px] text-slate-300 leading-normal">{ann.content}</span>
                <button
                  onClick={() => deleteAnnouncement(ann.id)}
                  className="text-slate-500 hover:text-red-400 transition-colors shrink-0"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Mods database CRUD */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          {/* Mod CRUD Form */}
          <form onSubmit={saveMod} className="glass-panel p-6 rounded-lg border-white/5 flex flex-col gap-4">
            <h3 className="text-sm font-bold uppercase tracking-widest text-constellation-orange border-b border-white/5 pb-2 flex justify-between items-center">
              <span>{editingMod ? 'Edit Mod Specification' : 'Upload New Mod Specification'}</span>
              {editingMod && (
                <button
                  type="button"
                  onClick={clearModForm}
                  className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold border border-white/10 px-2 py-0.5 rounded hover:bg-white/5"
                >
                  Cancel Edit
                </button>
              )}
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[9px] text-slate-400 font-bold tracking-widest uppercase">Mod Title</label>
                <input
                  type="text"
                  value={modTitle}
                  onChange={(e) => setModTitle(e.target.value)}
                  placeholder="e.g. Aegis: Gates of Janus"
                  required
                  className="bg-space-900 border border-white/10 focus:border-constellation-orange focus:outline-none rounded px-3 py-1.5 text-xs text-slate-200"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[9px] text-slate-400 font-bold tracking-widest uppercase">Release Date</label>
                <input
                  type="date"
                  value={modDate}
                  onChange={(e) => setModDate(e.target.value)}
                  className="bg-space-900 border border-white/10 focus:border-constellation-orange focus:outline-none rounded px-3 py-1.5 text-xs text-slate-200"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[9px] text-slate-400 font-bold tracking-widest uppercase">Description</label>
              <textarea
                value={modDesc}
                onChange={(e) => setModDesc(e.target.value)}
                placeholder="Describe features, factions, and looter mechanics..."
                rows={3}
                className="bg-space-900 border border-white/10 focus:border-constellation-orange focus:outline-none rounded px-3 py-1.5 text-xs text-slate-200 leading-relaxed"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[9px] text-slate-400 font-bold tracking-widest uppercase">Cover Image URL</label>
                <input
                  type="url"
                  value={modImg}
                  onChange={(e) => setModImg(e.target.value)}
                  placeholder="https://example.com/cover.png"
                  className="bg-space-900 border border-white/10 focus:border-constellation-orange focus:outline-none rounded px-3 py-1.5 text-xs text-slate-200"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[9px] text-slate-400 font-bold tracking-widest uppercase">Download Nexus/GitHub URL</label>
                <input
                  type="url"
                  value={modUrl}
                  onChange={(e) => setModUrl(e.target.value)}
                  placeholder="https://nexusmods.com"
                  required
                  className="bg-space-900 border border-white/10 focus:border-constellation-orange focus:outline-none rounded px-3 py-1.5 text-xs text-slate-200"
                />
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                className="py-2 px-5 bg-constellation-orange text-space-950 font-bold uppercase text-[10px] tracking-widest rounded hover:bg-white transition-all flex items-center gap-1.5 shadow-glow-orange"
              >
                <Save className="w-3.5 h-3.5" />
                {editingMod ? 'Update Mod' : 'Publish Mod'}
              </button>
            </div>
          </form>

          {/* Active Mods List for Edit / Delete */}
          <div className="glass-panel p-6 rounded-lg border-white/5 flex flex-col gap-4">
            <h3 className="text-sm font-bold uppercase tracking-widest text-slate-100 border-b border-white/5 pb-2">
              Registered Database Mod Index
            </h3>

            <div className="flex flex-col gap-3">
              {mods.map((mod) => (
                <div key={mod.id} className="flex justify-between items-center gap-4 bg-space-900 border border-white/5 p-4 rounded hover:border-constellation-orange/20 transition-all">
                  <div>
                    <h4 className="text-xs font-black text-slate-100 uppercase tracking-wide">{mod.title}</h4>
                    <span className="text-[9px] text-slate-500 uppercase tracking-wider font-semibold">
                      Released: {new Date(mod.release_date).toLocaleDateString()}
                    </span>
                  </div>

                  <div className="flex gap-2 shrink-0">
                    <button
                      onClick={() => editMod(mod)}
                      className="p-1.5 bg-white/5 hover:bg-constellation-orange/15 text-slate-400 hover:text-constellation-orange border border-white/10 rounded transition-all"
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => deleteMod(mod.id)}
                      className="p-1.5 bg-white/5 hover:bg-red-950/20 text-slate-400 hover:text-red-400 border border-white/10 rounded transition-all"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
