// components/DetailedCIECalculator.js

const InputField = ({ name, label, placeholder, value, onChange }) => (
    <div>
        <label className="block text-sm font-medium text-gray-400">{label}</label>
        <input
            type="number"
            name={name}
            placeholder={placeholder}
            value={value || ''}
            onChange={onChange}
            className="w-full p-2 mt-1 bg-gray-700 border border-gray-600 rounded-md text-white focus:ring-blue-500 focus:border-blue-500"
        />
    </div>
);

export default function DetailedCIECalculator({ courseType, cieMarks, handleMarkChange }) {
    if (!courseType || courseType === 'None') return null;

    const renderTheoryInputs = () => (
        <>
            <h4 className="col-span-full text-lg font-semibold text-blue-300">Quizzes (Total 20 Marks)</h4>
            <InputField name="quiz1" label="Quiz 1" placeholder="Out of 10" value={cieMarks.quiz1} onChange={handleMarkChange} />
            <InputField name="quiz2" label="Quiz 2" placeholder="Out of 10" value={cieMarks.quiz2} onChange={handleMarkChange} />
            
            <h4 className="col-span-full mt-4 text-lg font-semibold text-blue-300">Tests (Best 2 of 3, reduced to 40 Marks)</h4>
            <InputField name="test1" label="Test 1" placeholder="Out of 50" value={cieMarks.test1} onChange={handleMarkChange} />
            <InputField name="test2" label="Test 2" placeholder="Out of 50" value={cieMarks.test2} onChange={handleMarkChange} />
            <InputField name="test3" label="Test 3" placeholder="Out of 50" value={cieMarks.test3} onChange={handleMarkChange} />

            <h4 className="col-span-full mt-4 text-lg font-semibold text-blue-300">Experiential Learning (Total 40 Marks)</h4>
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
        <div className="p-4 mt-4 bg-gray-800/50 rounded-lg">
            <h3 className="text-xl font-bold text-white mb-4">Continuous Internal Evaluation (CIE)</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {courseType === 'Theory' && renderTheoryInputs()}
                {courseType === 'Lab' && renderLabInputs()}
                {isEffectivelyIntegrated && renderIntegratedInputs()}
            </div>
        </div>
    );
}
