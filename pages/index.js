// pages/index.js
import Head from 'next/head';
import SgpaCalculator from '../components/SgpaCalculator';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white py-10 px-4 sm:px-6 lg:px-8">
      <Head>
        <title>RVCE Grade & SGPA Calculator | 2025 Scheme</title>
        <meta name="description" content="An accurate RVCE grade and SGPA calculator for the 2025 scheme, based on the official syllabus document." />
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
      </Head>

      <main className="flex flex-col items-center justify-center">
        <div className="mb-12 text-center">
          <h1 className="text-5xl sm:text-6xl font-extrabold mb-3 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 animate-gradient">
            RVCE Grade & SGPA Calculator
          </h1>
          <p className="text-gray-400 text-xl">2025 Scheme (First Year)</p>
          <div className="mt-4 flex items-center justify-center gap-4 text-sm text-gray-500">
            <span className="flex items-center gap-1">
              <span className="text-orange-400">🧪</span> Chemistry Cycle
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <span className="text-blue-400">⚛️</span> Physics Cycle
            </span>
          </div>
        </div>

        <SgpaCalculator />
      </main>
      
    </div>
  );
}
