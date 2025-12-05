// components/CourseCard.js
import { useState, useEffect, useMemo, useRef } from 'react';
import { courses } from '../lib/data';
import { calculateTheoryCIE, calculateLabCIE, calculateIntegratedCIE, calculateFinalScore, getGradeDetails, checkPassStatus } from '../lib/calculator';
import DetailedCIECalculator from './DetailedCIECalculator';

export default function CourseCard({ id, onUpdate, onRemove, initialCourseData }) {
  const [selectedCourseCode, setSelectedCourseCode] = useState(initialCourseData.courseDetails?.code || 'SELECT');
  const [cieMarks, setCieMarks] = useState(initialCourseData.cieMarks || {});
  const [seeMarks, setSeeMarks] = useState(initialCourseData.seeMarks || {});
  
  // Use ref to store the previous results to avoid infinite loops
  const prevResultsRef = useRef();

  const courseDetails = courses.find(c => c.code === selectedCourseCode) || courses[0];
  // Hack to handle courses like CS222IA which are labeled "Theory+Lab" but categorized as "Lab" in PDF
  const isEffectivelyIntegrated = courseDetails.type === 'Integrated' || courseDetails.cieMax === 150;

  const results = useMemo(() => {
    let totalCie = 0;
    let finalScore = 0;
    let passCheckMarks = {};

    if (courseDetails.type === 'Theory') {
        totalCie = calculateTheoryCIE(cieMarks);
        passCheckMarks = { totalCie, see: seeMarks.see };
        finalScore = calculateFinalScore(totalCie, seeMarks.see || 0, courseDetails.cieMax, courseDetails.seeMax);
    } else if (courseDetails.type === 'Lab' && !isEffectivelyIntegrated) {
        totalCie = calculateLabCIE(cieMarks);
        passCheckMarks = { totalCie, see: seeMarks.see };
        finalScore = calculateFinalScore(totalCie, seeMarks.see || 0, courseDetails.cieMax, courseDetails.seeMax);
    } else if (isEffectivelyIntegrated) {
        const { cieTheory, cieLab } = calculateIntegratedCIE(cieMarks);
        totalCie = cieTheory + cieLab;
        passCheckMarks = { cieTheory, cieLab, seeTheory: seeMarks.seeTheory, seeLab: seeMarks.seeLab };
        const totalSEE = (Number(seeMarks.seeTheory) || 0) + (Number(seeMarks.seeLab) || 0);
        finalScore = calculateFinalScore(totalCie, totalSEE, courseDetails.cieMax, courseDetails.seeMax);
    }
    
    const isPass = checkPassStatus(courseDetails, passCheckMarks);
    const { grade, points } = getGradeDetails(finalScore, isPass);

    return { score: finalScore.toFixed(2), grade, points, isPass, totalCie: totalCie.toFixed(2) };
  }, [cieMarks, seeMarks, courseDetails, isEffectivelyIntegrated]);

  useEffect(() => {
    // Only call onUpdate if results have actually changed (compare values, not references)
    const hasChanged = 
      !prevResultsRef.current ||
      prevResultsRef.current.score !== results.score ||
      prevResultsRef.current.grade !== results.grade ||
      prevResultsRef.current.points !== results.points ||
      prevResultsRef.current.isPass !== results.isPass ||
      prevResultsRef.current.totalCie !== results.totalCie;
    
    if (hasChanged) {
      prevResultsRef.current = results;
      onUpdate(id, { courseDetails, cieMarks, seeMarks, results });
    }
  }, [id, courseDetails, cieMarks, seeMarks, results, onUpdate]);

  const handleCourseChange = (e) => {
    setSelectedCourseCode(e.target.value);
    setCieMarks({});
    setSeeMarks({});
  };

  const handleCieMarkChange = (e) => {
    // A special flag for our DetailedCIECalculator component logic
    setCieMarks(prev => ({ 
      ...prev, 
      [e.target.name]: e.target.value,
      isIntegratedLab: isEffectivelyIntegrated 
    }));
  };

  const handleSeeMarkChange = (e) => {
    setSeeMarks(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };
  
  return (
    <div className="bg-gray-800 p-6 rounded-lg shadow-2xl border border-gray-700">
      <div className="flex justify-between items-start mb-4">
        <div className="flex-grow pr-4">
          <select onChange={handleCourseChange} value={selectedCourseCode} className="w-full p-2 bg-gray-700 rounded-md text-white border border-gray-600 focus:ring-blue-500 focus:border-blue-500">
            {courses.map(course => (
              <option key={course.code} value={course.code}>{course.code} - {course.title}</option>
            ))}
          </select>
          {courseDetails.code !== 'SELECT' && <p className="text-sm text-gray-400 mt-2">Credits: {courseDetails.credits} | Type: {courseDetails.type}</p>}
        </div>
        <button onClick={() => onRemove(id)} className="text-red-500 hover:text-red-400 font-bold text-3xl leading-none px-2">&times;</button>
      </div>

      {courseDetails.code !== 'SELECT' && (
        <>
          <DetailedCIECalculator courseType={courseDetails.type} cieMarks={cieMarks} handleMarkChange={handleCieMarkChange} />
          
          <div className="p-4 mt-4 bg-gray-800/50 rounded-lg">
            <h3 className="text-xl font-bold text-white mb-4">Semester End Examination (SEE)</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {isEffectivelyIntegrated ? (
                    <>
                        <InputField name="seeTheory" label="SEE Theory Marks" placeholder={`Out of ${courseDetails.seeBreakdown.theory}`} value={seeMarks.seeTheory} onChange={handleSeeMarkChange} />
                        <InputField name="seeLab" label="SEE Lab Marks" placeholder={`Out of ${courseDetails.seeBreakdown.lab}`} value={seeMarks.seeLab} onChange={handleSeeMarkChange} />
                    </>
                ) : (
                    <InputField name="see" label="SEE Marks" placeholder={`Out of ${courseDetails.seeMax}`} value={seeMarks.see} onChange={handleSeeMarkChange} />
                )}
            </div>
          </div>
          
          <div className="mt-6 bg-gray-900/90 p-4 rounded-md grid grid-cols-2 md:grid-cols-5 gap-4 text-center">
             <ResultDisplay label="Status" value={results.isPass ? 'Pass' : 'Fail'} color={results.isPass ? 'text-green-400' : 'text-red-400'} />
             <ResultDisplay label="Total CIE" value={results.totalCie || '0.00'} color="text-cyan-400" />
             <ResultDisplay label="Final %" value={results.score} color="text-blue-400" />
             <ResultDisplay label="Grade" value={results.grade} color="text-purple-400" />
             <ResultDisplay label="Points" value={results.points} color="text-yellow-400" />
          </div>
        </>
      )}
    </div>
  );
}

const InputField = ({ name, label, placeholder, value, onChange }) => (
    <div>
        <label className="block text-sm font-medium text-gray-400">{label}</label>
        <input type="number" name={name} placeholder={placeholder} value={value || ''} onChange={onChange} className="w-full p-2 mt-1 bg-gray-700 border border-gray-600 rounded-md" />
    </div>
);

const ResultDisplay = ({ label, value, color }) => (
    <div>
        <p className="text-sm text-gray-400">{label}</p>
        <p className={`font-bold text-lg ${color}`}>{value ?? '-'}</p>
    </div>
);
