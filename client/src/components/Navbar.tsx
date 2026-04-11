// SecureReview — Navbar Component
// Design: Dark Glassmorphism — frosted glass top bar with electric blue accents

import { Link, useLocation } from 'wouter';
import { Shield, Code2, History, Info, Menu, X } from 'lucide-react';
import { useState } from 'react';

const NAV_LINKS = [
  { href: '/', label: 'Home', icon: Shield },
  { href: '/audit', label: 'Audit', icon: Code2 },
  { href: '/history', label: 'History', icon: History },
  { href: '/about', label: 'About', icon: Info },
];

export default function Navbar() {
  const [location] = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50"
      style={{
        background: 'rgba(9, 11, 17, 0.85)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(88, 166, 255, 0.12)',
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{
                background: 'linear-gradient(135deg, rgba(88, 166, 255, 0.3), rgba(88, 166, 255, 0.1))',
                border: '1px solid rgba(88, 166, 255, 0.4)',
                boxShadow: '0 0 12px rgba(88, 166, 255, 0.2)',
              }}
            >
              <Shield className="w-4 h-4 text-blue-400" />
            </div>
            <span
              className="text-lg font-bold tracking-tight"
              style={{ fontFamily: 'Space Grotesk, sans-serif', color: '#e2e8f0' }}
            >
              Secure<span style={{ color: '#58a6ff' }}>Review</span>
            </span>
          </Link>

          {/* Desktop nav links */}
          <div className="hidden md:flex items-center gap-1">
            {NAV_LINKS.map(({ href, label }) => {
              const isActive = location === href;
              return (
                <Link
                  key={href}
                  href={href}
                  className="relative px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200"
                  style={{
                    color: isActive ? '#58a6ff' : '#94a3b8',
                    background: isActive ? 'rgba(88, 166, 255, 0.1)' : 'transparent',
                    fontFamily: 'Inter, sans-serif',
                  }}
                  onMouseEnter={e => {
                    if (!isActive) {
                      (e.currentTarget as HTMLElement).style.color = '#e2e8f0';
                      (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.05)';
                    }
                  }}
                  onMouseLeave={e => {
                    if (!isActive) {
                      (e.currentTarget as HTMLElement).style.color = '#94a3b8';
                      (e.currentTarget as HTMLElement).style.background = 'transparent';
                    }
                  }}
                >
                  {isActive && (
                    <span
                      className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4 h-0.5 rounded-full"
                      style={{ background: '#58a6ff' }}
                    />
                  )}
                  {label}
                </Link>
              );
            })}
          </div>

          {/* CTA button */}
          <div className="hidden md:flex items-center gap-3">
            <Link
              href="/audit"
              className="px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200"
              style={{
                background: 'linear-gradient(135deg, #1d4ed8, #2563eb)',
                color: '#fff',
                border: '1px solid rgba(88, 166, 255, 0.3)',
                boxShadow: '0 0 16px rgba(88, 166, 255, 0.2)',
                fontFamily: 'Space Grotesk, sans-serif',
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLElement).style.boxShadow = '0 0 24px rgba(88, 166, 255, 0.4)';
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLElement).style.boxShadow = '0 0 16px rgba(88, 166, 255, 0.2)';
              }}
            >
              Start Auditing
            </Link>
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden p-2 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-white/5 transition-colors"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div
          className="md:hidden border-t"
          style={{
            borderColor: 'rgba(88, 166, 255, 0.12)',
            background: 'rgba(9, 11, 17, 0.95)',
          }}
        >
          <div className="px-4 py-3 space-y-1">
            {NAV_LINKS.map(({ href, label, icon: Icon }) => {
              const isActive = location === href;
              return (
                <Link
                  key={href}
                  href={href}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors"
                  style={{
                    color: isActive ? '#58a6ff' : '#94a3b8',
                    background: isActive ? 'rgba(88, 166, 255, 0.1)' : 'transparent',
                  }}
                  onClick={() => setMobileOpen(false)}
                >
                  <Icon className="w-4 h-4" />
                  {label}
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </nav>
  );
}
