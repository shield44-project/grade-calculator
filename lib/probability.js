// lib/probability.js
import { calculateSGPA, getGradeDetails, calculateFinalScore, checkPassStatus } from './calculator';

// Constants for effort level thresholds (percentage of SEE marks needed)
const EFFORT_THRESHOLDS = {
  ALREADY_SECURED: 35,
  VERY_EASY: 45,
  EASY: 55,
  MODERATE_EASY: 65,
  MODERATE: 75,
  HARD: 85,
  VERY_HARD: 95
};

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

  // For each course, calculate possible grades and their likelihood
  let currentWeightedPoints = 0; // Points already secured from courses with SEE marks
  let remainingCredits = 0; // Credits for courses without SEE marks
  let totalCIEQuality = 0;
  let totalDifficultyScore = 0;
  let coursesCount = 0;
  const courseRequirements = [];

  // First, account for courses that already have SEE marks
  courses.forEach(course => {
    if (!course.courseDetails) return;
    
    const credits = course.courseDetails.credits;
    const cieMax = course.courseDetails.cieMax;
    const seeMax = course.courseDetails.seeMax;
    const cieMarks = course.results?.totalCie || 0;
    
    coursesCount++;
    const ciePercentage = (cieMarks / cieMax) * 100;
    totalCIEQuality += ciePercentage;
    
    // If course has SEE marks, calculate its contribution
    if (course.results?.see !== undefined && course.results?.see !== null) {
      const finalScore = calculateFinalScore(cieMarks, course.results.see, cieMax, seeMax);
      const isPass = checkPassStatus(course.courseDetails, {
        totalCie: cieMarks,
        see: course.results.see
      });
      const gradeDetails = getGradeDetails(finalScore, isPass);
      currentWeightedPoints += gradeDetails.points * credits;
    } else {
      // Course needs SEE prediction
      remainingCredits += credits;
    }
  });

  // Calculate what we need from remaining courses
  const neededPoints = requiredWeightedPoints - currentWeightedPoints;
  const neededAvgGradePoints = remainingCredits > 0 ? neededPoints / remainingCredits : 0;

  // Now analyze each course without SEE to see what's needed
  let totalEffortScore = 0;
  let achievableCourses = 0;
  let totalCoursesNeedingSEE = 0;

  courses.forEach(course => {
    if (!course.courseDetails) return;
    
    // Skip courses that already have SEE marks
    if (course.results?.see !== undefined && course.results?.see !== null) {
      return;
    }
    
    totalCoursesNeedingSEE++;
    
    const credits = course.courseDetails.credits;
    const cieMax = course.courseDetails.cieMax;
    const seeMax = course.courseDetails.seeMax;
    const cieMarks = course.results?.totalCie || 0;

    // Determine what grade is needed from this course
    // Use the needed average as the target
    const seeAnalysis = analyzeRequiredSEEForGrade(
      cieMarks,
      cieMax,
      seeMax,
      neededAvgGradePoints,
      course.courseDetails
    );

    courseRequirements.push({
      courseCode: course.courseDetails.code,
      courseTitle: course.courseDetails.title,
      currentCIE: cieMarks,
      requiredSEE: seeAnalysis.requiredSEE,
      requiredGrade: seeAnalysis.requiredGrade,
      difficulty: seeAnalysis.difficulty,
      effortLevel: seeAnalysis.effortLevel
    });

    totalEffortScore += seeAnalysis.effortLevel;
    totalDifficultyScore += seeAnalysis.effortLevel;
    
    if (seeAnalysis.achievable) {
      achievableCourses++;
    }
  });

  const averageCIEQuality = coursesCount > 0 ? totalCIEQuality / coursesCount : 0;
  const averageDifficulty = totalCoursesNeedingSEE > 0 ? totalDifficultyScore / totalCoursesNeedingSEE : 0;
  const averageEffort = totalCoursesNeedingSEE > 0 ? totalEffortScore / totalCoursesNeedingSEE : 0;

  // Calculate realistic probability
  const probability = calculateRealisticProbability(
    achievableCourses,
    totalCoursesNeedingSEE,
    averageCIEQuality,
    averageDifficulty,
    targetSGPA,
    neededAvgGradePoints
  );

  return {
    achievable: totalCoursesNeedingSEE === 0 ? neededAvgGradePoints <= 10 : achievableCourses === totalCoursesNeedingSEE,
    probability,
    effortLevel: getEffortDescription(averageEffort),
    effortScore: averageEffort,
    requiredWeightedPoints,
    currentWeightedPoints,
    neededPoints,
    neededAvgGradePoints: neededAvgGradePoints.toFixed(2),
    courseRequirements,
    studyHoursEstimate: estimateStudyHours(averageEffort, totalCoursesNeedingSEE)
  };
}

