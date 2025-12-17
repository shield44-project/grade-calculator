// pages/index.js
import Head from 'next/head';
import SgpaCalculator from '../components/SgpaCalculator';

export default function Home() {
  return (
    <div className="min-h-screen text-white relative overflow-hidden">
      <Head>
        <title>RVCE Grade & SGPA Calculator | 2025 Scheme</title>
        <meta name="description" content="An accurate RVCE grade and SGPA calculator for the 2025 scheme, based on the official syllabus document." />
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
      </Head>

      {/* Animated background elements */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute top-0 -left-4 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-float"></div>
        <div className="absolute top-0 -right-4 w-72 h-72 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-float" style={{animationDelay: '2s'}}></div>
        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-float" style={{animationDelay: '4s'}}></div>
      </div>

      {/* Header */}
      <header className="relative z-10 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center space-y-4 animate-fadeIn">
            <div className="inline-block mb-4">
              <span className="px-4 py-2 rounded-full bg-gradient-to-r from-purple-500/20 to-blue-500/20 border border-purple-500/30 text-sm font-medium text-purple-300">
                ✨ 2025 Scheme (First Year)
              </span>
            </div>
            <h1 className="text-5xl sm:text-6xl md:text-7xl font-extrabold tracking-tight">
              <span className="block bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 drop-shadow-lg">
                RVCE Grade &
              </span>
              <span className="block bg-clip-text text-transparent bg-gradient-to-r from-pink-400 via-purple-400 to-blue-400 mt-2">
                SGPA Calculator
              </span>
            </h1>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto mt-6">
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
      <footer className="relative z-10 py-8 px-4 sm:px-6 lg:px-8 mt-16">
        <div className="max-w-7xl mx-auto">
          <div className="border-t border-gray-800 pt-8">
            <p className="text-center text-gray-500 text-sm">
              Made with ❤️ for RVCE Students | An unofficial tool for educational purposes
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
