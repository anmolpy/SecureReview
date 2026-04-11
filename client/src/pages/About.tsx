// SecureReview — About Page
// Design: Dark Glassmorphism — informational layout with CWE table and how-it-works section

import { Info, Shield, Cpu, Database, Key, FileCode, Lock, AlertTriangle, Layers } from 'lucide-react';

const CWE_LIST = [
  { id: 'CWE-89', name: 'SQL Injection', severity: 'Critical', description: 'Improper neutralization of special elements used in SQL commands.' },
  { id: 'CWE-78', name: 'OS Command Injection', severity: 'Critical', description: 'Improper neutralization of special elements used in an OS command.' },
  { id: 'CWE-798', name: 'Hardcoded Credentials', severity: 'High', description: 'Use of hard-coded credentials such as passwords or API keys.' },
  { id: 'CWE-22', name: 'Path Traversal', severity: 'High', description: 'Improper limitation of a pathname to a restricted directory.' },
  { id: 'CWE-327', name: 'Insecure Cryptographic Algorithm', severity: 'High', description: 'Use of a broken or risky cryptographic algorithm (e.g., MD5, SHA1).' },
  { id: 'CWE-502', name: 'Insecure Deserialization', severity: 'High', description: 'Deserialization of untrusted data without validation.' },
  { id: 'CWE-287', name: 'Improper Authentication', severity: 'High', description: 'Broken or missing authentication mechanisms.' },
  { id: 'CWE-120', name: 'Buffer Overflow', severity: 'Critical', description: 'Classic buffer overflow — writing beyond allocated buffer boundaries.' },
  { id: 'CWE-311', name: 'Missing Encryption', severity: 'Medium', description: 'Sensitive data transmitted or stored without encryption.' },
  { id: 'CWE-330', name: 'Insufficient Randomness', severity: 'Medium', description: 'Use of insufficiently random values for security-sensitive operations.' },
  { id: 'CWE-20', name: 'Improper Input Validation', severity: 'Medium', description: 'Failure to properly validate input before processing.' },
  { id: 'CWE-200', name: 'Information Exposure', severity: 'Low', description: 'Exposure of sensitive information to an unauthorized actor.' },
];

const SEVERITY_COLORS: Record<string, { text: string; bg: string; border: string }> = {
  Critical: { text: '#f87171', bg: 'rgba(239, 68, 68, 0.1)', border: 'rgba(239, 68, 68, 0.25)' },
  High: { text: '#fb923c', bg: 'rgba(249, 115, 22, 0.1)', border: 'rgba(249, 115, 22, 0.25)' },
  Medium: { text: '#facc15', bg: 'rgba(234, 179, 8, 0.1)', border: 'rgba(234, 179, 8, 0.25)' },
  Low: { text: '#60a5fa', bg: 'rgba(59, 130, 246, 0.1)', border: 'rgba(59, 130, 246, 0.25)' },
};

const HOW_IT_WORKS = [
  {
    icon: Key,
    title: 'API Key Authentication',
    description: 'You provide your own Google Gemini API key. It is stored only in your browser session memory and never transmitted to any third-party server.',
    color: '#58a6ff',
  },
  {
    icon: FileCode,
    title: 'Code Submission',
    description: 'Your code is sent directly from your browser to the Gemini API endpoint with a carefully crafted security audit prompt.',
    color: '#c084fc',
  },
  {
    icon: Cpu,
    title: 'AI Analysis',
    description: 'Gemini 2.0 Flash analyzes the code for common vulnerability patterns, focusing on OWASP Top 10 and CWE-listed weaknesses.',
    color: '#4ade80',
  },
  {
    icon: Database,
    title: 'Structured Response',
    description: 'The AI returns a structured JSON object with findings sorted by severity, each containing a CWE ID, description, and remediation advice.',
    color: '#fb923c',
  },
];

