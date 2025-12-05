// lib/calculator.js
import { gradingSystem } from './data';

// Rubric for THEORY CIE (e.g., page 13 of PDF)
export const calculateTheoryCIE = (cieMarks) => {
  const { quiz1, quiz2, test1, test2, test3, expLearning } = cieMarks;
  
  const quizTotal = (Number(quiz1) || 0) + (Number(quiz2) || 0); // Max 20

  const tests = [Number(test1) || 0, Number(test2) || 0, Number(test3) || 0].sort((a, b) => b - a);
  const testTotal = ((tests[0] + tests[1]) / 100) * 40; // Best 2 of 3 (out of 100) reduced to 40

  const expLearningTotal = Number(expLearning) || 0; // Max 40

  return Math.min(100, quizTotal + testTotal + expLearningTotal);
};

// Rubric for LAB CIE (e.g., page 74 for IDEA LAB)
export const calculateLabCIE = (cieMarks) => {
    const { labRecord, labTest, innovativeExp } = cieMarks;
    const total = (Number(labRecord) || 0) + (Number(labTest) || 0) + (Number(innovativeExp) || 0);
    return Math.min(50, total);
};

// Rubric for INTEGRATED CIE (e.g., page 31 for Physics)
export const calculateIntegratedCIE = (cieMarks) => {
    const { quiz1, quiz2, test1, test2, test3, expLearning, labRecord, labTest } = cieMarks;
    
    // Theory Part (100 Marks)
    const quizTotal = (Number(quiz1) || 0) + (Number(quiz2) || 0);
    const tests = [Number(test1) || 0, Number(test2) || 0, Number(test3) || 0].sort((a, b) => b - a);
    const testTotal = ((tests[0] + tests[1]) / 100) * 40;
    const expLearningTotal = Number(expLearning) || 0;
    const theoryCIETotal = Math.min(100, quizTotal + testTotal + expLearningTotal);

    // Lab Part (50 Marks)
    const labCIETotal = (Number(labRecord) || 0) + (Number(labTest) || 0);
    
    return {
        cieTheory: theoryCIETotal,
        cieLab: Math.min(50, labCIETotal),
    }
};

export const calculateFinalScore = (cieMarks, seeMarks, cieMax, seeMax) => {
  if (cieMax === 0 || seeMax === 0) return 0;
  const weightedCIE = (cieMarks / cieMax) * 50;
  const weightedSEE = (seeMarks / seeMax) * 50;
  return weightedCIE + weightedSEE;
};

export const getGradeDetails = (finalScore, isPass) => {
  if (!isPass) {
    return { grade: 'F', points: 0 };
  }
  const score = Math.round(finalScore);
  for (const level of gradingSystem) {
    if (score >= level.min && score <= level.max) {
      return { grade: level.grade, points: level.points };
    }
  }
  if (score > 100) return { grade: 'O', points: 10 };
  return { grade: 'F', points: 0 };
};

export const checkPassStatus = (course, marks) => {
  // IMPORTANT: Passing standards are based on the old images, as they are not in the new PDF.
  // Theory: CIE >= 40%, SEE >= 35%, Aggregate >= 40%
  // Lab: CIE >= 40%, SEE >= 35%, Aggregate >= 40%
  // Integrated: CIE(Theory) >= 40%, CIE(Lab) >= 40%, SEE(Theory) >= 35%, SEE(Lab) >= 35%, Aggregate >= 40%
  
  const { type, cieMax, seeMax, cieBreakdown, seeBreakdown } = course;
  const { totalCie, see, seeTheory, seeLab, cieTheory, cieLab } = marks;

  if (type === 'Theory' || (type === 'Lab' && cieMax !== 150)) { // Standard Theory and Lab
    const ciePercent = (totalCie / cieMax) * 100;
    const seePercent = ((see || 0) / seeMax) * 100;
    const aggregate = calculateFinalScore(totalCie, see || 0, cieMax, seeMax);
    return ciePercent >= 40 && seePercent >= 35 && aggregate >= 40;
  }
  
  if (type === 'Integrated' || (type === 'Lab' && cieMax === 150) ) { // Integrated courses & some labs like CS222IA
    const safeCieBreakdown = cieBreakdown || { theory: 100, lab: 50 }; // Default for safety
    const safeSeeBreakdown = seeBreakdown || { theory: 100, lab: 50 };

    const cieTheoryPercent = (cieTheory / safeCieBreakdown.theory) * 100;
    const cieLabPercent = (cieLab / safeCieBreakdown.lab) * 100;
    const seeTheoryPercent = ((seeTheory || 0) / safeSeeBreakdown.theory) * 100;
    const seeLabPercent = ((seeLab || 0) / safeSeeBreakdown.lab) * 100;

    const totalCIE = Number(cieTheory || 0) + Number(cieLab || 0);
    const totalSEE = Number(seeTheory || 0) + Number(seeLab || 0);
    const aggregate = calculateFinalScore(totalCIE, totalSEE, cieMax, seeMax);

    const ciePass = cieTheoryPercent >= 40 && cieLabPercent >= 40;
    const seePass = seeTheoryPercent >= 35 && seeLabPercent >= 35;
    const aggregatePass = aggregate >= 40;

    return ciePass && seePass && aggregatePass;
  }

  return false;
};

export const calculateSGPA = (courses) => {
  let totalCredits = 0;
  let totalWeightedPoints = 0;

  courses.forEach(course => {
    if (course.courseDetails && course.courseDetails.credits > 0) {
      totalCredits += course.courseDetails.credits;
      if (course.results.isPass) { // Only add points if the student passed
         totalWeightedPoints += course.results.points * course.courseDetails.credits;
      }
    }
  });

  if (totalCredits === 0) return 0;
  return (totalWeightedPoints / totalCredits).toFixed(2);
};
