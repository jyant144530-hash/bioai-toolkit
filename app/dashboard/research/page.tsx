'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Search,
  Sparkles,
  AlertTriangle,
  ArrowRight,
  ExternalLink,
  BookOpen,
  FlaskConical,
  Activity,
  HelpCircle,
  ListOrdered,
  FileText,
  Atom,
} from 'lucide-react';

const SUGGESTIONS = [
  "Metformin and Alzheimer's",
  'CRISPR off-target effects',
  'p53 in breast cancer',
];

const STAGES = [
  { label: 'Extracting entities' },
  { label: 'Querying databases' },
  { label: 'Synthesizing' },
];

export default function ResearchPage() {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [stage, setStage] = useState(0);
  const [error, setError] = useState('');
  const [upgrade, setUpgrade] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'literature' | 'trials' | 'mechanism' | 'gaps' | 'next_steps'>('literature');

  useEffect(() => {
    if (!loading) return;
    const interval = setInterval(() => {
      setStage((s) => Math.min(s + 1, 2));
    }, 4500);
    return () => clearInterval(interval);
  }, [loading]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim() || query.trim().length < 8) return;

    setLoading(true);
    setStage(0);
    setError('');
    setUpgrade(false);
    setResult(null);

    try {
      const res = await fetch('/api/research', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query }),
      });
      const data = await res.json();
      if (!res.ok) {
        if (res.status === 402 && data.upgrade) setUpgrade(true);
        throw new Error(data.error || 'Failed to research');
      }
      setResult(data);
      setActiveTab('literature');
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const getConfidenceStyle = (conf: string) => {
    switch (conf?.toLowerCase()) {
      case 'high':
        return 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30';
      case 'moderate':
        return 'bg-blue-500/15 text-blue-400 border border-blue-500/30';
      case 'low':
        return 'bg-yellow-500/15 text-yellow-400 border border-yellow-500/30';
      default:
        return 'bg-zinc-500/15 text-zinc-400 border border-zinc-500/30';
    }
  };

  const tabs = [
    { id: 'literature', label: 'Literature', icon: BookOpen },
    { id: 'trials', label: 'Trials', icon: Activity },
    { id: 'mechanism', label: 'Mechanism', icon: Atom },
    { id: 'gaps', label: 'Gaps', icon: HelpCircle },
    { id: 'next_steps', label: 'Next Steps', icon: ListOrdered },
  ] as const;

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-16">
      {/* Hero Section */}
      <div className="text-center py-10 md:py-14 animate-in">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-emerald-500/20 bg-emerald-500/5 text-xs text-emerald-400 font-medium mb-4">
          <FlaskConical className="h-3.5 w-3.5" />
          <span>Real-time Europe PMC &amp; ClinicalTrials.gov synthesis</span>
        </div>
        <h1 className="text-4xl md:text-5xl font-semibold tracking-tight text-[var(--color-text-primary)]">
          Literature-to-Hypothesis Agent
        </h1>
        <p className="text-sm md:text-base text-[var(--color-text-secondary)] max-w-lg mx-auto mt-3 leading-relaxed">
          Ask a biological question. We retrieve peer-reviewed papers, registered clinical trials, and compound chemistry to build an evidence dossier.
        </p>

        {/* Search Bar */}
        <form onSubmit={handleSearch} className="relative max-w-2xl mx-auto mt-8">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-[var(--color-text-muted)] pointer-events-none" />
          <input
            type="text"
            className="input-base pl-12 pr-32 py-4 text-sm md:text-base rounded-xl shadow-xl"
            placeholder="e.g. Metformin and Alzheimer's disease"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            disabled={loading}
          />
          <button
            type="submit"
            className="btn-primary absolute right-2.5 top-1/2 -translate-y-1/2 py-2 px-5 text-xs font-semibold rounded-lg cursor-pointer active:scale-[0.98] disabled:opacity-50"
            disabled={loading || query.trim().length < 8}
          >
            {loading ? 'Searching...' : 'Search'}
          </button>
        </form>

        {/* Suggestion Chips */}
        <div className="flex flex-wrap items-center justify-center gap-2 mt-4 text-xs">
          <span className="text-[var(--color-text-muted)] font-medium">Try:</span>
          {SUGGESTIONS.map((s, i) => (
            <button
              key={s}
              type="button"
              onClick={() => setQuery(s)}
              className="px-3 py-1 rounded-full border border-[var(--color-border)] bg-white/[0.02] text-[var(--color-text-secondary)] hover:text-white hover:border-emerald-500/30 hover:bg-emerald-500/5 transition-all duration-150 cursor-pointer active:scale-[0.98]"
              style={{ animationDelay: `${i * 60}ms` }}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Error / Upgrade Alert */}
      {error && (
        <div className="card p-4 rounded-xl border border-red-500/30 bg-red-500/10 text-red-300 text-sm animate-in flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-red-400 shrink-0 mt-0.5" />
          <div className="flex-1 space-y-2">
            <p>{error}</p>
            {upgrade && (
              <Link
                href="/pricing"
                className="inline-flex items-center gap-1 font-semibold text-emerald-400 hover:underline cursor-pointer"
              >
                <span>Upgrade to Student Pro for unlimited research reports</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            )}
          </div>
        </div>
      )}

      {/* Three-Stage Loading Indicator */}
      {loading && (
        <div className="card p-8 rounded-xl border border-[var(--color-border)] flex flex-col items-center justify-center animate-in">
          <div className="flex items-center justify-center gap-6 sm:gap-12 w-full max-w-md py-4">
            {STAGES.map((s, i) => {
              const isPast = stage > i;
              const isCurrent = stage === i;
              return (
                <div key={s.label} className="flex flex-col items-center gap-2 flex-1 text-center">
                  <div
                    className={`h-9 w-9 rounded-full flex items-center justify-center text-xs font-semibold transition-all duration-300 ${
                      isPast
                        ? 'bg-emerald-500 text-black shadow-[0_0_12px_rgba(16,185,129,0.4)]'
                        : isCurrent
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500 animate-glow'
                        : 'bg-white/[0.04] text-[var(--color-text-muted)] border border-[var(--color-border)]'
                    }`}
                  >
                    {i + 1}
                  </div>
                  <span
                    className={`text-xs font-medium ${
                      isCurrent
                        ? 'text-emerald-400 font-semibold'
                        : isPast
                        ? 'text-[var(--color-text-primary)]'
                        : 'text-[var(--color-text-muted)]'
                    }`}
                  >
                    {s.label}
                  </span>
                </div>
              );
            })}
          </div>
          <div className="mt-6 w-full max-w-md">
            <div className="skeleton h-2 w-full rounded-full" />
          </div>
        </div>
      )}

      {/* Research Results */}
      {!loading && result && (
        <div className="space-y-6 animate-in">
          {/* Report Header Card */}
          <div className="card p-6 md:p-8 rounded-xl border border-[var(--color-border)] space-y-3">
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <span className="text-xs uppercase tracking-wider text-[var(--color-text-muted)] font-mono font-medium">
                Research Report
              </span>
              {result.confidence && (
                <span
                  className={`text-xs font-semibold px-3 py-1 rounded-full uppercase tracking-wider ${getConfidenceStyle(
                    result.confidence
                  )}`}
                >
                  Confidence: {result.confidence}
                </span>
              )}
            </div>

            <h2 className="text-2xl md:text-3xl font-semibold tracking-tight text-[var(--color-text-primary)] leading-snug">
              {result.headline}
            </h2>
          </div>

          {/* Horizontal Underline Tabs */}
          <div className="border-b border-[var(--color-border)] flex gap-1 overflow-x-auto scrollbar-none">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const active = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-3 text-sm font-medium transition-all duration-150 relative cursor-pointer active:scale-[0.98] whitespace-nowrap ${
                    active
                      ? 'text-[var(--color-text-primary)] font-semibold'
                      : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]'
                  }`}
                >
                  <Icon className={`h-4 w-4 ${active ? 'text-emerald-400' : 'text-[var(--color-text-muted)]'}`} />
                  <span>{tab.label}</span>
                  {active && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-500 rounded-full shadow-[0_0_8px_rgba(16,185,129,0.6)]" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Tab Content */}
          <div className="mt-4">
            {/* Tab 1: Literature */}
            {activeTab === 'literature' && (
              <div className="space-y-6 animate-in">
                <div className="card p-6 md:p-8 rounded-xl border border-[var(--color-border)]">
                  <div className="text-sm md:text-base text-[var(--color-text-primary)] leading-relaxed whitespace-pre-wrap space-y-4">
                    {result.literature}
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-semibold uppercase tracking-wider text-[var(--color-text-muted)] font-mono">
                      Retrieved Papers ({result.sources?.papers?.length || 0})
                    </h3>
                  </div>

                  <div className="grid gap-3">
                    {result.sources?.papers?.map((p: any, i: number) => (
                      <a
                        key={i}
                        href={p.url}
                        target="_blank"
                        rel="noreferrer"
                        className="card p-4 rounded-xl border border-[var(--color-border)] hover:border-emerald-500/40 hover:bg-white/[0.02] transition-all duration-150 block group cursor-pointer animate-in"
                        style={{ animationDelay: `${i * 60}ms` }}
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="space-y-1.5 flex-1">
                            <h4 className="text-sm font-medium text-[var(--color-text-primary)] group-hover:text-emerald-400 transition-colors leading-snug">
                              {p.title}
                            </h4>
                            <div className="text-xs text-[var(--color-text-muted)] flex flex-wrap items-center gap-2">
                              {p.authors && <span>{p.authors}</span>}
                              <span>•</span>
                              <span>{p.journal || 'PubMed'}</span>
                              {p.year && (
                                <>
                                  <span>•</span>
                                  <span>{p.year}</span>
                                </>
                              )}
                              {p.pmid && (
                                <>
                                  <span>•</span>
                                  <span className="font-mono text-emerald-400/80">PMID:{p.pmid}</span>
                                </>
                              )}
                            </div>
                            {p.abstract && (
                              <p className="text-xs text-[var(--color-text-secondary)] line-clamp-2 mt-2 leading-relaxed">
                                {p.abstract}
                              </p>
                            )}
                          </div>
                          <ExternalLink className="h-4 w-4 text-[var(--color-text-muted)] group-hover:text-emerald-400 shrink-0 transition-colors mt-1" />
                        </div>
                      </a>
                    ))}

                    {(!result.sources?.papers || result.sources.papers.length === 0) && (
                      <div className="card p-8 text-center text-sm text-[var(--color-text-muted)] rounded-xl border border-[var(--color-border)]">
                        No papers retrieved for this query.
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Tab 2: Trials */}
            {activeTab === 'trials' && (
              <div className="space-y-6 animate-in">
                <div className="card p-6 md:p-8 rounded-xl border border-[var(--color-border)]">
                  <div className="text-sm md:text-base text-[var(--color-text-primary)] leading-relaxed whitespace-pre-wrap">
                    {result.trials}
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-semibold uppercase tracking-wider text-[var(--color-text-muted)] font-mono mb-4">
                    Registered Clinical Trials ({result.sources?.trials?.length || 0})
                  </h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    {result.sources?.trials?.map((t: any, i: number) => (
                      <a
                        key={i}
                        href={t.url}
                        target="_blank"
                        rel="noreferrer"
                        className="card p-5 rounded-xl border border-[var(--color-border)] hover:border-emerald-500/40 hover:bg-white/[0.02] transition-all duration-150 flex flex-col justify-between group cursor-pointer animate-in"
                        style={{ animationDelay: `${i * 60}ms` }}
                      >
                        <div className="space-y-2">
                          <div className="flex items-center justify-between gap-2">
                            <span className="font-mono text-xs text-emerald-400 font-semibold group-hover:underline">
                              {t.nctId}
                            </span>
                            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full border border-[var(--color-border)] bg-white/[0.03] text-[var(--color-text-secondary)]">
                              {t.status}
                            </span>
                          </div>
                          <h4 className="text-sm font-medium text-[var(--color-text-primary)] line-clamp-2 leading-snug">
                            {t.title}
                          </h4>
                        </div>
                        <div className="mt-4 pt-3 border-t border-[var(--color-border)] text-xs text-[var(--color-text-muted)] space-y-1">
                          {t.phase && <p><strong className="text-[var(--color-text-secondary)]">Phase:</strong> {t.phase}</p>}
                          {t.conditions?.length > 0 && (
                            <p className="line-clamp-1">
                              <strong className="text-[var(--color-text-secondary)]">Conditions:</strong> {t.conditions.join(', ')}
                            </p>
                          )}
                        </div>
                      </a>
                    ))}
                    {(!result.sources?.trials || result.sources.trials.length === 0) && (
                      <div className="card p-8 text-center text-sm text-[var(--color-text-muted)] rounded-xl border border-[var(--color-border)] col-span-2">
                        No registered clinical trials found matching the disease criteria.
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Tab 3: Mechanism */}
            {activeTab === 'mechanism' && (
              <div className="space-y-6 animate-in">
                <div className="card p-6 md:p-8 rounded-xl border border-[var(--color-border)]">
                  <div className="text-sm md:text-base text-[var(--color-text-primary)] leading-relaxed whitespace-pre-wrap">
                    {result.mechanism}
                  </div>
                </div>

                {result.sources?.compound && (
                  <div className="card p-6 rounded-xl border border-emerald-500/20 bg-emerald-950/10 space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Atom className="h-5 w-5 text-emerald-400" />
                        <h3 className="font-semibold text-base text-[var(--color-text-primary)]">
                          PubChem Compound Record: {result.sources.compound.name}
                        </h3>
                      </div>
                      <a
                        href={result.sources.compound.url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs text-emerald-400 hover:underline flex items-center gap-1 cursor-pointer font-medium"
                      >
                        <span>View on PubChem</span>
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    </div>

                    <div className="grid sm:grid-cols-3 gap-3 text-xs">
                      <div className="p-3 rounded-lg bg-black/40 border border-[var(--color-border)]">
                        <div className="text-[var(--color-text-muted)] uppercase tracking-wider font-mono">Formula</div>
                        <div className="font-mono text-sm font-semibold text-white mt-1">
                          {result.sources.compound.formula || '—'}
                        </div>
                      </div>
                      <div className="p-3 rounded-lg bg-black/40 border border-[var(--color-border)]">
                        <div className="text-[var(--color-text-muted)] uppercase tracking-wider font-mono">Weight</div>
                        <div className="font-mono text-sm font-semibold text-white mt-1">
                          {result.sources.compound.weight ? `${result.sources.compound.weight} g/mol` : '—'}
                        </div>
                      </div>
                      <div className="p-3 rounded-lg bg-black/40 border border-[var(--color-border)] sm:col-span-1">
                        <div className="text-[var(--color-text-muted)] uppercase tracking-wider font-mono">SMILES</div>
                        <div className="font-mono text-xs font-semibold text-emerald-300 truncate mt-1" title={result.sources.compound.smiles}>
                          {result.sources.compound.smiles || '—'}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Tab 4: Gaps */}
            {activeTab === 'gaps' && (
              <div className="card p-6 md:p-8 rounded-xl border border-[var(--color-border)] animate-in">
                <div className="flex items-center gap-2 mb-4 text-amber-400 text-sm font-medium">
                  <HelpCircle className="h-4 w-4" />
                  <span>Unresolved scientific questions &amp; limitations</span>
                </div>
                <div className="text-sm md:text-base text-[var(--color-text-primary)] leading-relaxed whitespace-pre-wrap">
                  {result.gaps}
                </div>
              </div>
            )}

            {/* Tab 5: Next Steps */}
            {activeTab === 'next_steps' && (
              <div className="card p-6 md:p-8 rounded-xl border border-[var(--color-border)] space-y-4 animate-in">
                <div className="flex items-center gap-2 text-emerald-400 text-sm font-medium">
                  <ListOrdered className="h-4 w-4" />
                  <span>Recommended research directions</span>
                </div>
                <ul className="space-y-3">
                  {result.next_steps?.map((step: string, i: number) => (
                    <li
                      key={i}
                      className="flex items-start gap-3 p-3.5 rounded-lg bg-white/[0.02] border border-[var(--color-border)] text-xs md:text-sm text-[var(--color-text-secondary)] leading-relaxed animate-in"
                      style={{ animationDelay: `${i * 60}ms` }}
                    >
                      <span className="h-5 w-5 rounded-full bg-emerald-500/10 text-emerald-400 font-mono font-semibold flex items-center justify-center text-xs shrink-0 mt-0.5">
                        {i + 1}
                      </span>
                      <span>{step}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
