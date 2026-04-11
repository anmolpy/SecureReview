// SecureReview — History Page
// Design: Dark Glassmorphism — expandable scan history cards

import { useState } from 'react';
import { History as HistoryIcon, ChevronDown, ChevronUp, Clock, Code2, Trash2, ExternalLink } from 'lucide-react';
import { Link } from 'wouter';
import { useApp } from '@/contexts/AppContext';
import SeverityBadge from '@/components/SeverityBadge';
import FindingCard from '@/components/FindingCard';

function formatTime(date: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  }).format(date);
}

export default function History() {
  const { history, clearHistory } = useApp();
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const toggleExpand = (id: string) => {
    setExpandedId(prev => (prev === id ? null : id));
  };

  return (
    <div className="min-h-screen pt-16" style={{ background: '#090b11' }}>
      {/* Page header */}
      <div
        className="px-4 sm:px-6 py-6"
        style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.06)' }}
      >
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className="w-9 h-9 rounded-lg flex items-center justify-center"
              style={{
                background: 'rgba(88, 166, 255, 0.1)',
                border: '1px solid rgba(88, 166, 255, 0.25)',
              }}
            >
              <HistoryIcon className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <h1
                className="text-lg font-bold"
                style={{ color: '#e2e8f0', fontFamily: 'Space Grotesk, sans-serif' }}
              >
                Scan History
              </h1>
              <p className="text-xs" style={{ color: '#475569', fontFamily: 'Inter, sans-serif' }}>
                {history.length} scan{history.length !== 1 ? 's' : ''} this session
              </p>
            </div>
          </div>

          {history.length > 0 && (
            <button
              onClick={clearHistory}
              className="flex items-center gap-1.5 text-xs px-3 py-2 rounded-lg transition-all"
              style={{ color: '#ef4444', fontFamily: 'Inter, sans-serif' }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLElement).style.background = 'rgba(239, 68, 68, 0.1)';
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLElement).style.background = 'transparent';
              }}
            >
              <Trash2 className="w-3.5 h-3.5" />
              Clear History
            </button>
          )}
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        {/* Empty state */}
        {history.length === 0 && (
          <div
            className="rounded-2xl p-16 text-center"
            style={{
              background: 'rgba(255, 255, 255, 0.02)',
              border: '1px dashed rgba(255, 255, 255, 0.08)',
            }}
          >
            <HistoryIcon className="w-14 h-14 mx-auto mb-5" style={{ color: '#1e3a5f' }} />
            <h2
              className="text-xl font-bold mb-3"
              style={{ color: '#334155', fontFamily: 'Space Grotesk, sans-serif' }}
            >
              No scans yet
            </h2>
            <p className="text-sm mb-6" style={{ color: '#1e293b', fontFamily: 'Inter, sans-serif' }}>
              Your scan history will appear here after you analyze code.
            </p>
            <Link
              href="/audit"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold transition-all"
              style={{
                background: 'linear-gradient(135deg, #1d4ed8, #2563eb)',
                color: '#fff',
                border: '1px solid rgba(88, 166, 255, 0.4)',
                boxShadow: '0 0 20px rgba(88, 166, 255, 0.2)',
                fontFamily: 'Space Grotesk, sans-serif',
              }}
            >
              <ExternalLink className="w-4 h-4" />
              Go to Audit
            </Link>
          </div>
        )}

        {/* History list */}
        {history.length > 0 && (
          <div className="space-y-4">
            {history.map((scan, idx) => {
              const isExpanded = expandedId === scan.id;
              return (
                <div
                  key={scan.id}
                  className="rounded-2xl overflow-hidden transition-all duration-300 animate-slide-in-up"
                  style={{
                    background: 'rgba(255, 255, 255, 0.03)',
                    border: '1px solid rgba(255, 255, 255, 0.07)',
                    animationDelay: `${idx * 0.05}s`,
                    opacity: 0,
                  }}
                >
                  {/* Summary row */}
                  <button
                    className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-white/[0.02] transition-colors"
                    onClick={() => toggleExpand(scan.id)}
                  >
                    <div className="flex items-center gap-4 min-w-0">
                      {/* Scan number */}
                      <span
                        className="text-xs font-mono font-bold flex-shrink-0 w-7 h-7 rounded-lg flex items-center justify-center"
                        style={{
                          background: 'rgba(88, 166, 255, 0.1)',
                          color: '#58a6ff',
                          border: '1px solid rgba(88, 166, 255, 0.2)',
                          fontFamily: 'JetBrains Mono, monospace',
                        }}
                      >
                        {history.length - idx}
                      </span>

                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <SeverityBadge level={scan.overall_risk} size="sm" />
                          <span
                            className="flex items-center gap-1 text-xs"
                            style={{ color: '#475569', fontFamily: 'Inter, sans-serif' }}
                          >
                            <Code2 className="w-3 h-3" />
                            {scan.language}
                          </span>
                          <span
                            className="text-xs"
                            style={{ color: '#334155', fontFamily: 'Inter, sans-serif' }}
                          >
                            {scan.findings_count} finding{scan.findings_count !== 1 ? 's' : ''}
                          </span>
                        </div>
                        <div
                          className="flex items-center gap-1 mt-1 text-xs"
                          style={{ color: '#334155', fontFamily: 'Inter, sans-serif' }}
                        >
                          <Clock className="w-3 h-3" />
                          {formatTime(scan.timestamp)}
                        </div>
                      </div>
                    </div>

                    <div className="flex-shrink-0 ml-3">
                      {isExpanded ? (
                        <ChevronUp className="w-4 h-4 text-slate-500" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-slate-500" />
                      )}
                    </div>
                  </button>

                  {/* Expanded details */}
                  {isExpanded && (
                    <div
                      className="px-5 pb-5 space-y-4 border-t"
                      style={{ borderColor: 'rgba(255,255,255,0.05)' }}
                    >
                      {/* Summary */}
                      <div className="pt-4">
                        <p
                          className="text-xs font-semibold uppercase tracking-wider mb-2"
                          style={{ color: '#475569', fontFamily: 'Space Grotesk, sans-serif' }}
                        >
                          Summary
                        </p>
                        <p className="text-sm leading-relaxed" style={{ color: '#94a3b8', fontFamily: 'Inter, sans-serif' }}>
                          {scan.result.summary}
                        </p>
                      </div>

                      {/* Code snippet */}
                      {scan.code_snippet && (
                        <div>
                          <p
                            className="text-xs font-semibold uppercase tracking-wider mb-2"
                            style={{ color: '#475569', fontFamily: 'Space Grotesk, sans-serif' }}
                          >
                            Code Snippet
                          </p>
                          <pre
                            className="text-xs p-3 rounded-lg overflow-x-auto"
                            style={{
                              background: 'rgba(0,0,0,0.3)',
                              border: '1px solid rgba(255,255,255,0.06)',
                              color: '#64748b',
                              fontFamily: 'JetBrains Mono, monospace',
                              lineHeight: 1.6,
                            }}
                          >
                            {scan.code_snippet}
                          </pre>
                        </div>
                      )}

                      {/* Findings */}
                      {scan.result.findings.length > 0 ? (
                        <div>
                          <p
                            className="text-xs font-semibold uppercase tracking-wider mb-3"
                            style={{ color: '#475569', fontFamily: 'Space Grotesk, sans-serif' }}
                          >
                            Findings ({scan.result.findings.length})
                          </p>
                          <div className="space-y-3">
                            {scan.result.findings.map((finding, i) => (
                              <FindingCard key={finding.id + i} finding={finding} index={i} />
                            ))}
                          </div>
                        </div>
                      ) : (
                        <div
                          className="rounded-xl p-4 text-center"
                          style={{
                            background: 'rgba(34, 197, 94, 0.05)',
                            border: '1px solid rgba(34, 197, 94, 0.15)',
                          }}
                        >
                          <p className="text-sm" style={{ color: '#4ade80', fontFamily: 'Inter, sans-serif' }}>
                            No vulnerabilities found in this scan.
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
