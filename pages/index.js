// pages/index.js
import Head from 'next/head';
import SgpaCalculator from '../components/SgpaCalculator';
import LoginButton from '../components/LoginButton';
import AttendanceChecker from '../components/AttendanceChecker';
import Resources from '../components/Resources';
import { useState, useEffect } from 'react';

const NAV_TABS = [
  {
    id: 'calculator',
    label: 'SGPA Calculator',
    shortLabel: 'Calc',
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 11h.01M12 11h.01M15 11h.01M4 19h16a2 2 0 002-2V7a2 2 0 00-2-2H4a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    ),
    color: 'cyan',
  },
  {
    id: 'attendance',
    label: 'Attendance',
    shortLabel: 'Attend',
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
      </svg>
    ),
    color: 'orange',
  },
  {
    id: 'resources',
    label: 'Resources',
    shortLabel: 'Res',
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
      </svg>
    ),
    color: 'purple',
  },
];

const TAB_ACCENT_COLORS = {
  cyan: '#22d3ee',
  orange: '#fb923c',
  purple: '#a78bfa',
};

const TAB_COLORS = {
  cyan: {
    active: 'bg-cyan-500/15 text-cyan-300 border-cyan-500/40 shadow-[0_0_16px_rgba(6,182,212,0.35)]',
    dot: 'bg-cyan-400',
    indicator: 'bg-cyan-400',
  },
  orange: {
    active: 'bg-orange-500/15 text-orange-300 border-orange-500/40 shadow-[0_0_16px_rgba(249,115,22,0.35)]',
    dot: 'bg-orange-400',
    indicator: 'bg-orange-400',
  },
  purple: {
    active: 'bg-purple-500/15 text-purple-300 border-purple-500/40 shadow-[0_0_16px_rgba(139,92,246,0.35)]',
    dot: 'bg-purple-400',
    indicator: 'bg-purple-400',
  },
};

// Animated floating orbs background
function FloatingOrbs() {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none" aria-hidden="true">
      {/* Large ambient blobs */}
      <div
        className="absolute w-[700px] h-[700px] rounded-full opacity-[0.12] blur-[100px]"
        style={{
          background: 'radial-gradient(circle, #06b6d4, #0891b2)',
          top: '-15%',
          left: '-10%',
          animation: 'orbFloat 20s ease-in-out infinite',
        }}
      />
      <div
        className="absolute w-[600px] h-[600px] rounded-full opacity-[0.10] blur-[100px]"
        style={{
          background: 'radial-gradient(circle, #f97316, #fb923c)',
          bottom: '-10%',
          right: '-8%',
          animation: 'orbFloat 25s ease-in-out infinite reverse',
        }}
      />
      <div
        className="absolute w-[500px] h-[500px] rounded-full opacity-[0.08] blur-[80px]"
        style={{
          background: 'radial-gradient(circle, #8b5cf6, #a78bfa)',
          top: '40%',
          left: '50%',
          transform: 'translateX(-50%)',
          animation: 'orbFloat 30s ease-in-out infinite 5s',
        }}
      />
      {/* Accent sparks */}
      <div
        className="absolute w-[200px] h-[200px] rounded-full opacity-[0.15] blur-[40px]"
        style={{
          background: 'radial-gradient(circle, #06b6d4, transparent)',
          top: '25%',
          right: '15%',
          animation: 'orbFloat 15s ease-in-out infinite 2s',
        }}
      />
      <div
        className="absolute w-[150px] h-[150px] rounded-full opacity-[0.12] blur-[30px]"
        style={{
          background: 'radial-gradient(circle, #f97316, transparent)',
          bottom: '30%',
          left: '10%',
          animation: 'orbFloat 18s ease-in-out infinite 7s reverse',
        }}
      />
    </div>
  );
}

