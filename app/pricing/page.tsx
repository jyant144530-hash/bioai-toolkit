'use client';

import { Check, Sparkles } from 'lucide-react';
import Link from 'next/link';

export default function PricingPage() {
  const handleUpgrade = () => {
    alert('Stripe coming soon — email hello@bioai.dev to upgrade manually.');
  };

  const freeFeatures = [
    '5 Biotech code reviews / month',
    '3 Literature research reports / month',
    'Standard execution queue',
    'Basic PubMed paper citations',
  ];

  const proFeatures = [
    'Unlimited Biotech code reviews',
    'Unlimited Literature research reports',
    'PubChem chemical properties & SMILES',
    'ClinicalTrials.gov live disease filtering',
    'PDF report export & citation copy',
    'Priority processing queue',
  ];

  return (
    <div className="py-16 px-4 max-w-5xl mx-auto">
      {/* Header */}
      <div className="text-center space-y-3 animate-in">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-emerald-500/20 bg-emerald-500/5 text-xs text-emerald-400 font-medium">
          <Sparkles className="h-3.5 w-3.5" />
          <span>Subsidized for BSc &amp; MSc Biotechnology students</span>
        </div>
        <h1 className="text-4xl md:text-5xl font-semibold tracking-tight text-[var(--color-text-primary)]">
          Simple pricing
        </h1>
        <p className="text-base text-[var(--color-text-secondary)] max-w-md mx-auto">
          Built for biotechnology coursework, thesis research, and wet-lab analysis scripts.
        </p>
      </div>

      {/* Pricing Cards Grid */}
      <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-6 mt-12 items-stretch">
        {/* Free Card */}
        <div className="card p-8 rounded-xl border border-[var(--color-border)] flex flex-col justify-between animate-in">
          <div>
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-semibold text-[var(--color-text-primary)]">Free</h2>
              <span className="text-xs uppercase tracking-wider text-[var(--color-text-muted)] font-mono font-medium">
                Starter
              </span>
            </div>
            <p className="text-sm text-[var(--color-text-secondary)] mt-2">
              For exploratory lab scripts and weekly coursework assignments.
            </p>

            <div className="my-8">
              <span className="text-5xl font-bold tracking-tight text-white">₹0</span>
              <span className="text-base text-[var(--color-text-muted)] ml-1 font-normal">/month</span>
            </div>

            <div className="space-y-3.5 pt-4 border-t border-[var(--color-border)]">
              {freeFeatures.map((feat, i) => (
                <div key={i} className="flex items-start gap-3 text-sm text-[var(--color-text-secondary)]">
                  <Check className="h-4 w-4 text-[var(--color-text-muted)] shrink-0 mt-0.5" />
                  <span>{feat}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-8 pt-4">
            <Link
              href="/dashboard"
              className="btn-ghost w-full py-3 text-center block text-sm font-semibold rounded-lg cursor-pointer active:scale-[0.98]"
            >
              Current Plan
            </Link>
          </div>
        </div>

        {/* Pro Card with 1px Emerald Gradient Border Wrapper */}
        <div className="bg-gradient-to-b from-emerald-500/40 via-emerald-500/10 to-transparent p-px rounded-xl relative flex animate-in" style={{ animationDelay: '60ms' }}>
          {/* Floating Most Popular Pill */}
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-emerald-500 text-black text-xs font-semibold px-3 py-1 rounded-full shadow-[0_0_12px_rgba(16,185,129,0.5)] tracking-wide uppercase">
            MOST POPULAR
          </div>

          <div className="bg-[var(--color-surface)] p-8 rounded-xl w-full flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-semibold text-white">Student Pro</h2>
                <span className="text-xs uppercase tracking-wider text-emerald-400 font-mono font-semibold">
                  Full Access
                </span>
              </div>
              <p className="text-sm text-[var(--color-text-secondary)] mt-2">
                Unrestricted intelligence for undergraduate &amp; postgraduate researchers.
              </p>

              <div className="my-8">
                <span className="text-5xl font-bold tracking-tight text-white">₹199</span>
                <span className="text-base text-[var(--color-text-muted)] ml-1 font-normal">/month</span>
              </div>

              <div className="space-y-3.5 pt-4 border-t border-[var(--color-border)]">
                {proFeatures.map((feat, i) => (
                  <div key={i} className="flex items-start gap-3 text-sm text-[var(--color-text-primary)]">
                    <Check className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span>{feat}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-8 pt-4 space-y-3">
              <button
                type="button"
                onClick={handleUpgrade}
                className="btn-primary w-full py-3 text-sm font-semibold text-center cursor-pointer active:scale-[0.98]"
              >
                Verify student status &amp; upgrade
              </button>
              <p className="text-[11px] text-[var(--color-text-muted)] text-center leading-relaxed">
                Requires a valid .edu, .ac.in, or .edu.in email. Student discount applied automatically.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