export default function About() {
  return (
    <div className="min-h-screen pt-16" style={{ background: '#090b11' }}>
      {/* Page header */}
      <div
        className="px-4 sm:px-6 py-6"
        style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.06)' }}
      >
        <div className="max-w-4xl mx-auto flex items-center gap-3">
          <div
            className="w-9 h-9 rounded-lg flex items-center justify-center"
            style={{
              background: 'rgba(88, 166, 255, 0.1)',
              border: '1px solid rgba(88, 166, 255, 0.25)',
            }}
          >
            <Info className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <h1
              className="text-lg font-bold"
              style={{ color: '#e2e8f0', fontFamily: 'Space Grotesk, sans-serif' }}
            >
              About SecureReview
            </h1>
            <p className="text-xs" style={{ color: '#475569', fontFamily: 'Inter, sans-serif' }}>
              How it works, what it checks, and the CWEs it covers
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 space-y-12">

        {/* What is SecureReview */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <Shield className="w-5 h-5 text-blue-400" />
            <h2
              className="text-xl font-bold"
              style={{ color: '#e2e8f0', fontFamily: 'Space Grotesk, sans-serif' }}
            >
              What is SecureReview?
            </h2>
          </div>
          <div
            className="rounded-2xl p-6"
            style={{
              background: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid rgba(255, 255, 255, 0.07)',
            }}
          >
            <p className="text-sm leading-relaxed mb-4" style={{ color: '#94a3b8', fontFamily: 'Inter, sans-serif' }}>
              <strong style={{ color: '#e2e8f0' }}>SecureReview</strong> is an AI-powered secure code auditor built on Google Gemini 2.0 Flash.
              It allows developers and security engineers to quickly scan code snippets for common security vulnerabilities
              without setting up complex SAST tooling.
            </p>
            <p className="text-sm leading-relaxed mb-4" style={{ color: '#94a3b8', fontFamily: 'Inter, sans-serif' }}>
              The tool runs entirely in your browser — your code is sent directly to the Gemini API using your own API key.
              No data is stored on any server, and your API key is kept only in your browser's session memory.
            </p>
            <p className="text-sm leading-relaxed" style={{ color: '#94a3b8', fontFamily: 'Inter, sans-serif' }}>
              SecureReview supports Python, JavaScript, C/C++, Java, SQL, Bash, and more with automatic language detection.
              It classifies findings by CWE ID, assigns severity ratings, and provides actionable remediation advice.
            </p>
          </div>
        </section>

        {/* How it works */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <Layers className="w-5 h-5 text-blue-400" />
            <h2
              className="text-xl font-bold"
              style={{ color: '#e2e8f0', fontFamily: 'Space Grotesk, sans-serif' }}
            >
              How It Works
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {HOW_IT_WORKS.map(({ icon: Icon, title, description, color }) => (
              <div
                key={title}
                className="rounded-xl p-5"
                style={{
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid rgba(255, 255, 255, 0.07)',
                }}
              >
                <div
                  className="w-9 h-9 rounded-lg flex items-center justify-center mb-3"
                  style={{
                    background: `${color}15`,
                    border: `1px solid ${color}30`,
                  }}
                >
                  <Icon className="w-4.5 h-4.5" style={{ color, width: '1.1rem', height: '1.1rem' }} />
                </div>
                <h3
                  className="text-sm font-bold mb-2"
                  style={{ color: '#e2e8f0', fontFamily: 'Space Grotesk, sans-serif' }}
                >
                  {title}
                </h3>
                <p className="text-xs leading-relaxed" style={{ color: '#64748b', fontFamily: 'Inter, sans-serif' }}>
                  {description}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Privacy note */}
        <section>
          <div
            className="rounded-xl p-5 flex items-start gap-4"
            style={{
              background: 'rgba(88, 166, 255, 0.05)',
              border: '1px solid rgba(88, 166, 255, 0.15)',
            }}
          >
            <Lock className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
            <div>
              <h3
                className="text-sm font-bold mb-1"
                style={{ color: '#58a6ff', fontFamily: 'Space Grotesk, sans-serif' }}
              >
                Privacy & Security
              </h3>
              <p className="text-sm leading-relaxed" style={{ color: '#64748b', fontFamily: 'Inter, sans-serif' }}>
                Your code and API key are never stored on any server. All processing happens directly between
                your browser and the Google Gemini API. Scan history is kept only in your browser's session
                memory and is cleared when you close the tab.
              </p>
            </div>
          </div>
        </section>

        {/* CWE Coverage Table */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle className="w-5 h-5 text-blue-400" />
            <h2
              className="text-xl font-bold"
              style={{ color: '#e2e8f0', fontFamily: 'Space Grotesk, sans-serif' }}
            >
              CWE Coverage
            </h2>
          </div>
          <p className="text-sm mb-5" style={{ color: '#64748b', fontFamily: 'Inter, sans-serif' }}>
            SecureReview focuses on the following Common Weakness Enumerations (CWEs), covering the most impactful
            vulnerability classes in modern software:
          </p>
          <div className="space-y-2">
            {CWE_LIST.map(({ id, name, severity, description }) => {
              const colors = SEVERITY_COLORS[severity] ?? SEVERITY_COLORS.Low;
              return (
                <div
                  key={id}
                  className="rounded-xl px-4 py-3 flex items-start gap-4 transition-all duration-200"
                  style={{
                    background: 'rgba(255, 255, 255, 0.02)',
                    border: '1px solid rgba(255, 255, 255, 0.06)',
                  }}
                  onMouseEnter={e => {
                    (e.currentTarget as HTMLElement).style.background = 'rgba(255, 255, 255, 0.04)';
                  }}
                  onMouseLeave={e => {
                    (e.currentTarget as HTMLElement).style.background = 'rgba(255, 255, 255, 0.02)';
                  }}
                >
                  <span
                    className="text-xs font-mono font-bold flex-shrink-0 px-2 py-0.5 rounded mt-0.5"
                    style={{
                      background: 'rgba(88, 166, 255, 0.1)',
                      color: '#58a6ff',
                      border: '1px solid rgba(88, 166, 255, 0.2)',
                    }}
                  >
                    {id}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span
                        className="text-sm font-semibold"
                        style={{ color: '#e2e8f0', fontFamily: 'Space Grotesk, sans-serif' }}
                      >
                        {name}
                      </span>
                      <span
                        className="text-xs px-2 py-0.5 rounded-md font-semibold"
                        style={{
                          background: colors.bg,
                          color: colors.text,
                          border: `1px solid ${colors.border}`,
                        }}
                      >
                        {severity}
                      </span>
                    </div>
                    <p className="text-xs" style={{ color: '#475569', fontFamily: 'Inter, sans-serif' }}>
                      {description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Disclaimer */}
        <section>
          <div
            className="rounded-xl p-5"
            style={{
              background: 'rgba(234, 179, 8, 0.05)',
              border: '1px solid rgba(234, 179, 8, 0.15)',
            }}
          >
            <p
              className="text-xs font-semibold uppercase tracking-wider mb-2"
              style={{ color: '#facc15', fontFamily: 'Space Grotesk, sans-serif' }}
            >
              Disclaimer
            </p>
            <p className="text-sm leading-relaxed" style={{ color: '#64748b', fontFamily: 'Inter, sans-serif' }}>
              SecureReview is an AI-assisted tool and may produce false positives or miss certain vulnerabilities.
              It is intended as a first-pass review aid and should not replace a thorough manual security audit
              or dedicated SAST/DAST tooling for production code.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
