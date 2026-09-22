import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { Code2, FlaskConical, ArrowRight, Sparkles, CheckCircle2 } from 'lucide-react';

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let reviewsUsed = 0;
  let researchUsed = 0;
  let tier = 'free';

  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('tier, reviews_used, research_used')
      .eq('id', user.id)
      .single();
    if (profile) {
      reviewsUsed = profile.reviews_used || 0;
      researchUsed = profile.research_used || 0;
      tier = profile.tier || 'free';
    }
  }

  const isPro = tier.toLowerCase() === 'pro';

  // Review limits: 5 on free
  const reviewRemaining = isPro ? Infinity : Math.max(0, 5 - reviewsUsed);
  const reviewPercent = isPro ? 100 : Math.min(100, Math.round((reviewsUsed / 5) * 100));
  const reviewBarColor = isPro || reviewRemaining > 2 ? 'bg-emerald-500' : reviewRemaining >= 1 ? 'bg-amber-400' : 'bg-red-500';

  // Research limits: 3 on free
  const researchRemaining = isPro ? Infinity : Math.max(0, 3 - researchUsed);
  const researchPercent = isPro ? 100 : Math.min(100, Math.round((researchUsed / 3) * 100));
  const researchBarColor = isPro || researchRemaining > 2 ? 'bg-emerald-500' : researchRemaining >= 1 ? 'bg-amber-400' : 'bg-red-500';

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-semibold tracking-tight text-[var(--color-text-primary)]">
          Welcome back
        </h1>
        <p className="text-sm text-[var(--color-text-secondary)] mt-1">
          Here&apos;s what you can do today
        </p>
      </div>

      {/* Upgrade Banner for Free Tier */}
      {!isPro && (
        <div className="card-elevated p-6 rounded-xl border border-emerald-500/20 bg-gradient-to-r from-emerald-950/30 via-[var(--color-surface)] to-[var(--color-surface)] flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-in">
          <div className="flex items-start gap-4">
            <div className="h-10 w-10 rounded-lg bg-emerald-500/15 text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/20">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-white text-base">Student Pro Membership</h3>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-semibold px-2 py-0.5 rounded-full">
                  ₹199/mo
                </span>
              </div>
              <p className="text-sm text-[var(--color-text-secondary)] mt-0.5 max-w-xl">
                Get unlimited Python code reviews, comprehensive PubMed literature syntheses, and priority processing with your student email.
              </p>
            </div>
          </div>
          <Link
            href="/pricing"
            className="btn-primary text-sm py-2.5 px-4 shrink-0 inline-flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>Upgrade to Pro</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      )}

      {/* Module Cards Grid */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Module 1: Code Review */}
        <Link
          href="/dashboard/code-review"
          className="card p-6 rounded-xl border border-[var(--color-border)] hover:border-emerald-500/30 transition-all duration-200 group flex flex-col justify-between cursor-pointer animate-in"
          style={{ animationDelay: '60ms' }}
        >
          <div>
            <div className="flex items-center justify-between">
              <div className="h-12 w-12 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/20 group-hover:scale-105 transition-transform duration-200">
                <Code2 className="h-6 w-6" />
              </div>
              <div className="text-xs text-[var(--color-text-muted)] group-hover:text-emerald-400 flex items-center gap-1 transition-colors">
                <span>Open tool</span>
                <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
              </div>
            </div>

            <h2 className="text-xl font-semibold text-[var(--color-text-primary)] mt-5 group-hover:text-emerald-400 transition-colors">
              Biotech Code Review Bot
            </h2>
            <p className="text-sm text-[var(--color-text-secondary)] mt-2 leading-relaxed">
              Catches the silent bioinformatics bugs that don&apos;t crash your scripts: zero-checks in fold-changes, hardcoded file paths, off-by-one coordinates, and missing metadata.
            </p>
          </div>

          <div className="mt-8 pt-4 border-t border-[var(--color-border)]">
            <div className="flex justify-between items-center text-xs mb-2">
              <span className="text-[var(--color-text-muted)] font-medium">Monthly usage</span>
              <span className="text-[var(--color-text-secondary)] font-mono">
                {isPro ? `${reviewsUsed} used (Unlimited)` : `${reviewsUsed} / 5 used`}
              </span>
            </div>
            <div className="h-1.5 w-full bg-white/[0.05] rounded-full overflow-hidden">
              <div
                className={`h-full ${reviewBarColor} transition-all duration-500 rounded-full`}
                style={{ width: `${reviewPercent}%` }}
              />
            </div>
          </div>
        </Link>

        {/* Module 2: Research Agent */}
        <Link
          href="/dashboard/research"
          className="card p-6 rounded-xl border border-[var(--color-border)] hover:border-emerald-500/30 transition-all duration-200 group flex flex-col justify-between cursor-pointer animate-in"
          style={{ animationDelay: '120ms' }}
        >
          <div>
            <div className="flex items-center justify-between">
              <div className="h-12 w-12 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/20 group-hover:scale-105 transition-transform duration-200">
                <FlaskConical className="h-6 w-6" />
              </div>
              <div className="text-xs text-[var(--color-text-muted)] group-hover:text-emerald-400 flex items-center gap-1 transition-colors">
                <span>Open tool</span>
                <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
              </div>
            </div>

            <h2 className="text-xl font-semibold text-[var(--color-text-primary)] mt-5 group-hover:text-emerald-400 transition-colors">
              Literature-to-Hypothesis Agent
            </h2>
            <p className="text-sm text-[var(--color-text-secondary)] mt-2 leading-relaxed">
              Extracts entities, queries Europe PMC and ClinicalTrials.gov in real time, and synthesizes structured evidence, ongoing trials, chemical properties, and research gaps.
            </p>
          </div>

          <div className="mt-8 pt-4 border-t border-[var(--color-border)]">
            <div className="flex justify-between items-center text-xs mb-2">
              <span className="text-[var(--color-text-muted)] font-medium">Monthly usage</span>
              <span className="text-[var(--color-text-secondary)] font-mono">
                {isPro ? `${researchUsed} used (Unlimited)` : `${researchUsed} / 3 used`}
              </span>
            </div>
            <div className="h-1.5 w-full bg-white/[0.05] rounded-full overflow-hidden">
              <div
                className={`h-full ${researchBarColor} transition-all duration-500 rounded-full`}
                style={{ width: `${researchPercent}%` }}
              />
            </div>
          </div>
        </Link>
      </div>
    </div>
  );
}
