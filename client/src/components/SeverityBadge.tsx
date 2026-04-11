// SecureReview — SeverityBadge Component
// Design: Glassmorphism severity badges with color-coded borders

import type { Severity, OverallRisk } from '@/lib/types';

type BadgeLevel = Severity | OverallRisk;

interface Props {
  level: BadgeLevel;
  size?: 'sm' | 'md' | 'lg';
}

const BADGE_STYLES: Record<string, { bg: string; text: string; border: string; dot: string }> = {
  Critical: {
    bg: 'rgba(239, 68, 68, 0.12)',
    text: '#f87171',
    border: 'rgba(239, 68, 68, 0.35)',
    dot: '#ef4444',
  },
  High: {
    bg: 'rgba(249, 115, 22, 0.12)',
    text: '#fb923c',
    border: 'rgba(249, 115, 22, 0.35)',
    dot: '#f97316',
  },
  Medium: {
    bg: 'rgba(234, 179, 8, 0.12)',
    text: '#facc15',
    border: 'rgba(234, 179, 8, 0.35)',
    dot: '#eab308',
  },
  Low: {
    bg: 'rgba(59, 130, 246, 0.12)',
    text: '#60a5fa',
    border: 'rgba(59, 130, 246, 0.35)',
    dot: '#3b82f6',
  },
  Informational: {
    bg: 'rgba(148, 163, 184, 0.12)',
    text: '#94a3b8',
    border: 'rgba(148, 163, 184, 0.35)',
    dot: '#94a3b8',
  },
  Clean: {
    bg: 'rgba(34, 197, 94, 0.12)',
    text: '#4ade80',
    border: 'rgba(34, 197, 94, 0.35)',
    dot: '#22c55e',
  },
};

const SIZE_CLASSES = {
  sm: 'text-xs px-2 py-0.5',
  md: 'text-xs px-2.5 py-1',
  lg: 'text-sm px-3 py-1.5',
};

export default function SeverityBadge({ level, size = 'md' }: Props) {
  const style = BADGE_STYLES[level] ?? BADGE_STYLES.Informational;

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-md font-semibold tracking-wide ${SIZE_CLASSES[size]}`}
      style={{
        background: style.bg,
        color: style.text,
        border: `1px solid ${style.border}`,
        fontFamily: 'Space Grotesk, sans-serif',
      }}
    >
      <span
        className="w-1.5 h-1.5 rounded-full flex-shrink-0"
        style={{ background: style.dot }}
      />
      {level}
    </span>
  );
}
