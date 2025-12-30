// components/DetailedCIECalculator.js

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

export default function DetailedCIECalculator({ courseType, cieMarks, handleMarkChange }) {
    if (!courseType || courseType === 'None') return null;

    const renderTheoryInputs = () => (
        <>
            <h4 className="col-span-full text-lg font-semibold text-blue-400 flex items-center gap-2 border-b border-blue-500/30 pb-2">
                <span className="w-2 h-2 bg-blue-400 rounded-full"></span>
                Quizzes (Total 20 Marks)
            </h4>
            <InputField name="quiz1" label="Quiz 1" placeholder="Out of 10" value={cieMarks.quiz1} onChange={handleMarkChange} />
            <InputField name="quiz2" label="Quiz 2" placeholder="Out of 10" value={cieMarks.quiz2} onChange={handleMarkChange} />
            
            <h4 className="col-span-full mt-4 text-lg font-semibold text-blue-400 flex items-center gap-2 border-b border-blue-500/30 pb-2">
                <span className="w-2 h-2 bg-blue-400 rounded-full"></span>
                Tests (Best 2 of 3, reduced to 40 Marks)
            </h4>
            <InputField name="test1" label="Test 1" placeholder="Out of 50" value={cieMarks.test1} onChange={handleMarkChange} />
            <InputField name="test2" label="Test 2" placeholder="Out of 50" value={cieMarks.test2} onChange={handleMarkChange} />
            <InputField name="test3" label="Test 3" placeholder="Out of 50" value={cieMarks.test3} onChange={handleMarkChange} />

            <h4 className="col-span-full mt-4 text-lg font-semibold text-blue-400 flex items-center gap-2 border-b border-blue-500/30 pb-2">
                <span className="w-2 h-2 bg-blue-400 rounded-full"></span>
                Experiential Learning (Total 40 Marks)
            </h4>
            <InputField name="expLearning" label="Program/Seminar/MATLAB etc." placeholder="Out of 40" value={cieMarks.expLearning} onChange={handleMarkChange} />
        </>
    );

    // For pure labs like IDEA LAB (pg 74)
    const renderLabInputs = () => (
        <>
            <h4 className="col-span-full text-lg font-semibold text-blue-400 flex items-center gap-2 border-b border-blue-500/30 pb-2">
                <span className="w-2 h-2 bg-blue-400 rounded-full"></span>
                Lab CIE (Total 50 Marks)
            </h4>
            <InputField name="labRecord" label="Conduction, Report, Observation" placeholder="Out of 20" value={cieMarks.labRecord} onChange={handleMarkChange} />
            <InputField name="labTest" label="Lab Test" placeholder="Out of 10" value={cieMarks.labTest} onChange={handleMarkChange} />
            <InputField name="innovativeExp" label="Innovative Experiment/Concept Design" placeholder="Out of 20" value={cieMarks.innovativeExp} onChange={handleMarkChange} />
        </>
    );

    // For English courses (HS111EL, HS121EL)
    const renderEnglishInputs = () => (
        <>
            <h4 className="col-span-full text-lg font-semibold text-blue-400 flex items-center gap-2 border-b border-blue-500/30 pb-2">
                <span className="w-2 h-2 bg-blue-400 rounded-full"></span>
                CIEs (Best 2 of 3, each out of 12)
            </h4>
            <InputField name="cie1" label="CIE 1" placeholder="Out of 12" value={cieMarks.cie1} onChange={handleMarkChange} />
            <InputField name="cie2" label="CIE 2" placeholder="Out of 12" value={cieMarks.cie2} onChange={handleMarkChange} />
            <InputField name="cie3" label="CIE 3" placeholder="Out of 12" value={cieMarks.cie3} onChange={handleMarkChange} />
            
            <h4 className="col-span-full mt-4 text-lg font-semibold text-blue-400 flex items-center gap-2 border-b border-blue-500/30 pb-2">
                <span className="w-2 h-2 bg-blue-400 rounded-full"></span>
                Additional Components
            </h4>
            <InputField name="modules" label="Modules" placeholder="Out of 10" value={cieMarks.modules} onChange={handleMarkChange} />
            <InputField name="expLearning" label="Experiential Learning" placeholder="Out of 20" value={cieMarks.expLearning} onChange={handleMarkChange} />
        </>
    );

    // For CAEG courses (ME112GL, ME122GL)
    const renderCAEGInputs = () => (
        <>
            <h4 className="col-span-full text-lg font-semibold text-blue-400 flex items-center gap-2 border-b border-blue-500/30 pb-2">
                <span className="w-2 h-2 bg-blue-400 rounded-full"></span>
                CIEs (Best of 2 Manual CIEs + 1 Lab CIE)
            </h4>
            <InputField name="manualCie1" label="Manual CIE 1" placeholder="Out of 50" value={cieMarks.manualCie1} onChange={handleMarkChange} />
            <InputField name="manualCie2" label="Manual CIE 2" placeholder="Out of 50" value={cieMarks.manualCie2} onChange={handleMarkChange} />
            <InputField name="labCie" label="Lab CIE" placeholder="Out of 50" value={cieMarks.labCie} onChange={handleMarkChange} />
            
            <h4 className="col-span-full mt-4 text-lg font-semibold text-blue-400 flex items-center gap-2 border-b border-blue-500/30 pb-2">
                <span className="w-2 h-2 bg-blue-400 rounded-full"></span>
                Additional Components
            </h4>
            <InputField name="labRecord" label="Lab Record" placeholder="Out of 80" value={cieMarks.labRecord} onChange={handleMarkChange} />
            <InputField name="expLearning" label="Experiential Learning" placeholder="Out of 20" value={cieMarks.expLearning} onChange={handleMarkChange} />
        </>
    );

    // For FOIC course (HS114TC)
    const renderFOICInputs = () => (
        <>
            <h4 className="col-span-full text-lg font-semibold text-blue-400 flex items-center gap-2 border-b border-blue-500/30 pb-2">
                <span className="w-2 h-2 bg-blue-400 rounded-full"></span>
                Quizzes (Average of 2)
            </h4>
            <InputField name="quiz1" label="Quiz 1" placeholder="Out of 10" value={cieMarks.quiz1} onChange={handleMarkChange} />
            <InputField name="quiz2" label="Quiz 2" placeholder="Out of 10" value={cieMarks.quiz2} onChange={handleMarkChange} />
            
            <h4 className="col-span-full mt-4 text-lg font-semibold text-blue-400 flex items-center gap-2 border-b border-blue-500/30 pb-2">
                <span className="w-2 h-2 bg-blue-400 rounded-full"></span>
                Tests (Total 100, reduced to 20)
            </h4>
            <InputField name="test1" label="Test 1" placeholder="Out of 50" value={cieMarks.test1} onChange={handleMarkChange} />
            <InputField name="test2" label="Test 2" placeholder="Out of 50" value={cieMarks.test2} onChange={handleMarkChange} />

            <h4 className="col-span-full mt-4 text-lg font-semibold text-blue-400 flex items-center gap-2 border-b border-blue-500/30 pb-2">
                <span className="w-2 h-2 bg-blue-400 rounded-full"></span>
                Experiential Learning
            </h4>
            <InputField name="expLearning" label="EL (40 reduced to 20)" placeholder="Out of 40" value={cieMarks.expLearning} onChange={handleMarkChange} />
        </>
    );

    // For Yoga course (HS115YL)
    const renderYogaInputs = () => (
        <>
            <h4 className="col-span-full text-lg font-semibold text-blue-400 flex items-center gap-2 border-b border-blue-500/30 pb-2">
                <span className="w-2 h-2 bg-blue-400 rounded-full"></span>
                Assessments
            </h4>
            <InputField name="quiz" label="Quiz" placeholder="Out of 10" value={cieMarks.quiz} onChange={handleMarkChange} />
            <InputField name="test" label="Test (40 reduced to 30)" placeholder="Out of 40" value={cieMarks.test} onChange={handleMarkChange} />
            <InputField name="expLearning" label="Experiential Learning" placeholder="Out of 10" value={cieMarks.expLearning} onChange={handleMarkChange} />
        </>
    );

    // For Maths courses
    const renderMathsInputs = () => (
        <>
            <h4 className="col-span-full text-lg font-semibold text-blue-400 flex items-center gap-2 border-b border-blue-500/30 pb-2">
                <span className="w-2 h-2 bg-blue-400 rounded-full"></span>
                Quizzes (Total 20 Marks)
            </h4>
            <InputField name="quiz1" label="Quiz 1" placeholder="Out of 10" value={cieMarks.quiz1} onChange={handleMarkChange} />
            <InputField name="quiz2" label="Quiz 2" placeholder="Out of 10" value={cieMarks.quiz2} onChange={handleMarkChange} />
            
            <h4 className="col-span-full mt-4 text-lg font-semibold text-blue-400 flex items-center gap-2 border-b border-blue-500/30 pb-2">
                <span className="w-2 h-2 bg-blue-400 rounded-full"></span>
                Tests (Best 2 of 3, reduced to 40 Marks)
            </h4>
            <InputField name="test1" label="Test 1" placeholder="Out of 50" value={cieMarks.test1} onChange={handleMarkChange} />
            <InputField name="test2" label="Test 2" placeholder="Out of 50" value={cieMarks.test2} onChange={handleMarkChange} />
            <InputField name="test3" label="Test 3" placeholder="Out of 50" value={cieMarks.test3} onChange={handleMarkChange} />

            <h4 className="col-span-full mt-4 text-lg font-semibold text-blue-400 flex items-center gap-2 border-b border-blue-500/30 pb-2">
                <span className="w-2 h-2 bg-blue-400 rounded-full"></span>
                Additional Components
            </h4>
            <InputField name="expLearning" label="Experiential Learning" placeholder="Out of 20" value={cieMarks.expLearning} onChange={handleMarkChange} />
            <InputField name="matlab" label="MATLAB" placeholder="Out of 20" value={cieMarks.matlab} onChange={handleMarkChange} />
        </>
    );

    // For Kannada course (HS12XKB)
    const renderKannadaInputs = () => (
        <>
            <h4 className="col-span-full text-lg font-semibold text-blue-400 flex items-center gap-2 border-b border-blue-500/30 pb-2">
                <span className="w-2 h-2 bg-blue-400 rounded-full"></span>
                Quizzes (Total 5 Marks)
            </h4>
            <InputField name="quiz1" label="Quiz 1" placeholder="Quiz marks" value={cieMarks.quiz1} onChange={handleMarkChange} />
            <InputField name="quiz2" label="Quiz 2" placeholder="Quiz marks" value={cieMarks.quiz2} onChange={handleMarkChange} />
            
            <h4 className="col-span-full mt-4 text-lg font-semibold text-blue-400 flex items-center gap-2 border-b border-blue-500/30 pb-2">
                <span className="w-2 h-2 bg-blue-400 rounded-full"></span>
                Tests (50 reduced to 25 Marks)
            </h4>
            <InputField name="test1" label="Test 1" placeholder="Out of 25" value={cieMarks.test1} onChange={handleMarkChange} />
            <InputField name="test2" label="Test 2" placeholder="Out of 25" value={cieMarks.test2} onChange={handleMarkChange} />

            <h4 className="col-span-full mt-4 text-lg font-semibold text-blue-400 flex items-center gap-2 border-b border-blue-500/30 pb-2">
                <span className="w-2 h-2 bg-blue-400 rounded-full"></span>
                Experiential Learning (20 Marks)
            </h4>
            <InputField name="expLearning" label="Experiential Learning" placeholder="Out of 20" value={cieMarks.expLearning} onChange={handleMarkChange} />
        </>
    );

    // For the Lab part of Integrated courses (pg 31)
    const renderIntegratedLabInputs = () => (
         <div className='col-span-full p-4 border border-purple-500/30 rounded-xl bg-purple-900/10'>
            <h3 className="text-xl font-bold text-purple-300 mb-3 flex items-center gap-2">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M7 2a1 1 0 00-.707 1.707L7 4.414v3.758a1 1 0 01-.293.707l-4 4C.817 14.769 2.156 18 4.828 18h10.343c2.673 0 4.012-3.231 2.122-5.121l-4-4A1 1 0 0113 8.172V4.414l.707-.707A1 1 0 0013 2H7zm2 6.172V4h2v4.172a3 3 0 00.879 2.12l1.027 1.028a4 4 0 00-2.171.102l-.47.156a4 4 0 01-2.53 0l-.563-.187a1.993 1.993 0 00-.114-.035l1.063-1.063A3 3 0 009 8.172z" clipRule="evenodd" />
                </svg>
                Lab Components (50 Marks)
            </h3>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InputField name="labRecord" label="Conduction, Report, Observation, Analysis" placeholder="Out of 40" value={cieMarks.labRecord} onChange={handleMarkChange} />
                <InputField name="labTest" label="Lab Test" placeholder="Out of 10" value={cieMarks.labTest} onChange={handleMarkChange} />
            </div>
        </div>
    )

    const renderIntegratedInputs = () => (
        <>
            <div className='col-span-full p-4 border border-blue-500/30 rounded-xl bg-blue-900/10'>
                <h3 className="text-xl font-bold text-blue-300 mb-3 flex items-center gap-2">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z" />
                    </svg>
                    Theory Components (100 Marks)
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {renderTheoryInputs()}
                </div>
            </div>
            {renderIntegratedLabInputs()}
        </>
    );
    
    // Some "Lab" courses like CS222IA follow the Integrated marking scheme
    const isEffectivelyIntegrated = courseType === 'Integrated' || (courseType === 'Lab' && cieMarks.isIntegratedLab);

    return (
        <div className="p-5 mt-4 bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-xl border border-gray-700/50">
            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <svg className="w-5 h-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                </svg>
                Continuous Internal Evaluation (CIE)
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {courseType === 'Theory' && renderTheoryInputs()}
                {courseType === 'Lab' && renderLabInputs()}
                {courseType === 'English' && renderEnglishInputs()}
                {courseType === 'CAEG' && renderCAEGInputs()}
                {courseType === 'FOIC' && renderFOICInputs()}
                {courseType === 'Yoga' && renderYogaInputs()}
                {courseType === 'Maths' && renderMathsInputs()}
                {courseType === 'Kannada' && renderKannadaInputs()}
                {isEffectivelyIntegrated && renderIntegratedInputs()}
            </div>
        </div>
    );
}