/**
 * Calculate realistic probability using multiple factors
 * This provides more accurate probabilities based on:
 * - Achievability of required grades
 * - CIE score quality across all courses
 * - Required effort/difficulty
 * - Target SGPA level
 * - Needed average grade points
 */
function calculateRealisticProbability(
  achievableCourses,
  totalCoursesNeedingSEE,
  averageCIEQuality,
  averageDifficulty,
  targetSGPA,
  neededAvgGradePoints
) {
  // If no courses need SEE, check if target is already met
  if (totalCoursesNeedingSEE === 0) {
    return neededAvgGradePoints <= 0 ? 100 : 0;
  }

  // Base probability from achievability (0-100)
  const achievabilityRatio = achievableCourses / totalCoursesNeedingSEE;
  let baseProbability = achievabilityRatio * 100;

  // If not all courses are achievable, cap probability severely
  if (achievableCourses < totalCoursesNeedingSEE) {
    // For each unachievable course, reduce probability dramatically
    const unachievableRatio = 1 - achievabilityRatio;
    baseProbability = baseProbability * (1 - unachievableRatio * 0.8);
    // Cap at 30% when courses are unachievable
    baseProbability = Math.min(baseProbability, 30);
  }

  // Grade points difficulty factor
  // Higher needed average grade points = lower probability
  // 10 points (O grade) = 0.4, 9 (A+) = 0.6, 8 (A) = 0.75, 7 (B+) = 0.85, 6 (B) = 0.9
  let gradePointsFactor;
  if (neededAvgGradePoints >= 10) gradePointsFactor = 0.4;
  else if (neededAvgGradePoints >= 9.5) gradePointsFactor = 0.5;
  else if (neededAvgGradePoints >= 9.0) gradePointsFactor = 0.6;
  else if (neededAvgGradePoints >= 8.5) gradePointsFactor = 0.7;
  else if (neededAvgGradePoints >= 8.0) gradePointsFactor = 0.75;
  else if (neededAvgGradePoints >= 7.0) gradePointsFactor = 0.85;
  else if (neededAvgGradePoints >= 6.0) gradePointsFactor = 0.9;
  else gradePointsFactor = 0.95;

  // CIE Quality Factor (0-1)
  // Higher average CIE scores increase probability of achieving target
  let cieQualityFactor;
  if (averageCIEQuality >= 90) cieQualityFactor = 1.0;
  else if (averageCIEQuality >= 85) cieQualityFactor = 0.95;
  else if (averageCIEQuality >= 80) cieQualityFactor = 0.88;
  else if (averageCIEQuality >= 75) cieQualityFactor = 0.82;
  else if (averageCIEQuality >= 70) cieQualityFactor = 0.75;
  else if (averageCIEQuality >= 65) cieQualityFactor = 0.68;
  else if (averageCIEQuality >= 60) cieQualityFactor = 0.62;
  else if (averageCIEQuality >= 55) cieQualityFactor = 0.55;
  else if (averageCIEQuality >= 50) cieQualityFactor = 0.48;
  else cieQualityFactor = 0.4;

  // Difficulty/Effort Factor (0-1)
  // Lower effort needed = higher probability
  let difficultyFactor;
  if (averageDifficulty < 15) difficultyFactor = 0.98;
  else if (averageDifficulty < 30) difficultyFactor = 0.90;
  else if (averageDifficulty < 45) difficultyFactor = 0.82;
  else if (averageDifficulty < 60) difficultyFactor = 0.72;
  else if (averageDifficulty < 75) difficultyFactor = 0.60;
  else if (averageDifficulty < 90) difficultyFactor = 0.45;
  else difficultyFactor = 0.30;

  // Target SGPA Realism Factor
  // Higher SGPAs are statistically harder to achieve
  let targetFactor;
  if (targetSGPA >= 10.0) targetFactor = 0.35;
  else if (targetSGPA >= 9.75) targetFactor = 0.45;
  else if (targetSGPA >= 9.45) targetFactor = 0.60;
  else if (targetSGPA >= 9.15) targetFactor = 0.70;
  else if (targetSGPA >= 9.0) targetFactor = 0.78;
  else if (targetSGPA >= 8.5) targetFactor = 0.85;
  else if (targetSGPA >= 8.0) targetFactor = 0.92;
  else targetFactor = 0.98;

  // Calculate final probability with all factors
  let finalProbability = baseProbability * cieQualityFactor * difficultyFactor * targetFactor * gradePointsFactor;

  // Apply realistic caps
  let maxProbability;
  if (targetSGPA >= 10.0) maxProbability = 75;
  else if (targetSGPA >= 9.75) maxProbability = 82;
  else if (targetSGPA >= 9.45) maxProbability = 88;
  else if (targetSGPA >= 9.15) maxProbability = 92;
  else if (targetSGPA >= 9.0) maxProbability = 94;
  else if (targetSGPA >= 8.5) maxProbability = 96;
  else maxProbability = 98;

  // Apply minimum thresholds for good CIE performance
  // If CIE quality is excellent (85%+), give a reasonable floor
  if (averageCIEQuality >= 85 && achievableCourses === totalCoursesNeedingSEE) {
    if (targetSGPA <= 9.0) {
      finalProbability = Math.max(finalProbability, 65);
    } else if (targetSGPA <= 9.45) {
      finalProbability = Math.max(finalProbability, 55);
    }
  }

  finalProbability = Math.min(finalProbability, maxProbability);
  finalProbability = Math.max(finalProbability, 0);

  return Math.round(finalProbability);
}

