// pages/index.js
import Head from 'next/head';
import SgpaCalculator from '../components/SgpaCalculator';
import LoginButton from '../components/LoginButton';
import { useState } from 'react';

export default function Home() {
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportForm, setReportForm] = useState({ title: '', description: '', email: '' });
  const [reportSubmitting, setReportSubmitting] = useState(false);
  const [reportSuccess, setReportSuccess] = useState(false);
  const [reportError, setReportError] = useState('');

  const handleReportSubmit = async (e) => {
    e.preventDefault();
    setReportSubmitting(true);
    setReportError('');

    try {
      const response = await fetch('/api/report-issue', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...reportForm,
          page: window.location.pathname
        }),
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
    } catch (err) {
      setReportError('Failed to connect to server');
    } finally {
      setReportSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen text-white relative overflow-hidden">
      <Head>
        <title>RVCE Grade & SGPA Calculator | 2025 Scheme</title>
        <meta name="description" content="An accurate RVCE grade and SGPA calculator for the 2025 scheme, based on the official syllabus document." />
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
      </Head>

      {/* Animated background elements with unique geometric shapes */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        {/* Floating geometric shapes */}
        <div className="absolute top-20 left-10 w-64 h-64 opacity-10 animate-float">
          <div className="hexagon w-full h-full bg-gradient-to-br from-emerald-400 to-teal-500 animate-morphBlob"></div>
        </div>
        <div className="absolute bottom-20 right-10 w-80 h-80 opacity-10 animate-float" style={{animationDelay: '3s'}}>
          <div className="hexagon w-full h-full bg-gradient-to-br from-amber-400 to-orange-500 animate-morphBlob" style={{animationDelay: '2s'}}></div>
        </div>
        <div className="absolute top-1/2 left-1/3 w-48 h-48 opacity-5 animate-float" style={{animationDelay: '5s'}}>
          <div className="parallelogram w-full h-full bg-gradient-to-br from-teal-400 to-emerald-500"></div>
        </div>
        
        {/* Radial gradients for depth */}
        <div className="absolute top-0 left-0 w-96 h-96 bg-emerald-500 rounded-full mix-blend-screen filter blur-[100px] opacity-10 animate-float"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-amber-500 rounded-full mix-blend-screen filter blur-[100px] opacity-10 animate-float" style={{animationDelay: '4s'}}></div>
      </div>

      {/* Header */}
      <header className="relative z-10 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Login Button - Fixed positioning for better visibility */}
          <div className="flex justify-end mb-8">
            <LoginButton />
          </div>
          
          <div className="text-center space-y-6 animate-fadeIn">
            {/* Badge with neumorphic style */}
            <div className="inline-block mb-4">
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full blur-md opacity-50 group-hover:opacity-75 transition-opacity"></div>
                <span className="relative px-6 py-3 rounded-full glass-effect text-sm font-bold text-emerald-300 inline-flex items-center gap-2">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  2025 Scheme (First Year)
                </span>
              </div>
            </div>
            
            {/* Main title with unique styling */}
            <div className="relative">
              <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black tracking-tight leading-tight">
                <span className="block gradient-text-cyan drop-shadow-[0_0_30px_rgba(16,185,129,0.4)]">
                  RVCE Grade &
                </span>
                <span className="block gradient-text-orange mt-2 drop-shadow-[0_0_30px_rgba(249,115,22,0.4)]">
                  SGPA Calculator
                </span>
              </h1>
              
              {/* Decorative lines */}
              <div className="flex items-center justify-center gap-4 mt-6">
                <div className="w-12 h-1 bg-gradient-to-r from-transparent to-emerald-400 rounded-full"></div>
                <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
                <div className="w-24 h-1 bg-gradient-to-r from-emerald-400 via-teal-400 to-amber-400 rounded-full"></div>
                <div className="w-2 h-2 bg-amber-400 rounded-full animate-pulse" style={{animationDelay: '0.5s'}}></div>
                <div className="w-12 h-1 bg-gradient-to-r from-amber-400 to-transparent rounded-full"></div>
              </div>
            </div>
            
            <p className="text-lg sm:text-xl text-gray-400 max-w-2xl mx-auto mt-8 leading-relaxed">
              Calculate your grades and SGPA with precision. Built for RVCE students.
            </p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <SgpaCalculator />
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 py-12 px-4 sm:px-6 lg:px-8 mt-20">
        <div className="max-w-7xl mx-auto">
          <div className="neumorphic rounded-3xl p-8">
            {/* Decorative top border */}
            <div className="flex justify-center mb-8">
              <div className="h-1 w-32 bg-gradient-to-r from-transparent via-emerald-400 to-transparent rounded-full"></div>
            </div>
            
            <p className="text-center text-gray-400 text-sm mb-6">
              Made for RVCE Students | An unofficial tool for educational purposes
            </p>
            
            <div className="flex items-center justify-center gap-8 flex-wrap">
              <a 
                href="https://github.com/shield44" 
                target="_blank" 
                rel="noopener noreferrer"
                className="group flex items-center gap-2 text-gray-400 hover:text-emerald-400 transition-all duration-300 transform hover:scale-105"
              >
                <div className="p-2 rounded-lg glass-effect group-hover:shadow-[0_0_20px_rgba(16,185,129,0.3)] transition-all duration-300">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                  </svg>
                </div>
                <span className="text-sm font-semibold">@shield44</span>
              </a>
              
              <a 
                href="https://github.com/shield44-project" 
                target="_blank" 
                rel="noopener noreferrer"
                className="group flex items-center gap-2 text-gray-400 hover:text-amber-400 transition-all duration-300 transform hover:scale-105"
              >
                <div className="p-2 rounded-lg glass-effect group-hover:shadow-[0_0_20px_rgba(251,146,60,0.3)] transition-all duration-300">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                  </svg>
                </div>
                <span className="text-sm font-semibold">@shield44-project</span>
              </a>
            </div>
            
            {/* Report Issues Button */}
            <div className="flex justify-center mt-8">
              <button
                onClick={() => setShowReportModal(true)}
                className="group relative overflow-hidden glass-effect px-6 py-3 rounded-xl transition-all duration-300 transform hover:scale-105"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/20 to-amber-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative flex items-center gap-2 text-gray-300 group-hover:text-white">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  <span className="font-semibold">Report an Issue</span>
                </div>
              </button>
            </div>
          </div>
        </div>
      </footer>

      {/* Report Issue Modal */}
      {showReportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div className="neumorphic rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto animate-scaleIn">
            <div className="p-8">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold gradient-text-cyan">Report an Issue</h2>
                <button
                  onClick={() => {
                    setShowReportModal(false);
                    setReportError('');
                    setReportSuccess(false);
                  }}
                  className="text-gray-400 hover:text-emerald-400 transition-colors p-2 rounded-lg glass-effect"
                  aria-label="Close modal"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {reportSuccess ? (
                <div className="py-12 text-center animate-scaleIn">
                  <div className="mb-6 inline-flex items-center justify-center w-20 h-20 rounded-full glass-effect">
                    <svg className="w-10 h-10 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <p className="text-emerald-400 text-xl font-bold mb-2">Issue reported successfully!</p>
                  <p className="text-gray-400">Thank you for your feedback.</p>
                </div>
              ) : (
                <form onSubmit={handleReportSubmit}>
                  {reportError && (
                    <div className="mb-4 p-4 glass-effect border border-red-500/30 rounded-xl">
                      <p className="text-red-400 text-sm">{reportError}</p>
                    </div>
                  )}

                  <div className="mb-6">
                    <label htmlFor="issueTitle" className="block text-gray-300 text-sm font-semibold mb-2">
                      Issue Title <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      id="issueTitle"
                      value={reportForm.title}
                      onChange={(e) => setReportForm({ ...reportForm, title: e.target.value })}
                      className="w-full px-4 py-3 neumorphic-inset rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500 text-white transition-all"
                      placeholder="Brief description of the issue"
                      required
                      maxLength={100}
                    />
                  </div>

                  <div className="mb-6">
                    <label htmlFor="issueDescription" className="block text-gray-300 text-sm font-semibold mb-2">
                      Description <span className="text-red-400">*</span>
                    </label>
                    <textarea
                      id="issueDescription"
                      value={reportForm.description}
                      onChange={(e) => setReportForm({ ...reportForm, description: e.target.value })}
                      className="w-full px-4 py-3 neumorphic-inset rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-white resize-none transition-all"
                      placeholder="Please describe the issue in detail..."
                      required
                      rows={5}
                      maxLength={1000}
                    />
                    <p className="text-xs text-gray-500 mt-2">{reportForm.description.length}/1000 characters</p>
                  </div>

                  <div className="mb-8">
                    <label htmlFor="issueEmail" className="block text-gray-300 text-sm font-semibold mb-2">
                      Email (optional)
                    </label>
                    <input
                      type="email"
                      id="issueEmail"
                      value={reportForm.email}
                      onChange={(e) => setReportForm({ ...reportForm, email: e.target.value })}
                      className="w-full px-4 py-3 neumorphic-inset rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500 text-white transition-all"
                      placeholder="your.email@example.com (if you want a response)"
                    />
                  </div>

                  <div className="flex gap-4">
                    <button
                      type="button"
                      onClick={() => {
                        setShowReportModal(false);
                        setReportError('');
                      }}
                      className="flex-1 px-6 py-3 glass-effect hover:bg-gray-700/50 text-white font-semibold rounded-xl transition-all transform hover:scale-105"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={reportSubmitting}
                      className="flex-1 px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-bold rounded-xl transition-all transform hover:scale-105 disabled:opacity-50 shadow-[0_0_20px_rgba(16,185,129,0.3)]"
                    >
                      {reportSubmitting ? 'Submitting...' : 'Submit Issue'}
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
