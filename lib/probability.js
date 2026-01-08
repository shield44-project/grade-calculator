// lib/probability.js
import { calculateSGPA, getGradeDetails, calculateFinalScore, checkPassStatus } from './calculator';

/**
 * Calculate SGPA probabilities based on current CIE marks
 * @param {Array} courses - Array of course data with CIE marks entered
 * @returns {Object} Probability data for different SGPA levels
 */
export function calculateSGPAProbabilities(courses) {
  // Filter courses that have CIE data entered
  const coursesWithCIE = courses.filter(course => {
    const hasCIE = course.cieMarks && Object.keys(course.cieMarks).length > 0;
    return hasCIE && course.courseDetails;
  });

  if (coursesWithCIE.length === 0) {
    return null; // No CIE data entered yet
  }

  // Define SGPA targets to analyze
  const sgpaTargets = [
    { label: '8.0+ SGPA', value: 8.0, description: 'Good Performance' },
    { label: '8.5+ SGPA', value: 8.5, description: 'Very Good Performance' },
    { label: '9.0+ SGPA', value: 9.0, description: 'Excellent Performance' },
    { label: '9.15+ SGPA', value: 9.15, description: 'Outstanding Performance' },
    { label: '9.45+ SGPA', value: 9.45, description: 'Exceptional Performance' },
    { label: '9.75+ SGPA', value: 9.75, description: 'Near Perfect Performance' },
    { label: '10.0 SGPA', value: 10.0, description: 'Perfect Score' }
  ];

  const results = [];
  const totalCredits = courses.reduce((sum, c) => sum + (c.courseDetails?.credits || 0), 0);

  for (const target of sgpaTargets) {
    const analysis = analyzeSGPATarget(courses, target.value, totalCredits);
    results.push({
      ...target,
      ...analysis
    });
  }

  // Sort by probability (highest first)
  results.sort((a, b) => b.probability - a.probability);

  return {
    targets: results,
    highestProbable: results[0],
    lowestAchievable: results.find(r => r.achievable) || results[results.length - 1],
    coursesAnalyzed: coursesWithCIE.length,
    totalCourses: courses.length
  };
}

/**
 * Analyze if a specific SGPA target is achievable
 */
function analyzeSGPATarget(courses, targetSGPA, totalCredits) {
  // Calculate total weighted points needed for target SGPA
  const requiredWeightedPoints = targetSGPA * totalCredits;

  // For each course, calculate the required grade points
  let achievableScenarios = 0;
  let totalScenarios = 0;
  let requiredEffort = 0;
  const courseRequirements = [];

  courses.forEach(course => {
    if (!course.courseDetails) return;

    const credits = course.courseDetails.credits;
    const cieMax = course.courseDetails.cieMax;
    const seeMax = course.courseDetails.seeMax;

    // Get current CIE marks
    const cieMarks = course.results?.totalCie || 0;

    // Calculate what's needed in SEE
    const seeAnalysis = analyzeRequiredSEE(
      cieMarks,
      cieMax,
      seeMax,
      targetSGPA,
      course.courseDetails
    );

    courseRequirements.push({
      courseCode: course.courseDetails.code,
      courseTitle: course.courseDetails.title,
      currentCIE: cieMarks,
      requiredSEE: seeAnalysis.requiredSEE,
      requiredGrade: seeAnalysis.requiredGrade,
      difficulty: seeAnalysis.difficulty
    });

    // Update effort and achievability
    if (seeAnalysis.achievable) {
      achievableScenarios++;
      requiredEffort += seeAnalysis.effortLevel;
    }
    totalScenarios++;
  });

  const probability = totalScenarios > 0 ? (achievableScenarios / totalScenarios) * 100 : 0;
  const averageEffort = totalScenarios > 0 ? requiredEffort / totalScenarios : 0;

  return {
    achievable: achievableScenarios === totalScenarios,
    probability: Math.round(probability),
    effortLevel: getEffortDescription(averageEffort),
    effortScore: averageEffort,
    requiredWeightedPoints,
    courseRequirements,
    studyHoursEstimate: estimateStudyHours(averageEffort, courses.length)
  };
}

/**
 * Analyze required SEE marks for a specific grade target
 */