export default function Home() {
  const [activeTab, setActiveTab] = useState('calculator');
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportForm, setReportForm] = useState({ title: '', description: '', email: '' });
  const [reportSubmitting, setReportSubmitting] = useState(false);
  const [reportSuccess, setReportSuccess] = useState(false);
  const [reportError, setReportError] = useState('');
  const [heroVisible, setHeroVisible] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setHeroVisible(true), 100);
    return () => clearTimeout(t);
  }, []);

  const handleReportSubmit = async (e) => {
    e.preventDefault();
    setReportSubmitting(true);
    setReportError('');

    try {
      const response = await fetch('/api/report-issue', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...reportForm, page: window.location.pathname }),
      });

      const data = await response.json();

      if (response.ok) {
        setReportSuccess(true);
        setReportForm({ title: '', description: '', email: '' });
        setTimeout(() => {
          setShowReportModal(false);
          setReportSuccess(false);
        }, 2000);
      } else {
        setReportError(data.error || 'Failed to submit issue');
      }
    } catch {
      setReportError('Failed to connect to server');
    } finally {
      setReportSubmitting(false);
    }
  };

  const activeTabData = NAV_TABS.find(t => t.id === activeTab);

  return (
    <div className="min-h-screen text-white relative overflow-x-hidden">
      <Head>
        <title>RVCE Grade & SGPA Calculator | 2025 Scheme</title>
        <meta name="description" content="An accurate RVCE grade and SGPA calculator for the 2025 scheme, based on the official syllabus document." />
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;700&display=swap" rel="stylesheet" />      </Head>

      <FloatingOrbs />

      {/* ── Sticky Header ── */}
      <header className="sticky top-0 z-40 w-full">
        <div
          className="border-b"
          style={{
            background: 'rgba(6, 8, 18, 0.85)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            borderColor: 'rgba(6, 182, 212, 0.15)',
            boxShadow: '0 1px 0 rgba(6,182,212,0.1), 0 4px 24px rgba(0,0,0,0.4)',
          }}
        >
          <div className="max-w-5xl mx-auto px-4 sm:px-6">
            <div className="flex items-center justify-between h-14 gap-4">

              {/* Brand */}
              <div className="flex items-center gap-2.5 flex-shrink-0">
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{
                    background: 'linear-gradient(135deg, #06b6d4 0%, #8b5cf6 50%, #f97316 100%)',
                    boxShadow: '0 0 14px rgba(6,182,212,0.5), 0 0 28px rgba(139,92,246,0.3)',
                  }}
                >
                  <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3z" />
                  </svg>
                </div>
                <div className="hidden sm:block">
                  <span className="font-bold text-sm terminal-text gradient-text-brand">
                    RVCE<span className="text-white/40">/</span>tools
                  </span>
                </div>
              </div>

              {/* Navigation tabs */}
              <nav className="flex items-center gap-1 flex-1 justify-center">
                {NAV_TABS.map((tab) => {
                  const isActive = activeTab === tab.id;
                  const colors = TAB_COLORS[tab.color];
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`relative flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 border ${
                        isActive
                          ? colors.active
                          : 'text-gray-500 border-transparent hover:text-gray-300 hover:bg-white/5'
                      }`}
                    >
                      {isActive && (
                        <span
                          className={`absolute top-0.5 left-0.5 w-1 h-1 rounded-full ${colors.dot}`}
                          style={{ boxShadow: `0 0 6px currentColor` }}
                        />
                      )}
                      {tab.icon}
                      <span className="hidden sm:inline">{tab.label}</span>
                      <span className="sm:hidden">{tab.shortLabel}</span>
                    </button>
                  );
                })}
              </nav>

              {/* Login */}
              <div className="flex-shrink-0">
                <LoginButton />
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* ── Hero (calculator tab only) ── */}
      {activeTab === 'calculator' && (
        <section
          className="relative z-10 pt-14 pb-8 px-4 sm:px-6 text-center"
          style={{
            opacity: heroVisible ? 1 : 0,
            transform: heroVisible ? 'translateY(0)' : 'translateY(24px)',
            transition: 'opacity 0.7s ease, transform 0.7s ease',
          }}
        >
          <div className="max-w-3xl mx-auto">
            {/* Status badge */}
            <div className="inline-flex items-center gap-2 mb-6">
              <div
                className="flex items-center gap-2 px-3 py-1.5 rounded-full terminal-text text-xs font-semibold"
                style={{
                  background: 'rgba(6,182,212,0.08)',
                  border: '1px solid rgba(6,182,212,0.3)',
                  color: '#67e8f9',
                  boxShadow: '0 0 12px rgba(6,182,212,0.15)',
                }}
              >
                <span
                  className="w-1.5 h-1.5 rounded-full bg-cyan-400 inline-block"
                  style={{ animation: 'blink 2s ease-in-out infinite', boxShadow: '0 0 6px #22d3ee' }}
                />
                <span className="opacity-60">$</span>
                <span>rvce@2025-scheme</span>
                <span className="opacity-50">~</span>
                <span className="opacity-70">first-year</span>
              </div>
            </div>

            {/* Main headline */}
            <h1 className="text-4xl sm:text-6xl font-black tracking-tight mb-4 leading-tight">
              <span className="block text-white">RVCE Grade &amp;</span>
              <span className="block mt-1 gradient-text-hero">SGPA Calculator</span>
            </h1>

            <p className="text-gray-400 text-base sm:text-lg max-w-xl mx-auto leading-relaxed">
              Blazing-fast grade calculator for the{' '}
              <span className="gradient-text-subtitle">2025 scheme</span>
              . Your data stays local — no server, no sign-in required.
            </p>

            {/* Feature pills */}
            <div className="flex flex-wrap items-center justify-center gap-2 mt-5">
              {[
                { icon: '⚡', text: 'Real-time calc', color: 'rgba(251,191,36,0.15)', border: 'rgba(251,191,36,0.35)', fg: '#fbbf24' },
                { icon: '🔒', text: 'Local storage', color: 'rgba(6,182,212,0.1)', border: 'rgba(6,182,212,0.3)', fg: '#67e8f9' },
                { icon: '📐', text: 'Official rubrics', color: 'rgba(139,92,246,0.1)', border: 'rgba(139,92,246,0.3)', fg: '#c4b5fd' },
              ].map((p) => (
                <span
                  key={p.text}
                  className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium terminal-text"
                  style={{ background: p.color, border: `1px solid ${p.border}`, color: p.fg }}
                >
                  <span>{p.icon}</span>
                  {p.text}
                </span>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── Breadcrumb for non-calculator tabs ── */}
      {activeTab !== 'calculator' && (
        <div className="relative z-10 pt-6 pb-3 px-4 sm:px-6 animate-fadeIn">
          <div className="max-w-5xl mx-auto">
            <div className="flex items-center gap-1.5 terminal-text text-xs text-gray-600 mb-1">
              <span
                className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                style={{ background: TAB_ACCENT_COLORS[activeTabData?.color] ?? '#22d3ee' }}
              />
              <button onClick={() => setActiveTab('calculator')} className="hover:text-gray-300 transition-colors">
                ~/calculator
              </button>
              <span className="text-gray-700">›</span>
              <span className="text-gray-300">{activeTabData?.label}</span>
            </div>
          </div>
        </div>
      )}

      {/* ── Main content ── */}
      <main className="relative z-10 pb-20 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto">
          {activeTab === 'calculator' && <SgpaCalculator />}
          {activeTab === 'attendance' && <AttendanceChecker />}
          {activeTab === 'resources' && <Resources />}
        </div>
      </main>

      {/* ── Footer ── */}
      <footer
        className="relative z-10 py-8 px-4 sm:px-6"
        style={{ borderTop: '1px solid rgba(6,182,212,0.1)' }}
      >
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            {/* Left: Terminal attribution */}
            <div className="flex items-center gap-2 terminal-text text-xs text-gray-600">
              <span className="text-cyan-700 select-none">$</span>
              <span>crafted for rvce students</span>
              <span className="text-gray-700 mx-1">·</span>
              <span>unofficial · educational use only</span>
            </div>

            {/* Right: Links */}
            <div className="flex items-center gap-4">
              <a
                href="https://github.com/shield44"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 terminal-text text-xs text-gray-500 hover:text-cyan-400 transition-all duration-200 hover:drop-shadow-[0_0_8px_rgba(6,182,212,0.6)]"
              >
                <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                  <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                </svg>
                @shield44
              </a>

              <button
                onClick={() => setShowReportModal(true)}
                className="flex items-center gap-1.5 terminal-text text-xs text-gray-500 hover:text-orange-400 transition-all duration-200 hover:drop-shadow-[0_0_8px_rgba(249,115,22,0.6)]"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                report issue
              </button>
            </div>
          </div>
        </div>
      </footer>

      {/* ── Report Issue Modal ── */}
      {showReportModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fadeIn"
          style={{ background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)' }}
          onClick={(e) => { if (e.target === e.currentTarget) { setShowReportModal(false); setReportError(''); } }}
        >
          <div
            className="neon-panel rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto animate-scaleIn"
            style={{ boxShadow: '0 0 40px rgba(6,182,212,0.2), 0 0 80px rgba(139,92,246,0.1)' }}
          >
            <div className="p-6">
              {/* Modal header */}
              <div className="flex justify-between items-center mb-5">
                <div>
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-cyan-700 text-xs terminal-text select-none">$</span>
                    <h2 className="text-sm font-bold gradient-text-cyan terminal-text">report-issue</h2>
                  </div>
                  <p className="text-xs text-gray-600 terminal-text">Submit a bug or feedback</p>
                </div>
                <button
                  onClick={() => { setShowReportModal(false); setReportError(''); setReportSuccess(false); }}
                  className="text-gray-500 hover:text-white transition-colors p-1.5 rounded-lg hover:bg-white/5"
                  aria-label="Close modal"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {reportSuccess ? (
                <div className="py-10 text-center animate-scaleIn">
                  <div
                    className="mb-4 inline-flex items-center justify-center w-14 h-14 rounded-xl"
                    style={{ background: 'rgba(6,182,212,0.12)', border: '1px solid rgba(6,182,212,0.3)' }}
                  >
                    <svg className="w-7 h-7 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <p className="text-white font-bold mb-1">Submitted!</p>
                  <p className="text-xs text-gray-500 terminal-text">Thanks for the feedback.</p>
                </div>
              ) : (
                <form onSubmit={handleReportSubmit} className="space-y-4">
                  {reportError && (
                    <div
                      className="p-3 rounded-xl text-red-300 text-xs terminal-text"
                      style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)' }}
                    >
                      {reportError}
                    </div>
                  )}

                  {[
                    { id: 'issueTitle', label: 'Issue Title', type: 'text', key: 'title', placeholder: 'Brief description', maxLength: 100, required: true },
                    { id: 'issueEmail', label: 'Email', type: 'email', key: 'email', placeholder: 'your.email@rvce.edu.in', required: false },
                  ].map((field) => (
                    <div key={field.id}>
                      <label htmlFor={field.id} className="block text-gray-400 text-xs font-semibold mb-1.5 terminal-text">
                        {field.label}{field.required && <span className="text-cyan-600 ml-1">*</span>}
                      </label>
                      <input
                        type={field.type}
                        id={field.id}
                        value={reportForm[field.key]}
                        onChange={(e) => setReportForm({ ...reportForm, [field.key]: e.target.value })}
                        className="w-full px-3 py-2.5 rounded-xl focus:outline-none focus:ring-1 focus:ring-cyan-500 text-white text-sm terminal-text transition-all placeholder-gray-700"
                        style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(6,182,212,0.15)' }}
                        placeholder={field.placeholder}
                        required={field.required}
                        maxLength={field.maxLength}
                      />
                    </div>
                  ))}

                  <div>
                    <label htmlFor="issueDescription" className="block text-gray-400 text-xs font-semibold mb-1.5 terminal-text">
                      Description<span className="text-cyan-600 ml-1">*</span>
                    </label>
                    <textarea
                      id="issueDescription"
                      value={reportForm.description}
                      onChange={(e) => setReportForm({ ...reportForm, description: e.target.value })}
                      className="w-full px-3 py-2.5 rounded-xl focus:outline-none focus:ring-1 focus:ring-cyan-500 text-white resize-none text-sm terminal-text transition-all placeholder-gray-700"
                      style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(6,182,212,0.15)' }}
                      placeholder="Describe the issue in detail..."
                      required
                      rows={4}
                      maxLength={1000}
                    />
                    <p className="text-xs text-gray-700 mt-1 terminal-text text-right">{reportForm.description.length}/1000</p>
                  </div>

                  <div className="flex gap-3 pt-1">
                    <button
                      type="button"
                      onClick={() => { setShowReportModal(false); setReportError(''); }}
                      className="flex-1 px-4 py-2.5 rounded-xl text-gray-400 hover:text-white font-semibold text-sm terminal-text transition-all hover:bg-white/5"
                      style={{ border: '1px solid rgba(255,255,255,0.08)' }}
                    >
                      cancel
                    </button>
                    <button
                      type="submit"
                      disabled={reportSubmitting}
                      className="flex-1 px-4 py-2.5 text-white font-bold rounded-xl transition-all disabled:opacity-50 text-sm terminal-text"
                      style={{
                        background: 'linear-gradient(135deg, #06b6d4, #8b5cf6)',
                        boxShadow: reportSubmitting ? 'none' : '0 0 20px rgba(6,182,212,0.4)',
                      }}
                    >
                      {reportSubmitting ? 'submitting…' : 'submit'}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

