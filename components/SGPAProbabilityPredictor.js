// components/SGPAProbabilityPredictor.js
import { useMemo } from 'react';
import { calculateSGPAProbabilities, getRecommendation } from '../lib/probability';

export default function SGPAProbabilityPredictor({ courses }) {
  const probabilityData = useMemo(() => {
    return calculateSGPAProbabilities(courses);
  }, [courses]);

  const recommendation = useMemo(() => {
    return getRecommendation(probabilityData);
  }, [probabilityData]);

  if (!probabilityData) {
    return (
      <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-6 mb-8">
        <div className="flex items-center gap-3 mb-4">
          <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          <h3 className="text-xl font-bold text-white">SGPA Probability Predictor</h3>
        </div>
        <p className="text-gray-400 text-sm">
          Enter your CIE marks in the courses below to see your SGPA predictions and study recommendations.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 mb-8">
      {/* Recommendation Card */}
      <div className={`relative overflow-hidden rounded-2xl shadow-lg ${
        recommendation.type === 'success' ? 'bg-gradient-to-br from-green-600/20 to-emerald-600/20 border border-green-500/30' :
        recommendation.type === 'warning' ? 'bg-gradient-to-br from-yellow-600/20 to-orange-600/20 border border-yellow-500/30' :
        'bg-gradient-to-br from-blue-600/20 to-purple-600/20 border border-blue-500/30'
      }`}>
        <div className="p-6">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0">
              {recommendation.type === 'success' ? (
                <svg className="w-8 h-8 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              ) : recommendation.type === 'warning' ? (
                <svg className="w-8 h-8 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg className="w-8 h-8 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              )}
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-bold text-white mb-2">{recommendation.title}</h3>
              <p className="text-gray-300">{recommendation.message}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Probability Distribution */}
      <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            <h3 className="text-xl font-bold text-white">SGPA Probability Analysis</h3>
          </div>
          <div className="text-sm text-gray-400">
            {probabilityData.coursesAnalyzed}/{probabilityData.totalCourses} courses analyzed
          </div>
        </div>

        <div className="space-y-4">
          {probabilityData.targets.map((target, index) => (
            <div
              key={index}
              className="relative overflow-hidden bg-gray-800/50 rounded-xl p-4 border border-gray-700/50 hover:border-purple-500/50 transition-colors"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                {/* Left side - Target info */}
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="flex items-center gap-2">
                      <span className={`text-lg font-bold ${
                        target.probability >= 70 ? 'text-green-400' :
                        target.probability >= 50 ? 'text-yellow-400' :
                        target.probability >= 30 ? 'text-orange-400' :
                        'text-red-400'
                      }`}>
                        {target.label}
                      </span>
                      {index === 0 && (
                        <span className="px-2 py-1 bg-purple-500/20 text-purple-300 rounded-full text-xs font-semibold">
                          Most Likely
                        </span>
                      )}
                      {!target.achievable && (
                        <span className="px-2 py-1 bg-red-500/20 text-red-300 rounded-full text-xs font-semibold">
                          Very Difficult
                        </span>
                      )}
                    </div>
                  </div>
                  <p className="text-sm text-gray-400 mb-2">{target.description}</p>
                  <p className="text-xs text-gray-500">{target.effortLevel}</p>
                </div>

                {/* Right side - Probability */}
                <div className="flex items-center gap-4">
                  <div className="flex flex-col items-end">
                    <div className="flex items-baseline gap-1">
                      <span className={`text-3xl font-bold ${
                        target.probability >= 70 ? 'text-green-400' :
                        target.probability >= 50 ? 'text-yellow-400' :
                        target.probability >= 30 ? 'text-orange-400' :
                        'text-red-400'
                      }`}>
                        {target.probability}
                      </span>
                      <span className="text-sm text-gray-400">%</span>
                    </div>
                    <span className="text-xs text-gray-500">Probability</span>
                  </div>
                  
                  <div className="flex flex-col items-center bg-gray-900/50 rounded-lg px-3 py-2">
                    <svg className="w-5 h-5 text-purple-400 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="text-sm font-semibold text-white">{target.studyHoursEstimate}h</span>
                    <span className="text-xs text-gray-500">Study</span>
                  </div>
                </div>
              </div>

              {/* Progress bar */}
              <div className="mt-3 h-2 bg-gray-700 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-500 ${
                    target.probability >= 70 ? 'bg-gradient-to-r from-green-500 to-emerald-500' :
                    target.probability >= 50 ? 'bg-gradient-to-r from-yellow-500 to-orange-500' :
                    target.probability >= 30 ? 'bg-gradient-to-r from-orange-500 to-red-500' :
                    'bg-gradient-to-r from-red-500 to-red-700'
                  }`}
                  style={{ width: `${target.probability}%` }}
                />
              </div>
            </div>
          ))}
        </div>

        {/* Legend */}
        <div className="mt-6 pt-6 border-t border-gray-700">
          <div className="flex flex-wrap gap-4 text-xs text-gray-400">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span>70%+ High Probability</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
              <span>50-70% Moderate Probability</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
              <span>30-50% Low Probability</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              <span>&lt;30% Very Low Probability</span>
            </div>
          </div>
        </div>
      </div>

      {/* Study Tips */}
      <div className="bg-gradient-to-br from-purple-600/10 to-blue-600/10 backdrop-blur-xl border border-purple-500/30 rounded-2xl p-6">
        <h4 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
          Study Tips
        </h4>
        <ul className="space-y-2 text-sm text-gray-300">
          <li className="flex items-start gap-2">
            <span className="text-purple-400 flex-shrink-0 mt-1">•</span>
            <span>Focus on understanding concepts rather than rote memorization</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-purple-400 flex-shrink-0 mt-1">•</span>
            <span>Practice previous year questions and sample papers</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-purple-400 flex-shrink-0 mt-1">•</span>
            <span>Create a study schedule and stick to it consistently</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-purple-400 flex-shrink-0 mt-1">•</span>
            <span>Take regular breaks to maintain focus and avoid burnout</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-purple-400 flex-shrink-0 mt-1">•</span>
            <span>Form study groups to discuss and clarify doubts</span>
          </li>
        </ul>
      </div>
    </div>
  );
}
