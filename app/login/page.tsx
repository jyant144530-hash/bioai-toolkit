'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import { AlertCircle } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (mode === 'signup') {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      }
      router.push('/dashboard');
      router.refresh();
    } catch (e: any) {
      setError(e.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: `${window.location.origin}/dashboard` },
      });
      if (error) throw error;
    } catch (e: any) {
      setError(e.message || 'Google authentication failed');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="card w-full max-w-md p-8 border border-[var(--color-border)] shadow-2xl animate-in">
        {/* Logo at top */}
        <div className="flex flex-col items-center justify-center text-center">
          <div className="flex items-center gap-2.5">
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.7)]" />
            <span className="font-semibold text-lg text-white tracking-tight">BioAI Toolkit</span>
          </div>
          <p className="text-sm text-[var(--color-text-secondary)] mt-1.5">
            Sign in or create an account
          </p>
        </div>

        {/* Tab Switcher: Pill with two buttons */}
        <div className="grid grid-cols-2 p-1 bg-white/[0.03] rounded-lg border border-[var(--color-border)] mt-6">
          <button
            type="button"
            onClick={() => { setMode('login'); setError(''); }}
            className={`py-2 text-xs font-semibold rounded-md transition-all duration-150 cursor-pointer ${
              mode === 'login'
                ? 'bg-[var(--color-surface)] text-[var(--color-text-primary)] shadow-md border border-[var(--color-border)]'
                : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)]'
            }`}
          >
            Log In
          </button>
          <button
            type="button"
            onClick={() => { setMode('signup'); setError(''); }}
            className={`py-2 text-xs font-semibold rounded-md transition-all duration-150 cursor-pointer ${
              mode === 'signup'
                ? 'bg-[var(--color-surface)] text-[var(--color-text-primary)] shadow-md border border-[var(--color-border)]'
                : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)]'
            }`}
          >
            Sign Up
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/25 text-red-400 rounded-lg p-3 text-sm mt-5 flex items-start gap-2.5 animate-in">
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Auth Form */}
        <form onSubmit={handleAuth} className="mt-6 space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs uppercase tracking-wider text-[var(--color-text-muted)] font-medium">
              Academic Email
            </label>
            <input
              type="email"
              placeholder="student@edu.in"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input-base text-sm"
              disabled={loading}
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs uppercase tracking-wider text-[var(--color-text-muted)] font-medium">
              Password
            </label>
            <input
              type="password"
              placeholder="••••••••"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input-base text-sm"
              disabled={loading}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full py-3 text-sm font-semibold tracking-wide mt-2 cursor-pointer active:scale-[0.98] disabled:opacity-50"
          >
            {loading ? 'Processing...' : mode === 'login' ? 'Sign In' : 'Create Account'}
          </button>
        </form>

        {/* Divider */}
        <div className="relative my-6 flex items-center justify-center">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-[var(--color-border)]" />
          </div>
          <span className="relative bg-[var(--color-surface)] px-3 text-xs uppercase tracking-wider text-[var(--color-text-muted)] font-medium">
            or continue with
          </span>
        </div>

        {/* Google OAuth Button */}
        <button
          type="button"
          onClick={handleGoogleAuth}
          className="btn-ghost w-full py-2.5 text-xs font-medium flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98]"
        >
          <svg className="h-4 w-4" viewBox="0 0 24 24">
            <path
              fill="#EA4335"
              d="M12 5c1.54 0 2.9.54 3.98 1.43l2.99-2.99C17.16 1.7 14.78 1 12 1 7.64 1 3.89 3.51 2.06 7.15l3.58 2.78C6.54 7.23 9.02 5 12 5z"
            />
            <path
              fill="#4285F4"
              d="M23.5 12.28c0-.82-.07-1.6-.21-2.28H12v4.56h6.47c-.28 1.48-1.12 2.73-2.38 3.58l3.69 2.86c2.16-1.99 3.72-4.92 3.72-8.72z"
            />
            <path
              fill="#FBBC05"
              d="M5.64 14.07c-.24-.73-.38-1.5-.38-2.31 0-.81.14-1.58.38-2.31L2.06 6.67C1.3 8.21.86 9.94.86 11.76c0 1.82.44 3.55 1.2 5.09l3.58-2.78z"
            />
            <path
              fill="#34A853"
              d="M12 22.5c3.24 0 5.96-1.07 7.95-2.91l-3.69-2.86c-1.08.72-2.46 1.15-4.26 1.15-2.98 0-5.46-2.23-6.36-4.93L2.06 15.73C3.89 19.37 7.64 22.5 12 22.5z"
            />
          </svg>
          <span>Continue with Google</span>
        </button>
      </div>
    </div>
  );
}
