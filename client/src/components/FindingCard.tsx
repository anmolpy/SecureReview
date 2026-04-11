// SecureReview — FindingCard Component
// Design: Glassmorphism card with severity-coded left border and expandable details

import { useState } from 'react';
import { ChevronDown, ChevronUp, MapPin, Wrench, AlertTriangle } from 'lucide-react';
import type { Finding } from '@/lib/types';
import SeverityBadge from './SeverityBadge';

interface Props {
  finding: Finding;
  index: number;
}

const BORDER_COLORS: Record<string, string> = {
  Critical: '#ef4444',
  High: '#f97316',
  Medium: '#eab308',
  Low: '#3b82f6',
  Informational: '#94a3b8',
};

export default function FindingCard({ finding, index }: Props) {
  const [expanded, setExpanded] = useState(index < 2); // First 2 expanded by default
  const borderColor = BORDER_COLORS[finding.severity] ?? '#94a3b8';

  return (
    <div
      className="rounded-xl overflow-hidden transition-all duration-300 animate-slide-in-up"
      style={{
        background: 'rgba(255, 255, 255, 0.03)',
        border: '1px solid rgba(255, 255, 255, 0.07)',
        borderLeft: `3px solid ${borderColor}`,
        animationDelay: `${index * 0.08}s`,
        opacity: 0,
      }}
    >
      {/* Header — always visible */}
      <button
        className="w-full flex items-center justify-between px-4 py-3.5 text-left hover:bg-white/[0.02] transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center gap-3 min-w-0">
          <span
            className="text-xs font-mono font-semibold flex-shrink-0 px-2 py-0.5 rounded"
            style={{
              background: 'rgba(88, 166, 255, 0.1)',
              color: '#58a6ff',
              border: '1px solid rgba(88, 166, 255, 0.2)',
            }}
          >
            {finding.id}
          </span>
          <span
            className="text-sm font-semibold text-slate-200 truncate"
            style={{ fontFamily: 'Space Grotesk, sans-serif' }}
          >
            {finding.title}
          </span>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0 ml-3">
          <SeverityBadge level={finding.severity} size="sm" />
          {expanded ? (
            <ChevronUp className="w-4 h-4 text-slate-500" />
          ) : (
            <ChevronDown className="w-4 h-4 text-slate-500" />
          )}
        </div>
      </button>

      {/* Expanded content */}
      {expanded && (
        <div
          className="px-4 pb-4 space-y-3 border-t"
          style={{ borderColor: 'rgba(255,255,255,0.05)' }}
        >
          {/* Line hint */}
          {finding.line_hint && (
            <div className="flex items-start gap-2 pt-3">
              <MapPin className="w-3.5 h-3.5 text-slate-500 mt-0.5 flex-shrink-0" />
              <span className="text-xs text-slate-400 font-mono">{finding.line_hint}</span>
            </div>
          )}

          {/* Description */}
          <div className="flex items-start gap-2 pt-2">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-500 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                Description
              </p>
              <p className="text-sm text-slate-300 leading-relaxed">{finding.description}</p>
            </div>
          </div>

          {/* Remediation */}
          <div
            className="flex items-start gap-2 p-3 rounded-lg"
            style={{
              background: 'rgba(34, 197, 94, 0.05)',
              border: '1px solid rgba(34, 197, 94, 0.15)',
            }}
          >
            <Wrench className="w-3.5 h-3.5 text-emerald-400 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-xs font-semibold text-emerald-400 uppercase tracking-wider mb-1">
                Remediation
              </p>
              <p className="text-sm text-slate-300 leading-relaxed">{finding.remediation}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
