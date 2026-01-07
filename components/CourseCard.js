// components/CourseCard.js
import { useState, useEffect, useMemo, useRef } from 'react';
import { 
  calculateTheoryCIE, 
  calculateLabCIE, 
  calculateIntegratedCIE, 
  calculateEnglishCIE,
  calculateCAEGCIE,
  calculateFOICCIE,
  calculateYogaCIE,
  calculateMathsCIE,
  calculateKannadaCIE,
  calculateFinalScore, 
  getGradeDetails, 
  checkPassStatus,
  calculateRequiredSEE
} from '../lib/calculator';
import DetailedCIECalculator from './DetailedCIECalculator';

export default function CourseCard({ id, onUpdate, onRemove, initialCourseData }) {
  const [cieMarks, setCieMarks] = useState(initialCourseData.cieMarks || {});
  const [seeMarks, setSeeMarks] = useState(initialCourseData.seeMarks || {});
  
  // Use ref to store the previous results to avoid infinite loops
  const prevResultsRef = useRef();

  const courseDetails = initialCourseData.courseDetails;
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
    } else if (courseDetails.type === 'English') {
        totalCie = calculateEnglishCIE(cieMarks);
        passCheckMarks = { totalCie, see: seeMarks.see };
        finalScore = calculateFinalScore(totalCie, seeMarks.see || 0, courseDetails.cieMax, courseDetails.seeMax);
    } else if (courseDetails.type === 'CAEG') {
        totalCie = calculateCAEGCIE(cieMarks);
        passCheckMarks = { totalCie, see: seeMarks.see };
        finalScore = calculateFinalScore(totalCie, seeMarks.see || 0, courseDetails.cieMax, courseDetails.seeMax);
    } else if (courseDetails.type === 'FOIC') {
        totalCie = calculateFOICCIE(cieMarks);
        passCheckMarks = { totalCie, see: seeMarks.see };
        finalScore = calculateFinalScore(totalCie, seeMarks.see || 0, courseDetails.cieMax, courseDetails.seeMax);
    } else if (courseDetails.type === 'Yoga') {
        totalCie = calculateYogaCIE(cieMarks);
        passCheckMarks = { totalCie, see: seeMarks.see };
        finalScore = calculateFinalScore(totalCie, seeMarks.see || 0, courseDetails.cieMax, courseDetails.seeMax);
    } else if (courseDetails.type === 'Maths') {
        totalCie = calculateMathsCIE(cieMarks);
        passCheckMarks = { totalCie, see: seeMarks.see };
        finalScore = calculateFinalScore(totalCie, seeMarks.see || 0, courseDetails.cieMax, courseDetails.seeMax);
    } else if (courseDetails.type === 'Kannada') {
        totalCie = calculateKannadaCIE(cieMarks);
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
    <div className="group relative overflow-hidden rounded-2xl transition-all duration-300 hover:scale-[1.02]">
      {/* Gradient border effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 via-blue-500/20 to-pink-500/20 rounded-2xl blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      
      <div className="relative bg-gradient-to-br from-gray-800/90 to-gray-900/90 backdrop-blur-xl border border-gray-700/50 p-6 rounded-2xl shadow-2xl">
        {/* Course Header */}
        <div className="mb-6">
          <div className="flex justify-between items-start">
            <div className="flex-grow">
              <h3 className="text-xl font-bold text-white mb-2">{courseDetails.code}</h3>
              <p className="text-gray-400 mb-3">{courseDetails.title}</p>
              <div className="flex gap-3">
                <span className="px-3 py-1 rounded-full bg-blue-500/20 border border-blue-500/30 text-xs font-medium text-blue-300">
                  Credits: {courseDetails.credits}
                </span>
                <span className="px-3 py-1 rounded-full bg-purple-500/20 border border-purple-500/30 text-xs font-medium text-purple-300">
                  {courseDetails.type}
                </span>
              </div>
            </div>
          </div>
        </div>

      <>
          <DetailedCIECalculator courseType={courseDetails.type} cieMarks={cieMarks} handleMarkChange={handleCieMarkChange} />
          
          {/* Show required SEE marks if CIE is entered but SEE is not */}
          {results.totalCie > 0 && !isEffectivelyIntegrated && (
            <RequiredSEEDisplay 
              totalCie={parseFloat(results.totalCie)} 
              cieMax={courseDetails.cieMax} 
              seeMax={courseDetails.seeMax}
              hasSeeMarks={seeMarks.see !== undefined && seeMarks.see !== null && seeMarks.see !== ''}
            />
          )}
          
          <div className="p-5 mt-4 bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-xl border border-gray-700/50">
            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <svg className="w-5 h-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
              </svg>
              Semester End Examination (SEE)
            </h3>
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
          
          {/* Results Display - Redesigned */}
          <div className="mt-6 relative overflow-hidden rounded-xl">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 to-purple-600/10"></div>
            <div className="relative backdrop-blur-sm bg-gray-900/50 border border-gray-700/50 p-6">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <svg className="w-5 h-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Results Summary
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <ResultDisplay label="Status" value={results.isPass ? 'Pass ✓' : 'Fail ✗'} color={results.isPass ? 'text-green-400' : 'text-red-400'} />
                <ResultDisplay label="Total CIE" value={results.totalCie || '0.00'} color="text-cyan-400" />
                <ResultDisplay label="Final Score" value={results.score + '%'} color="text-blue-400" />
                <ResultDisplay label="Grade" value={results.grade} color="text-purple-400" />
                <ResultDisplay label="Points" value={results.points} color="text-yellow-400" />
              </div>
            </div>
          </div>
        </>
      </div>
    </div>
  );
}

