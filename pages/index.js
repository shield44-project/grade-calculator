// pages/index.js
import Head from 'next/head';
import SgpaCalculator from '../components/SgpaCalculator';

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-900 text-white py-10 px-4 sm:px-6 lg:px-8">
      <Head>
        <title>RVCE Grade & SGPA Calculator | 2025 Scheme</title>
        <meta name="description" content="An accurate RVCE grade and SGPA calculator for the 2025 scheme, based on the official syllabus document." />
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
      </Head>

      <main className="flex flex-col items-center justify-center">
        <h1 className="text-4xl sm:text-5xl font-extrabold text-center mb-2 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">
          RVCE Grade & SGPA Calculator
        </h1>
        <p className="text-gray-400 text-lg mb-10">2025 Scheme (First Year)</p>

        <SgpaCalculator />
      </main>
      
      <footer className="text-center mt-12 text-gray-500">
        <p>Built by Gemini based on the official 2025 scheme syllabus.</p>
      </footer>
    </div>
  );
}
