// components/SgpaCalculator.js
import { useState, useMemo, useCallback } from 'react';
import CourseCard from './CourseCard';
import { calculateSGPA } from '../lib/calculator';

export default function SgpaCalculator() {
  const [courses, setCourses] = useState([{ id: 1, courseDetails: null, cieMarks: {}, seeMarks: {}, results: {} }]);
  const sgpa = useMemo(() => calculateSGPA(courses), [courses]);

  const addCourse = () => {
    setCourses([...courses, { id: Date.now(), courseDetails: null, cieMarks: {}, seeMarks: {}, results: {} }]);
  };

  const removeCourse = (id) => {
    setCourses(courses.filter(course => course.id !== id));
  };

  const updateCourse = useCallback((id, data) => {
    setCourses(courses => courses.map(course => (course.id === id ? { ...course, ...data } : course)));
  }, []);

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="sticky top-0 z-10 bg-gray-900/80 backdrop-blur-md p-4 mb-8 rounded-b-xl shadow-lg border-b border-l border-r border-gray-700">
        <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-white">Your SGPA</h2>
            <div className="text-4xl font-extrabold text-green-400">{sgpa}</div>
        </div>
      </div>
      
      <div className="space-y-8">
        {courses.map((course, index) => (
          <CourseCard key={course.id} id={course.id} initialCourseData={course} onUpdate={updateCourse} onRemove={removeCourse} />
        ))}
      </div>

      <div className="mt-8 text-center">
        <button onClick={addCourse} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-lg transition-colors">
          + Add Another Course
        </button>
      </div>

      <div className="mt-8 p-4 bg-gray-800 rounded-lg text-gray-400 text-sm border border-gray-700">
        <h4 className="font-bold text-white mb-2">Disclaimer & Assumptions:</h4>
        <ul className="list-disc list-inside mt-2 space-y-1">
            <li>Course data and CIE rubrics are based on the provided &quot;Dean-First-year-scheme-syllabus-updated-as-on-16-10-2025.pdf&quot;.</li>
            <li>**Passing Standards:** The minimum passing percentages (e.g., CIE &gt;= 40%, SEE &gt;= 35%) are based on the images provided in the previous prompt, as this specific table was not found in the new PDF syllabus. This is a standard practice for autonomous colleges.</li>
            <li>This is an unofficial tool. Always confirm with official results from the university.</li>
        </ul>
      </div>
    </div>
  );
}
