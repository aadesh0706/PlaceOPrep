import { useEffect, useState } from 'react';
import { Search, Brain, Building2, Filter, Play, ArrowLeft, CheckCircle, XCircle, Clock, Trophy, Home } from 'lucide-react';
import api from '../services/api';
import AptitudeQuiz from '../components/AptitudeQuiz';

const APTITUDE_CATEGORIES = [
  { id: 'all', name: 'All Categories', icon: '📊', desc: 'All aptitude questions' },
  { id: 'quantitative', name: 'Quantitative', icon: '🔢', desc: 'Math and numerical problems' },
  { id: 'logical', name: 'Logical Reasoning', icon: '🧠', desc: 'Pattern recognition and logic' },
  { id: 'verbal', name: 'Verbal Ability', icon: '📝', desc: 'Reading comprehension and grammar' },
  { id: 'spatial', name: 'Spatial Reasoning', icon: '🔲', desc: 'Visual and spatial puzzles' },
  { id: 'technical', name: 'Technical Questions', icon: '💻', desc: 'Programming and technical concepts' }
];

const COMPANIES = ['tcs', 'infosys', 'wipro', 'capgemini', 'accenture', 'cognizant'];

export default function Aptitude() {
  const [questions, setQuestions] = useState([]);
  const [filteredQuestions, setFilteredQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    difficulty: 'all',
    search: ''
  });
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedCompanies, setSelectedCompanies] = useState([]);
  const [examMode, setExamMode] = useState(false);
  const [examQuestions, setExamQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [examResults, setExamResults] = useState([]);
  const [examStartTime, setExamStartTime] = useState(null);
  const [showResults, setShowResults] = useState(false);
  const [finalResults, setFinalResults] = useState(null);
  const [showExitConfirm, setShowExitConfirm] = useState(false);

  useEffect(() => {
    fetchAptitudeQuestions();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [filters, questions, selectedCategory, selectedCompanies]);

  const fetchAptitudeQuestions = async () => {
    try {
      // Load questions directly from JSON files
      const [logicalRes, mathRes, techRes] = await Promise.all([
        fetch('/logical_reasoning.json'),
        fetch('/mathematical_aptitude.json'),
        fetch('/technical_questions.json')
      ]);
      
      const [logical, math, tech] = await Promise.all([
        logicalRes.json(),
        mathRes.json(), 
        techRes.json()
      ]);
      
      const allQuestions = [
        ...logical.map(q => ({ ...q, category: 'logical', _id: `logical_${q.question_no}` })),
        ...math.map(q => ({ ...q, category: 'quantitative', _id: `math_${q.question_no}` })),
        ...tech.map(q => ({ ...q, category: 'technical', _id: `tech_${q.question_no}` }))
      ].map(q => ({
        _id: q._id,
        title: `Question ${q.question_no}`,
        description: q.question,
        options: [q.options.A, q.options.B, q.options.C, q.options.D],
        correctAnswer: q.answer,
        difficulty: q.difficulty || 'medium',
        category: q.category,
        type: 'mcq',
        company: [q.company_tag],
        question_no: q.question_no,
        companyTag: q.company_tag
      }));
      
      console.log('Loaded questions from JSON files:', allQuestions.length);
      setQuestions(allQuestions);
      setFilteredQuestions(allQuestions);
      return allQuestions;
    } catch (error) {
      console.error('Error loading JSON files:', error);
      setQuestions([]);
      setFilteredQuestions([]);
      return [];
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...questions];

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(q => {
        const questionCategory = (q.category || '').toLowerCase();
        if (questionCategory === selectedCategory) {
          return true;
        }
        const categoryKeywords = {
          quantitative: ['math', 'number', 'calculate', 'formula', 'equation', 'percentage', 'ratio', 'profit', 'loss'],
          logical: ['pattern', 'sequence', 'logic', 'reasoning', 'puzzle', 'arrangement', 'series'],
          verbal: ['reading', 'comprehension', 'grammar', 'vocabulary', 'sentence', 'paragraph'],
          data: ['chart', 'graph', 'table', 'data', 'interpretation', 'analysis', 'statistics'],
          spatial: ['shape', 'figure', 'visual', 'spatial', 'geometry', 'cube', 'dice']
        };
        const keywords = categoryKeywords[selectedCategory] || [];
        const content = ((q.description || '') + ' ' + (q.title || '')).toLowerCase();
        return keywords.some(keyword => content.includes(keyword));
      });
    }

    if (selectedCompanies.length > 0) {
      filtered = filtered.filter(q => {
        if (!q.company || !Array.isArray(q.company)) return false;
        return q.company.some(c => selectedCompanies.includes(c.toLowerCase()));
      });
    }

    if (filters.difficulty !== 'all') {
      filtered = filtered.filter(q => getDifficultyMapping(q.difficulty) === filters.difficulty);
    }

    if (filters.search) {
      filtered = filtered.filter(q =>
        q.title.toLowerCase().includes(filters.search.toLowerCase()) ||
        q.description.toLowerCase().includes(filters.search.toLowerCase())
      );
    }

    setFilteredQuestions(filtered);
  };

  const getDifficultyColor = (difficulty) => {
    switch(difficulty) {
      case 'beginner':
      case 'easy': return 'bg-green-100 text-green-700 border-green-300';
      case 'intermediate':
      case 'medium': return 'bg-yellow-100 text-yellow-700 border-yellow-300';
      case 'advanced':
      case 'hard': return 'bg-red-100 text-red-700 border-red-300';
      case 'pro': return 'bg-purple-100 text-purple-700 border-purple-300';
      default: return 'bg-gray-100 text-gray-700 border-gray-300';
    }
  };

  const getDifficultyMapping = (difficulty) => {
    const mapping = {
      'beginner': 'easy',
      'easy': 'easy',
      'intermediate': 'medium', 
      'medium': 'medium',
      'advanced': 'hard',
      'hard': 'hard',
      'pro': 'pro'
    };
    return mapping[difficulty] || difficulty;
  };

  const getDifficultyLabel = (difficulty) => {
    const mapping = {
      'beginner': 'Easy',
      'easy': 'Easy',
      'intermediate': 'Medium',
      'medium': 'Medium',
      'advanced': 'Hard',
      'hard': 'Hard',
      'pro': 'Pro'
    };
    return mapping[difficulty] || difficulty;
  };

  const startExam = async () => {
    try {
      setLoading(true);

      let availableQuestions = [...questions];

      if (availableQuestions.length === 0) {
        console.log('No questions in state, attempting to fetch...');
        const fetchedQuestions = await fetchAptitudeQuestions();
        availableQuestions = fetchedQuestions;
        
        if (availableQuestions.length === 0) {
          const retry = window.confirm(
            'No questions are currently loaded.\n\n' +
            'This could mean:\n' +
            '1. Questions are still loading\n' +
            '2. No aptitude questions exist in the database\n' +
            '3. There was an error fetching questions\n\n' +
            'Would you like to try fetching again?'
          );
          
          if (retry) {
            const retriedQuestions = await fetchAptitudeQuestions();
            availableQuestions = retriedQuestions;
          }
          
          if (availableQuestions.length === 0) {
            alert('No questions available. Please ensure aptitude questions have been imported into the database.\n\n' +
                  'You can import questions by running: node backend/seed_aptitude_from_csv.js');
            setLoading(false);
            return;
          }
        }
      }

      let allQuestions = [...availableQuestions];
      let filteredByCategory = allQuestions.length;
      let filteredByCompany = allQuestions.length;
      let filteredByDifficulty = allQuestions.length;

      if (selectedCategory !== 'all') {
        const beforeFilter = allQuestions.length;
        allQuestions = allQuestions.filter(q => {
          const questionCategory = (q.category || '').toLowerCase();
          if (questionCategory === selectedCategory) {
            return true;
          }
          const categoryKeywords = {
            quantitative: ['numerical', 'math', 'number', 'calculate', 'formula', 'equation', 'percentage', 'ratio', 'profit', 'loss'],
            logical: ['logical', 'pattern', 'sequence', 'logic', 'reasoning', 'puzzle', 'arrangement', 'series'],
            verbal: ['verbal', 'reading', 'comprehension', 'grammar', 'vocabulary', 'sentence', 'paragraph', 'synonym', 'antonym'],
            spatial: ['spatial', 'shape', 'figure', 'visual', 'geometry', 'cube', 'dice', 'mirror']
          };
          const keywords = categoryKeywords[selectedCategory] || [];
          const content = ((q.description || '') + ' ' + (q.title || '')).toLowerCase();
          return keywords.some(keyword => content.includes(keyword));
        });
        filteredByCategory = allQuestions.length;
        if (allQuestions.length === 0 && beforeFilter > 0) {
          console.warn(`No questions found for category: ${selectedCategory}. Available categories:`, 
            [...new Set(availableQuestions.map(q => q.category))]);
        }
      }

      if (selectedCompanies.length > 0) {
        const beforeFilter = allQuestions.length;
        const companyFiltered = allQuestions.filter(q => {
          if (!q.company || !Array.isArray(q.company)) return false;
          return q.company.some(c => selectedCompanies.includes(c.toLowerCase()));
        });
        if (companyFiltered.length > 0) {
          allQuestions = companyFiltered;
          filteredByCompany = allQuestions.length;
        } else {
          console.warn(`No questions found for selected companies: ${selectedCompanies.join(', ')}. Using all questions.`);
          filteredByCompany = beforeFilter;
        }
      }

      if (filters.difficulty !== 'all') {
        const beforeFilter = allQuestions.length;
        allQuestions = allQuestions.filter(q => getDifficultyMapping(q.difficulty) === filters.difficulty);
        filteredByDifficulty = allQuestions.length;
        if (allQuestions.length === 0 && beforeFilter > 0) {
          console.warn(`No questions found for difficulty: ${filters.difficulty}. Available difficulties:`, 
            [...new Set(questions.map(q => q.difficulty))]);
        }
      }

      if (allQuestions.length === 0) {
        let fallbackQuestions = [...questions];
        
        if (selectedCategory !== 'all') {
          fallbackQuestions = fallbackQuestions.filter(q => {
            const questionCategory = (q.category || '').toLowerCase();
            return questionCategory === selectedCategory;
          });
        }
        
        if (fallbackQuestions.length === 0 && filters.difficulty !== 'all') {
          fallbackQuestions = availableQuestions.filter(q => getDifficultyMapping(q.difficulty) === filters.difficulty);
        }
        
        if (fallbackQuestions.length === 0) {
          fallbackQuestions = [...availableQuestions];
        }
        
        if (fallbackQuestions.length > 0) {
          const useFallback = window.confirm(
            `No questions found for the exact selected criteria.\n\n` +
            `Would you like to use ${fallbackQuestions.length} available questions instead?\n\n` +
            `(This will ignore some of your filters)`
          );
          if (useFallback) {
            allQuestions = fallbackQuestions;
          } else {
            const message = `No questions found for the selected criteria.\n\n` +
              `Total questions available: ${availableQuestions.length}\n` +
              `After category filter: ${filteredByCategory}\n` +
              `After company filter: ${filteredByCompany}\n` +
              `After difficulty filter: ${filteredByDifficulty}\n\n` +
              `Please try:\n` +
              `- Select "All Categories"\n` +
              `- Select "All Levels" for difficulty\n` +
              `- Deselect companies or select different ones`;
            alert(message);
            setLoading(false);
            return;
          }
        } else {
          const message = `No questions available in the database.\n\n` +
            `Please ensure aptitude questions have been imported.\n\n` +
            `Run: node backend/seed_aptitude_from_csv.js`;
          alert(message);
          setLoading(false);
          return;
        }
      }

      const selectedQuestions = getRandomQuestions(allQuestions, Math.min(10, allQuestions.length));

      setExamQuestions(selectedQuestions);
      setExamMode(true);
      setCurrentQuestionIndex(0);
      setExamResults([]);
      setExamStartTime(Date.now());
      setLoading(false);
    } catch (error) {
      console.error('Error starting exam:', error);
      alert('Error starting exam: ' + error.message);
      setLoading(false);
    }
  };

  const handleExamSubmit = async (result) => {
    const currentQuestion = examQuestions[currentQuestionIndex];
    const isCorrect = currentQuestion.correctAnswer && 
      result.answer.toUpperCase() === currentQuestion.correctAnswer.toUpperCase();
    
    const questionResult = {
      questionId: currentQuestion._id,
      selectedAnswer: result.answer,
      correctAnswer: currentQuestion.correctAnswer || '',
      isCorrect: isCorrect,
      timeSpent: result.timeSpent
    };
    
    const updatedResults = [...examResults, questionResult];
    setExamResults(updatedResults);

    if (currentQuestionIndex < examQuestions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      await submitExamResults(updatedResults);
    }
  };

  const submitExamResults = async (results) => {
    try {
      // Check if user is logged in for results submission
      const token = localStorage.getItem('token');
      if (!token) {
        console.warn('Authentication required to save results');
        // Show results without saving to database
        const totalQuestions = examQuestions.length;
        const correctAnswers = results.filter(r => r.isCorrect).length;
        const score = Math.round((correctAnswers / totalQuestions) * 100);
        const totalTimeSpent = results.reduce((sum, r) => sum + r.timeSpent, 0);
        
        const resultsData = {
          score,
          totalQuestions,
          correctAnswers,
          totalTimeSpent,
          category: selectedCategory === 'all' ? 'all' : selectedCategory,
          difficulty: filters.difficulty === 'all' ? 'all' : filters.difficulty,
          questions: results,
          examQuestions,
          saved: false
        };
        
        setFinalResults(resultsData);
        setExamMode(false);
        setExamQuestions([]);
        setCurrentQuestionIndex(0);
        setExamResults([]);
        setExamStartTime(null);
        setShowResults(true);
        return;
      }

      const totalQuestions = examQuestions.length;
      const correctAnswers = results.filter(r => r.isCorrect).length;
      const score = Math.round((correctAnswers / totalQuestions) * 100);
      const totalTimeSpent = results.reduce((sum, r) => sum + r.timeSpent, 0);
      
      const examData = {
        category: selectedCategory === 'all' ? 'all' : selectedCategory,
        difficulty: filters.difficulty === 'all' ? 'all' : filters.difficulty,
        score: score,
        totalQuestions: totalQuestions,
        correctAnswers: correctAnswers,
        timeSpent: totalTimeSpent,
        questions: results
      };

      await api.post('/aptitude/results', examData);
      
      const resultsData = {
        score,
        totalQuestions,
        correctAnswers,
        totalTimeSpent,
        category: selectedCategory === 'all' ? 'all' : selectedCategory,
        difficulty: filters.difficulty === 'all' ? 'all' : filters.difficulty,
        questions: results,
        examQuestions,
        saved: true
      };
      
      setFinalResults(resultsData);
      setExamMode(false);
      setExamQuestions([]);
      setCurrentQuestionIndex(0);
      setExamResults([]);
      setExamStartTime(null);
      setShowResults(true);
    } catch (error) {
      console.error('Error submitting exam results:', error);
      setFinalResults({
        error: true,
        message: 'Error saving exam results. Please try again.'
      });
      setShowResults(true);
    }
  };

  const exitExam = () => {
    if (examResults.length > 0) {
      setShowExitConfirm(true);
    } else {
      setExamMode(false);
      setExamQuestions([]);
      setCurrentQuestionIndex(0);
      setExamResults([]);
      setExamStartTime(null);
    }
  };

  const confirmExit = () => {
    setExamMode(false);
    setExamQuestions([]);
    setCurrentQuestionIndex(0);
    setExamResults([]);
    setExamStartTime(null);
    setShowExitConfirm(false);
  };

  const cancelExit = () => {
    setShowExitConfirm(false);
  };

  const closeResults = () => {
    setShowResults(false);
    setFinalResults(null);
  };

  const filterByCompany = (q) => {
    if (selectedCompanies.length === 0) return true;
    return q.company?.some(c => selectedCompanies.includes(c.toLowerCase()));
  };

  const getRandomQuestions = (list, count) => {
    return list.sort(() => Math.random() - 0.5).slice(0, count);
  };

  const getDifficultyStats = () => {
    const stats = { easy: 0, medium: 0, hard: 0 };
    questions.forEach(q => {
      const diff = q.difficulty?.toLowerCase();
      if (diff === 'beginner' || diff === 'easy') stats.easy++;
      else if (diff === 'intermediate' || diff === 'medium') stats.medium++;
      else if (diff === 'advanced' || diff === 'hard') stats.hard++;
    });
    return stats;
  };

  const difficultyStats = getDifficultyStats();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-purple-500"></div>
      </div>
    );
  }

  if (examMode) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Exit Confirmation Modal */}
        {showExitConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl shadow-xl p-6 max-w-md w-full mx-4">
              <h3 className="text-xl font-bold text-gray-800 mb-4">Exit Exam?</h3>
              <p className="text-gray-600 mb-6">
                Are you sure you want to exit? Your progress will be lost.
              </p>
              <div className="flex space-x-3">
                <button
                  onClick={confirmExit}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  Exit Exam
                </button>
                <button
                  onClick={cancelExit}
                  className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Exam Header */}
        <div className="bg-white shadow-sm border-b">
          <div className="max-w-4xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <button
                  onClick={exitExam}
                  className="flex items-center space-x-2 text-gray-600 hover:text-gray-800"
                >
                  <ArrowLeft className="w-5 h-5" />
                  <span>Exit Exam</span>
                </button>
                <div>
                  <h1 className="text-xl font-bold text-gray-800">Aptitude Practice Exam</h1>
                  <p className="text-sm text-gray-600">
                    Question {currentQuestionIndex + 1} of {examQuestions.length}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-600">
                  Companies: {selectedCompanies.length > 0 ? selectedCompanies.join(', ') : 'All'}
                </span>
                <span className="text-sm text-gray-600">
                  Category: {APTITUDE_CATEGORIES.find(c => c.id === selectedCategory)?.name || 'All'}
                </span>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                  filters.difficulty === 'easy' ? 'bg-green-100 text-green-700' :
                  filters.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                  filters.difficulty === 'hard' ? 'bg-red-100 text-red-700' :
                  'bg-gray-100 text-gray-700'
                }`}>
                  {filters.difficulty === 'all' ? 'All Levels' : filters.difficulty}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-6 py-8">
          {examQuestions[currentQuestionIndex] && (
            <AptitudeQuiz
              question={examQuestions[currentQuestionIndex]}
              onSubmit={handleExamSubmit}
              timeLimit={examQuestions[currentQuestionIndex].timeLimit || 180}
            />
          )}
        </div>
      </div>
    );
  }

  if (showResults && finalResults) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-4xl mx-auto">
          {finalResults.error ? (
            <div className="bg-white rounded-xl shadow-lg p-8">
              <div className="text-center">
                <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-gray-800 mb-2">Error</h2>
                <p className="text-gray-600 mb-6">{finalResults.message}</p>
                <button
                  onClick={closeResults}
                  className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
              <div className={`p-8 text-center ${
                finalResults.score >= 80 ? 'bg-gradient-to-r from-green-500 to-emerald-600' :
                finalResults.score >= 60 ? 'bg-gradient-to-r from-yellow-500 to-orange-500' :
                'bg-gradient-to-r from-red-500 to-pink-600'
              }`}>
                <Trophy className="w-20 h-20 text-white mx-auto mb-4" />
                <h2 className="text-4xl font-bold text-white mb-2">Exam Completed!</h2>
                <p className="text-white text-lg">Your Results</p>
              </div>

              <div className="p-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-6 text-center">
                    <div className="text-4xl font-bold text-blue-600 mb-2">{finalResults.score}%</div>
                    <div className="text-gray-600 font-medium">Score</div>
                  </div>
                  <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-6 text-center">
                    <div className="text-4xl font-bold text-green-600 mb-2">
                      {finalResults.correctAnswers}/{finalResults.totalQuestions}
                    </div>
                    <div className="text-gray-600 font-medium">Correct Answers</div>
                  </div>
                  <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-6 text-center">
                    <div className="text-4xl font-bold text-purple-600 mb-2">
                      {Math.floor(finalResults.totalTimeSpent / 60)}:{(finalResults.totalTimeSpent % 60).toString().padStart(2, '0')}
                    </div>
                    <div className="text-gray-600 font-medium">Time Taken</div>
                  </div>
                </div>

                <div className="mb-6">
                  <h3 className="text-xl font-bold text-gray-800 mb-4">Exam Details</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-gray-600">Category:</span>
                      <span className="ml-2 font-semibold text-gray-800 capitalize">
                        {finalResults.category === 'all' ? 'All Categories' : finalResults.category}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600">Difficulty:</span>
                      <span className="ml-2 font-semibold text-gray-800 capitalize">
                        {finalResults.difficulty === 'all' ? 'All Levels' : finalResults.difficulty}
                      </span>
                    </div>
                  </div>
                  {finalResults.saved === false && (
                    <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <p className="text-sm text-yellow-700">
                        <strong>Note:</strong> Results not saved to history. Please log in to save your progress.
                      </p>
                    </div>
                  )}
                  {finalResults.saved === true && (
                    <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                      <p className="text-sm text-green-700">
                        <strong>✓ Results saved!</strong> You can view this in your history.
                      </p>
                    </div>
                  )}
                </div>

                <div className="mb-6">
                  <h3 className="text-xl font-bold text-gray-800 mb-4">Question Review</h3>
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {finalResults.questions.map((result, index) => {
                      const question = finalResults.examQuestions[index];
                      return (
                        <div
                          key={index}
                          className={`p-4 rounded-lg border-2 ${
                            result.isCorrect
                              ? 'bg-green-50 border-green-200'
                              : 'bg-red-50 border-red-200'
                          }`}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center space-x-2 mb-2">
                                {result.isCorrect ? (
                                  <CheckCircle className="w-5 h-5 text-green-600" />
                                ) : (
                                  <XCircle className="w-5 h-5 text-red-600" />
                                )}
                                <span className="font-semibold text-gray-800">
                                  Question {index + 1}
                                </span>
                              </div>
                              <p className="text-sm text-gray-700 mb-2 line-clamp-2">
                                {question?.title || question?.description || 'Question'}
                              </p>
                              <div className="text-xs text-gray-600 space-y-1">
                                <div>
                                  <span className="font-medium">Your Answer:</span>{' '}
                                  <span className={result.isCorrect ? 'text-green-600' : 'text-red-600'}>
                                    {result.selectedAnswer}
                                  </span>
                                </div>
                                {!result.isCorrect && (
                                  <div>
                                    <span className="font-medium">Correct Answer:</span>{' '}
                                    <span className="text-green-600">{result.correctAnswer}</span>
                                  </div>
                                )}
                                <div>
                                  <span className="font-medium">Time:</span> {result.timeSpent}s
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="flex space-x-4">
                  <button
                    onClick={closeResults}
                    className="flex-1 px-6 py-3 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition-colors flex items-center justify-center space-x-2"
                  >
                    <Home className="w-5 h-5" />
                    <span>Back to Home</span>
                  </button>
                  <button
                    onClick={() => {
                      closeResults();
                      window.location.href = '/history';
                    }}
                    className="flex-1 px-6 py-3 bg-gray-200 text-gray-800 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
                  >
                    View History
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <div className="mb-8">
        <div className="flex items-center space-x-3 mb-2">
          <div className="p-3 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl">
            <Brain className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-4xl font-bold text-gray-800">Aptitude Questions</h1>
            <p className="text-gray-600 mt-1">Practice aptitude questions from top companies</p>
          </div>
        </div>
      </div>

      {!loading && questions.length === 0 && (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-8 rounded">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-yellow-700">
                <strong>No aptitude questions found.</strong> Please ensure the JSON files are in the public directory.
                <br />
                <span className="text-xs mt-1 block">Required files: logical_reasoning.json, mathematical_aptitude.json, technical_questions.json</span>
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Company Selection */}
      <div className="bg-white rounded-xl shadow-md p-6 mb-8">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Select Companies</h2>
        <div className="flex flex-wrap gap-3">
          {COMPANIES.map((company) => (
            <button
              key={company}
              onClick={() => {
                setSelectedCompanies(prev =>
                  prev.includes(company)
                    ? prev.filter(c => c !== company)
                    : [...prev, company]
                );
              }}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                selectedCompanies.includes(company)
                  ? 'bg-purple-500 text-white shadow-md'
                  : 'bg-white border-2 border-gray-300 text-gray-700 hover:border-purple-300'
              }`}
            >
              {company.toUpperCase()}
            </button>
          ))}
        </div>
        <p className="text-sm text-gray-600 mt-2">
          Selected: {selectedCompanies.length > 0 ? selectedCompanies.join(', ') : 'All companies'}
        </p>
      </div>

      {/* Category Selection */}
      <div className="bg-white rounded-xl shadow-md p-6 mb-8">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Choose Category</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {APTITUDE_CATEGORIES.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`p-4 rounded-lg border-2 transition-all ${
                selectedCategory === category.id
                  ? 'border-purple-500 bg-purple-50 shadow-md'
                  : 'border-gray-200 bg-white hover:border-purple-300 hover:shadow-sm'
              }`}
            >
              <div className="text-2xl mb-2">{category.icon}</div>
              <h3 className="font-semibold text-gray-800 text-sm">{category.name}</h3>
              <p className="text-xs text-gray-600 mt-1">{category.desc}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Difficulty Filter */}
      <div className="bg-white rounded-xl shadow-md p-6 mb-8">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Select Difficulty</h2>
        <div className="flex flex-wrap gap-3">
          {['all', 'easy', 'medium', 'hard'].map((diff) => (
            <button
              key={diff}
              onClick={() => setFilters(prev => ({ ...prev, difficulty: diff }))}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                filters.difficulty === diff
                  ? diff === 'easy' ? 'bg-green-500 text-white shadow-md' :
                    diff === 'medium' ? 'bg-yellow-500 text-white shadow-md' :
                    diff === 'hard' ? 'bg-red-500 text-white shadow-md' :
                    'bg-purple-500 text-white shadow-md'
                  : 'bg-white border-2 border-gray-300 text-gray-700 hover:border-purple-300'
              }`}
            >
              {diff === 'all' ? 'All Levels' : diff.charAt(0).toUpperCase() + diff.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Exam Setup Card */}
      <div className="bg-white rounded-xl shadow-md p-6 mb-8">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Exam Setup</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div>
            <p className="text-sm text-gray-600 mb-1">Selected Companies</p>
            <p className="font-semibold text-gray-800">
              {selectedCompanies.length > 0 ? selectedCompanies.join(', ') : 'All companies'}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-1">Selected Category</p>
            <p className="font-semibold text-gray-800">
              {APTITUDE_CATEGORIES.find(c => c.id === selectedCategory)?.name || 'All'}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-1">Selected Difficulty</p>
            <p className="font-semibold text-gray-800">
              {filters.difficulty === 'all' ? 'All Levels' : filters.difficulty.charAt(0).toUpperCase() + filters.difficulty.slice(1)}
            </p>
          </div>
        </div>
        <div className="text-center">
          <button
            onClick={startExam}
            className="px-8 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg font-semibold hover:from-purple-700 hover:to-indigo-700 transition-all"
          >
            Start Exam
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Total Questions</p>
              <p className="text-3xl font-bold text-gray-800">{questions.length}</p>
            </div>
            <Brain className="w-12 h-12 text-purple-500 opacity-20" />
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Easy</p>
              <p className="text-3xl font-bold text-green-600">{difficultyStats.easy}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <span className="text-green-600 font-bold">E</span>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Medium</p>
              <p className="text-3xl font-bold text-yellow-600">{difficultyStats.medium}</p>
            </div>
            <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
              <span className="text-yellow-600 font-bold">M</span>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Hard</p>
              <p className="text-3xl font-bold text-red-600">{difficultyStats.hard}</p>
            </div>
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
              <span className="text-red-600 font-bold">H</span>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Practice */}
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-xl p-6 mb-8 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold mb-2">Quick Practice</h2>
            <p className="text-purple-100">Test your skills with a random aptitude question</p>
          </div>
          <button
            onClick={() => window.location.href = '/aptitude-practice'}
            className="px-6 py-3 bg-white text-purple-600 rounded-lg font-semibold hover:bg-gray-50 transition-colors flex items-center space-x-2"
          >
            <Play className="w-5 h-5" />
            <span>Start Practice</span>
          </button>
        </div>
      </div>

    </div>
  );
}
