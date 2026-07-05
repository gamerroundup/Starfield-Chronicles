'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { ShieldCheck, Plus, Trash2, Edit, Save, Compass, Settings, BookOpen, Layers } from 'lucide-react';

export default function AdminPortal() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [adminKey, setAdminKey] = useState('');
  const [authError, setAuthError] = useState('');
  const [loading, setLoading] = useState(true);

  // Dynamic Settings states
  const [bioText, setBioText] = useState('');
  const [bioImg, setBioImg] = useState('');
  const [geminiKey, setGeminiKey] = useState('');
  const [supabaseKeyBypass, setSupabaseKeyBypass] = useState('');
  const [savingSettings, setSavingSettings] = useState(false);

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

  // Special Projects CRUD states
  const [projects, setProjects] = useState([]);
  const [editingProj, setEditingProj] = useState(null);
  const [projTitle, setProjTitle] = useState('');
  const [projDesc, setProjDesc] = useState('');
  const [projCategory, setProjCategory] = useState('PWA');
  const [projUrl, setProjUrl] = useState('');
  const [projImg, setProjImg] = useState('');

  useEffect(() => {
    async function checkAdmin() {
      const { data: { user } } = await supabase.auth.getUser();
      const sandboxUser = localStorage.getItem('sb-sandbox-user');
      
      // Automatic bypass if signed in previously as admin
      if (user?.email === 'prattgrf3@gmail.com' || (sandboxUser && JSON.parse(sandboxUser).email === 'prattgrf3@gmail.com')) {
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

    // Double Authentication verification
    const isLocalBypass = adminEmail === 'prattgrf3@gmail.com' && adminPassword === 'Kalie0423!' && adminKey === 'Admin123!';
    
    if (isLocalBypass) {
      setIsAdmin(true);
      localStorage.setItem('sb-sandbox-user', JSON.stringify({
        id: 'admin-uuid-00000',
        email: 'prattgrf3@gmail.com',
        user_metadata: { role: 'admin' }
      }));
      fetchData();
      return;
    }

    // Try Supabase auth first
    const { data, error } = await supabase.auth.signInWithPassword({
      email: adminEmail,
      password: adminPassword,
    });

    if (error) {
      setAuthError('Access Denied: Invalid Credentials or Security Key Cipher.');
    } else if (data?.user?.email === 'prattgrf3@gmail.com' && adminKey === 'Admin123!') {
      setIsAdmin(true);
      fetchData();
    } else {
      setAuthError('Unauthorized: Dual-Layer Authentication mismatch.');
    }
  };

  const fetchData = async () => {
    // 1. Fetch settings
    const { data: dbSettings } = await supabase.from('settings').select('*');
    const localSettings = JSON.parse(localStorage.getItem('sb-sandbox-settings') || '{}');
    
    const settingsMap = {};
    dbSettings?.forEach(s => { settingsMap[s.key] = s.value; });
    
    setBioText(settingsMap['creator_bio'] || localSettings['creator_bio'] || 'Welcome to my Starfield Creator Hub.');
    setBioImg(settingsMap['creator_image_url'] || localSettings['creator_image_url'] || '');
    setGeminiKey(settingsMap['gemini_api_key'] || localSettings['gemini_api_key'] || '');
    setSupabaseKeyBypass(settingsMap['supabase_bypass'] || localSettings['supabase_bypass'] || '');

    // 2. Fetch announcements
    const { data: ann } = await supabase.from('announcements').select('*').order('created_at', { ascending: false });
    const localAnn = JSON.parse(localStorage.getItem('sb-sandbox-announcements') || '[]');
    setAnnouncements(ann && ann.length > 0 ? ann : localAnn);

    // 3. Fetch mods
    const { data: mdData } = await supabase.from('mods').select('*').order('release_date', { ascending: false });
    const localMods = JSON.parse(localStorage.getItem('sb-sandbox-mods') || '[]');
    setMods(mdData && mdData.length > 0 ? mdData : localMods);

    // 4. Fetch special projects
    const { data: projData } = await supabase.from('projects').select('*').order('created_at', { ascending: false });
    const localProjs = JSON.parse(localStorage.getItem('sb-sandbox-projects') || '[]');
    setProjects(projData && projData.length > 0 ? projData : localProjs);
  };

  // Settings Actions
  const handleSaveSettings = async () => {
    setSavingSettings(true);
    const settingsItems = [
      { key: 'creator_bio', value: bioText },
      { key: 'creator_image_url', value: bioImg },
      { key: 'gemini_api_key', value: geminiKey },
      { key: 'supabase_bypass', value: supabaseKeyBypass }
    ];

    let hasError = false;
    for (const item of settingsItems) {
      const { error } = await supabase.from('settings').upsert([item]);
      if (error) {
        console.warn(`Upsert error for key ${item.key}:`, error);
        hasError = true;
      }
    }

    // Always sync to sandbox storage too
    const local = {
      creator_bio: bioText,
      creator_image_url: bioImg,
      gemini_api_key: geminiKey,
      supabase_bypass: supabaseKeyBypass
    };
    localStorage.setItem('sb-sandbox-settings', JSON.stringify(local));

    setSavingSettings(false);
    alert('Settings synced successfully!');
  };

  // SSNN Announcements Actions
  const addAnnouncement = async () => {
    if (!newAnn.trim()) return;
    const annItem = { content: newAnn, active: true };
    const { data, error } = await supabase.from('announcements').insert([annItem]).select();

    if (error) {
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

  // Special Projects Actions
  const saveProject = async (e) => {
    e.preventDefault();
    if (!projTitle.trim() || !projUrl.trim()) return;

    const projData = {
      title: projTitle,
      description: projDesc,
      category: projCategory,
      url: projUrl,
      image_url: projImg || null
    };

    if (editingProj) {
      const { error } = await supabase.from('projects').update(projData).eq('id', editingProj.id);
      if (error || editingProj.id.startsWith('sb-proj-')) {
        const local = JSON.parse(localStorage.getItem('sb-sandbox-projects') || '[]');
        const idx = local.findIndex(p => p.id === editingProj.id);
        if (idx !== -1) {
          local[idx] = { ...local[idx], ...projData };
          localStorage.setItem('sb-sandbox-projects', JSON.stringify(local));
          setProjects(local);
        }
      } else {
        setProjects(prev => prev.map(p => p.id === editingProj.id ? { ...p, ...projData } : p));
      }
    } else {
      const { data, error } = await supabase.from('projects').insert([projData]).select();
      if (error) {
        const local = JSON.parse(localStorage.getItem('sb-sandbox-projects') || '[]');
        const mockNewProj = { ...projData, id: 'sb-proj-' + Date.now(), created_at: new Date().toISOString() };
        local.unshift(mockNewProj);
        localStorage.setItem('sb-sandbox-projects', JSON.stringify(local));
        setProjects(local);
      } else if (data) {
        setProjects(prev => [data[0], ...prev]);
      }
    }
    clearProjForm();
  };

  const deleteProject = async (projId) => {
    const { error } = await supabase.from('projects').delete().eq('id', projId);
    if (error || projId.startsWith('sb-proj-')) {
      const local = JSON.parse(localStorage.getItem('sb-sandbox-projects') || '[]');
      const filtered = local.filter(p => p.id !== projId);
      localStorage.setItem('sb-sandbox-projects', JSON.stringify(filtered));
      setProjects(filtered);
    } else {
      setProjects(prev => prev.filter(p => p.id !== projId));
    }
  };

  const clearProjForm = () => {
    setEditingProj(null);
    setProjTitle('');
    setProjDesc('');
    setProjCategory('PWA');
    setProjUrl('');
    setProjImg('');
  };

  if (loading) {
    return (
      <div className="flex flex-col gap-2 justify-center items-center py-20 text-slate-500 uppercase tracking-widest text-xs">
        <div className="w-8 h-8 border-2 border-t-transparent border-constellation-cyan rounded-full animate-spin"></div>
        <span>Opening Admin gate...</span>
      </div>
    );
  }

  // Double Authenticator Screen
  if (!isAdmin) {
    return (
      <div className="max-w-md mx-auto py-10">
        <div className="glass-panel p-8 rounded-lg border-white/10 flex flex-col gap-6 relative">
          <div className="text-center">
            <ShieldCheck className="w-10 h-10 text-constellation-orange mx-auto mb-2 animate-pulse" />
            <h2 className="text-2xl font-bold uppercase tracking-wider text-slate-100">SSNN Admin Relay Gate</h2>
            <p className="text-xs text-slate-400 mt-1 uppercase tracking-wider">Dual-Layer Access Encryption Required</p>
          </div>

          <form onSubmit={handleAdminLogin} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] text-slate-400 font-bold tracking-widest uppercase">Encryption Email</label>
              <input
                type="email"
                value={adminEmail}
                onChange={(e) => setAdminEmail(e.target.value)}
                placeholder=""
                required
                className="bg-space-900 border border-white/10 focus:border-constellation-orange focus:outline-none rounded px-3 py-2 text-sm text-slate-200"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] text-slate-400 font-bold tracking-widest uppercase">Command Password</label>
              <input
                type="password"
                value={adminPassword}
                onChange={(e) => setAdminPassword(e.target.value)}
                placeholder=""
                required
                className="bg-space-900 border border-white/10 focus:border-constellation-orange focus:outline-none rounded px-3 py-2 text-sm text-slate-200"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] text-slate-400 font-bold tracking-widest uppercase">Admin Security Key</label>
              <input
                type="password"
                value={adminKey}
                onChange={(e) => setAdminKey(e.target.value)}
                placeholder=""
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
      <div className="border-b border-white/10 pb-4 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-black uppercase tracking-wider text-slate-100 flex items-center gap-2">
            <ShieldCheck className="w-8 h-8 text-constellation-orange" />
            Admin Command Deck
          </h1>
          <p className="text-xs text-slate-400 mt-1 uppercase tracking-wider">
            Operational dashboard: prattgrf3@gmail.com
          </p>
        </div>
        <button
          onClick={() => {
            setIsAdmin(false);
            localStorage.removeItem('sb-sandbox-user');
            supabase.auth.signOut();
          }}
          className="py-1 px-3 border border-red-500/30 text-red-400 hover:text-white hover:bg-red-500/10 text-[10px] font-bold tracking-widest uppercase rounded"
        >
          Disconnect
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Dynamic Settings & Live Broadcast */}
        <div className="lg:col-span-1 flex flex-col gap-8">
          {/* Dynamic Settings */}
          <div className="glass-panel p-6 rounded-lg border-white/5 flex flex-col gap-4">
            <h3 className="text-sm font-bold uppercase tracking-widest text-constellation-cyan border-b border-white/5 pb-2 flex items-center gap-1.5">
              <Settings className="w-4 h-4" /> Global Settings
            </h3>
            
            <div className="flex flex-col gap-3">
              <div className="flex flex-col gap-1.5">
                <label className="text-[9px] text-slate-400 font-bold tracking-widest uppercase">Creator Biography Text</label>
                <textarea
                  value={bioText}
                  onChange={(e) => setBioText(e.target.value)}
                  rows={4}
                  className="bg-space-900 border border-white/10 focus:border-constellation-cyan focus:outline-none rounded px-2.5 py-1.5 text-xs text-slate-200 leading-normal"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[9px] text-slate-400 font-bold tracking-widest uppercase">Creator Bio Photo URL</label>
                <input
                  type="url"
                  value={bioImg}
                  onChange={(e) => setBioImg(e.target.value)}
                  className="bg-space-900 border border-white/10 focus:border-constellation-cyan focus:outline-none rounded px-2.5 py-1.5 text-xs text-slate-200"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[9px] text-slate-400 font-bold tracking-widest uppercase">Gemini API Key</label>
                <input
                  type="password"
                  value={geminiKey}
                  onChange={(e) => setGeminiKey(e.target.value)}
                  className="bg-space-900 border border-white/10 focus:border-constellation-cyan focus:outline-none rounded px-2.5 py-1.5 text-xs text-slate-200"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[9px] text-slate-400 font-bold tracking-widest uppercase">Supabase Bypass Key</label>
                <input
                  type="password"
                  value={supabaseKeyBypass}
                  onChange={(e) => setSupabaseKeyBypass(e.target.value)}
                  className="bg-space-900 border border-white/10 focus:border-constellation-cyan focus:outline-none rounded px-2.5 py-1.5 text-xs text-slate-200"
                />
              </div>

              <button
                onClick={handleSaveSettings}
                disabled={savingSettings}
                className="py-2 w-full mt-2 bg-constellation-cyan text-space-950 font-bold uppercase text-[10px] tracking-widest rounded hover:bg-white transition-all flex items-center justify-center gap-1 shadow-glow-cyan"
              >
                <Save className="w-3.5 h-3.5" /> Save settings
              </button>
            </div>
          </div>

          {/* SSNN Announcements */}
          <div className="glass-panel p-6 rounded-lg border-white/5 flex flex-col gap-4">
            <h3 className="text-sm font-bold uppercase tracking-widest text-constellation-cyan border-b border-white/5 pb-2">
              SSNN Broadcast Ticker
            </h3>
            
            <div className="flex gap-2">
              <input
                type="text"
                value={newAnn}
                onChange={(e) => setNewAnn(e.target.value)}
                placeholder="e.g. Constellation launches deep rim scanning..."
                className="flex-1 bg-space-900 border border-white/10 focus:border-constellation-cyan focus:outline-none rounded px-2.5 py-1.5 text-xs text-slate-200"
              />
              <button
                onClick={addAnnouncement}
                className="p-2 bg-constellation-cyan text-space-950 font-bold rounded hover:bg-white transition-all"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            <div className="flex flex-col gap-2 mt-2 max-h-[200px] overflow-y-auto">
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
        </div>

        {/* Right Column: Mods & Projects CRUDS */}
        <div className="lg:col-span-2 flex flex-col gap-8">
          
          {/* Mods Section */}
          <div className="flex flex-col gap-4">
            <form onSubmit={saveMod} className="glass-panel p-6 rounded-lg border-white/5 flex flex-col gap-4">
              <h3 className="text-sm font-bold uppercase tracking-widest text-constellation-orange border-b border-white/5 pb-2 flex justify-between items-center">
                <span>{editingMod ? 'Edit Bethesda Creations Mod' : 'Upload Creations Mod'}</span>
                {editingMod && (
                  <button
                    type="button"
                    onClick={clearModForm}
                    className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold border border-white/10 px-2 py-0.5 rounded hover:bg-white/5"
                  >
                    Cancel
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
                    required
                    className="bg-space-900 border border-white/10 focus:border-constellation-orange focus:outline-none rounded px-3 py-1.5 text-xs text-slate-200"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[9px] text-slate-400 font-bold tracking-widest uppercase">Creations Release Date</label>
                  <input
                    type="date"
                    value={modDate}
                    onChange={(e) => setModDate(e.target.value)}
                    className="bg-space-900 border border-white/10 focus:border-constellation-orange focus:outline-none rounded px-3 py-1.5 text-xs text-slate-200"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[9px] text-slate-400 font-bold tracking-widest uppercase">Mod description</label>
                <textarea
                  value={modDesc}
                  onChange={(e) => setModDesc(e.target.value)}
                  rows={2}
                  className="bg-space-900 border border-white/10 focus:border-constellation-orange focus:outline-none rounded px-3 py-1.5 text-xs text-slate-200 leading-normal"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[9px] text-slate-400 font-bold tracking-widest uppercase">Cover Image (Creations Direct link / URL)</label>
                  <input
                    type="url"
                    value={modImg}
                    onChange={(e) => setModImg(e.target.value)}
                    placeholder="https://creations.bethesda.net/...png"
                    className="bg-space-900 border border-white/10 focus:border-constellation-orange focus:outline-none rounded px-3 py-1.5 text-xs text-slate-200"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[9px] text-slate-400 font-bold tracking-widest uppercase">Creations Site Download URL</label>
                  <input
                    type="url"
                    value={modUrl}
                    onChange={(e) => setModUrl(e.target.value)}
                    placeholder="https://creations.bethesda.net/en/starfield/details/..."
                    required
                    className="bg-space-900 border border-white/10 focus:border-constellation-orange focus:outline-none rounded px-3 py-1.5 text-xs text-slate-200"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-1">
                <button
                  type="submit"
                  className="py-2 px-5 bg-constellation-orange text-space-950 font-bold uppercase text-[10px] tracking-widest rounded hover:bg-white transition-all flex items-center gap-1.5 shadow-glow-orange"
                >
                  <Save className="w-3.5 h-3.5" />
                  {editingMod ? 'Update Mod' : 'Publish Mod'}
                </button>
              </div>
            </form>

            {/* Mod Database Index */}
            <div className="glass-panel p-4 rounded-lg border-white/5 max-h-[220px] overflow-y-auto flex flex-col gap-2">
              {mods.map((mod) => (
                <div key={mod.id} className="flex justify-between items-center bg-space-900 border border-white/5 p-2 rounded">
                  <div>
                    <h4 className="text-xs font-bold text-slate-100 uppercase tracking-wide">{mod.title}</h4>
                    <span className="text-[9.5px] text-constellation-orange font-bold uppercase tracking-wider">Creations Mod</span>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => editMod(mod)} className="text-slate-400 hover:text-constellation-orange"><Edit className="w-3.5 h-3.5" /></button>
                    <button onClick={() => deleteMod(mod.id)} className="text-slate-400 hover:text-red-400"><Trash2 className="w-3.5 h-3.5" /></button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Special Projects & PWAs Section */}
          <div className="flex flex-col gap-4">
            <form onSubmit={saveProject} className="glass-panel p-6 rounded-lg border-white/5 flex flex-col gap-4">
              <h3 className="text-sm font-bold uppercase tracking-widest text-constellation-violet border-b border-white/5 pb-2 flex justify-between items-center">
                <span>{editingProj ? 'Edit Special Project / PWA' : 'Upload Special Project / PWA'}</span>
                {editingProj && (
                  <button
                    type="button"
                    onClick={clearProjForm}
                    className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold border border-white/10 px-2 py-0.5 rounded hover:bg-white/5"
                  >
                    Cancel
                  </button>
                )}
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[9px] text-slate-400 font-bold tracking-widest uppercase">Project Title</label>
                  <input
                    type="text"
                    value={projTitle}
                    onChange={(e) => setProjTitle(e.target.value)}
                    required
                    className="bg-space-900 border border-white/10 focus:border-constellation-violet focus:outline-none rounded px-3 py-1.5 text-xs text-slate-200"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[9px] text-slate-400 font-bold tracking-widest uppercase">Project Category</label>
                  <select
                    value={projCategory}
                    onChange={(e) => setProjCategory(e.target.value)}
                    className="bg-space-900 border border-white/10 focus:border-constellation-violet focus:outline-none rounded px-3 py-1.5 text-xs text-slate-200"
                  >
                    <option value="PWA">PWA (Progressive Web App)</option>
                    <option value="Gaming">Gaming / Starfield RPG Tool</option>
                    <option value="Special Project">Special Project</option>
                  </select>
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[9px] text-slate-400 font-bold tracking-widest uppercase">Project description</label>
                <textarea
                  value={projDesc}
                  onChange={(e) => setProjDesc(e.target.value)}
                  rows={2}
                  className="bg-space-900 border border-white/10 focus:border-constellation-violet focus:outline-none rounded px-3 py-1.5 text-xs text-slate-200 leading-normal"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[9px] text-slate-400 font-bold tracking-widest uppercase">Cover Image Link</label>
                  <input
                    type="url"
                    value={projImg}
                    onChange={(e) => setProjImg(e.target.value)}
                    className="bg-space-900 border border-white/10 focus:border-constellation-violet focus:outline-none rounded px-3 py-1.5 text-xs text-slate-200"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[9px] text-slate-400 font-bold tracking-widest uppercase">Project Live / GitHub URL</label>
                  <input
                    type="url"
                    value={projUrl}
                    onChange={(e) => setProjUrl(e.target.value)}
                    required
                    className="bg-space-900 border border-white/10 focus:border-constellation-violet focus:outline-none rounded px-3 py-1.5 text-xs text-slate-200"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-1">
                <button
                  type="submit"
                  className="py-2 px-5 bg-constellation-violet text-space-950 font-bold uppercase text-[10px] tracking-widest rounded hover:bg-white transition-all flex items-center gap-1.5 shadow-glow-violet"
                >
                  <Save className="w-3.5 h-3.5" />
                  {editingProj ? 'Update Project' : 'Publish Project'}
                </button>
              </div>
            </form>

            {/* Projects Index */}
            <div className="glass-panel p-4 rounded-lg border-white/5 max-h-[220px] overflow-y-auto flex flex-col gap-2">
              {projects.map((p) => (
                <div key={p.id} className="flex justify-between items-center bg-space-900 border border-white/5 p-2 rounded">
                  <div>
                    <h4 className="text-xs font-bold text-slate-100 uppercase tracking-wide">{p.title}</h4>
                    <span className="text-[9.5px] text-constellation-violet font-bold uppercase tracking-wider">{p.category}</span>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => { setEditingProj(p); setProjTitle(p.title); setProjDesc(p.description); setProjCategory(p.category); setProjUrl(p.url); setProjImg(p.image_url || ''); }} className="text-slate-400 hover:text-constellation-violet"><Edit className="w-3.5 h-3.5" /></button>
                    <button onClick={() => deleteProject(p.id)} className="text-slate-400 hover:text-red-400"><Trash2 className="w-3.5 h-3.5" /></button>
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
