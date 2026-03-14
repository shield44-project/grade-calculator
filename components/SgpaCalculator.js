// components/SgpaCalculator.js
import { useState, useMemo, useCallback, useEffect } from 'react';
import CourseCard from './CourseCard';
import SGPAProbabilityPredictor from './SGPAProbabilityPredictor';
import { calculateSGPA } from '../lib/calculator';
import { cCycleCourses, pCycleCourses } from '../lib/data';

const STORAGE_KEY = 'rvce-grade-calculator-courses';
const CYCLE_KEY = 'rvce-grade-calculator-cycle';
const C_CYCLE_DATA_KEY = 'rvce-grade-calculator-c-cycle-data';
const P_CYCLE_DATA_KEY = 'rvce-grade-calculator-p-cycle-data';

export default function SgpaCalculator() {
  // Initialize selected cycle from localStorage or use default 'C'
  const [selectedCycle, setSelectedCycle] = useState(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem(CYCLE_KEY);
        if (saved && (saved === 'C' || saved === 'P')) {
          return saved;
        }
      } catch (error) {
        console.error('Error loading cycle from localStorage:', error);
      }
    }
    return 'C';
  });

  // Get courses based on selected cycle
  const cycleCourses = selectedCycle === 'C' ? cCycleCourses : pCycleCourses;

  // Initialize courses from localStorage for the selected cycle
  const [courses, setCourses] = useState(() => {
    if (typeof window !== 'undefined') {
      try {
        const storageKey = selectedCycle === 'C' ? C_CYCLE_DATA_KEY : P_CYCLE_DATA_KEY;
        const saved = localStorage.getItem(storageKey);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) {
            return parsed;
          }
        }
      } catch (error) {
        console.error('Error loading courses from localStorage:', error);
      }
    }
    // Initialize with all courses from the selected cycle
    return cycleCourses.map((course, index) => ({
      id: index + 1,
      courseDetails: course,
      cieMarks: {},
      seeMarks: {},
      results: {}
    }));
  });
  
  const sgpa = useMemo(() => calculateSGPA(courses), [courses]);
  
  // Load both cycle SGPAs for CGPA calculation
  const [cCycleSGPA, setCCycleSGPA] = useState(0);
  const [pCycleSGPA, setPCycleSGPA] = useState(0);
  
  // Calculate SGPA for both cycles
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        // Get C Cycle SGPA
        const cCycleData = localStorage.getItem(C_CYCLE_DATA_KEY);
        if (cCycleData) {
          const parsed = JSON.parse(cCycleData);
          const cSgpa = calculateSGPA(parsed);
          setCCycleSGPA(cSgpa);
        } else {
          setCCycleSGPA(0);
        }
        
        // Get P Cycle SGPA
        const pCycleData = localStorage.getItem(P_CYCLE_DATA_KEY);
        if (pCycleData) {
          const parsed = JSON.parse(pCycleData);
          const pSgpa = calculateSGPA(parsed);
          setPCycleSGPA(pSgpa);
        } else {
          setPCycleSGPA(0);
        }
      } catch (error) {
        console.error('Error calculating cycle SGPAs:', error);
      }
    }
  }, [courses, selectedCycle]);
  
  // Calculate CGPA if both cycles have data
  const cgpa = useMemo(() => {
    const cSgpa = parseFloat(cCycleSGPA);
    const pSgpa = parseFloat(pCycleSGPA);
    if (cSgpa > 0 && pSgpa > 0) {
      return ((cSgpa + pSgpa) / 2).toFixed(2);
    }
    return null;
  }, [cCycleSGPA, pCycleSGPA]);

  // Save cycle to localStorage whenever it changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(CYCLE_KEY, selectedCycle);
      } catch (error) {
        console.error('Error saving cycle to localStorage:', error);
      }
    }
  }, [selectedCycle]);

  // Save courses to cycle-specific localStorage whenever they change
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const storageKey = selectedCycle === 'C' ? C_CYCLE_DATA_KEY : P_CYCLE_DATA_KEY;
        localStorage.setItem(storageKey, JSON.stringify(courses));
      } catch (error) {
        console.error('Error saving courses to localStorage:', error);
      }
    }
  }, [courses, selectedCycle]);

  // Submit data to backend for owner to collect
  useEffect(() => {
    // Only submit if user has entered meaningful data
    const hasData = courses.some(course => 
      course.courseDetails && 
      (Object.keys(course.cieMarks).length > 0 || Object.keys(course.seeMarks).length > 0)
    );

    if (hasData) {
      // Debounce the submission to avoid too many requests
      const timeoutId = setTimeout(async () => {
        try {
          // Get username from localStorage (if logged in)
          const username = localStorage.getItem('rvce-calculator-username') || null;
          
          // Get login time from localStorage (stored when user logs in)
          const loginTime = localStorage.getItem('rvce-calculator-login-time') || null;
          
          const submissionData = {
            username: username,
            loginTime: loginTime,
            sgpa: sgpa,
            cycle: selectedCycle, // 'C' for Chemistry Cycle or 'P' for Physics Cycle
            courses: courses.map(course => ({
              courseDetails: course.courseDetails,
              cieMarks: course.cieMarks,
              seeMarks: course.seeMarks,
              results: course.results
            }))
          };

          await fetch('/api/submit-data', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(submissionData),
          });
          // Silent submission - don't notify user
        } catch (error) {
          console.error('Error submitting data:', error);
          // Fail silently - don't disrupt user experience
        }
      }, 3000); // Wait 3 seconds after last change

      return () => clearTimeout(timeoutId);
    }
  }, [courses, sgpa]);

  const handleCycleChange = (cycle) => {
    if (cycle !== selectedCycle) {
      setSelectedCycle(cycle);
      // Load saved data for the new cycle, or initialize with default courses
      const storageKey = cycle === 'C' ? C_CYCLE_DATA_KEY : P_CYCLE_DATA_KEY;
      const newCycleCourses = cycle === 'C' ? cCycleCourses : pCycleCourses;
      
      if (typeof window !== 'undefined') {
        try {
          const saved = localStorage.getItem(storageKey);
          if (saved) {
            const parsed = JSON.parse(saved);
            if (Array.isArray(parsed) && parsed.length > 0) {
              setCourses(parsed);
              return;
            }
          }
        } catch (error) {
          console.error('Error loading cycle data:', error);
        }
      }
      
      // If no saved data, initialize with default courses
      setCourses(newCycleCourses.map((course, index) => ({
        id: index + 1,
        courseDetails: course,
        cieMarks: {},
        seeMarks: {},
        results: {}
      })));
    }
  };

  const updateCourse = useCallback((id, data) => {
    setCourses(courses => courses.map(course => (course.id === id ? { ...course, ...data } : course)));
  }, []);

  const clearAllData = () => {
    if (confirm('Are you sure you want to clear all your saved data for BOTH semesters? This cannot be undone.')) {
      // Reset current cycle courses
      const newCycleCourses = selectedCycle === 'C' ? cCycleCourses : pCycleCourses;
      setCourses(newCycleCourses.map((course, index) => ({
        id: index + 1,
        courseDetails: course,
        cieMarks: {},
        seeMarks: {},
        results: {}
      })));
      
      // Clear all localStorage data for both cycles
      if (typeof window !== 'undefined') {
        localStorage.removeItem(C_CYCLE_DATA_KEY);
        localStorage.removeItem(P_CYCLE_DATA_KEY);
        // Reset the SGPAs
        setCCycleSGPA(0);
        setPCycleSGPA(0);
      }
    }
  };

  return (
    <div className="w-full mx-auto animate-fadeIn">
      {/* Cycle Selector */}
      <div className="mb-10 flex justify-center">
        <div
          className="inline-flex rounded-2xl p-1.5"
          style={{
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(124,58,237,0.2)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
          }}
        >
          <button
            onClick={() => handleCycleChange('C')}
            className={`group relative px-6 py-3 rounded-xl font-bold transition-all duration-300 text-sm ${
              selectedCycle === 'C' ? 'text-white scale-[1.02]' : 'text-gray-400 hover:text-white hover:scale-[1.02]'
            }`}
            style={
              selectedCycle === 'C'
                ? { background: 'linear-gradient(135deg,#06b6d4,#3b82f6,#7c3aed)', boxShadow: '0 0 20px rgba(6,182,212,0.4)' }
                : {}
            }
          >
            <span className="relative z-10 flex items-center gap-2">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z" />
              </svg>
              C Cycle (Chemistry)
            </span>
          </button>
          <button
            onClick={() => handleCycleChange('P')}
            className={`group relative px-6 py-3 rounded-xl font-bold transition-all duration-300 text-sm ${
              selectedCycle === 'P' ? 'text-white scale-[1.02]' : 'text-gray-400 hover:text-white hover:scale-[1.02]'
            }`}
            style={
              selectedCycle === 'P'
                ? { background: 'linear-gradient(135deg,#7c3aed,#a855f7,#ec4899)', boxShadow: '0 0 20px rgba(124,58,237,0.5)' }
                : {}
            }
          >
            <span className="relative z-10 flex items-center gap-2">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
              </svg>
              P Cycle (Physics)
            </span>
          </button>
        </div>
      </div>

      {/* SGPA/CGPA Display Card */}
      <div className="sticky top-4 z-20 mb-10">
        <div className="relative overflow-hidden rounded-3xl animate-scaleIn">
          {/* Ambient glow */}
          <div
            className="absolute inset-0 blur-2xl"
            style={{ background: 'linear-gradient(135deg,rgba(124,58,237,0.25),rgba(59,130,246,0.2),rgba(6,182,212,0.15))', borderRadius: '24px' }}
          />
          {/* Card */}
          <div
            className="relative p-8 sm:p-10 rounded-3xl"
            style={{
              background: 'rgba(255,255,255,0.05)',
              backdropFilter: 'blur(30px)',
              WebkitBackdropFilter: 'blur(30px)',
              border: '1px solid rgba(124,58,237,0.3)',
              boxShadow: '0 24px 64px rgba(0,0,0,0.5)',
            }}
          >
            {cgpa ? (
              <div className="space-y-8">
                <div className="flex flex-col md:flex-row justify-between items-center gap-8 pb-8" style={{ borderBottom: '1px solid rgba(124,58,237,0.2)' }}>
                  <div className="text-center md:text-left">
                    <div className="text-violet-400 text-xs font-bold uppercase tracking-widest mb-2 flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-violet-400 animate-pulse" />
                      Your Overall
                    </div>
                    <h2
                      className="text-4xl font-black"
                      style={{ background: 'linear-gradient(135deg,#a855f7,#60a5fa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}
                    >
                      CGPA Score
                    </h2>
                  </div>
                  <div className="relative group">
                    <div
                      className="absolute inset-0 rounded-full blur-3xl opacity-60 group-hover:opacity-80 transition-opacity"
                      style={{ background: 'linear-gradient(135deg,#7c3aed,#3b82f6)' }}
                    />
                    <div
                      className="relative rounded-full p-10"
                      style={{ background: 'rgba(0,0,0,0.5)', border: '2px solid rgba(124,58,237,0.4)' }}
                    >
                      <div
                        className="text-6xl sm:text-7xl font-black"
                        style={{ background: 'linear-gradient(135deg,#a855f7,#60a5fa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}
                      >
                        {cgpa}
                      </div>
                    </div>
                  </div>
                  <div className="text-center md:text-right">
                    <p className="text-sm text-gray-400 mb-2 font-semibold">Out of</p>
                    <p
                      className="text-5xl font-black"
                      style={{ background: 'linear-gradient(135deg,#f97316,#fbbf24)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}
                    >
                      10.0
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div
                    className="rounded-2xl p-5 transition-all hover:scale-[1.02]"
                    style={{ background: 'rgba(6,182,212,0.06)', border: '1px solid rgba(6,182,212,0.2)' }}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-white text-sm font-bold mb-1">C Cycle SGPA</p>
                        <div className="w-8 h-0.5 rounded-full" style={{ background: 'linear-gradient(90deg,#06b6d4,transparent)' }} />
                      </div>
                      <div
                        className="text-4xl font-black"
                        style={{ background: 'linear-gradient(135deg,#06b6d4,#22d3ee)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}
                      >
                        {cCycleSGPA}
                      </div>
                    </div>
                  </div>
                  <div
                    className="rounded-2xl p-5 transition-all hover:scale-[1.02]"
                    style={{ background: 'rgba(168,85,247,0.06)', border: '1px solid rgba(168,85,247,0.2)' }}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-white text-sm font-bold mb-1">P Cycle SGPA</p>
                        <div className="w-8 h-0.5 rounded-full" style={{ background: 'linear-gradient(90deg,#a855f7,transparent)' }} />
                      </div>
                      <div
                        className="text-4xl font-black"
                        style={{ background: 'linear-gradient(135deg,#a855f7,#ec4899)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}
                      >
                        {pCycleSGPA}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col md:flex-row justify-between items-center gap-8">
                <div className="text-center md:text-left">
                  <div className="text-violet-400 text-xs font-bold uppercase tracking-widest mb-2 flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-violet-400 animate-pulse" />
                    Your Current
                  </div>
                  <h2
                    className="text-4xl font-black"
                    style={{ background: 'linear-gradient(135deg,#a855f7,#60a5fa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}
                  >
                    SGPA Score
                  </h2>
                  <p className="text-violet-300 text-xs font-bold mt-1 opacity-70">
                    ({selectedCycle === 'C' ? 'C Cycle' : 'P Cycle'})
                  </p>
                </div>
                <div className="relative group">
                  <div
                    className="absolute inset-0 rounded-full blur-3xl opacity-50 group-hover:opacity-70 transition-opacity"
                    style={{ background: 'linear-gradient(135deg,#7c3aed,#ec4899)' }}
                  />
                  <div
                    className="relative rounded-full p-10"
                    style={{ background: 'rgba(0,0,0,0.5)', border: '2px solid rgba(168,85,247,0.4)' }}
                  >
                    <div
                      className="text-6xl sm:text-7xl font-black"
                      style={{ background: 'linear-gradient(135deg,#a855f7,#ec4899)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}
                    >
                      {sgpa}
                    </div>
                  </div>
                </div>
                <div className="text-center md:text-right">
                  <p className="text-sm text-gray-400 mb-2 font-semibold">Out of</p>
                  <p
                    className="text-5xl font-black"
                    style={{ background: 'linear-gradient(135deg,#f97316,#fbbf24)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}
                  >
                    10.0
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* SGPA Probability Predictor */}
      <SGPAProbabilityPredictor courses={courses} />
      
      {/* Courses Section */}
      <div className="space-y-5">
        {courses.map((course, index) => (
          <div key={course.id} className="animate-slideInLeft" style={{animationDelay: `${index * 0.07}s`}}>
            <CourseCard id={course.id} initialCourseData={course} onUpdate={updateCourse} />
          </div>
        ))}
      </div>

      {/* Action Buttons */}
      <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
        <button 
          onClick={clearAllData} 
          className="group relative overflow-hidden px-8 py-3.5 rounded-2xl transition-all duration-300 hover:scale-[1.03] text-sm font-bold text-gray-300 hover:text-white"
          style={{
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.1)',
          }}
        >
          <div
            className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl"
            style={{ background: 'linear-gradient(135deg,rgba(239,68,68,0.15),rgba(249,115,22,0.1))' }}
          />
          <span className="relative z-10 flex items-center justify-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            Clear All Data
          </span>
        </button>
      </div>

      {/* Disclaimer Section */}
      <div className="mt-14 animate-fadeIn">
        <div
          className="rounded-2xl p-7"
          style={{
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(124,58,237,0.15)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
          }}
        >
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 mt-0.5">
              <div
                className="p-2.5 rounded-xl"
                style={{ background: 'rgba(249,115,22,0.1)', border: '1px solid rgba(249,115,22,0.25)' }}
              >
                <svg className="w-5 h-5 text-orange-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
            <div className="flex-1">
              <h4
                className="font-black text-lg mb-3"
                style={{ background: 'linear-gradient(135deg,#a855f7,#60a5fa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}
              >
                Disclaimer &amp; Assumptions
              </h4>
              <ul className="space-y-2.5 text-gray-400 text-sm">
                <li className="flex items-start gap-3">
                  <span className="text-violet-400 flex-shrink-0 mt-0.5">▸</span>
                  <span>Course data and CIE rubrics are based on the provided &quot;Dean-First-year-scheme-syllabus-updated-as-on-16-10-2025.pdf&quot;.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-violet-400 flex-shrink-0 mt-0.5">▸</span>
                  <span><strong className="text-white">Passing Standards:</strong> The minimum passing percentages (e.g., CIE &gt;= 40%, SEE &gt;= 35%) are based on standard autonomous college practices.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-violet-400 flex-shrink-0 mt-0.5">▸</span>
                  <span>This is an unofficial tool. Always confirm with official results from the university.</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
