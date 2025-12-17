// components/SgpaCalculator.js
import { useState, useMemo, useCallback, useEffect } from 'react';
import CourseCard from './CourseCard';
import { calculateSGPA } from '../lib/calculator';

const STORAGE_KEY = 'rvce-grade-calculator-courses';
const STORAGE_KEY_CYCLE = 'rvce-grade-calculator-active-cycle';

export default function SgpaCalculator() {
  // Initialize with default values, then update from localStorage in useEffect
  const [activeCycle, setActiveCycle] = useState('C');
  const [courses, setCourses] = useState([{ id: 1, courseDetails: null, cieMarks: {}, seeMarks: {}, results: {}, cycle: 'C' }]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load saved data from localStorage after component mounts
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const savedCycle = localStorage.getItem(STORAGE_KEY_CYCLE);
        if (savedCycle) {
          setActiveCycle(savedCycle);
        }

        const savedCourses = localStorage.getItem(STORAGE_KEY);
        if (savedCourses) {
          const parsed = JSON.parse(savedCourses);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setCourses(parsed);
          }
        }
      } catch (error) {
        console.error('Error loading from localStorage:', error);
      }
      setIsLoaded(true);
    }
  }, []);
  
  // Filter courses by cycle
  const cCycleCourses = useMemo(() => courses.filter(c => c.courseDetails?.cycle === 'C'), [courses]);
  const pCycleCourses = useMemo(() => courses.filter(c => c.courseDetails?.cycle === 'P'), [courses]);
  
  // Calculate SGPAs for each cycle
  const cCycleSGPA = useMemo(() => calculateSGPA(cCycleCourses), [cCycleCourses]);
  const pCycleSGPA = useMemo(() => calculateSGPA(pCycleCourses), [pCycleCourses]);
  
  // Overall SGPA combining both cycles
  const overallSGPA = useMemo(() => calculateSGPA(courses), [courses]);

  // Save courses to localStorage whenever they change
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(courses));
      } catch (error) {
        console.error('Error saving courses to localStorage:', error);
      }
    }
  }, [courses]);

  // Save active cycle to localStorage whenever it changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(STORAGE_KEY_CYCLE, activeCycle);
      } catch (error) {
        console.error('Error saving cycle to localStorage:', error);
      }
    }
  }, [activeCycle]);

  const addCourse = () => {
    setCourses([...courses, { id: Date.now(), courseDetails: null, cieMarks: {}, seeMarks: {}, results: {}, cycle: activeCycle }]);
  };

  const removeCourse = (id) => {
    setCourses(courses.filter(course => course.id !== id));
  };

  const updateCourse = useCallback((id, data) => {
    setCourses(courses => courses.map(course => (course.id === id ? { ...course, ...data } : course)));
  }, []);

  const clearAllData = () => {
    if (confirm('Are you sure you want to clear all your saved data? This cannot be undone.')) {
      setCourses([{ id: Date.now(), courseDetails: null, cieMarks: {}, seeMarks: {}, results: {}, cycle: activeCycle }]);
      if (typeof window !== 'undefined') {
        localStorage.removeItem(STORAGE_KEY);
      }
    }
  };

  // Get courses to display based on active cycle
  const displayCourses = useMemo(() => {
    return courses.filter(c => !c.courseDetails || c.courseDetails.cycle === activeCycle || c.courseDetails.cycle === 'none');
  }, [courses, activeCycle]);

  return (
    <div className="w-full max-w-6xl mx-auto">
      {/* Cycle Selector with Modern Tabs */}
      <div className="mb-8">
        <div className="bg-gradient-to-r from-gray-800 via-gray-900 to-gray-800 p-1 rounded-2xl shadow-2xl">
          <div className="flex gap-2 p-2">
            <button
              onClick={() => setActiveCycle('C')}
              className={`flex-1 py-4 px-6 rounded-xl font-bold text-lg transition-all duration-300 transform ${
                activeCycle === 'C'
                  ? 'bg-gradient-to-r from-orange-500 to-pink-600 text-white shadow-lg scale-105'
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white'
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <span className="text-2xl">🧪</span>
                <span>C Cycle (Chemistry)</span>
              </div>
            </button>
            <button
              onClick={() => setActiveCycle('P')}
              className={`flex-1 py-4 px-6 rounded-xl font-bold text-lg transition-all duration-300 transform ${
                activeCycle === 'P'
                  ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg scale-105'
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white'
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <span className="text-2xl">⚛️</span>
                <span>P Cycle (Physics)</span>
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* SGPA Display Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* C Cycle SGPA */}
        <div className="bg-gradient-to-br from-orange-500/20 to-pink-600/20 backdrop-blur-md p-6 rounded-2xl shadow-xl border border-orange-500/30">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-semibold text-orange-300">🧪 C Cycle</h3>
          </div>
          <div className="text-4xl font-extrabold text-orange-400">{cCycleSGPA}</div>
          <p className="text-sm text-gray-400 mt-2">{cCycleCourses.length} courses</p>
        </div>

        {/* P Cycle SGPA */}
        <div className="bg-gradient-to-br from-blue-500/20 to-purple-600/20 backdrop-blur-md p-6 rounded-2xl shadow-xl border border-blue-500/30">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-semibold text-blue-300">⚛️ P Cycle</h3>
          </div>
          <div className="text-4xl font-extrabold text-blue-400">{pCycleSGPA}</div>
          <p className="text-sm text-gray-400 mt-2">{pCycleCourses.length} courses</p>
        </div>

        {/* Overall SGPA */}
        <div className="bg-gradient-to-br from-green-500/20 to-emerald-600/20 backdrop-blur-md p-6 rounded-2xl shadow-xl border border-green-500/30">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-semibold text-green-300">🎓 Overall</h3>
          </div>
          <div className="text-4xl font-extrabold text-green-400">{overallSGPA}</div>
          <p className="text-sm text-gray-400 mt-2">Combined SGPA</p>
        </div>
      </div>

      {/* Current Cycle Display */}
      <div className={`mb-6 p-4 rounded-xl border-2 ${
        activeCycle === 'C' 
          ? 'bg-orange-500/10 border-orange-500/50' 
          : 'bg-blue-500/10 border-blue-500/50'
      }`}>
        <p className="text-center text-lg font-semibold">
          {activeCycle === 'C' ? '🧪 Managing Chemistry Cycle Courses' : '⚛️ Managing Physics Cycle Courses'}
        </p>
      </div>
      
      <div className="space-y-6">
        {displayCourses.map((course, index) => (
          <CourseCard 
            key={course.id} 
            id={course.id} 
            initialCourseData={course} 
            onUpdate={updateCourse} 
            onRemove={removeCourse}
            activeCycle={activeCycle}
          />
        ))}
      </div>

      <div className="mt-8 text-center space-x-4">
        <button 
          onClick={addCourse} 
          className={`${
            activeCycle === 'C'
              ? 'bg-gradient-to-r from-orange-500 to-pink-600 hover:from-orange-600 hover:to-pink-700'
              : 'bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700'
          } text-white font-bold py-3 px-8 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg`}
        >
          + Add {activeCycle} Cycle Course
        </button>
        <button 
          onClick={clearAllData} 
          className="bg-gradient-to-r from-red-500 to-red-700 hover:from-red-600 hover:to-red-800 text-white font-bold py-3 px-8 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg"
        >
          Clear All Data
        </button>
      </div>

      <div className="mt-8 p-6 bg-gradient-to-r from-gray-800/50 to-gray-900/50 rounded-2xl text-gray-400 text-sm border border-gray-700 shadow-xl backdrop-blur-sm">
        <h4 className="font-bold text-white mb-3 text-lg">ℹ️ Disclaimer & Assumptions:</h4>
        <ul className="list-disc list-inside mt-2 space-y-2">
            <li>Course data and CIE rubrics are based on the provided &quot;Dean-First-year-scheme-syllabus-updated-as-on-16-10-2025.pdf&quot;.</li>
            <li><strong>C Cycle</strong> refers to Chemistry Cycle courses, and <strong>P Cycle</strong> refers to Physics Cycle courses.</li>
            <li><strong>Passing Standards:</strong> The minimum passing percentages (e.g., CIE &gt;= 40%, SEE &gt;= 35%) are based on the images provided in the previous prompt, as this specific table was not found in the new PDF syllabus. This is a standard practice for autonomous colleges.</li>
            <li>This is an unofficial tool. Always confirm with official results from the university.</li>
        </ul>
      </div>
    </div>
  );
}
