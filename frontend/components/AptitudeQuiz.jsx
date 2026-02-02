import React, { useState, useEffect } from 'react';

export default function AptitudeQuiz({ question, onSubmit, timeLimit = 300 }) {
  const [selectedAnswer, setSelectedAnswer] = useState('');
  const [timeLeft, setTimeLeft] = useState(timeLimit);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    // Reset component state when question changes
    setSelectedAnswer('');
    setTimeLeft(timeLimit);
    setSubmitted(false);
  }, [question, timeLimit]);

  useEffect(() => {
    if (timeLeft > 0 && !submitted) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && !submitted) {
      handleSubmit();
    }
  }, [timeLeft, submitted]);

  const handleSubmit = () => {
    if (submitted) return;
    setSubmitted(true);
    onSubmit({ answer: selectedAnswer, timeSpent: timeLimit - timeLeft });
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between bg-gradient-to-r from-red-50 to-orange-50 border-2 border-red-200 rounded-lg p-4">
        <div className="flex items-center space-x-2">
          <span className="text-2xl">⏱️</span>
          <span className="font-semibold text-gray-700">Time Remaining:</span>
        </div>
        <div className={`text-2xl font-bold ${timeLeft < 60 ? 'text-red-600 animate-pulse' : 'text-gray-800'}`}>
          {formatTime(timeLeft)}
        </div>
      </div>

      <div className="bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 border-2 border-blue-200 rounded-xl p-6">
        <p className="text-lg text-gray-800 leading-relaxed mb-6">{question.description}</p>

        {question.options && question.options.length > 0 ? (
          <div className="space-y-3">
            {question.options.map((option, idx) => {
              const optionLabel = String.fromCharCode(65 + idx);
              return (
                <button
                  key={idx}
                  onClick={() => !submitted && setSelectedAnswer(optionLabel)}
                  disabled={submitted}
                  className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                    selectedAnswer === optionLabel
                      ? 'border-purple-500 bg-purple-100 shadow-lg'
                      : 'border-gray-300 bg-white hover:border-purple-300 hover:shadow-md'
                  } ${submitted ? 'opacity-75 cursor-not-allowed' : 'cursor-pointer'}`}
                >
                  <div className="flex items-center space-x-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                      selectedAnswer === optionLabel
                        ? 'bg-purple-600 text-white'
                        : 'bg-gray-200 text-gray-700'
                    }`}>
                      {optionLabel}
                    </div>
                    <span className="flex-1 text-gray-800">{option}</span>
                  </div>
                </button>
              );
            })}
          </div>
        ) : (
          <div className="bg-white border-2 border-gray-300 rounded-lg p-4">
            <textarea
              value={selectedAnswer}
              onChange={(e) => !submitted && setSelectedAnswer(e.target.value)}
              disabled={submitted}
              placeholder="Enter your answer here..."
              className="w-full h-32 p-3 border-0 focus:outline-none resize-none"
            />
          </div>
        )}
      </div>

      <div className="flex justify-end">
        <button
          onClick={handleSubmit}
          disabled={submitted || (!selectedAnswer && question.options)}
          className="px-8 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {submitted ? 'Submitted' : 'Submit Answer'}
        </button>
      </div>
    </div>
  );
}
