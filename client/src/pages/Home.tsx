// SecureReview — Home Page
// Design: Dark Glassmorphism hero with electric blue accents, feature grid below
// Background: Generated hero image with circuit board patterns

import { Link } from 'wouter';
import { Shield, Zap, Tag, AlertTriangle, Wrench, Code2, ChevronRight, CheckCircle2 } from 'lucide-react';

const HERO_BG = 'https://d2xsxph8kpxj0f.cloudfront.net/310519663527816774/kJYCLUr3ixsCpqUEyBYyjk/hero-bg-XHtqZvGiusj2HSJDvvkvcu.webp';
const SHIELD_ICON = 'https://d2xsxph8kpxj0f.cloudfront.net/310519663527816774/kJYCLUr3ixsCpqUEyBYyjk/shield-icon-8VnCZAWpzprgjiExSSBQM5.webp';

const FEATURES = [
  {
    icon: Tag,
    title: 'CWE Classification',
    description: 'Every vulnerability is mapped to its official CWE identifier for standardized reporting and tracking.',
    color: '#58a6ff',
  },
  {
    icon: AlertTriangle,
    title: 'Severity Ratings',
    description: 'Findings are ranked Critical, High, Medium, Low, or Informational so you can prioritize fixes.',
    color: '#fb923c',
  },
  {
    icon: Wrench,
    title: 'Remediation Advice',
    description: 'Each finding comes with actionable remediation guidance to help you fix vulnerabilities fast.',
    color: '#4ade80',
  },
  {
    icon: Zap,
    title: 'Instant AI Analysis',
    description: 'Powered by Google Gemini 2.0 Flash — get comprehensive security analysis in seconds.',
    color: '#facc15',
  },
  {
    icon: Code2,
    title: 'Multi-Language Support',
    description: 'Analyze Python, JavaScript, C/C++, Java, SQL, Bash, and more with automatic language detection.',
    color: '#c084fc',
  },
  {
    icon: Shield,
    title: 'Session History',
    description: 'All scans are tracked in your session so you can review and compare past audit results.',
    color: '#38bdf8',
  },
];

const VULNERABILITY_TYPES = [
  'SQL Injection',
  'Command Injection',
  'Hardcoded Secrets',
  'Path Traversal',
  'Insecure Crypto',
  'Broken Auth',
  'Buffer Overflows',
  'Deserialization',
];

