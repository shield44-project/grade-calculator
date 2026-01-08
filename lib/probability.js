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
  let totalCIEQuality = 0;
  let totalDifficultyScore = 0;
  const courseRequirements = [];

  courses.forEach(course => {
    if (!course.courseDetails) return;

    const credits = course.courseDetails.credits;
    const cieMax = course.courseDetails.cieMax;
    const seeMax = course.courseDetails.seeMax;

    // Get current CIE marks
    const cieMarks = course.results?.totalCie || 0;

    // Calculate CIE quality (how good the CIE score is)
    const ciePercentage = (cieMarks / cieMax) * 100;
    totalCIEQuality += ciePercentage;

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
    totalDifficultyScore += seeAnalysis.effortLevel;
    totalScenarios++;
  });

  const averageCIEQuality = totalScenarios > 0 ? totalCIEQuality / totalScenarios : 0;
  const averageDifficulty = totalScenarios > 0 ? totalDifficultyScore / totalScenarios : 0;
  const averageEffort = totalScenarios > 0 ? requiredEffort / totalScenarios : 0;

  // Calculate advanced probability using multiple factors
  const probability = calculateAdvancedProbability(
    achievableScenarios,
    totalScenarios,
    averageCIEQuality,
    averageDifficulty,
    targetSGPA
  );

  return {
    achievable: achievableScenarios === totalScenarios,
    probability,
    effortLevel: getEffortDescription(averageEffort),
    effortScore: averageEffort,
    requiredWeightedPoints,
    courseRequirements,
    studyHoursEstimate: estimateStudyHours(averageEffort, courses.length)
  };
}

/**
 * Calculate advanced probability using multiple factors
 * This provides more realistic probabilities based on:
 * - Basic achievability
 * - CIE score quality
 * - Required difficulty/effort
 * - Target SGPA level
 */
function calculateAdvancedProbability(
  achievableScenarios,
  totalScenarios,
  averageCIEQuality,
  averageDifficulty,
  targetSGPA
) {
  if (totalScenarios === 0) return 0;

  // Base probability from achievability (0-100)
  const baseProbability = (achievableScenarios / totalScenarios) * 100;

  // If not all scenarios are achievable, significantly reduce probability
  // Cap at 25% and apply 0.6 multiplier to base probability
  if (achievableScenarios < totalScenarios) {
    return Math.round(Math.min(baseProbability * 0.6, 25));
  }

  // CIE Quality Factor (0-1)
  // Higher CIE scores increase probability
  // 90%+ CIE = 1.0, 80%+ = 0.9, 70%+ = 0.8, etc.
  let cieQualityFactor;
  if (averageCIEQuality >= 90) cieQualityFactor = 1.0;
  else if (averageCIEQuality >= 85) cieQualityFactor = 0.95;
  else if (averageCIEQuality >= 80) cieQualityFactor = 0.9;
  else if (averageCIEQuality >= 75) cieQualityFactor = 0.85;
  else if (averageCIEQuality >= 70) cieQualityFactor = 0.8;
  else if (averageCIEQuality >= 65) cieQualityFactor = 0.75;
  else if (averageCIEQuality >= 60) cieQualityFactor = 0.7;
  else if (averageCIEQuality >= 55) cieQualityFactor = 0.65;
  else if (averageCIEQuality >= 50) cieQualityFactor = 0.6;
  else cieQualityFactor = 0.5;

  // Difficulty Factor (0-1)
  // Lower difficulty (easier to achieve) increases probability
  // Effort: 0-20 = 0.95, 20-40 = 0.85, 40-60 = 0.75, 60-80 = 0.65, 80-100 = 0.5
  let difficultyFactor;
  if (averageDifficulty < 20) difficultyFactor = 0.95;
  else if (averageDifficulty < 40) difficultyFactor = 0.85;
  else if (averageDifficulty < 60) difficultyFactor = 0.75;
  else if (averageDifficulty < 80) difficultyFactor = 0.65;
  else difficultyFactor = 0.5;

  // Target SGPA Factor (0-1)
  // Higher targets are naturally harder to achieve
  // 10.0 = 0.5, 9.75+ = 0.6, 9.45+ = 0.7, 9.15+ = 0.75, 9.0+ = 0.8, 8.5+ = 0.85, 8.0+ = 0.9
  let targetFactor;
  if (targetSGPA >= 10.0) targetFactor = 0.5;
  else if (targetSGPA >= 9.75) targetFactor = 0.6;
  else if (targetSGPA >= 9.45) targetFactor = 0.7;
  else if (targetSGPA >= 9.15) targetFactor = 0.75;
  else if (targetSGPA >= 9.0) targetFactor = 0.8;
  else if (targetSGPA >= 8.5) targetFactor = 0.85;
  else if (targetSGPA >= 8.0) targetFactor = 0.9;
  else targetFactor = 0.95;

  // Bonus for exceptional CIE scores targeting high SGPA
  // Students with 85%+ CIE get additional probability boost for 9+ SGPA targets
  let bonusFactor = 0;
  if (averageCIEQuality >= 85 && targetSGPA >= 9.0) {
    // Very good CIE scores targeting 9+ SGPA get a bonus
    // Scales from 0% (at 85% CIE) to 10% (at 100% CIE)
    bonusFactor = Math.min((averageCIEQuality - 85) / 15 * 10, 10); // Up to +10%
  }

  // Calculate final probability
  // Formula: base * CIE quality * difficulty * target - with realistic caps
  let finalProbability = baseProbability * cieQualityFactor * difficultyFactor * targetFactor + bonusFactor;

  // Apply realistic caps based on target SGPA
  // Even with perfect CIE, high SGPAs should not show 100%
  let maxProbability;
  if (targetSGPA >= 10.0) maxProbability = 85; // Perfect score is very rare
  else if (targetSGPA >= 9.75) maxProbability = 90;
  else if (targetSGPA >= 9.45) maxProbability = 92;
  else if (targetSGPA >= 9.15) maxProbability = 94;
  else if (targetSGPA >= 9.0) maxProbability = 95;
  else if (targetSGPA >= 8.5) maxProbability = 97;
  else maxProbability = 98;

  // Special boost for very good CIE scores (85%+) targeting 9.0-9.5 SGPA
  // This ensures high-performing students see encouraging probabilities for excellent grades
  if (averageCIEQuality >= 85 && targetSGPA >= 9.0 && targetSGPA <= 9.5) {
    finalProbability = Math.max(finalProbability, 75); // Ensure at least 75% for good students
  }

  finalProbability = Math.min(finalProbability, maxProbability);

  return Math.round(finalProbability);
}

/**
 * Analyze required SEE marks for a specific grade target
 */
function analyzeRequiredSEE(cieMarks, cieMax, seeMax, targetSGPA, courseDetails) {
  // Map SGPA ranges to grade requirements
  // Use the minimum score needed for the SGPA target
  let targetGrade;
  if (targetSGPA >= 9.75) {
    targetGrade = { grade: 'O', minScore: 90 };
  } else if (targetSGPA >= 9.0) {
    targetGrade = { grade: 'A+', minScore: 80 };
  } else if (targetSGPA >= 8.0) {
    targetGrade = { grade: 'A', minScore: 70 };
  } else if (targetSGPA >= 7.0) {
    targetGrade = { grade: 'B+', minScore: 60 };
  } else if (targetSGPA >= 6.0) {
    targetGrade = { grade: 'B', minScore: 50 };
  } else {
    targetGrade = { grade: 'C', minScore: 40 };
  }
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
