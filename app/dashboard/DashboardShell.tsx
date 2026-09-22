'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Code2, FlaskConical, LayoutDashboard, Menu, X, LogOut } from 'lucide-react';
import { supabase } from '@/lib/supabase/client';

export default function DashboardShell({
  children,
  userEmail,
  tier,
}: {
  children: React.ReactNode;
  userEmail: string;
  tier: string;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isPro = tier?.toLowerCase() === 'pro';
  const initials = (userEmail.split('@')[0] || 'U').slice(0, 2).toUpperCase();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  };

  const navItems = [
    { href: '/dashboard', label: 'Overview', icon: LayoutDashboard },
    { href: '/dashboard/code-review', label: 'Code Review', icon: Code2 },
    { href: '/dashboard/research', label: 'Research', icon: FlaskConical },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-[var(--color-bg)] text-[var(--color-text-primary)]">
      {/* Mobile Top Bar */}
      <header className="md:hidden flex items-center justify-between px-4 py-3 bg-[var(--color-surface)] border-b border-[var(--color-border)] sticky top-0 z-40">
        <Link href="/dashboard" className="flex items-center gap-2.5">
          <span className="h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)]" />
          <span className="font-semibold tracking-tight text-white text-base">BioAI Toolkit</span>
        </Link>
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="p-2 rounded-lg text-[var(--color-text-secondary)] hover:text-white hover:bg-white/[0.04] transition-colors cursor-pointer"
          aria-label="Toggle navigation"
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </header>

      {/* Mobile Slide-in Drawer */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-black/70 backdrop-blur-sm transition-opacity"
            onClick={() => setMobileOpen(false)}
          />
          <div className="relative w-72 max-w-[80vw] bg-[var(--color-surface)] h-full flex flex-col p-4 border-r border-[var(--color-border)] z-10">
            <div className="flex items-center justify-between pb-4 border-b border-[var(--color-border)]">
              <div className="flex items-center gap-2.5">
                <span className="h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)]" />
                <span className="font-semibold tracking-tight text-white">BioAI Toolkit</span>
              </div>
              <button
                onClick={() => setMobileOpen(false)}
                className="p-1.5 rounded-lg text-[var(--color-text-secondary)] hover:text-white cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <nav className="flex-1 py-4 space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const active = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-150 cursor-pointer ${
                      active
                        ? 'bg-emerald-500/10 text-emerald-400 font-medium'
                        : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-white/[0.03]'
                    }`}
                  >
                    <Icon className={`h-4 w-4 ${active ? 'text-emerald-400' : 'text-[var(--color-text-muted)]'}`} />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>

            <div className="pt-4 border-t border-[var(--color-border)]">
              <div className="flex items-center gap-3 p-2 rounded-xl bg-white/[0.02] border border-[var(--color-border)]">
                <div className="h-9 w-9 rounded-full bg-emerald-500/20 text-emerald-400 font-mono font-semibold flex items-center justify-center text-xs border border-emerald-500/30 shrink-0">
                  {initials}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-[var(--color-text-primary)] truncate font-medium">{userEmail}</p>
                  <span
                    className={`inline-block text-[10px] font-semibold px-2 py-0.5 rounded-full mt-0.5 ${
                      isPro
                        ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                        : 'bg-white/[0.06] text-[var(--color-text-muted)]'
                    }`}
                  >
                    {isPro ? 'PRO' : 'FREE'}
                  </span>
                </div>
              </div>
              <button
                onClick={handleSignOut}
                className="flex items-center gap-2 text-xs text-[var(--color-text-muted)] hover:text-red-400 transition-colors cursor-pointer mt-3 px-2"
              >
                <LogOut className="h-3.5 w-3.5" />
                <span>Sign out</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Desktop Fixed Sidebar */}
      <aside className="w-[260px] hidden md:flex flex-col h-screen fixed inset-y-0 left-0 bg-[var(--color-surface)] border-r border-[var(--color-border)] z-30">
        {/* Top brand */}
        <div className="h-16 flex items-center px-5 border-b border-[var(--color-border)]">
          <Link href="/dashboard" className="flex items-center gap-2.5 cursor-pointer">
            <span className="h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)]" />
            <span className="font-semibold tracking-tight text-white text-base">BioAI Toolkit</span>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-3 space-y-1.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-150 cursor-pointer ${
                  active
                    ? 'bg-emerald-500/10 text-emerald-400 font-medium'
                    : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-white/[0.03]'
                }`}
              >
                <Icon className={`h-4 w-4 ${active ? 'text-emerald-400' : 'text-[var(--color-text-muted)]'}`} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Bottom user card */}
        <div className="p-3 border-t border-[var(--color-border)] bg-black/20">
          <div className="flex items-center gap-3 p-2.5 rounded-xl bg-white/[0.02] border border-[var(--color-border)]">
            <div className="h-9 w-9 rounded-full bg-emerald-500/20 text-emerald-400 font-mono font-semibold flex items-center justify-center text-xs border border-emerald-500/30 shrink-0">
              {initials}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-[var(--color-text-primary)] truncate font-medium" title={userEmail}>
                {userEmail}
              </p>
              <span
                className={`inline-block text-[10px] font-semibold px-2 py-0.5 rounded-full mt-0.5 ${
                  isPro
                    ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                    : 'bg-white/[0.06] text-[var(--color-text-muted)]'
                }`}
              >
                {isPro ? 'PRO' : 'FREE'}
              </span>
            </div>
          </div>
          <button
            onClick={handleSignOut}
            className="flex items-center gap-1.5 text-xs text-[var(--color-text-muted)] hover:text-red-400 transition-colors cursor-pointer mt-2.5 px-2 py-1"
          >
            <LogOut className="h-3.5 w-3.5" />
            <span>Sign out</span>
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="md:pl-[260px] flex-1 flex flex-col min-w-0">
        <div className="flex-1 p-6 md:p-8 max-w-7xl w-full mx-auto animate-in">
          {children}
        </div>
      </main>
    </div>
  );
}