export default function Home() {
  return (
    <div className="min-h-screen" style={{ background: '#090b11' }}>
      {/* Hero Section */}
      <section
        className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16"
        style={{
          backgroundImage: `url(${HERO_BG})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center top',
        }}
      >
        {/* Dark overlay */}
        <div
          className="absolute inset-0"
          style={{
            background: 'linear-gradient(to bottom, rgba(9,11,17,0.6) 0%, rgba(9,11,17,0.4) 40%, rgba(9,11,17,0.9) 85%, rgba(9,11,17,1) 100%)',
          }}
        />

        {/* Content */}
        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 text-center">
          {/* Badge */}
          <div
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold mb-8 animate-fade-in"
            style={{
              background: 'rgba(88, 166, 255, 0.1)',
              border: '1px solid rgba(88, 166, 255, 0.3)',
              color: '#58a6ff',
              fontFamily: 'Space Grotesk, sans-serif',
            }}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
            Powered by Google Gemini 2.0 Flash
          </div>

          {/* Shield icon */}
          <div className="flex justify-center mb-6 animate-slide-in-up delay-100">
            <img
              src={SHIELD_ICON}
              alt="SecureReview Shield"
              className="w-20 h-20 object-contain"
              style={{ filter: 'drop-shadow(0 0 20px rgba(88, 166, 255, 0.5))' }}
            />
          </div>

          {/* Headline */}
          <h1
            className="text-5xl sm:text-6xl lg:text-7xl font-bold mb-6 animate-slide-in-up delay-200"
            style={{
              fontFamily: 'Space Grotesk, sans-serif',
              color: '#f1f5f9',
              lineHeight: 1.1,
            }}
          >
            Secure<span style={{ color: '#58a6ff' }}>Review</span>
          </h1>

          <p
            className="text-xl sm:text-2xl font-medium mb-4 animate-slide-in-up delay-300"
            style={{ color: '#94a3b8', fontFamily: 'Space Grotesk, sans-serif' }}
          >
            AI-Powered Secure Code Auditor
          </p>

          <p
            className="text-base sm:text-lg max-w-2xl mx-auto mb-10 leading-relaxed animate-slide-in-up delay-400"
            style={{ color: '#64748b', fontFamily: 'Inter, sans-serif' }}
          >
            Paste your code and let Gemini AI identify vulnerabilities, classify CWEs,
            assign severity ratings, and provide actionable remediation advice — all in seconds.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-slide-in-up delay-500">
            <Link
              href="/audit"
              className="group flex items-center gap-2 px-8 py-4 rounded-xl text-base font-bold transition-all duration-300"
              style={{
                background: 'linear-gradient(135deg, #1d4ed8, #2563eb)',
                color: '#fff',
                border: '1px solid rgba(88, 166, 255, 0.4)',
                boxShadow: '0 0 30px rgba(88, 166, 255, 0.25)',
                fontFamily: 'Space Grotesk, sans-serif',
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLElement).style.boxShadow = '0 0 50px rgba(88, 166, 255, 0.45)';
                (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLElement).style.boxShadow = '0 0 30px rgba(88, 166, 255, 0.25)';
                (e.currentTarget as HTMLElement).style.transform = 'translateY(0)';
              }}
            >
              Start Auditing
              <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              href="/about"
              className="flex items-center gap-2 px-8 py-4 rounded-xl text-base font-semibold transition-all duration-200"
              style={{
                background: 'rgba(255, 255, 255, 0.05)',
                color: '#94a3b8',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                fontFamily: 'Space Grotesk, sans-serif',
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLElement).style.background = 'rgba(255, 255, 255, 0.08)';
                (e.currentTarget as HTMLElement).style.color = '#e2e8f0';
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLElement).style.background = 'rgba(255, 255, 255, 0.05)';
                (e.currentTarget as HTMLElement).style.color = '#94a3b8';
              }}
            >
              Learn More
            </Link>
          </div>

          {/* Vulnerability types pills */}
          <div className="flex flex-wrap justify-center gap-2 mt-12 animate-fade-in" style={{ animationDelay: '0.6s', opacity: 0 }}>
            {VULNERABILITY_TYPES.map(type => (
              <span
                key={type}
                className="text-xs px-3 py-1 rounded-full"
                style={{
                  background: 'rgba(255, 255, 255, 0.04)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  color: '#64748b',
                  fontFamily: 'Inter, sans-serif',
                }}
              >
                {type}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 px-4 sm:px-6" style={{ background: '#090b11' }}>
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <p
              className="text-xs font-semibold tracking-widest uppercase mb-3"
              style={{ color: '#58a6ff', fontFamily: 'Space Grotesk, sans-serif' }}
            >
              Capabilities
            </p>
            <h2
              className="text-3xl sm:text-4xl font-bold mb-4"
              style={{ color: '#f1f5f9', fontFamily: 'Space Grotesk, sans-serif' }}
            >
              Everything you need to audit code
            </h2>
            <p className="text-base max-w-xl mx-auto" style={{ color: '#64748b', fontFamily: 'Inter, sans-serif' }}>
              SecureReview combines the power of Gemini AI with security best practices
              to deliver comprehensive vulnerability analysis.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {FEATURES.map(({ icon: Icon, title, description, color }) => (
              <div
                key={title}
                className="group p-6 rounded-2xl transition-all duration-300"
                style={{
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid rgba(255, 255, 255, 0.07)',
                }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLElement).style.background = 'rgba(255, 255, 255, 0.05)';
                  (e.currentTarget as HTMLElement).style.borderColor = 'rgba(88, 166, 255, 0.2)';
                  (e.currentTarget as HTMLElement).style.transform = 'translateY(-3px)';
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLElement).style.background = 'rgba(255, 255, 255, 0.03)';
                  (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255, 255, 255, 0.07)';
                  (e.currentTarget as HTMLElement).style.transform = 'translateY(0)';
                }}
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center mb-4"
                  style={{
                    background: `${color}18`,
                    border: `1px solid ${color}30`,
                  }}
                >
                  <Icon className="w-5 h-5" style={{ color }} />
                </div>
                <h3
                  className="text-base font-bold mb-2"
                  style={{ color: '#e2e8f0', fontFamily: 'Space Grotesk, sans-serif' }}
                >
                  {title}
                </h3>
                <p className="text-sm leading-relaxed" style={{ color: '#64748b', fontFamily: 'Inter, sans-serif' }}>
                  {description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section
        className="py-24 px-4 sm:px-6"
        style={{
          background: 'rgba(255, 255, 255, 0.015)',
          borderTop: '1px solid rgba(255, 255, 255, 0.06)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
        }}
      >
        <div className="max-w-4xl mx-auto text-center">
          <p
            className="text-xs font-semibold tracking-widest uppercase mb-3"
            style={{ color: '#58a6ff', fontFamily: 'Space Grotesk, sans-serif' }}
          >
            How It Works
          </p>
          <h2
            className="text-3xl sm:text-4xl font-bold mb-12"
            style={{ color: '#f1f5f9', fontFamily: 'Space Grotesk, sans-serif' }}
          >
            Three steps to secure code
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { step: '01', title: 'Paste your code', desc: 'Select the language and paste the code you want to audit into the editor.' },
              { step: '02', title: 'AI analyzes it', desc: 'Gemini 2.0 Flash scans for injection flaws, hardcoded secrets, insecure crypto, and more.' },
              { step: '03', title: 'Review findings', desc: 'Get a full report with CWE IDs, severity ratings, and step-by-step remediation advice.' },
            ].map(({ step, title, desc }) => (
              <div key={step} className="relative">
                <div
                  className="text-5xl font-black mb-4 leading-none"
                  style={{
                    fontFamily: 'Space Grotesk, sans-serif',
                    color: 'rgba(88, 166, 255, 0.15)',
                  }}
                >
                  {step}
                </div>
                <h3
                  className="text-lg font-bold mb-2"
                  style={{ color: '#e2e8f0', fontFamily: 'Space Grotesk, sans-serif' }}
                >
                  {title}
                </h3>
                <p className="text-sm leading-relaxed" style={{ color: '#64748b', fontFamily: 'Inter, sans-serif' }}>
                  {desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-4 sm:px-6" style={{ background: '#090b11' }}>
        <div className="max-w-2xl mx-auto text-center">
          <div
            className="p-10 rounded-3xl"
            style={{
              background: 'rgba(88, 166, 255, 0.05)',
              border: '1px solid rgba(88, 166, 255, 0.2)',
              boxShadow: '0 0 60px rgba(88, 166, 255, 0.08)',
            }}
          >
            <Shield className="w-12 h-12 mx-auto mb-6" style={{ color: '#58a6ff' }} />
            <h2
              className="text-3xl font-bold mb-4"
              style={{ color: '#f1f5f9', fontFamily: 'Space Grotesk, sans-serif' }}
            >
              Ready to audit your code?
            </h2>
            <p className="text-base mb-8" style={{ color: '#64748b', fontFamily: 'Inter, sans-serif' }}>
              No API key needed — just paste your code and let the AI do the work.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-6">
              {['Free to use', 'No data stored', 'Instant results'].map(item => (
                <div key={item} className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" style={{ color: '#4ade80' }} />
                  <span className="text-sm" style={{ color: '#94a3b8', fontFamily: 'Inter, sans-serif' }}>{item}</span>
                </div>
              ))}
            </div>
            <Link
              href="/audit"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-xl text-base font-bold transition-all duration-300"
              style={{
                background: 'linear-gradient(135deg, #1d4ed8, #2563eb)',
                color: '#fff',
                border: '1px solid rgba(88, 166, 255, 0.4)',
                boxShadow: '0 0 30px rgba(88, 166, 255, 0.25)',
                fontFamily: 'Space Grotesk, sans-serif',
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLElement).style.boxShadow = '0 0 50px rgba(88, 166, 255, 0.45)';
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLElement).style.boxShadow = '0 0 30px rgba(88, 166, 255, 0.25)';
              }}
            >
              Start Auditing Now
              <ChevronRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer
        className="py-8 px-4 text-center"
        style={{
          borderTop: '1px solid rgba(255, 255, 255, 0.06)',
          color: '#475569',
          fontFamily: 'Inter, sans-serif',
          fontSize: '0.8rem',
        }}
      >
        <p>SecureReview — AI-Powered Secure Code Auditor. Built with Google Gemini 2.0 Flash.</p>
      </footer>
    </div>
  );
}