/**
 * Analyze required SEE marks for a specific grade points target
 * This calculates what SEE score is needed to achieve a certain grade point value
 */
function analyzeRequiredSEEForGrade(cieMarks, cieMax, seeMax, targetGradePoints, courseDetails) {
  // Map grade points to required final score ranges
  let targetGrade;
  let targetMinScore;
  
  if (targetGradePoints >= 10) {
    targetGrade = 'O';
    targetMinScore = 90;
  } else if (targetGradePoints >= 9) {
    targetGrade = 'A+';
    targetMinScore = 80;
  } else if (targetGradePoints >= 8) {
    targetGrade = 'A';
    targetMinScore = 70;
  } else if (targetGradePoints >= 7) {
    targetGrade = 'B+';
    targetMinScore = 60;
  } else if (targetGradePoints >= 6) {
    targetGrade = 'B';
    targetMinScore = 50;
  } else if (targetGradePoints >= 5) {
    targetGrade = 'C';
    targetMinScore = 40;
  } else {
    targetGrade = 'P';
    targetMinScore = 40; // Minimum passing
  }

  // Calculate required SEE marks
  // finalScore = (CIE/cieMax * 50) + (SEE/seeMax * 50)
  const weightedCIE = (cieMarks / cieMax) * 50;
  const requiredWeightedSEE = targetMinScore - weightedCIE;
  const requiredSEE = (requiredWeightedSEE * seeMax) / 50;

  // Check if achievable (must be >= 35% and <= 100%)
  const minSEE = seeMax * 0.35;
  const achievable = requiredSEE >= minSEE && requiredSEE <= seeMax;

  // Calculate difficulty/effort level (0-100)
  const seePercentageNeeded = (requiredSEE / seeMax) * 100;
  let effortLevel = 0;
  if (seePercentageNeeded < EFFORT_THRESHOLDS.ALREADY_SECURED) effortLevel = 5;
  else if (seePercentageNeeded < EFFORT_THRESHOLDS.VERY_EASY) effortLevel = 15;
  else if (seePercentageNeeded < EFFORT_THRESHOLDS.EASY) effortLevel = 30;
  else if (seePercentageNeeded < EFFORT_THRESHOLDS.MODERATE_EASY) effortLevel = 45;
  else if (seePercentageNeeded < EFFORT_THRESHOLDS.MODERATE) effortLevel = 60;
  else if (seePercentageNeeded < EFFORT_THRESHOLDS.HARD) effortLevel = 75;
  else if (seePercentageNeeded < EFFORT_THRESHOLDS.VERY_HARD) effortLevel = 88;
  else effortLevel = 100;

  return {
    requiredSEE: Math.ceil(Math.max(minSEE, Math.min(seeMax, requiredSEE))),
    requiredGrade: targetGrade,
    achievable,
    difficulty: seePercentageNeeded > 100 ? 'Impossible' : 
                seePercentageNeeded > EFFORT_THRESHOLDS.VERY_HARD ? 'Extremely Hard' :
                seePercentageNeeded > EFFORT_THRESHOLDS.HARD ? 'Very Hard' :
                seePercentageNeeded > EFFORT_THRESHOLDS.MODERATE ? 'Hard' :
                seePercentageNeeded > EFFORT_THRESHOLDS.MODERATE_EASY ? 'Moderate' :
                seePercentageNeeded > EFFORT_THRESHOLDS.EASY ? 'Moderate-Easy' :
                seePercentageNeeded > EFFORT_THRESHOLDS.VERY_EASY ? 'Easy' :
                seePercentageNeeded > EFFORT_THRESHOLDS.ALREADY_SECURED ? 'Very Easy' : 'Already Secured',
    effortLevel
  };
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
