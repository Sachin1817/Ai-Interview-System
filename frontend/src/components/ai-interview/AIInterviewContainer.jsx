import React, { useState } from 'react';
import MediaSetup from './MediaSetup';
import RealtimeInterviewRoom from './RealtimeInterviewRoom';
import InterviewSummaryReport from './InterviewSummaryReport';

const AIInterviewContainer = () => {
    const [step, setStep] = useState('setup'); // 'setup' | 'room' | 'summary'
    const [setupData, setSetupData] = useState(null);
    const [summaryData, setSummaryData] = useState(null);

    const handleSetupComplete = (data) => {
        setSetupData(data);
        setStep('room');
    };

    const handleInterviewFinish = (sessionId, summary) => {
        setSummaryData(summary);
        setStep('summary');
    };

    const handleReset = () => {
        setSetupData(null);
        setSummaryData(null);
        setStep('setup');
    };

    return (
        <div className="min-h-screen pt-28 pb-16 px-4 md:px-6">
            {step === 'setup' && (
                <MediaSetup onSetupComplete={handleSetupComplete} />
            )}

            {step === 'room' && setupData && (
                <RealtimeInterviewRoom
                    setupData={setupData}
                    onInterviewFinish={handleInterviewFinish}
                />
            )}

            {step === 'summary' && (
                <InterviewSummaryReport
                    summaryData={summaryData}
                    onReset={handleReset}
                />
            )}
        </div>
    );
};

export default AIInterviewContainer;
