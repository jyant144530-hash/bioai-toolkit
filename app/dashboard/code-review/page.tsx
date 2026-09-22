'use client';

import { useState } from 'react';
import Editor from '@monaco-editor/react';
import Link from 'next/link';
import { Sparkles, Check, Copy, AlertTriangle, ArrowRight, ShieldCheck, CheckCircle2 } from 'lucide-react';

const SAMPLE_CODE = `import pandas as pd

df = pd.read_csv("/Users/me/Desktop/plate_reader_export.csv")
control = df[df["sample"] == "control"]
treated = df[df["sample"] == "treated"]

fold_change = treated["signal"].mean() / control["signal"].mean()
print("Fold change:", fold_change)
`;

export default function CodeReviewPage() {
  const [code, setCode] = useState(SAMPLE_CODE);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [upgrade, setUpgrade] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const handleReview = async () => {
    if (code.length < 30) return;
    setLoading(true);
    setError('');
    setUpgrade(false);
    setResult(null);

    try {
      const res = await fetch('/api/review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, filename: 'analysis.py' }),
      });
      const data = await res.json();
      if (!res.ok) {
        if (res.status === 402 && data.upgrade) setUpgrade(true);
        throw new Error(data.error || 'Failed to review code');
      }
      setResult(data);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyFix = (text: string, idx: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(idx);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const getSeverityStyle = (sev: string) => {
    switch (sev?.toLowerCase()) {
      case 'critical':
        return {
          border: 'border-l-red-500',
          pill: 'bg-red-500/15 text-red-400 border-red-500/30',
        };
      case 'high':
        return {
          border: 'border-l-orange-500',
          pill: 'bg-orange-500/15 text-orange-400 border-orange-500/30',
        };
      case 'medium':
        return {
          border: 'border-l-yellow-500',
          pill: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/30',
        };
      case 'low':
        return {
          border: 'border-l-blue-500',
          pill: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
        };
      default:
        return {
          border: 'border-l-zinc-500',
          pill: 'bg-zinc-500/15 text-zinc-400 border-zinc-500/30',
        };
    }
  };

  const getScoreColor = (score: number) => {
    if (score <= 40) return 'text-red-500';
    if (score <= 70) return 'text-yellow-400';
    return 'text-emerald-400';
  };

  return (
    <div className="space-y-6">
      <div className="grid lg:grid-cols-[1fr,480px] gap-6 items-start">
        {/* Left Column: Editor */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              <span className="text-xs font-mono uppercase tracking-wider text-[var(--color-text-secondary)] font-medium">
                Python (analysis.py)
              </span>
            </div>
            <button
              type="button"
              onClick={() => setCode(SAMPLE_CODE)}
              className="btn-ghost text-xs py-1.5 px-3 cursor-pointer active:scale-[0.98]"
            >
              Load sample
            </button>
          </div>

          <div className="rounded-xl border border-[var(--color-border)] overflow-hidden min-h-[70vh] bg-[#1e1e1e] shadow-2xl">
            <Editor
              height="70vh"
              defaultLanguage="python"
              theme="vs-dark"
              value={code}
              onChange={(val) => setCode(val || '')}
              options={{
                minimap: { enabled: false },
                fontSize: 13,
                lineNumbers: 'on',
                scrollBeyondLastLine: false,
                padding: { top: 16, bottom: 16 },
                renderLineHighlight: 'all',
                fontFamily: 'var(--font-mono), monospace',
              }}
            />
          </div>

          <button
            type="button"
            className="btn-primary w-full py-3.5 text-sm font-semibold tracking-wide cursor-pointer active:scale-[0.98] disabled:cursor-not-allowed"
            onClick={handleReview}
            disabled={loading || code.trim().length < 30}
          >
            {loading ? 'Scanning biological logic...' : 'Review my code'}
          </button>
        </div>

        {/* Right Column: Review Results or Empty State */}
        <div className="flex flex-col gap-4 overflow-y-auto">
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
                    <span>Upgrade to Student Pro for unlimited reviews</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                )}
              </div>
            </div>
          )}

          {/* Loading Skeletons */}
          {loading && (
            <div className="space-y-3 animate-in">
              <div className="skeleton h-32 w-full rounded-xl" />
              <div className="skeleton h-44 w-full rounded-xl" />
              <div className="skeleton h-44 w-full rounded-xl" />
            </div>
          )}

          {/* Empty State before review */}
          {!loading && !result && (
            <div className="card p-12 text-center rounded-xl border border-[var(--color-border)] flex flex-col items-center justify-center animate-in">
              <div className="h-16 w-16 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-5 border border-emerald-500/20">
                <Sparkles className="h-8 w-8 text-emerald-400/80" />
              </div>
              <h2 className="text-lg font-medium text-[var(--color-text-primary)] tracking-tight">
                Ready when you are
              </h2>
              <p className="text-sm text-[var(--color-text-secondary)] mt-2 max-w-sm leading-relaxed">
                Paste your wet-lab Python script on the left. We analyze statistical operations, file paths, coordinate schemas, and plate reader normalization.
              </p>

              <div className="mt-8 space-y-3 text-left w-full max-w-xs text-xs text-[var(--color-text-secondary)]">
                <div className="flex items-center gap-2.5">
                  <Check className="h-4 w-4 text-emerald-400 shrink-0" />
                  <span>Checks for zero-division in fold changes</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Check className="h-4 w-4 text-emerald-400 shrink-0" />
                  <span>Flags fragile absolute file paths</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Check className="h-4 w-4 text-emerald-400 shrink-0" />
                  <span>Validates coordinate bases &amp; NaN handling</span>
                </div>
              </div>
            </div>
          )}

          {/* Result Cards Stack */}
          {!loading && result && (
            <div className="space-y-4 pb-12 animate-in">
              {/* Score Card */}
              <div className="card p-6 rounded-xl border border-[var(--color-border)] text-center">
                <div className={`text-6xl font-bold tracking-tight ${getScoreColor(result.score ?? 0)}`}>
                  {result.score ?? '—'}
                </div>
                <div className="text-xs uppercase tracking-wider text-[var(--color-text-muted)] font-medium mt-1">
                  Scientific reliability score
                </div>
                <p className="text-sm text-[var(--color-text-secondary)] mt-3 leading-relaxed max-w-md mx-auto">
                  {result.summary}
                </p>
              </div>

              {/* Issues Section */}
              <div className="space-y-3">
                <div className="flex items-center justify-between px-1">
                  <span className="text-xs font-semibold uppercase tracking-wider text-[var(--color-text-muted)]">
                    Detected issues ({result.issues?.length || 0})
                  </span>
                </div>

                {result.issues?.map((issue: any, i: number) => {
                  const style = getSeverityStyle(issue.severity);
                  return (
                    <div
                      key={i}
                      className={`card p-5 rounded-xl border border-[var(--color-border)] border-l-4 ${style.border} space-y-3 animate-in`}
                      style={{ animationDelay: `${i * 60}ms` }}
                    >
                      <div className="flex items-center gap-2 flex-wrap text-xs">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${style.pill} uppercase tracking-wider`}>
                          {issue.severity}
                        </span>
                        <span className="text-[var(--color-text-muted)]">•</span>
                        <span className="text-[var(--color-text-secondary)] font-medium capitalize">
                          {issue.category}
                        </span>
                        {issue.line && (
                          <>
                            <span className="text-[var(--color-text-muted)]">•</span>
                            <span className="text-[var(--color-text-muted)] font-mono">
                              Line {issue.line}
                            </span>
                          </>
                        )}
                      </div>

                      <h3 className="text-base font-semibold text-[var(--color-text-primary)] leading-snug">
                        {issue.title}
                      </h3>

                      <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed">
                        {issue.explanation}
                      </p>

                      {issue.fix && (
                        <div className="relative rounded-lg bg-black/50 border border-[var(--color-border)] p-3 pt-8 font-mono text-xs overflow-x-auto text-emerald-300">
                          <button
                            type="button"
                            onClick={() => handleCopyFix(issue.fix, i)}
                            className="btn-ghost absolute top-2 right-2 text-[11px] py-1 px-2 flex items-center gap-1 cursor-pointer active:scale-[0.98]"
                            title="Copy snippet"
                          >
                            {copiedIndex === i ? (
                              <>
                                <Check className="h-3 w-3 text-emerald-400" />
                                <span className="text-emerald-400">Copied</span>
                              </>
                            ) : (
                              <>
                                <Copy className="h-3 w-3" />
                                <span>Copy</span>
                              </>
                            )}
                          </button>
                          <pre className="whitespace-pre-wrap">{issue.fix}</pre>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Learning Points Card */}
              {result.learning_points?.length > 0 && (
                <div className="card p-5 rounded-xl border border-[var(--color-border)] space-y-3 animate-in">
                  <div className="flex items-center gap-2 text-emerald-400 font-medium text-sm">
                    <ShieldCheck className="h-4 w-4" />
                    <span>Key takeaways for future experiments</span>
                  </div>
                  <ul className="space-y-2.5">
                    {result.learning_points.map((pt: string, i: number) => (
                      <li key={i} className="flex items-start gap-2.5 text-xs text-[var(--color-text-secondary)] leading-relaxed">
                        <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                        <span>{pt}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
