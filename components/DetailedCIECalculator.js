// components/DetailedCIECalculator.js

const InputField = ({ name, label, placeholder, value, onChange }) => (
    <div>
        <label className="block text-sm font-medium text-gray-300 mb-1">{label}</label>
        <input
            type="number"
            name={name}
            placeholder={placeholder}
            value={value || ''}
            onChange={onChange}
            className="w-full p-3 bg-gradient-to-r from-gray-700 to-gray-800 border-2 border-gray-600 rounded-lg text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
        />
    </div>
);

export default function DetailedCIECalculator({ courseType, cieMarks, handleMarkChange }) {
    if (!courseType || courseType === 'None') return null;

    const renderTheoryInputs = () => (
        <>
            <h4 className="col-span-full text-lg font-semibold text-blue-400 bg-blue-500/10 p-3 rounded-lg border border-blue-500/30">📝 Quizzes (Total 20 Marks)</h4>
            <InputField name="quiz1" label="Quiz 1" placeholder="Out of 10" value={cieMarks.quiz1} onChange={handleMarkChange} />
            <InputField name="quiz2" label="Quiz 2" placeholder="Out of 10" value={cieMarks.quiz2} onChange={handleMarkChange} />
            
            <h4 className="col-span-full mt-4 text-lg font-semibold text-purple-400 bg-purple-500/10 p-3 rounded-lg border border-purple-500/30">📊 Tests (Best 2 of 3, reduced to 40 Marks)</h4>
            <InputField name="test1" label="Test 1" placeholder="Out of 50" value={cieMarks.test1} onChange={handleMarkChange} />
            <InputField name="test2" label="Test 2" placeholder="Out of 50" value={cieMarks.test2} onChange={handleMarkChange} />
            <InputField name="test3" label="Test 3" placeholder="Out of 50" value={cieMarks.test3} onChange={handleMarkChange} />

            <h4 className="col-span-full mt-4 text-lg font-semibold text-green-400 bg-green-500/10 p-3 rounded-lg border border-green-500/30">🎯 Experiential Learning (Total 40 Marks)</h4>
            <InputField name="expLearning" label="Program/Seminar/MATLAB etc." placeholder="Out of 40" value={cieMarks.expLearning} onChange={handleMarkChange} />
        </>
    );

    // For pure labs like IDEA LAB (pg 74)
    const renderLabInputs = () => (
        <>
            <h4 className="col-span-full text-lg font-semibold text-blue-300">Lab CIE (Total 50 Marks)</h4>
            <InputField name="labRecord" label="Conduction, Report, Observation" placeholder="Out of 20" value={cieMarks.labRecord} onChange={handleMarkChange} />
            <InputField name="labTest" label="Lab Test" placeholder="Out of 10" value={cieMarks.labTest} onChange={handleMarkChange} />
            <InputField name="innovativeExp" label="Innovative Experiment/Concept Design" placeholder="Out of 20" value={cieMarks.innovativeExp} onChange={handleMarkChange} />
        </>
    );

    // For English courses (HS111EL, HS121EL)
    const renderEnglishInputs = () => (
        <>
            <h4 className="col-span-full text-lg font-semibold text-blue-300">CIEs (Best 2 of 3, each out of 12)</h4>
            <InputField name="cie1" label="CIE 1" placeholder="Out of 12" value={cieMarks.cie1} onChange={handleMarkChange} />
            <InputField name="cie2" label="CIE 2" placeholder="Out of 12" value={cieMarks.cie2} onChange={handleMarkChange} />
            <InputField name="cie3" label="CIE 3" placeholder="Out of 12" value={cieMarks.cie3} onChange={handleMarkChange} />
            
            <h4 className="col-span-full mt-4 text-lg font-semibold text-blue-300">Additional Components</h4>
            <InputField name="modules" label="Modules" placeholder="Out of 10" value={cieMarks.modules} onChange={handleMarkChange} />
            <InputField name="expLearning" label="Experiential Learning" placeholder="Out of 20" value={cieMarks.expLearning} onChange={handleMarkChange} />
        </>
    );

    // For CAEG courses (ME112GL, ME122GL)
    const renderCAEGInputs = () => (
        <>
            <h4 className="col-span-full text-lg font-semibold text-blue-300">CIEs (Best of 2 Manual CIEs + 1 Lab CIE)</h4>
            <InputField name="manualCie1" label="Manual CIE 1" placeholder="Out of 50" value={cieMarks.manualCie1} onChange={handleMarkChange} />
            <InputField name="manualCie2" label="Manual CIE 2" placeholder="Out of 50" value={cieMarks.manualCie2} onChange={handleMarkChange} />
            <InputField name="labCie" label="Lab CIE" placeholder="Out of 50" value={cieMarks.labCie} onChange={handleMarkChange} />
            
            <h4 className="col-span-full mt-4 text-lg font-semibold text-blue-300">Additional Components</h4>
            <InputField name="labRecord" label="Lab Record" placeholder="Out of 80" value={cieMarks.labRecord} onChange={handleMarkChange} />
            <InputField name="expLearning" label="Experiential Learning" placeholder="Out of 20" value={cieMarks.expLearning} onChange={handleMarkChange} />
        </>
    );

    // For FOIC course (HS114TC)
    const renderFOICInputs = () => (
        <>
            <h4 className="col-span-full text-lg font-semibold text-blue-300">Quizzes (Average of 2)</h4>
            <InputField name="quiz1" label="Quiz 1" placeholder="Out of 10" value={cieMarks.quiz1} onChange={handleMarkChange} />
            <InputField name="quiz2" label="Quiz 2" placeholder="Out of 10" value={cieMarks.quiz2} onChange={handleMarkChange} />
            
            <h4 className="col-span-full mt-4 text-lg font-semibold text-blue-300">Tests (Total 100, reduced to 20)</h4>
            <InputField name="test1" label="Test 1" placeholder="Out of 50" value={cieMarks.test1} onChange={handleMarkChange} />
            <InputField name="test2" label="Test 2" placeholder="Out of 50" value={cieMarks.test2} onChange={handleMarkChange} />

            <h4 className="col-span-full mt-4 text-lg font-semibold text-blue-300">Experiential Learning</h4>
            <InputField name="expLearning" label="EL (40 reduced to 20)" placeholder="Out of 40" value={cieMarks.expLearning} onChange={handleMarkChange} />
        </>
    );

    // For Yoga course (HS115YL)
    const renderYogaInputs = () => (
        <>
            <h4 className="col-span-full text-lg font-semibold text-blue-300">Assessments</h4>
            <InputField name="quiz" label="Quiz" placeholder="Out of 10" value={cieMarks.quiz} onChange={handleMarkChange} />
            <InputField name="test" label="Test (40 reduced to 30)" placeholder="Out of 40" value={cieMarks.test} onChange={handleMarkChange} />
            <InputField name="expLearning" label="Experiential Learning" placeholder="Out of 10" value={cieMarks.expLearning} onChange={handleMarkChange} />
        </>
    );

    // For Maths courses
    const renderMathsInputs = () => (
        <>
            <h4 className="col-span-full text-lg font-semibold text-blue-300">Quizzes (Total 20 Marks)</h4>
            <InputField name="quiz1" label="Quiz 1" placeholder="Out of 10" value={cieMarks.quiz1} onChange={handleMarkChange} />
            <InputField name="quiz2" label="Quiz 2" placeholder="Out of 10" value={cieMarks.quiz2} onChange={handleMarkChange} />
            
            <h4 className="col-span-full mt-4 text-lg font-semibold text-blue-300">Tests (Best 2 of 3, reduced to 40 Marks)</h4>
            <InputField name="test1" label="Test 1" placeholder="Out of 50" value={cieMarks.test1} onChange={handleMarkChange} />
            <InputField name="test2" label="Test 2" placeholder="Out of 50" value={cieMarks.test2} onChange={handleMarkChange} />
            <InputField name="test3" label="Test 3" placeholder="Out of 50" value={cieMarks.test3} onChange={handleMarkChange} />

            <h4 className="col-span-full mt-4 text-lg font-semibold text-blue-300">Additional Components</h4>
            <InputField name="expLearning" label="Experiential Learning" placeholder="Out of 20" value={cieMarks.expLearning} onChange={handleMarkChange} />
            <InputField name="matlab" label="MATLAB" placeholder="Out of 20" value={cieMarks.matlab} onChange={handleMarkChange} />
        </>
    );

    // For the Lab part of Integrated courses (pg 31)
    const renderIntegratedLabInputs = () => (
         <div className='col-span-full p-4 border border-gray-600 rounded-lg'>
            <h3 className="text-xl font-bold text-gray-100 mb-2">Lab Components (50 Marks)</h3>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InputField name="labRecord" label="Conduction, Report, Observation, Analysis" placeholder="Out of 40" value={cieMarks.labRecord} onChange={handleMarkChange} />
                <InputField name="labTest" label="Lab Test" placeholder="Out of 10" value={cieMarks.labTest} onChange={handleMarkChange} />
            </div>
        </div>
    )

    const renderIntegratedInputs = () => (
        <>
            <div className='col-span-full p-4 border border-gray-600 rounded-lg'>
                <h3 className="text-xl font-bold text-gray-100 mb-2">Theory Components (100 Marks)</h3>
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
        <div className="p-5 mt-4 bg-gradient-to-r from-gray-800/70 to-gray-900/70 rounded-xl border border-gray-700">
            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <span>📚</span> Continuous Internal Evaluation (CIE)
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {courseType === 'Theory' && renderTheoryInputs()}
                {courseType === 'Lab' && renderLabInputs()}
                {courseType === 'English' && renderEnglishInputs()}
                {courseType === 'CAEG' && renderCAEGInputs()}
                {courseType === 'FOIC' && renderFOICInputs()}
                {courseType === 'Yoga' && renderYogaInputs()}
                {courseType === 'Maths' && renderMathsInputs()}
                {isEffectivelyIntegrated && renderIntegratedInputs()}
            </div>
        </div>
    );
}
