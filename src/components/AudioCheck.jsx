import { useState } from "react";

export const AudioCheck = () => {
    const [audioStatus, setAudioStatus] = useState('checking');

    const testAudio = () => {
        const testUtterance = new SpeechSynthesisUtterance("टेस्ट ऑडियो");
        testUtterance.volume = 1;
        testUtterance.onstart = () => setAudioStatus('working');
        testUtterance.onerror = () => setAudioStatus('error');
        testUtterance.onend = () => setAudioStatus('completed');

        window.speechSynthesis.speak(testUtterance);
    };

    return (
        <div className="mb-4 p-4 bg-gray-700 rounded-lg">
            <div className="flex items-center justify-between">
                <span className="text-white">Audio Status: </span>
                <span className={`ml-2 px-2 py-1 rounded ${audioStatus === 'working' ? 'bg-green-500' :
                    audioStatus === 'error' ? 'bg-red-500' : 'bg-yellow-500'
                    }`}>
                    {audioStatus}
                </span>
                <button
                    onClick={testAudio}
                    className="ml-4 bg-green-600 text-white px-3 py-1 rounded"
                >
                    Test Audio
                </button>
            </div>
        </div>
    );
};