// lib/data.js

export const gradingSystem = [
  { grade: 'O', points: 10, min: 90, max: 100 },
  { grade: 'A+', points: 9, min: 80, max: 89 },
  { grade: 'A', points: 8, min: 70, max: 79 },
  { grade: 'B+', points: 7, min: 60, max: 69 },
  { grade: 'B', points: 6, min: 55, max: 59 },
  { grade: 'C', points: 5, min: 50, max: 54 },
  { grade: 'P', points: 4, min: 40, max: 49 },
  { grade: 'F', points: 0, min: 0, max: 39 }
];

export const courses = [
  { code: 'SELECT', title: 'Select a Course', credits: 0, type: 'None', cieMax: 0, seeMax: 0 },
  // SEM I - CHEM CYCLE (CS, BT, CD, CY, CI) - Page 7
  { code: 'MA211TC', title: 'Fundamentals of Linear Algebra, Calculus and Statistics', credits: 4, type: 'Maths', cieMax: 100, seeMax: 100 },
  { code: 'CM211IA', title: 'Chemistry of Smart Materials And Devices', credits: 4, type: 'Integrated', cieMax: 150, seeMax: 150, cieBreakdown: { theory: 100, lab: 50 }, seeBreakdown: { theory: 100, lab: 50 } },
  { code: 'ME112GL', title: 'Computer Aided Engineering Graphics', credits: 3, type: 'CAEG', cieMax: 50, seeMax: 50 },
  { code: 'XX113XTX', title: 'Engineering Science Course - I', credits: 3, type: 'Theory', cieMax: 100, seeMax: 100 },
  { code: 'XX115XIX', title: 'Programming Languages Course', credits: 3, type: 'Integrated', cieMax: 150, seeMax: 150, cieBreakdown: { theory: 100, lab: 50 }, seeBreakdown: { theory: 100, lab: 50 } },
  { code: 'HS111EL', title: 'Communicative English-I', credits: 1, type: 'English', cieMax: 50, seeMax: 50 },
  { code: 'HS114TC', title: 'Fundamentals of Indian Constitution', credits: 1, type: 'FOIC', cieMax: 50, seeMax: 50 },
  { code: 'HS115YL', title: 'Scientific Foundations of Health-Yoga Practice', credits: 1, type: 'Yoga', cieMax: 50, seeMax: 50 },

  // SEM II - PHYSICS CYCLE (CS, BT, CD, CY, CI) - Page 7
  { code: 'MA221TC', title: 'Number Theory, Vector Calculus and Computational Methods', credits: 4, type: 'Maths', cieMax: 100, seeMax: 100 },
  { code: 'PY221IC', title: 'Quantum Physics for Engineers', credits: 4, type: 'Integrated', cieMax: 150, seeMax: 150, cieBreakdown: { theory: 100, lab: 50 }, seeBreakdown: { theory: 100, lab: 50 } },
  { code: 'CS222IA', title: 'Principles of Programming Using C', credits: 3, type: 'Integrated', cieMax: 150, seeMax: 150, cieBreakdown: { theory: 100, lab: 50 }, seeBreakdown: { theory: 100, lab: 50 } },
  { code: 'XX123XTX', title: 'Engineering Science Course-II', credits: 3, type: 'Theory', cieMax: 100, seeMax: 100 },
  { code: 'CI124TA', title: 'AI Foundations for Engineers', credits: 3, type: 'Theory', cieMax: 100, seeMax: 100 },
  { code: 'HS121EL', title: 'Communicative English-II', credits: 1, type: 'English', cieMax: 50, seeMax: 50 },
  { code: 'HS12XKB', title: 'Samskrutika Kannada/ Balake Kannada', credits: 1, type: 'Kannada', cieMax: 50, seeMax: 50 },
  { code: 'ME121DL', title: 'IDEA LAB', credits: 1, type: 'Lab', cieMax: 50, seeMax: 50 },
  
  // SEM I - PHYSICS CYCLE (EC, EE, ET) - Page 8
  { code: 'MA211TA', title: 'Fundamentals of Linear Algebra, Calculus and Numerical Methods', credits: 4, type: 'Maths', cieMax: 100, seeMax: 100 },
  { code: 'PY211IA', title: 'Condensed Matter Physics for Engineers', credits: 4, type: 'Integrated', cieMax: 150, seeMax: 150, cieBreakdown: { theory: 100, lab: 50 }, seeBreakdown: { theory: 100, lab: 50 } },
  { code: 'PY211IE', title: 'Physics of Electrical & Electronic Materials', credits: 4, type: 'Integrated', cieMax: 150, seeMax: 150, cieBreakdown: { theory: 100, lab: 50 }, seeBreakdown: { theory: 100, lab: 50 } },
  { code: 'EC112TA', title: 'Basic Electronics', credits: 3, type: 'Theory', cieMax: 100, seeMax: 100 },
  { code: 'EE112TA', title: 'Elements of Electrical Engineering', credits: 3, type: 'Theory', cieMax: 100, seeMax: 100 },
  { code: 'CI114TA', title: 'AI Foundations for Engineers', credits: 3, type: 'Theory', cieMax: 100, seeMax: 100 },
  { code: 'ME111DL', title: 'IDEA LAB', credits: 1, type: 'Lab', cieMax: 50, seeMax: 50 },

  // SEM II - CHEM CYCLE (EC, EE, ET) - Page 8
  { code: 'MA221TA', title: 'Vector Calculus, Laplace Transform and Numerical Methods', credits: 4, type: 'Maths', cieMax: 100, seeMax: 100 },
  { code: 'CM221IB', title: 'Chemistry of functional materials', credits: 4, type: 'Integrated', cieMax: 150, seeMax: 150, cieBreakdown: { theory: 100, lab: 50 }, seeBreakdown: { theory: 100, lab: 50 } },
  { code: 'ME122GL', title: 'Computer Aided Engineering Graphics', credits: 3, type: 'CAEG', cieMax: 50, seeMax: 50 },
  
  // SEM I - PHYSICS CYCLE (AS, CH, IM, ME) - Page 9
  { code: 'MA211TB', title: 'Fundamentals of Linear Algebra, Calculus and Differential Equations', credits: 4, type: 'Maths', cieMax: 100, seeMax: 100 },
  { code: 'PY211IB', title: 'Classical Physics for Engineers', credits: 4, type: 'Integrated', cieMax: 150, seeMax: 150, cieBreakdown: { theory: 100, lab: 50 }, seeBreakdown: { theory: 100, lab: 50 } },
  { code: 'ME112TA', title: 'Elements of Mechanical Engineering', credits: 3, type: 'Theory', cieMax: 100, seeMax: 100 },

  // SEM II - CHEM CYCLE (AS, CH, IM, ME) - Page 9
  { code: 'MA221TB', title: 'Vector Calculus and Computational Methods', credits: 4, type: 'Maths', cieMax: 100, seeMax: 100 },
  { code: 'CM221IC', title: 'Chemistry of Engineering materials', credits: 4, type: 'Integrated', cieMax: 150, seeMax: 150, cieBreakdown: { theory: 100, lab: 50 }, seeBreakdown: { theory: 100, lab: 50 } },

  // SEM I - PHYSICS CYCLE (CV) - Page 10
  { code: 'MA211TD', title: 'Applied Mathematics – I', credits: 4, type: 'Maths', cieMax: 100, seeMax: 100 },
  { code: 'PY211ID', title: 'Applied Physics for Engineers', credits: 4, type: 'Integrated', cieMax: 150, seeMax: 150, cieBreakdown: { theory: 100, lab: 50 }, seeBreakdown: { theory: 100, lab: 50 } },
  { code: 'CV112TA', title: 'Engineering Mechanics', credits: 3, type: 'Theory', cieMax: 100, seeMax: 100 },
  
  // SEM II - CHEM CYCLE (CV) - Page 10
  { code: 'MA221TD', title: 'Applied Mathematics – II', credits: 4, type: 'Maths', cieMax: 100, seeMax: 100 },
  { code: 'CM221ID', title: 'Engineering And Environmental Chemistry', credits: 4, type: 'Integrated', cieMax: 150, seeMax: 150, cieBreakdown: { theory: 100, lab: 50 }, seeBreakdown: { theory: 100, lab: 50 } },
  
  // Generic Engineering Science and Programming Language courses that appear in multiple streams
  { code: 'XX125XIX', title: 'Programming Languages Course', credits: 3, type: 'Integrated', cieMax: 150, seeMax: 150, cieBreakdown: { theory: 100, lab: 50 }, seeBreakdown: { theory: 100, lab: 50 } },
];