function analyzeRequiredSEE(cieMarks, cieMax, seeMax, targetSGPA, courseDetails) {
  // Determine required grade points for target SGPA
  // For simplicity, we'll aim for grade that gives us >= target
  const gradePointsNeeded = Math.ceil(targetSGPA);

  // Map grade points to grades
  const gradeMap = {
    10: { grade: 'O', minScore: 90 },
    9: { grade: 'A+', minScore: 80 },
    8: { grade: 'A', minScore: 70 },
    7: { grade: 'B+', minScore: 60 },
    6: { grade: 'B', minScore: 50 },
    5: { grade: 'C', minScore: 40 }
  };

  const targetGrade = gradeMap[gradePointsNeeded] || gradeMap[10];
  const requiredFinalScore = targetGrade.minScore;

  // Calculate required SEE marks
  // finalScore = (CIE/cieMax * 50) + (SEE/seeMax * 50)
  const weightedCIE = (cieMarks / cieMax) * 50;
  const requiredWeightedSEE = requiredFinalScore - weightedCIE;
  const requiredSEE = (requiredWeightedSEE * seeMax) / 50;

  // Check if achievable (must be >= 35% and <= 100%)
  const minSEE = seeMax * 0.35;
  const achievable = requiredSEE >= minSEE && requiredSEE <= seeMax;

  // Calculate difficulty/effort level (0-100)
  const seePercentageNeeded = (requiredSEE / seeMax) * 100;
  let effortLevel = 0;
  if (seePercentageNeeded < 35) effortLevel = 10; // Very easy
  else if (seePercentageNeeded < 50) effortLevel = 30; // Easy
  else if (seePercentageNeeded < 70) effortLevel = 50; // Moderate
  else if (seePercentageNeeded < 85) effortLevel = 70; // Hard
  else if (seePercentageNeeded < 95) effortLevel = 85; // Very hard
  else effortLevel = 100; // Extremely hard

  return {
    requiredSEE: Math.ceil(Math.max(minSEE, Math.min(seeMax, requiredSEE))),
    requiredGrade: targetGrade.grade,
    achievable,
    difficulty: seePercentageNeeded > 100 ? 'Impossible' : 
                seePercentageNeeded > 90 ? 'Very Hard' :
                seePercentageNeeded > 75 ? 'Hard' :
                seePercentageNeeded > 60 ? 'Moderate' :
                seePercentageNeeded > 45 ? 'Easy' : 'Very Easy',
    effortLevel
  };
}

/**
 * Get effort description based on effort score
 */
function getEffortDescription(effortScore) {
  if (effortScore < 20) return 'Minimal effort - Already well positioned';
  if (effortScore < 40) return 'Light study - Regular revision should suffice';
  if (effortScore < 60) return 'Moderate effort - Consistent study needed';
  if (effortScore < 75) return 'High effort - Intensive study required';
  if (effortScore < 90) return 'Very high effort - Extensive preparation needed';
  return 'Maximum effort - Requires exceptional preparation';
}

/**
 * Estimate study hours needed based on effort level
 */
function estimateStudyHours(effortScore, numCourses) {
  // Base hours per course
  const baseHours = 10;
  const effortMultiplier = effortScore / 50; // 0.2 to 2.0
  const totalHours = Math.round(baseHours * effortMultiplier * numCourses);
  
  return totalHours;
}

/**
 * Get recommendation based on current CIE performance
 */
export function getRecommendation(probabilityData) {
  if (!probabilityData || !probabilityData.highestProbable) {
    return {
      title: 'Enter CIE Marks First',
      message: 'Start entering your CIE marks to see SGPA predictions and recommendations.',
      type: 'info'
    };
  }

  const highest = probabilityData.highestProbable;
  
  if (highest.value >= 9.5 && highest.probability >= 70) {
    return {
      title: 'Excellent Position! 🌟',
      message: `You're on track for an outstanding ${highest.label}! Keep up the great work and maintain your study routine.`,
      type: 'success'
    };
  } else if (highest.value >= 9.0 && highest.probability >= 60) {
    return {
      title: 'Great Performance! 🎯',
      message: `You have a good chance at ${highest.label}. ${highest.effortLevel} to maintain this trajectory.`,
      type: 'success'
    };
  } else if (highest.value >= 8.0 && highest.probability >= 50) {
    return {
      title: 'Good Progress 📈',
      message: `${highest.label} is achievable. ${highest.effortLevel} for better results.`,
      type: 'info'
    };
  } else {
    return {
      title: 'Focus Required ⚠️',
      message: `Reaching ${highest.label} will require ${highest.effortLevel}. Stay committed and you can do it!`,
      type: 'warning'
    };
  }
}