const InputField = ({ name, label, placeholder, value, onChange }) => (
    <div className="group">
        <label className="block text-sm font-medium text-gray-400 mb-2 group-focus-within:text-blue-400 transition-colors duration-200">{label}</label>
        <input 
            type="number" 
            name={name} 
            placeholder={placeholder} 
            value={value || ''} 
            onChange={onChange} 
            className="w-full p-3 bg-gray-900/50 border border-gray-600/50 rounded-xl text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all duration-300 hover:border-blue-500/30" 
        />
    </div>
);

const ResultDisplay = ({ label, value, color }) => (
    <div className="text-center p-3 rounded-lg bg-gray-800/30 border border-gray-700/30 hover:border-gray-600/50 transition-all duration-300">
        <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">{label}</p>
        <p className={`font-bold text-xl ${color} drop-shadow-lg`}>{value ?? '-'}</p>
    </div>
);

const RequiredSEEDisplay = ({ totalCie, cieMax, seeMax, hasSeeMarks }) => {
    if (hasSeeMarks) return null; // Don't show if SEE marks are already entered
    
    const requiredSEE = calculateRequiredSEE(totalCie, cieMax, seeMax);
    if (!requiredSEE) return null;
    
    return (
        <div className="p-5 mt-4 relative overflow-hidden rounded-xl border border-purple-500/30">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-900/30 to-blue-900/30"></div>
            <div className="relative">
                <h3 className="text-lg font-bold text-purple-300 mb-4 flex items-center gap-2">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
                    </svg>
                    Required SEE Marks for Grades
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {Object.entries(requiredSEE).map(([grade, info]) => (
                        <div key={grade} className={`p-3 rounded-lg backdrop-blur-sm transition-all duration-300 hover:scale-105 ${info.achievable ? 'bg-gray-800/50 border border-green-500/30' : 'bg-red-900/20 border border-red-500/30'}`}>
                            <div className="text-center">
                                <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Grade {grade}</p>
                                <p className={`font-bold text-2xl ${info.achievable ? 'text-green-400' : 'text-red-400'} drop-shadow-lg`}>
                                    {info.required}
                                </p>
                                <p className="text-xs text-gray-500 mt-1">out of {seeMax}</p>
                                {info.note && <p className="text-xs text-gray-500 mt-1 italic">{info.note}</p>}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};
