// components/SGPAProbabilityPredictor.js
import { useMemo, useState } from 'react';
import { calculateSGPAProbabilities, getRecommendation } from '../lib/probability';

export default function SGPAProbabilityPredictor({ courses }) {
  const [isExpanded, setIsExpanded] = useState(false);

  const probabilityData = useMemo(() => {
    return calculateSGPAProbabilities(courses);
  }, [courses]);

  const recommendation = useMemo(() => {
    return getRecommendation(probabilityData);
  }, [probabilityData]);

  const topTarget = probabilityData?.targets?.[0];

  return (
    <div className="mb-8">
      {/* Toggle Header */}
      <button
        onClick={() => setIsExpanded(prev => !prev)}
        className="w-full text-left rounded-2xl p-5 transition-all duration-200 group"
        style={{
          background: 'rgba(255,255,255,0.04)',
          border: isExpanded ? '1px solid rgba(0,229,255,0.35)' : '1px solid rgba(255,255,255,0.08)',
          boxShadow: isExpanded ? '0 0 20px rgba(0,229,255,0.15)' : 'none',
        }}
        aria-expanded={isExpanded}
      >
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div
              className="p-2 rounded-xl"
              style={{ background: 'rgba(0,229,255,0.12)', border: '1px solid rgba(0,229,255,0.25)' }}
            >
              <svg className="w-5 h-5 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <div>
              <h3 className="text-base font-bold text-white">SGPA Probability Predictor</h3>
              {!probabilityData ? (
                <p className="text-xs text-gray-500 mt-0.5">Enter CIE marks to see predictions</p>
              ) : topTarget ? (
                <p className="text-xs text-gray-400 mt-0.5">
                  Most likely: <span className={`font-semibold ${
                    topTarget.probability >= 70 ? 'text-green-400' :
                    topTarget.probability >= 50 ? 'text-yellow-400' :
                    'text-orange-400'
                  }`}>{topTarget.label}</span>
                  {' '}at{' '}
                  <span className={`font-semibold ${
                    topTarget.probability >= 70 ? 'text-green-400' :
                    topTarget.probability >= 50 ? 'text-yellow-400' :
                    'text-orange-400'
                  }`}>{topTarget.probability}%</span> probability
                </p>
              ) : null}
            </div>
          </div>
          <div className="flex items-center gap-3 flex-shrink-0">
            {probabilityData && (
              <span
                className="hidden sm:inline-flex text-xs text-gray-500 px-2 py-1 rounded-lg"
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
              >
                {probabilityData.coursesAnalyzed}/{probabilityData.totalCourses} analyzed
              </span>
            )}
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 ${isExpanded ? 'text-cyan-400' : 'text-gray-400 group-hover:text-cyan-400'}`}
              style={{
                background: isExpanded ? 'rgba(0,229,255,0.15)' : 'rgba(255,255,255,0.05)',
                border: isExpanded ? '1px solid rgba(0,229,255,0.35)' : '1px solid rgba(255,255,255,0.1)',
              }}
            >
              <svg
                className={`w-4 h-4 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </div>
      </button>

      {/* Expandable Content */}
      {isExpanded && (
        <div className="mt-3 space-y-4 animate-fadeIn">
          {!probabilityData ? (
            <div
              className="rounded-2xl p-6"
              style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}
            >
              <p className="text-gray-400 text-sm text-center">
                Enter your CIE marks in the courses above to see your SGPA predictions and study recommendations.
              </p>
            </div>
          ) : (
            <>
              {/* Recommendation Card */}
              <div
                className="relative overflow-hidden rounded-2xl"
                style={{
                  background: recommendation.type === 'success'
                    ? 'rgba(16,185,129,0.08)'
                    : recommendation.type === 'warning'
                    ? 'rgba(245,158,11,0.08)'
                    : 'rgba(6,182,212,0.08)',
                  border: recommendation.type === 'success'
                    ? '1px solid rgba(16,185,129,0.25)'
                    : recommendation.type === 'warning'
                    ? '1px solid rgba(245,158,11,0.25)'
                    : '1px solid rgba(6,182,212,0.25)',
                }}
              >
                <div className="p-5">
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 mt-0.5">
                      {recommendation.type === 'success' ? (
                        <svg className="w-6 h-6 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                      ) : recommendation.type === 'warning' ? (
                        <svg className="w-6 h-6 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                      ) : (
                        <svg className="w-6 h-6 text-cyan-400" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                        </svg>
                      )}
                    </div>
                    <div>
                      <h4 className="font-bold text-white mb-1">{recommendation.title}</h4>
                      <p className="text-sm text-gray-300">{recommendation.message}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Probability Distribution */}
              <div
                className="rounded-2xl p-5"
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
              >
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-bold text-white text-sm">SGPA Probability Breakdown</h4>
                  <span className="text-xs text-gray-500">{probabilityData.coursesAnalyzed}/{probabilityData.totalCourses} courses</span>
                </div>

                <div className="space-y-3">
                  {probabilityData.targets.map((target, index) => (
                    <div
                      key={index}
                      className="rounded-xl p-3"
                      style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}
                    >
                      <div className="flex items-center justify-between gap-3 mb-2">
                        <div className="flex items-center gap-2 min-w-0">
                          <span className={`font-bold text-sm ${
                            target.probability >= 70 ? 'text-green-400' :
                            target.probability >= 50 ? 'text-yellow-400' :
                            target.probability >= 30 ? 'text-orange-400' :
                            'text-red-400'
                          }`}>{target.label}</span>
                          {index === 0 && (
                            <span
                              className="px-1.5 py-0.5 text-cyan-300 rounded text-xs"
                              style={{ background: 'rgba(0,229,255,0.15)', border: '1px solid rgba(0,229,255,0.2)' }}
                            >
                              Top
                            </span>
                          )}
                          {!target.achievable && (
                            <span
                              className="px-1.5 py-0.5 text-red-300 rounded text-xs"
                              style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)' }}
                            >
                              Hard
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <span className={`text-xl font-bold ${
                            target.probability >= 70 ? 'text-green-400' :
                            target.probability >= 50 ? 'text-yellow-400' :
                            target.probability >= 30 ? 'text-orange-400' :
                            'text-red-400'
                          }`}>{target.probability}%</span>
                          <span
                            className="text-xs text-gray-500 px-2 py-1 rounded-lg"
                            style={{ background: 'rgba(0,0,0,0.3)' }}
                          >
                            {target.studyHoursEstimate}h
                          </span>
                        </div>
                      </div>
                      <p className="text-xs text-gray-500 mb-2">{target.effortLevel}</p>
                      <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.07)' }}>
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            target.probability >= 70 ? 'bg-gradient-to-r from-green-500 to-emerald-400' :
                            target.probability >= 50 ? 'bg-gradient-to-r from-yellow-500 to-amber-400' :
                            target.probability >= 30 ? 'bg-gradient-to-r from-orange-500 to-amber-500' :
                            'bg-gradient-to-r from-red-600 to-red-400'
                          }`}
                          style={{ width: `${target.probability}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-4 pt-4 flex flex-wrap gap-3 text-xs text-gray-500" style={{ borderTop: '1px solid rgba(255,255,255,0.07)' }}>
                  <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-green-500 inline-block"></span>70%+ High</span>
                  <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-yellow-500 inline-block"></span>50-70% Moderate</span>
                  <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-orange-500 inline-block"></span>30-50% Low</span>
                  <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-red-500 inline-block"></span>&lt;30% Very Low</span>
                </div>
              </div>

              {/* Study Tips */}
              <div
                className="rounded-2xl p-5"
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
              >
                <h4 className="font-bold text-white text-sm mb-3 flex items-center gap-2">
                  <svg className="w-4 h-4 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                  Quick Study Tips
                </h4>
                <ul className="space-y-1.5 text-sm text-gray-400">
                  {[
                    'Focus on understanding concepts, not rote memorization',
                    'Practice previous year questions and sample papers',
                    'Keep a consistent study schedule and take short breaks',
                    'Form study groups to discuss and clarify doubts',
                  ].map((tip, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-cyan-400 flex-shrink-0 mt-0.5">›</span>
                      <span>{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
