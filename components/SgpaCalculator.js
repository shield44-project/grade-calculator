// components/SgpaCalculator.js
import { useState, useMemo, useCallback, useEffect } from 'react';
import CourseCard from './CourseCard';
import { calculateSGPA } from '../lib/calculator';

const STORAGE_KEY = 'rvce-grade-calculator-courses';

export default function SgpaCalculator() {
  // Initialize courses from localStorage or use default
  const [courses, setCourses] = useState(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          // Validate the data structure
          if (Array.isArray(parsed) && parsed.length > 0) {
            return parsed;
          }
        }
      } catch (error) {
        console.error('Error loading courses from localStorage:', error);
      }
    }
    return [{ id: 1, courseDetails: null, cieMarks: {}, seeMarks: {}, results: {} }];
  });
  
  const sgpa = useMemo(() => calculateSGPA(courses), [courses]);

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

  const addCourse = () => {
    setCourses([...courses, { id: Date.now(), courseDetails: null, cieMarks: {}, seeMarks: {}, results: {} }]);
  };

  const removeCourse = (id) => {
    setCourses(courses.filter(course => course.id !== id));
  };

  const updateCourse = useCallback((id, data) => {
    setCourses(courses => courses.map(course => (course.id === id ? { ...course, ...data } : course)));
  }, []);

  const clearAllData = () => {
    if (confirm('Are you sure you want to clear all your saved data? This cannot be undone.')) {
      setCourses([{ id: Date.now(), courseDetails: null, cieMarks: {}, seeMarks: {}, results: {} }]);
      if (typeof window !== 'undefined') {
        localStorage.removeItem(STORAGE_KEY);
      }
    }
  };

  return (
    <div className="w-full mx-auto animate-fadeIn">
      {/* SGPA Display Card - Redesigned */}
      <div className="sticky top-4 z-20 mb-12">
        <div className="relative overflow-hidden rounded-3xl shadow-2xl">
          {/* Gradient background */}
          <div className="absolute inset-0 bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-700"></div>
          
          {/* Glass morphism overlay */}
          <div className="relative backdrop-blur-xl bg-white/10 border border-white/20 p-8">
            <div className="flex flex-col md:flex-row justify-between items-center gap-6">
              <div className="text-center md:text-left">
                <p className="text-blue-200 text-sm font-medium uppercase tracking-wider mb-2">Your Current</p>
                <h2 className="text-3xl font-bold text-white">SGPA Score</h2>
              </div>
              
              <div className="relative">
                <div className="absolute inset-0 bg-white/20 rounded-full blur-xl"></div>
                <div className="relative bg-gradient-to-br from-white/30 to-white/10 backdrop-blur-md rounded-full p-8 border-4 border-white/30">
                  <div className="text-6xl font-extrabold text-white drop-shadow-lg">
                    {sgpa}
                  </div>
                </div>
              </div>
              
              <div className="text-center md:text-right">
                <p className="text-sm text-blue-100 mb-2">Out of</p>
                <p className="text-4xl font-bold text-white">10.0</p>
              </div>
            </div>
          </div>
          
          {/* Animated border */}
          <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500 opacity-50 blur-sm -z-10"></div>
        </div>
      </div>
      
      {/* Courses Section */}
      <div className="space-y-6">
        {courses.map((course, index) => (
          <div key={course.id} className="animate-slideInLeft" style={{animationDelay: `${index * 0.1}s`}}>
            <CourseCard id={course.id} initialCourseData={course} onUpdate={updateCourse} onRemove={removeCourse} />
          </div>
        ))}
      </div>

      {/* Action Buttons - Redesigned */}
      <div className="mt-12 flex flex-col sm:flex-row gap-4 justify-center">
        <button 
          onClick={addCourse} 
          className="group relative overflow-hidden bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold py-4 px-8 rounded-2xl transition-all duration-300 shadow-lg hover:shadow-2xl hover:scale-105 transform"
        >
          <span className="relative z-10 flex items-center justify-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Add Another Course
          </span>
          <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        </button>
        
        <button 
          onClick={clearAllData} 
          className="group relative overflow-hidden bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 text-white font-bold py-4 px-8 rounded-2xl transition-all duration-300 shadow-lg hover:shadow-2xl hover:scale-105 transform"
        >
          <span className="relative z-10 flex items-center justify-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            Clear All Data
          </span>
          <div className="absolute inset-0 bg-gradient-to-r from-pink-600 to-red-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        </button>
      </div>

      {/* Disclaimer Section - Redesigned */}
      <div className="mt-12 relative overflow-hidden rounded-2xl">
        <div className="absolute inset-0 bg-gradient-to-br from-gray-800 to-gray-900"></div>
        <div className="relative backdrop-blur-xl bg-white/5 border border-gray-700/50 p-6">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 mt-1">
              <svg className="w-6 h-6 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="flex-1">
              <h4 className="font-bold text-white text-lg mb-3 flex items-center gap-2">
                Disclaimer & Assumptions
              </h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li className="flex items-start gap-2">
                  <span className="text-purple-400 flex-shrink-0 mt-1">•</span>
                  <span>Course data and CIE rubrics are based on the provided &quot;Dean-First-year-scheme-syllabus-updated-as-on-16-10-2025.pdf&quot;.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-400 flex-shrink-0 mt-1">•</span>
                  <span><strong className="text-gray-300">Passing Standards:</strong> The minimum passing percentages (e.g., CIE &gt;= 40%, SEE &gt;= 35%) are based on standard autonomous college practices.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-400 flex-shrink-0 mt-1">•</span>
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
