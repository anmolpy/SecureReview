// SecureReview — Audit Page
// Design: Dark Glassmorphism — asymmetric split panel layout
// Left: language selector, code input | Right: Results panel
// API key is now server-side — no user input needed

import { useState } from 'react';
import {
  ChevronDown, Play, Loader2, AlertCircle, CheckCircle2,
  ShieldAlert, Code2, Copy, Check
} from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import { useAnalyzeCode } from '@/lib/gemini';
import { trpc } from '@/lib/trpc';
import type { AuditResult, Language } from '@/lib/types';
import { LANGUAGES, SAMPLE_VULNERABLE_CODE } from '@/lib/types';
import SeverityBadge from '@/components/SeverityBadge';
import FindingCard from '@/components/FindingCard';

export default function Audit() {
  const { addScan } = useApp();
  const analyzeMutation = useAnalyzeCode();
  const [language, setLanguage] = useState<Language>('Auto-detect');
  const [code, setCode] = useState(SAMPLE_VULNERABLE_CODE);
  const [result, setResult] = useState<AuditResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [requestId, setRequestId] = useState<string | null>(null);

  const loading = analyzeMutation.isPending;
  const statusQuery = trpc.audit.status.useQuery(
    requestId ? { requestId } : ({ requestId: '' } as { requestId: string }),
    {
      enabled: Boolean(requestId) && loading,
      refetchInterval: 700,
      refetchOnWindowFocus: false,
      retry: false,
    }
  );

  const handleAnalyze = async () => {
    if (!code.trim()) {
      setError('Please paste some code to analyze.');
      return;
    }

    setError(null);
    setResult(null);
    const nextRequestId = crypto.randomUUID();
    setRequestId(nextRequestId);

    try {
      const auditResult = await analyzeMutation.mutateAsync({
        code,
        language,
        requestId: nextRequestId,
      });
      const typedResult = auditResult as AuditResult;
      setResult(typedResult);
      addScan(typedResult, code);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'An unexpected error occurred.';
      setError(message);
    } finally {
      setRequestId(null);
    }
  };

  const handleCopyCode = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const RISK_GLOW: Record<string, string> = {
    Critical: 'rgba(239, 68, 68, 0.2)',
    High: 'rgba(249, 115, 22, 0.2)',
    Medium: 'rgba(234, 179, 8, 0.15)',
    Low: 'rgba(59, 130, 246, 0.15)',
    Clean: 'rgba(34, 197, 94, 0.15)',
  };

  return (
    <div className="min-h-screen pt-16" style={{ background: '#090b11' }}>
      {/* Page header */}
      <div
        className="px-4 sm:px-6 py-6"
        style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.06)' }}
      >
        <div className="max-w-7xl mx-auto flex items-center gap-3">
          <div
            className="w-9 h-9 rounded-lg flex items-center justify-center"
            style={{
              background: 'rgba(88, 166, 255, 0.1)',
              border: '1px solid rgba(88, 166, 255, 0.25)',
            }}
          >
            <ShieldAlert className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <h1
              className="text-lg font-bold"
              style={{ color: '#e2e8f0', fontFamily: 'Space Grotesk, sans-serif' }}
            >
              Code Audit
            </h1>
            <p className="text-xs" style={{ color: '#475569', fontFamily: 'Inter, sans-serif' }}>
              Paste your code below and click Analyze to scan for vulnerabilities
            </p>
          </div>
        </div>
      </div>

      {/* Main layout */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">

          {/* LEFT PANEL — Input */}
          <div className="space-y-4">

            {/* Language Selector */}
            <div
              className="rounded-xl p-4"
              style={{
                background: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid rgba(255, 255, 255, 0.07)',
              }}
            >
              <label
                className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider mb-2"
                style={{ color: '#58a6ff', fontFamily: 'Space Grotesk, sans-serif' }}
              >
                <Code2 className="w-3.5 h-3.5" />
                Language
              </label>
              <div className="relative">
                <select
                  value={language}
                  onChange={e => setLanguage(e.target.value as Language)}
                  className="w-full px-3 py-2.5 rounded-lg text-sm appearance-none outline-none transition-all"
                  style={{
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    color: '#e2e8f0',
                    fontFamily: 'Inter, sans-serif',
                  }}
                  onFocus={e => {
                    (e.target as HTMLSelectElement).style.borderColor = 'rgba(88, 166, 255, 0.4)';
                  }}
                  onBlur={e => {
                    (e.target as HTMLSelectElement).style.borderColor = 'rgba(255, 255, 255, 0.1)';
                  }}
                >
                  {LANGUAGES.map(lang => (
                    <option key={lang} value={lang} style={{ background: '#1e293b' }}>
                      {lang}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none" style={{ color: '#475569' }} />
              </div>
            </div>

            {/* Code Input */}
            <div
              className="rounded-xl overflow-hidden"
              style={{
                background: 'rgba(255, 255, 255, 0.02)',
                border: '1px solid rgba(255, 255, 255, 0.07)',
              }}
            >
              <div
                className="flex items-center justify-between px-4 py-2.5"
                style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.06)' }}
              >
                <span
                  className="text-xs font-semibold uppercase tracking-wider"
                  style={{ color: '#58a6ff', fontFamily: 'Space Grotesk, sans-serif' }}
                >
                  Code to Analyze
                </span>
                <button
                  className="flex items-center gap-1.5 text-xs transition-colors px-2 py-1 rounded"
                  style={{ color: '#475569' }}
                  onClick={handleCopyCode}
                  onMouseEnter={e => {
                    (e.currentTarget as HTMLElement).style.color = '#94a3b8';
                    (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.05)';
                  }}
                  onMouseLeave={e => {
                    (e.currentTarget as HTMLElement).style.color = '#475569';
                    (e.currentTarget as HTMLElement).style.background = 'transparent';
                  }}
                >
                  {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  {copied ? 'Copied' : 'Copy'}
                </button>
              </div>
              <textarea
                value={code}
                onChange={e => setCode(e.target.value)}
                rows={24}
                className="w-full p-4 outline-none resize-none code-textarea"
                style={{
                  background: 'transparent',
                  color: '#94a3b8',
                  fontFamily: 'JetBrains Mono, Fira Code, monospace',
                  fontSize: '0.78rem',
                  lineHeight: 1.7,
                }}
                placeholder="Paste your code here..."
                spellCheck={false}
              />
            </div>

            {/* Analyze Button */}
            <button
              onClick={handleAnalyze}
              disabled={loading}
              className="w-full flex items-center justify-center gap-2.5 py-4 rounded-xl text-base font-bold transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed"
              style={{
                background: loading
                  ? 'rgba(88, 166, 255, 0.15)'
                  : 'linear-gradient(135deg, #1d4ed8, #2563eb)',
                color: '#fff',
                border: '1px solid rgba(88, 166, 255, 0.4)',
                boxShadow: loading ? 'none' : '0 0 30px rgba(88, 166, 255, 0.25)',
                fontFamily: 'Space Grotesk, sans-serif',
              }}
              onMouseEnter={e => {
                if (!loading) {
                  (e.currentTarget as HTMLElement).style.boxShadow = '0 0 50px rgba(88, 166, 255, 0.45)';
                  (e.currentTarget as HTMLElement).style.transform = 'translateY(-1px)';
                }
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLElement).style.boxShadow = '0 0 30px rgba(88, 166, 255, 0.25)';
                (e.currentTarget as HTMLElement).style.transform = 'translateY(0)';
              }}
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Play className="w-5 h-5" />
                  Analyze Code
                </>
              )}
            </button>
          </div>

          {/* RIGHT PANEL — Results */}
          <div className="space-y-4 lg:sticky lg:top-24">

            {/* Error state */}
            {error && (
              <div
                className="rounded-xl p-4 flex items-start gap-3 animate-slide-in-up"
                style={{
                  background: 'rgba(239, 68, 68, 0.08)',
                  border: '1px solid rgba(239, 68, 68, 0.25)',
                }}
              >
                <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p
                    className="text-sm font-semibold mb-1"
                    style={{ color: '#f87171', fontFamily: 'Space Grotesk, sans-serif' }}
                  >
                    Analysis Failed
                  </p>
                  <p className="text-sm" style={{ color: '#94a3b8', fontFamily: 'Inter, sans-serif' }}>
                    {error}
                  </p>
                </div>
              </div>
            )}

            {/* Loading skeleton */}
            {loading && (
              <div
                className="rounded-xl p-6 animate-pulse-glow"
                style={{
                  background: 'rgba(88, 166, 255, 0.05)',
                  border: '1px solid rgba(88, 166, 255, 0.2)',
                }}
              >
                <div className="flex items-center gap-3 mb-4">
                  <Loader2 className="w-5 h-5 text-blue-400 animate-spin" />
                  <div>
                    <span
                      className="text-sm font-semibold"
                      style={{ color: '#58a6ff', fontFamily: 'Space Grotesk, sans-serif' }}
                    >
                      {statusQuery.data?.message || 'Scanning for vulnerabilities...'}
                    </span>
                    {(statusQuery.data?.currentProvider || statusQuery.data?.currentModel) && (
                      <p
                        className="text-xs mt-1"
                        style={{ color: '#94a3b8', fontFamily: 'Inter, sans-serif' }}
                      >
                        Active: {statusQuery.data?.currentProvider || 'llm'}
                        {statusQuery.data?.currentModel ? ` (${statusQuery.data.currentModel})` : ''}
                      </p>
                    )}
                  </div>
                </div>
                <div className="space-y-2">
                  {[80, 60, 70, 50].map((w, i) => (
                    <div
                      key={i}
                      className="h-3 rounded-full"
                      style={{
                        width: `${w}%`,
                        background: 'rgba(88, 166, 255, 0.1)',
                      }}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Results */}
            {result && !loading && (
              <div className="space-y-4 animate-fade-in">
                {/* Overall risk badge */}
                <div
                  className="rounded-xl p-5"
                  style={{
                    background: `rgba(${result.overall_risk === 'Clean' ? '34, 197, 94' : result.overall_risk === 'Critical' ? '239, 68, 68' : result.overall_risk === 'High' ? '249, 115, 22' : result.overall_risk === 'Medium' ? '234, 179, 8' : '59, 130, 246'}, 0.06)`,
                    border: `1px solid ${RISK_GLOW[result.overall_risk] ?? 'rgba(255,255,255,0.1)'}`,
                    boxShadow: `0 0 30px ${RISK_GLOW[result.overall_risk] ?? 'transparent'}`,
                  }}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p
                        className="text-xs font-semibold uppercase tracking-wider mb-2"
                        style={{ color: '#475569', fontFamily: 'Space Grotesk, sans-serif' }}
                      >
                        Overall Risk
                      </p>
                      <SeverityBadge level={result.overall_risk} size="lg" />
                      <p className="text-xs mt-2" style={{ color: '#64748b', fontFamily: 'Inter, sans-serif' }}>
                        Language: <span style={{ color: '#94a3b8' }}>{result.language}</span>
                        {' · '}
                        {result.findings.length} finding{result.findings.length !== 1 ? 's' : ''}
                      </p>
                    </div>
                    {result.overall_risk === 'Clean' && (
                      <CheckCircle2 className="w-8 h-8 text-emerald-400 flex-shrink-0" />
                    )}
                  </div>
                  <p
                    className="text-sm mt-3 leading-relaxed"
                    style={{ color: '#94a3b8', fontFamily: 'Inter, sans-serif' }}
                  >
                    {result.summary}
                  </p>
                </div>

                {/* Clean state */}
                {result.findings.length === 0 && (
                  <div
                    className="rounded-xl p-8 text-center animate-scale-in"
                    style={{
                      background: 'rgba(34, 197, 94, 0.05)',
                      border: '1px solid rgba(34, 197, 94, 0.2)',
                    }}
                  >
                    <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto mb-3" />
                    <h3
                      className="text-lg font-bold mb-2"
                      style={{ color: '#4ade80', fontFamily: 'Space Grotesk, sans-serif' }}
                    >
                      No Vulnerabilities Found
                    </h3>
                    <p className="text-sm" style={{ color: '#64748b', fontFamily: 'Inter, sans-serif' }}>
                      The analyzed code appears to be clean. No security issues were detected.
                    </p>
                  </div>
                )}

                {/* Findings */}
                {result.findings.length > 0 && (
                  <div>
                    <p
                      className="text-xs font-semibold uppercase tracking-wider mb-3"
                      style={{ color: '#475569', fontFamily: 'Space Grotesk, sans-serif' }}
                    >
                      Findings ({result.findings.length})
                    </p>
                    <div className="space-y-3">
                      {result.findings.map((finding, i) => (
                        <FindingCard key={finding.id + i} finding={finding} index={i} />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Empty state */}
            {!result && !loading && !error && (
              <div
                className="rounded-xl p-10 text-center"
                style={{
                  background: 'rgba(255, 255, 255, 0.02)',
                  border: '1px dashed rgba(255, 255, 255, 0.08)',
                }}
              >
                <ShieldAlert className="w-12 h-12 mx-auto mb-4" style={{ color: '#1e3a5f' }} />
                <p
                  className="text-base font-semibold mb-2"
                  style={{ color: '#334155', fontFamily: 'Space Grotesk, sans-serif' }}
                >
                  Awaiting Analysis
                </p>
                <p className="text-sm" style={{ color: '#1e293b', fontFamily: 'Inter, sans-serif' }}>
                  Paste code and click "Analyze Code" to begin scanning for vulnerabilities.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
