// components/Resources.js

const RESOURCES = [
  {
    category: 'Official & Academic',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
      </svg>
    ),
    color: 'cyan',
    items: [
      { title: 'RVCE Official Website', url: 'https://rvce.edu.in', description: 'Notices, results, and official announcements' },
      // TODO: Update with actual student portal URL when available
      { title: 'RVCE Student Portal', url: 'https://rvce.edu.in', description: 'Check marks, attendance, and fee details' },
      // TODO: Update with direct PDF link when available
      { title: '2025 Scheme Syllabus (PDF)', url: 'https://rvce.edu.in', description: 'Official Dean First Year scheme document' },
    ],
  },
  {
    category: 'Study & Learning',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
      </svg>
    ),
    color: 'teal',
    items: [
      { title: 'NPTEL (IIT Courses)', url: 'https://nptel.ac.in', description: 'Free video lectures from IIT/IISc professors' },
      { title: 'MIT OpenCourseWare', url: 'https://ocw.mit.edu', description: 'Free MIT course materials for engineering' },
      { title: 'Khan Academy', url: 'https://khanacademy.org', description: 'Maths, Physics, Chemistry fundamentals' },
      { title: '3Blue1Brown (YouTube)', url: 'https://youtube.com/@3blue1brown', description: 'Visual maths explanations' },
    ],
  },
  {
    category: 'Programming',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
      </svg>
    ),
    color: 'orange',
    items: [
      { title: 'CS50 by Harvard', url: 'https://cs50.harvard.edu', description: 'Best intro to programming — free on edX' },
      { title: 'GeeksforGeeks', url: 'https://geeksforgeeks.org', description: 'Data structures, algorithms, C/C++/Python' },
      { title: 'LeetCode', url: 'https://leetcode.com', description: 'Coding practice and interview prep' },
      { title: 'W3Schools', url: 'https://w3schools.com', description: 'Quick reference for web and programming basics' },
      { title: 'LearnCpp.com', url: 'https://learncpp.com', description: 'Free, comprehensive C++ tutorials for beginners to advanced' },
      { title: 'cppreference.com', url: 'https://en.cppreference.com', description: 'Official C++ language and standard library reference' },
      { title: 'MDN Web Docs', url: 'https://developer.mozilla.org', description: 'Authoritative reference for HTML, CSS, and JavaScript' },
      { title: 'Striver (takeUforward)', url: 'https://youtube.com/@takeUforward', description: 'Best DSA & CP YouTube channel — A-Z DSA sheet by Striver' },
      { title: 'Apna College (YouTube)', url: 'https://youtube.com/@ApnaCollegeOfficial', description: 'C++, Java, DSA & placement prep in Hindi/English' },
      { title: 'CodeWithHarry (YouTube)', url: 'https://youtube.com/@CodeWithHarry', description: 'Programming tutorials in Hindi — C, Python, web dev & more' },
    ],
  },
  {
    category: 'Tools & Productivity',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
    color: 'amber',
    items: [
      { title: 'Notion', url: 'https://notion.so', description: 'Free for students — notes, planners, and more' },
      { title: 'Overleaf (LaTeX)', url: 'https://overleaf.com', description: 'Online LaTeX editor for reports and papers' },
      { title: 'Wolfram Alpha', url: 'https://wolframalpha.com', description: 'Solve maths, physics, and chemistry problems' },
      { title: 'Desmos Graphing Calculator', url: 'https://desmos.com/calculator', description: 'Free visual graphing calculator' },
    ],
  },
];

const colorMap = {
  cyan: { icon: 'bg-cyan-500/10 border-cyan-500/20 text-cyan-400', link: 'hover:text-cyan-400', badge: 'text-cyan-400' },
  teal: { icon: 'bg-teal-500/10 border-teal-500/20 text-teal-400', link: 'hover:text-teal-400', badge: 'text-teal-400' },
  orange: { icon: 'bg-orange-500/10 border-orange-500/20 text-orange-400', link: 'hover:text-orange-400', badge: 'text-orange-400' },
  amber: { icon: 'bg-amber-500/10 border-amber-500/20 text-amber-400', link: 'hover:text-amber-400', badge: 'text-amber-400' },
};

export default function Resources() {
  return (
    <div className="w-full mx-auto animate-fadeIn">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-white mb-2">Resources</h2>
        <p className="text-sm text-gray-400">Curated links to help you study smarter, not harder.</p>
      </div>

      <div className="space-y-6">
        {RESOURCES.map((section) => {
          const c = colorMap[section.color];
          return (
            <div key={section.category} className="neumorphic rounded-2xl p-5">
              <div className="flex items-center gap-3 mb-4">
                <div className={`p-2 rounded-xl border ${c.icon}`}>
                  {section.icon}
                </div>
                <h3 className="font-bold text-white">{section.category}</h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {section.items.map((item) => (
                  <a
                    key={item.title}
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`group flex items-start gap-3 p-3 rounded-xl bg-gray-800/40 border border-gray-700/30 hover:border-gray-600/50 transition-all ${c.link}`}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 mb-0.5">
                        <span className="font-semibold text-sm text-white group-hover:text-inherit transition-colors truncate">{item.title}</span>
                        <svg className={`w-3 h-3 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity ${c.badge}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                      </div>
                      <p className="text-xs text-gray-500 leading-relaxed">{item.description}</p>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-8 neumorphic rounded-2xl p-5 text-center">
        <p className="text-sm text-gray-500">
          Know a great resource for RVCE students?{' '}
          <a
            href="https://github.com/shield44-project/grade-calculator/issues"
            target="_blank"
            rel="noopener noreferrer"
            className="text-cyan-400 hover:text-cyan-300 font-medium transition-colors"
          >
            Suggest it on GitHub →
          </a>
        </p>
      </div>
    </div>
  );
}
