import { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Video, VideoOff, Bot, User, Clock, RefreshCw, ArrowLeft, ArrowRight, Moon, Radio, XCircle } from 'lucide-react';

function InterviewDashboard({ questions, sessionId, onEndInterview, candidateName = 'Alex Johnson', duration = 30 }) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [interviewHistory, setInterviewHistory] = useState([]);
  const processorRef = useRef(null);
  const streamRef = useRef(null);
  const totalQuestions = questions.length;
  
  // Calculate time per question in seconds
  const timePerQuestion = Math.floor((duration * 60) / totalQuestions);
  const [questionTimeRemaining, setQuestionTimeRemaining] = useState(timePerQuestion);
  
  // Fetch user name from localStorage (set in Profile.jsx)
  const getUserName = () => {
    try {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        const userObj = JSON.parse(storedUser);
        return userObj.name || candidateName;
      }
    } catch (error) {
      console.error('Error fetching user from localStorage:', error);
    }
    return candidateName;
  };
  
  const displayName = getUserName();
  const firstName = displayName.split(' ')[0];

  // Timer for each question
  useEffect(() => {
    const timer = setInterval(() => {
      setQuestionTimeRemaining(prev => {
        if (prev <= 1) {
          if (currentQuestionIndex < totalQuestions - 1) {
            setCurrentQuestionIndex(c => c + 1);
            setTranscript('');
          }
          return timePerQuestion;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [currentQuestionIndex, totalQuestions, timePerQuestion]);

  useEffect(() => {
    setQuestionTimeRemaining(timePerQuestion);
  }, [currentQuestionIndex, timePerQuestion]);

  useEffect(() => {
    if (currentQuestionIndex > 0) {
      speakQuestion();
    }
  }, [currentQuestionIndex]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const speakQuestion = async () => {
    const currentQuestion = questions[currentQuestionIndex]?.question;
    if (!currentQuestion) return;

    setIsPlaying(true);
    
    // Show typing animation for 1.5 seconds before adding question to history
    setTimeout(() => {
      setInterviewHistory(prev => [...prev, { type: 'ai', text: currentQuestion }]);
    }, 1500);
    
    try {
      const response = await fetch('http://localhost:5000/speak-question', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: currentQuestion })
      });

      const result = await response.json();
      
      if (result.success && result.audio) {
        const audio = new Audio(`data:audio/wav;base64,${result.audio}`);
        audio.onended = () => setIsPlaying(false);
        audio.onerror = () => setIsPlaying(false);
        await audio.play();
      } else {
        setIsPlaying(false);
      }
    } catch (error) {
      console.error('TTS Error:', error);
      setIsPlaying(false);
    }
  };

  const handleNext = () => {
    if (currentQuestionIndex < totalQuestions - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setTranscript('');
      setQuestionTimeRemaining(timePerQuestion);
    }
  };

  const handleBack = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
      setTranscript('');
      setQuestionTimeRemaining(timePerQuestion);
    }
  };

  const toggleRecording = async () => {
    if (!isRecording) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ 
          audio: { sampleRate: 16000, channelCount: 1, echoCancellation: true, noiseSuppression: true } 
        });
        
        streamRef.current = stream;
        const mediaRecorder = new MediaRecorder(stream);
        const audioChunks = [];
        
        mediaRecorder.ondataavailable = (e) => {
          if (e.data.size > 0) {
            audioChunks.push(e.data);
          }
        };
        
        mediaRecorder.onstop = async () => {
          const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
          
          const formData = new FormData();
          formData.append('audio', audioBlob, 'answer.webm');
          formData.append('session_id', sessionId);
          formData.append('question_index', currentQuestionIndex);
          
          try {
            const response = await fetch('http://localhost:5000/transcribe-answer', {
              method: 'POST',
              body: formData
            });
            
            const result = await response.json();
            if (result.success && result.transcript) {
              setTranscript(result.transcript);
              setInterviewHistory(prev => [...prev, { type: 'user', text: result.transcript }]);
            }
          } catch (error) {
            console.error('Transcription error:', error);
          }
          
          stream.getTracks().forEach(track => track.stop());
        };
        
        mediaRecorder.start();
        processorRef.current = mediaRecorder;
        setIsRecording(true);
        setTranscript('');
        
      } catch (error) {
        console.error('Microphone error:', error);
        alert('Could not access microphone');
      }
    } else {
      setIsRecording(false);
      
      if (processorRef.current) {
        processorRef.current.stop();
      }
    }
  };

  const currentQuestion = questions[currentQuestionIndex]?.question || 'No question available';

  return (
    <div className="min-h-screen bg-[#F5F7FB] p-6 overflow-auto">
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        @keyframes pulse-glow {
          0%, 100% { box-shadow: 0 0 20px rgba(34, 197, 94, 0.4); }
          50% { box-shadow: 0 0 30px rgba(34, 197, 94, 0.7); }
        }
        @keyframes pulse-ring {
          0% { transform: scale(1); opacity: 1; }
          100% { transform: scale(1.4); opacity: 0; }
        }
        @keyframes slideInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes typing-dot {
          0%, 60%, 100% { transform: translateY(0); }
          30% { transform: translateY(-8px); }
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-4px); }
          75% { transform: translateX(4px); }
        }
        .animate-float { animation: float 3s ease-in-out infinite; }
        .animate-pulse-glow { animation: pulse-glow 2s ease-in-out infinite; }
        .animate-slide-in { animation: slideInUp 0.4s ease-out; }
        .hover-lift { transition: all 0.2s ease; }
        .hover-lift:hover { transform: translateY(-2px); box-shadow: 0 10px 25px rgba(0,0,0,0.1); }
        .hover-scale { transition: all 0.2s ease; }
        .hover-scale:hover { transform: scale(1.03); }
      `}</style>

      <div className="max-w-7xl mx-auto">
        {/* HEADER */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-2 group cursor-pointer">
            <div className="w-8 h-8 bg-gradient-to-br from-[#6C5CE7] to-[#8B7CF6] rounded-lg flex items-center justify-center transition-transform duration-200 group-hover:scale-110">
              <span className="text-white font-bold text-sm">T</span>
            </div>
            <span className="text-[#1F2937] font-bold text-lg">TalentAI</span>
          </div>
          
          <div className="inline-flex items-center gap-2 bg-[#22C55E] bg-opacity-10 text-[#22C55E] rounded-full px-4 py-2 text-sm font-semibold animate-pulse-glow">
            <Radio className="w-4 h-4" />
            LIVE SESSION
          </div>
          
          <button className="w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-all duration-200 hover:rotate-12 shadow-sm">
            <Moon className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* MAIN SECTION - Two Cards Side by Side */}
        <div className="grid grid-cols-2 gap-6 mb-8">
          {/* Card 1: AI Interviewer */}
          <div className="bg-white rounded-2xl shadow-lg p-8 text-center hover:shadow-xl transition-all duration-250 hover:-translate-y-1">
            <div className="flex flex-col items-center">
              <div className="relative mb-4">
                <div className="absolute inset-0 rounded-full bg-[#6C5CE7] opacity-20 blur-2xl animate-float"></div>
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[#6C5CE7] to-[#8B7CF6] flex items-center justify-center shadow-xl animate-float relative z-10">
                  <Bot className="w-12 h-12 text-white" />
                </div>
                <div className="absolute -right-2 top-0 w-8 h-8 bg-white rounded-full shadow-lg flex items-center justify-center">
                  <Mic className={`w-4 h-4 ${isPlaying ? 'text-[#6C5CE7] animate-pulse' : 'text-gray-400'}`} />
                </div>
              </div>
              
              <h3 className="text-xl font-bold text-[#1F2937] mb-2">AI Interviewer</h3>
              <span className="inline-block bg-[#22C55E] bg-opacity-10 text-[#22C55E] px-3 py-1 rounded-full text-sm font-medium">
                Ready to assist
              </span>
            </div>
          </div>

          {/* Card 2: Candidate */}
          <div className="bg-white rounded-2xl shadow-lg p-8 text-center hover:shadow-xl transition-all duration-250 hover:-translate-y-1">
            <div className="flex flex-col items-center">
              <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center mb-4 hover:scale-105 transition-transform duration-200">
                <User className="w-12 h-12 text-gray-500" />
              </div>
              
              <h3 className="text-xl font-bold text-[#1F2937] mb-1">{displayName}</h3>
              <p className="text-gray-500 text-sm mb-4">Software Engineer Candidate</p>
              
              <div className="flex items-center gap-3">
                <button
                  onClick={toggleRecording}
                  className="relative w-12 h-12 rounded-full bg-[#6C5CE7] hover:bg-[#5B4BC6] flex items-center justify-center shadow-lg transition-all duration-200 hover-scale"
                >
                  {isRecording && (
                    <>
                      <span className="absolute inset-0 rounded-full bg-[#6C5CE7] animate-ping opacity-75"></span>
                      <span className="absolute inset-0 rounded-full border-4 border-[#6C5CE7] animate-[pulse-ring_1.5s_ease-out_infinite]"></span>
                    </>
                  )}
                  <Mic className="w-5 h-5 text-white relative z-10" />
                </button>
                
                <button className="w-12 h-12 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center shadow-lg transition-all duration-200 hover-scale">
                  <VideoOff className="w-5 h-5 text-gray-500" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* QUESTION CARD */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8 hover-lift animate-slide-in">
          {/* Top Row */}
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-3">
              <span className="inline-block bg-[#6C5CE7] bg-opacity-10 text-[#6C5CE7] px-3 py-1.5 rounded-lg text-sm font-semibold">
                QUESTION {currentQuestionIndex + 1}/{totalQuestions}
              </span>
              <span className="inline-block bg-gray-100 text-gray-700 px-3 py-1.5 rounded-lg text-sm font-medium">
                Technical • JavaScript
              </span>
            </div>
            <div className="flex items-center gap-2 text-gray-600">
              <Clock className="w-5 h-5" />
              <span className={`font-mono text-base font-semibold ${questionTimeRemaining <= 30 ? 'text-red-500 animate-pulse' : ''}`}>
                {Math.floor(questionTimeRemaining / 60).toString().padStart(2, '0')}:{(questionTimeRemaining % 60).toString().padStart(2, '0')} remaining
              </span>
            </div>
          </div>

          {/* Main Question */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-[#1F2937] leading-relaxed">
              {currentQuestion.includes('null') && currentQuestion.includes('undefined') ? (
                <>
                  What is the difference between <span className="text-[#6C5CE7] italic">null</span> and <span className="text-[#6C5CE7] italic">undefined</span> in JavaScript?
                </>
              ) : (
                currentQuestion
              )}
            </h2>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <button 
                onClick={speakQuestion} 
                className="flex items-center gap-2 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 text-sm font-medium hover-scale shadow-sm"
              >
                <RefreshCw className="w-4 h-4" />
                Repeat
              </button>
              <button 
                onClick={handleBack} 
                disabled={currentQuestionIndex === 0} 
                className="flex items-center gap-2 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed text-sm font-medium hover-scale shadow-sm disabled:hover:scale-100"
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </button>
              <button 
                onClick={onEndInterview} 
                className="flex items-center gap-2 px-4 py-2.5 border border-[#EF4444] text-[#EF4444] rounded-xl hover:bg-red-50 text-sm font-medium hover-scale shadow-sm hover:animate-[shake_0.5s_ease-in-out]"
              >
                <XCircle className="w-4 h-4" />
                End Interview
              </button>
            </div>
            
            <button 
              onClick={handleNext} 
              disabled={currentQuestionIndex >= totalQuestions - 1} 
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#6C5CE7] to-[#8B7CF6] text-white rounded-xl hover:from-[#5B4BC6] hover:to-[#7A6BE5] disabled:opacity-40 disabled:cursor-not-allowed text-sm font-semibold hover-scale shadow-lg disabled:hover:scale-100 group"
            >
              Next Question
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-200" />
            </button>
          </div>
        </div>

        {/* LIVE TRANSCRIPT SECTION */}
        <div className="bg-white rounded-2xl shadow-lg p-8 hover-lift">
          <h3 className="text-xl font-bold text-[#1F2937] mb-6">Live Transcript</h3>
          
          <div className="space-y-5 max-h-[500px] overflow-y-auto pr-2">
            {interviewHistory.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-400 text-sm">No conversation yet. Start speaking to see the transcript.</p>
              </div>
            ) : (
              interviewHistory.map((item, idx) => (
                item.type === 'ai' ? (
                  // AI Message - Left Aligned
                  <div key={idx} className="flex gap-3 animate-slide-in">
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 rounded-full bg-[#6C5CE7] flex items-center justify-center shadow-md">
                        <Bot className="w-5 h-5 text-white" />
                      </div>
                    </div>
                    <div className="flex-1 max-w-[75%]">
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">INTERVIEWER</span>
                        <span className="text-xs text-gray-400">Just now</span>
                      </div>
                      <div className="bg-gray-50 rounded-2xl rounded-tl-sm p-4 shadow-sm">
                        <p className="text-sm text-[#1F2937] leading-relaxed">{item.text}</p>
                      </div>
                    </div>
                  </div>
                ) : (
                  // User Message - Right Aligned
                  <div key={idx} className="flex gap-3 justify-end animate-slide-in">
                    <div className="flex-1 max-w-[75%] flex flex-col items-end">
                      <div className="flex items-center justify-between w-full mb-1.5">
                        <span className="text-xs text-gray-400">Just now</span>
                        <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">YOU ({firstName.toUpperCase()})</span>
                      </div>
                      <div className="bg-[#6C5CE7] bg-opacity-10 rounded-2xl rounded-tr-sm p-4 shadow-sm">
                        <p className="text-sm text-[#1F2937] leading-relaxed text-left">{item.text}</p>
                      </div>
                    </div>
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center shadow-md">
                        <User className="w-5 h-5 text-gray-600" />
                      </div>
                    </div>
                  </div>
                )
              ))
            )}
            
            {isPlaying && interviewHistory.length > 0 && (
              <div className="flex gap-3 animate-slide-in">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 rounded-full bg-[#6C5CE7] flex items-center justify-center shadow-md">
                    <Bot className="w-5 h-5 text-white" />
                  </div>
                </div>
                <div className="flex-1 max-w-[75%]">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">INTERVIEWER</span>
                    <span className="text-xs text-gray-400 italic">typing...</span>
                  </div>
                  <div className="bg-gray-50 rounded-2xl rounded-tl-sm p-4 shadow-sm">
                    <div className="flex gap-1.5">
                      <div className="w-2 h-2 bg-[#6C5CE7] rounded-full" style={{ animation: 'typing-dot 1.4s ease-in-out infinite' }}></div>
                      <div className="w-2 h-2 bg-[#6C5CE7] rounded-full" style={{ animation: 'typing-dot 1.4s ease-in-out 0.2s infinite' }}></div>
                      <div className="w-2 h-2 bg-[#6C5CE7] rounded-full" style={{ animation: 'typing-dot 1.4s ease-in-out 0.4s infinite' }}></div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default InterviewDashboard;
