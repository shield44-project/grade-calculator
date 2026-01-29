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
      {/* Cycle Selector with neumorphic design */}
      <div className="mb-12 flex justify-center">
        <div className="inline-flex neumorphic rounded-2xl p-2 shadow-2xl">
          <button
            onClick={() => handleCycleChange('C')}
            className={`group relative px-8 py-4 rounded-xl font-bold transition-all duration-300 ${
              selectedCycle === 'C'
                ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-[0_0_30px_rgba(16,185,129,0.4)] scale-105'
                : 'text-gray-400 hover:text-white hover:scale-105'
            }`}
          >
            <span className="relative z-10 flex items-center gap-2">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z" />
              </svg>
              C Cycle (Chemistry)
            </span>
          </button>
          <button
            onClick={() => handleCycleChange('P')}
            className={`group relative px-8 py-4 rounded-xl font-bold transition-all duration-300 ${
              selectedCycle === 'P'
                ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-[0_0_30px_rgba(16,185,129,0.4)] scale-105'
                : 'text-gray-400 hover:text-white hover:scale-105'
            }`}
          >
            <span className="relative z-10 flex items-center gap-2">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
              </svg>
              P Cycle (Physics)
            </span>
          </button>
        </div>
      </div>



      {/* SGPA/CGPA Display Card - Neumorphic Design */}
      <div className="sticky top-4 z-20 mb-12">
        <div className="relative overflow-hidden rounded-3xl animate-scaleIn">
          {/* Glowing border effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 via-teal-500 to-amber-500 opacity-30 blur-xl animate-pulse"></div>
          
          {/* Main card with neumorphic effect */}
          <div className="relative neumorphic p-8 sm:p-10">
            {cgpa ? (
              // Show CGPA when both cycles have data
              <div className="space-y-8">
                {/* CGPA Display */}
                <div className="flex flex-col md:flex-row justify-between items-center gap-8 pb-8 border-b border-emerald-500/20">
                  <div className="text-center md:text-left">
                    <p className="text-emerald-400 text-sm font-bold uppercase tracking-wider mb-2 flex items-center gap-2">
                      <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
                      Your Overall
                    </p>
                    <h2 className="text-4xl font-black gradient-text-cyan">CGPA Score</h2>
                  </div>
                  
                  <div className="relative group">
                    <div className="absolute inset-0 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-full blur-2xl opacity-50 group-hover:opacity-75 transition-opacity"></div>
                    <div className="relative neumorphic-inset rounded-full p-10 border-4 border-emerald-500/30">
                      <div className="text-6xl sm:text-7xl font-black gradient-text-cyan">
                        {cgpa}
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-center md:text-right">
                    <p className="text-sm text-gray-400 mb-2 font-semibold">Out of</p>
                    <p className="text-5xl font-black gradient-text-orange">10.0</p>
                  </div>
                </div>
                
                {/* Individual Semester SGPAs */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="glass-effect rounded-2xl p-6 hover:shadow-[0_0_30px_rgba(16,185,129,0.2)] transition-all transform hover:scale-105">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-white text-sm font-bold mb-1">C Cycle SGPA</p>
                        <div className="w-12 h-1 bg-gradient-to-r from-emerald-400 to-transparent rounded-full"></div>
                      </div>
                      <div className="text-4xl font-black gradient-text-cyan">{cCycleSGPA}</div>
                    </div>
                  </div>
                  <div className="glass-effect rounded-2xl p-6 hover:shadow-[0_0_30px_rgba(251,146,60,0.2)] transition-all transform hover:scale-105">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-white text-sm font-bold mb-1">P Cycle SGPA</p>
                        <div className="w-12 h-1 bg-gradient-to-r from-amber-400 to-transparent rounded-full"></div>
                      </div>
                      <div className="text-4xl font-black gradient-text-orange">{pCycleSGPA}</div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              // Show only SGPA when only one cycle has data
              <div className="flex flex-col md:flex-row justify-between items-center gap-8">
                <div className="text-center md:text-left">
                  <p className="text-emerald-400 text-sm font-bold uppercase tracking-wider mb-2 flex items-center gap-2">
                    <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
                    Your Current
                  </p>
                  <h2 className="text-4xl font-black gradient-text-cyan">SGPA Score</h2>
                  <p className="text-amber-400 text-xs font-bold mt-2">({selectedCycle === 'C' ? 'C Cycle' : 'P Cycle'})</p>
                </div>
                
                <div className="relative group">
                  <div className="absolute inset-0 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-full blur-2xl opacity-50 group-hover:opacity-75 transition-opacity"></div>
                  <div className="relative neumorphic-inset rounded-full p-10 border-4 border-emerald-500/30">
                    <div className="text-6xl sm:text-7xl font-black gradient-text-cyan">
                      {sgpa}
                    </div>
                  </div>
                </div>
                
                <div className="text-center md:text-right">
                  <p className="text-sm text-gray-400 mb-2 font-semibold">Out of</p>
                  <p className="text-5xl font-black gradient-text-orange">10.0</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* SGPA Probability Predictor */}
      <SGPAProbabilityPredictor courses={courses} />
      
      {/* Courses Section */}
      <div className="space-y-6">
        {courses.map((course, index) => (
          <div key={course.id} className="animate-slideInLeft" style={{animationDelay: `${index * 0.1}s`}}>
            <CourseCard id={course.id} initialCourseData={course} onUpdate={updateCourse} />
          </div>
        ))}
      </div>

      {/* Action Buttons - Redesigned */}
      <div className="mt-12 flex flex-col sm:flex-row gap-4 justify-center">
        <button 
          onClick={clearAllData} 
          className="group relative overflow-hidden neumorphic px-8 py-4 rounded-2xl transition-all duration-300 transform hover:scale-105"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-red-500/20 to-orange-500/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <span className="relative z-10 flex items-center justify-center gap-2 text-gray-300 group-hover:text-white font-bold">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            Clear All Data
          </span>
        </button>
      </div>

      {/* Disclaimer Section - Redesigned */}
      <div className="mt-16 relative overflow-hidden rounded-2xl animate-fadeIn">
        <div className="neumorphic p-8">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 mt-1">
              <div className="p-3 rounded-xl glass-effect">
                <svg className="w-6 h-6 text-orange-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
            <div className="flex-1">
              <h4 className="font-black text-white text-xl mb-4 gradient-text-cyan">
                Disclaimer & Assumptions
              </h4>
              <ul className="space-y-3 text-gray-400 text-sm">
                <li className="flex items-start gap-3">
                  <span className="gradient-text-cyan flex-shrink-0 mt-1 font-bold">▸</span>
                  <span>Course data and CIE rubrics are based on the provided &quot;Dean-First-year-scheme-syllabus-updated-as-on-16-10-2025.pdf&quot;.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="gradient-text-cyan flex-shrink-0 mt-1 font-bold">▸</span>
                  <span><strong className="text-white">Passing Standards:</strong> The minimum passing percentages (e.g., CIE &gt;= 40%, SEE &gt;= 35%) are based on standard autonomous college practices.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="gradient-text-cyan flex-shrink-0 mt-1 font-bold">▸</span>
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
