'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { LogIn, Compass, Key } from 'lucide-react';

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setMessage(`Error: ${error.message}`);
      setLoading(false);
    } else {
      router.push('/');
      router.refresh();
    }
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    const { error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      setMessage(`Error: ${error.message}`);
    } else {
      setMessage('Verification link sent! Check your email.');
    }
    setLoading(false);
  };

  // Auth bypass for easy local development / testing
  const handleBypass = async () => {
    setLoading(true);
    setMessage('Accessing local sandbox mode...');
    
    // Check if we can sign in using a mock developer user
    const mockEmail = 'explorer@constellation.com';
    const mockPassword = 'Password123!';

    // Attempt sign in
    const { data, error } = await supabase.auth.signInWithPassword({
      email: mockEmail,
      password: mockPassword,
    });

    if (error) {
      // If mock user doesn't exist, try to sign up
      const { error: signUpError } = await supabase.auth.signUp({
        email: mockEmail,
        password: mockPassword,
      });

      if (signUpError) {
        // Fallback: Store mock user locally in localStorage if Supabase is offline
        localStorage.setItem('sb-sandbox-user', JSON.stringify({
          id: '00000000-0000-0000-0000-000000000000',
          email: mockEmail,
          user_metadata: { role: 'sandbox' }
        }));
        router.push('/');
        router.refresh();
      } else {
        // Sign in after signup
        await supabase.auth.signInWithPassword({
          email: mockEmail,
          password: mockPassword,
        });
        router.push('/');
        router.refresh();
      }
    } else {
      router.push('/');
      router.refresh();
    }
  };

  return (
    <div className="max-w-md mx-auto py-10">
      <div className="glass-panel p-8 rounded-lg border-white/10 flex flex-col gap-6 relative">
        <div className="text-center">
          <Compass className="w-10 h-10 text-constellation-cyan mx-auto mb-2 animate-pulse" />
          <h2 className="text-2xl font-bold uppercase tracking-wider text-slate-100">Access Pilot Console</h2>
          <p className="text-xs text-slate-400 mt-1 uppercase tracking-wider">Establish connection to Net Relay</p>
        </div>

        <form onSubmit={handleLogin} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] text-slate-400 font-semibold tracking-widest uppercase">E-Mail Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. pilot@constellation.org"
              required
              className="bg-space-900 border border-white/10 focus:border-constellation-cyan focus:outline-none rounded px-3 py-2 text-sm text-slate-200"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] text-slate-400 font-semibold tracking-widest uppercase">Encryption Key (Password)</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="bg-space-900 border border-white/10 focus:border-constellation-cyan focus:outline-none rounded px-3 py-2 text-sm text-slate-200"
            />
          </div>

          {message && (
            <div className="text-xs p-3 rounded bg-red-950/40 border border-red-500/20 text-red-300">
              {message}
            </div>
          )}

          <div className="grid grid-cols-2 gap-3 mt-2">
            <button
              type="submit"
              disabled={loading}
              className="py-2.5 px-4 bg-constellation-cyan text-space-950 font-bold uppercase text-xs tracking-wider rounded hover:bg-white transition-all flex items-center justify-center gap-1 shadow-glow-cyan"
            >
              <LogIn className="w-3.5 h-3.5" /> Sign In
            </button>
            <button
              type="button"
              onClick={handleSignUp}
              disabled={loading}
              className="py-2.5 px-4 bg-transparent border border-white/15 hover:bg-white/5 text-slate-300 font-bold uppercase text-xs tracking-wider rounded transition-all"
            >
              Sign Up
            </button>
          </div>
        </form>

        <div className="relative flex py-2 items-center">
          <div className="flex-grow border-t border-white/5"></div>
          <span className="flex-shrink mx-4 text-[9px] text-slate-500 font-semibold uppercase tracking-widest">or sandbox bypass</span>
          <div className="flex-grow border-t border-white/5"></div>
        </div>

        <button
          onClick={handleBypass}
          disabled={loading}
          className="w-full py-2.5 px-4 bg-transparent border border-constellation-orange/40 hover:bg-constellation-orange/10 text-constellation-orange font-bold uppercase text-xs tracking-wider rounded transition-all flex items-center justify-center gap-1.5"
        >
          <Key className="w-3.5 h-3.5" /> Launch Dev Sandbox
        </button>
      </div>
    </div>
  );
}
