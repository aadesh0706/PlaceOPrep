import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, Circle, Code2, Sprout, Zap, Flame } from 'lucide-react';
import api from '../services/api';

export default function CodingProblems() {
  const navigate = useNavigate();
  const [questions, setQuestions] = useState([]);
  const [filteredQuestions, setFilteredQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    difficulty: 'all',
    category: 'all',
    status: 'all'
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [solvedQuestions, setSolvedQuestions] = useState(new Set());
  const itemsPerPage = 9;

  useEffect(() => {
    fetchQuestions();
    fetchSolvedQuestions();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [filters, searchQuery, questions, solvedQuestions]); // Added solvedQuestions dependency

  const fetchQuestions = async () => {
    try {
      const response = await fetch('/merged_problems.json');
      const data = await response.json();
      const fetchedQuestions = data.questions || [];
      
      // Transform questions to match expected format
      const transformedQuestions = fetchedQuestions.map((q, index) => ({
        _id: q.id || `question-${index}`,
        title: q.title,
        description: q.description,
        difficulty: q.difficulty,
        topics: q.topics || [],
        examples: q.examples || [],
        constraints: q.constraints || [],
        testCases: q.test_cases?.map((tc, index) => ({
          input: JSON.stringify(tc.input),
          expectedOutput: JSON.stringify(tc.output),
          explanation: ''
        })) || q.examples?.map((ex, index) => ({
          input: JSON.stringify(ex.input),
          expectedOutput: JSON.stringify(ex.output),
          explanation: ex.explanation || ''
        })) || [],
        boilerplateCode: q.starter_code || {}
      }));
      
      setQuestions(transformedQuestions);
    } catch (error) {
      setQuestions([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchSolvedQuestions = async () => {
    try {
      // Force fresh data by adding timestamp to prevent caching
      const response = await api.get(`/submissions?_t=${Date.now()}`);
      const submissions = response.data.submissions || [];
      const solved = new Set(submissions.map(s => s.questionId).filter(Boolean));
      setSolvedQuestions(solved);
    } catch (error) {
      setSolvedQuestions(new Set());
    }
  };

  const applyFilters = () => {
    let filtered = [...questions];

    if (filters.difficulty !== 'all') {
      const difficultyMap = {
        'easy': ['beginner', 'easy'],
        'medium': ['intermediate', 'medium'],
        'hard': ['advanced', 'hard', 'pro']
      };
      filtered = filtered.filter(q => {
        const diff = q.difficulty?.toLowerCase();
        return difficultyMap[filters.difficulty]?.includes(diff);
      });
    }

    if (filters.category !== 'all') {
      filtered = filtered.filter(q => {
        const tags = getTags(q);
        return tags.some(tag => tag.toLowerCase().includes(filters.category.toLowerCase()));
      });
    }

    if (filters.status === 'solved') {
      filtered = filtered.filter(q => solvedQuestions.has(q._id));
    } else if (filters.status === 'unsolved') {
      filtered = filtered.filter(q => !solvedQuestions.has(q._id));
    }

    if (searchQuery) {
      filtered = filtered.filter(q =>
        q.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        q._id?.toString().includes(searchQuery) ||
        q.description?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredQuestions(filtered);
    setCurrentPage(1);
  };

  const getDifficultyStats = () => {
    const stats = { easy: { total: 0, solved: 0 }, medium: { total: 0, solved: 0 }, hard: { total: 0, solved: 0 } };
    
    questions.forEach(q => {
      const diff = q.difficulty?.toLowerCase();
      const isSolved = solvedQuestions.has(q._id);
      
      if (diff === 'beginner' || diff === 'easy') {
        stats.easy.total++;
        if (isSolved) stats.easy.solved++;
      } else if (diff === 'intermediate' || diff === 'medium') {
        stats.medium.total++;
        if (isSolved) stats.medium.solved++;
      } else if (diff === 'advanced' || diff === 'hard' || diff === 'pro') {
        stats.hard.total++;
        if (isSolved) stats.hard.solved++;
      }
    });

    return {
      easy: {
        ...stats.easy,
        fillAmount: stats.easy.total > 0 ? stats.easy.solved / stats.easy.total : 0,
        thisWeek: Math.max(0, Math.min(stats.easy.solved, 3))
      },
      medium: {
        ...stats.medium,
        fillAmount: stats.medium.total > 0 ? stats.medium.solved / stats.medium.total : 0,
        thisWeek: Math.max(0, Math.min(stats.medium.solved, 2))
      },
      hard: {
        ...stats.hard,
        fillAmount: stats.hard.total > 0 ? stats.hard.solved / stats.hard.total : 0,
        thisWeek: Math.max(0, Math.min(stats.hard.solved, 1))
      }
    };
  };

  const getDifficultyLabel = (difficulty) => {
    const diff = difficulty?.toLowerCase();
    if (diff === 'beginner' || diff === 'easy') return 'EASY';
    if (diff === 'intermediate' || diff === 'medium') return 'MEDIUM';
    if (diff === 'advanced' || diff === 'hard' || diff === 'pro') return 'HARD';
    return 'MEDIUM';
  };

  const getDifficultyColor = (difficulty) => {
    const diff = difficulty?.toLowerCase();
    if (diff === 'beginner' || diff === 'easy') return 'bg-green-100 text-green-800';
    if (diff === 'intermediate' || diff === 'medium') return 'bg-yellow-100 text-yellow-800';
    if (diff === 'advanced' || diff === 'hard' || diff === 'pro') return 'bg-red-100 text-red-800';
    return 'bg-gray-100 text-gray-800';
  };

  const getDifficultyProgressColor = (difficulty) => {
    if (difficulty === 'easy') return 'text-green-600';
    if (difficulty === 'medium') return 'text-amber-600';
    return 'text-red-600';
  };

  const getTags = (question) => {
    const tags = [];
    const desc = (question.description || '').toLowerCase();
    const title = (question.title || '').toLowerCase();
    
    if (title.includes('two sum') || title.includes('three sum')) tags.push('Arrays', 'Hash Table');
    if (title.includes('valid parentheses') || desc.includes('parentheses') || desc.includes('bracket')) tags.push('Stack', 'String');
    if (title.includes('linked list') || desc.includes('linked list')) tags.push('Linked List');
    if (title.includes('substring') || desc.includes('substring')) tags.push('String', 'Sliding Window');
    if (title.includes('subarray') || desc.includes('subarray')) tags.push('Arrays', 'DP');
    if (title.includes('merge') || desc.includes('merge')) tags.push('Linked List', 'Two Pointers');
    if (title.includes('stock') || desc.includes('stock')) tags.push('Arrays', 'DP');
    if (title.includes('stairs') || desc.includes('stairs') || desc.includes('climb')) tags.push('DP', 'Math');
    if (desc.includes('graph')) tags.push('Graph');
    if (desc.includes('tree')) tags.push('Tree');
    if (desc.includes('dynamic') || desc.includes('dp')) tags.push('DP');
    if (desc.includes('hash') || desc.includes('map') || desc.includes('dictionary')) tags.push('Hash Table');
    
    if (tags.length === 0) tags.push('Arrays');
    return tags.slice(0, 2);
  };

  const categories = ['All', 'Arrays', 'String', 'Linked List', 'DP', 'Sliding Window', 'Stack', 'Tree', 'Graph', 'Hash Table', 'Two Pointers', 'Math'];

  const stats = getDifficultyStats();
  const totalPages = Math.ceil(filteredQuestions.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedQuestions = filteredQuestions.slice(startIndex, startIndex + itemsPerPage);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-purple-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F9FB] p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header with Icon */}
        <div className="flex items-center gap-4 mb-8">
          <div className="w-14 h-14 bg-gradient-to-br from-purple-200 to-purple-300 rounded-2xl flex items-center justify-center shadow-lg" style={{boxShadow: '0 8px 20px rgba(124, 58, 237, 0.25)'}}>
            <Code2 className="w-7 h-7 text-purple-700" />
          </div>
          <div>
            <h1 className="text-4xl font-bold text-gray-800">Coding Problems</h1>
            <p className="text-gray-600 mt-1">Practice DSA & coding interview questions</p>
          </div>
        </div>

        {/* Progress Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-200" style={{boxShadow: '0 10px 30px rgba(34, 197, 94, 0.1)'}}>
            {/* Header */}
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-green-600 rounded-2xl flex items-center justify-center shadow-lg">
                <Sprout className="w-6 h-6 text-white" fill="currentColor" />
              </div>
              <div className="text-lg font-bold text-green-800">EASY</div>
            </div>
            
            <div className="flex items-center justify-between">
              {/* Problems Solved Component */}
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600 mb-1">{stats.easy.solved}</div>
                <div className="text-sm text-gray-600 mb-2">Problems Solved</div>
                <div className="inline-flex items-center px-2 py-1 bg-green-50 text-green-700 text-xs font-medium rounded-full">
                  +{stats.easy.thisWeek}
                </div>
              </div>
              
              {/* Progress Ring */}
              <div className="relative w-24 h-24">
                <svg className="transform -rotate-90 w-24 h-24">
                  <circle
                    cx="48"
                    cy="48"
                    r="36"
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="none"
                    className="text-green-100"
                  />
                  <circle
                    cx="48"
                    cy="48"
                    r="36"
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="none"
                    strokeDasharray={`${2 * Math.PI * 36}`}
                    strokeDashoffset={`${2 * Math.PI * 36 * (1 - stats.easy.fillAmount)}`}
                    className="text-green-500"
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-base font-semibold text-green-700">{Math.round(stats.easy.fillAmount * 100)}%</span>
                </div>
              </div>
            </div>
            
            <div className={`text-sm text-gray-500 mt-4 text-center`}>This week: +{stats.easy.thisWeek}</div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-200" style={{boxShadow: '0 10px 30px rgba(245, 158, 11, 0.1)'}}>
            {/* Header */}
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-amber-400 to-amber-600 rounded-2xl flex items-center justify-center shadow-lg">
                <Zap className="w-6 h-6 text-white" fill="currentColor" />
              </div>
              <div className="text-lg font-bold text-amber-800">MEDIUM</div>
            </div>
            
            <div className="flex items-center justify-between">
              {/* Problems Solved Component */}
              <div className="text-center">
                <div className="text-3xl font-bold text-amber-600 mb-1">{stats.medium.solved}</div>
                <div className="text-sm text-gray-600 mb-2">Problems Solved</div>
                <div className="inline-flex items-center px-2 py-1 bg-amber-50 text-amber-700 text-xs font-medium rounded-full">
                  +{stats.medium.thisWeek}
                </div>
              </div>
              
              {/* Progress Ring */}
              <div className="relative w-24 h-24">
                <svg className="transform -rotate-90 w-24 h-24">
                  <circle
                    cx="48"
                    cy="48"
                    r="36"
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="none"
                    className="text-amber-100"
                  />
                  <circle
                    cx="48"
                    cy="48"
                    r="36"
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="none"
                    strokeDasharray={`${2 * Math.PI * 36}`}
                    strokeDashoffset={`${2 * Math.PI * 36 * (1 - stats.medium.fillAmount)}`}
                    className="text-amber-500"
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-base font-semibold text-amber-700">{Math.round(stats.medium.fillAmount * 100)}%</span>
                </div>
              </div>
            </div>
            
            <div className={`text-sm text-gray-500 mt-4 text-center`}>This week: +{stats.medium.thisWeek}</div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-200" style={{boxShadow: '0 10px 30px rgba(239, 68, 68, 0.1)'}}>
            {/* Header */}
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-red-400 to-red-600 rounded-2xl flex items-center justify-center shadow-lg">
                <Flame className="w-6 h-6 text-white" fill="currentColor" />
              </div>
              <div className="text-lg font-bold text-red-800">HARD</div>
            </div>
            
            <div className="flex items-center justify-between">
              {/* Problems Solved Component */}
              <div className="text-center">
                <div className="text-3xl font-bold text-red-600 mb-1">{stats.hard.solved}</div>
                <div className="text-sm text-gray-600 mb-2">Problems Solved</div>
                <div className="inline-flex items-center px-2 py-1 bg-red-50 text-red-700 text-xs font-medium rounded-full">
                  +{stats.hard.thisWeek}
                </div>
              </div>
              
              {/* Progress Ring */}
              <div className="relative w-24 h-24">
                <svg className="transform -rotate-90 w-24 h-24">
                  <circle
                    cx="48"
                    cy="48"
                    r="36"
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="none"
                    className="text-red-100"
                  />
                  <circle
                    cx="48"
                    cy="48"
                    r="36"
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="none"
                    strokeDasharray={`${2 * Math.PI * 36}`}
                    strokeDashoffset={`${2 * Math.PI * 36 * (1 - stats.hard.fillAmount)}`}
                    className="text-red-500"
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-base font-semibold text-red-700">{Math.round(stats.hard.fillAmount * 100)}%</span>
                </div>
              </div>
            </div>
            
            <div className={`text-sm text-gray-500 mt-4 text-center`}>This week: +{stats.hard.thisWeek}</div>
          </div>
        </div>

        {/* Choose Difficulty Section */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Choose Difficulty</h2>
          <div className="flex gap-3">
            {['all', 'easy', 'medium', 'hard'].map((difficulty) => (
              <button
                key={difficulty}
                onClick={() => setFilters({ ...filters, difficulty })}
                className={`px-6 py-2 rounded-full font-medium transition-all duration-200 ${
                  filters.difficulty === difficulty
                    ? 'bg-gradient-to-r from-purple-600 to-purple-700 text-white shadow-lg'
                    : 'bg-white text-gray-700 border border-gray-200 hover:bg-purple-50 hover:border-purple-200'
                }`}
              >
                {difficulty === 'all' ? 'All' : difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Category Filter */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Categories</h2>
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setFilters({ ...filters, category: category === 'All' ? 'all' : category })}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                  (filters.category === 'all' && category === 'All') || filters.category === category
                    ? 'bg-gradient-to-r from-purple-600 to-purple-700 text-white shadow-lg'
                    : 'bg-white text-gray-700 border border-gray-200 hover:bg-purple-50 hover:border-purple-200'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>



        {/* Question List */}
        <div className="space-y-3 mb-8">
          {loading ? (
            // Loading skeleton
            Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 animate-pulse">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-5 h-5 bg-gray-200 rounded-full"></div>
                    <div className="h-5 bg-gray-200 rounded w-64"></div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="h-6 bg-gray-200 rounded w-16"></div>
                    <div className="h-6 bg-gray-200 rounded w-20"></div>
                    <div className="h-8 bg-gray-200 rounded w-20"></div>
                  </div>
                </div>
              </div>
            ))
          ) : filteredQuestions.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-gray-500 text-lg">No questions match your filters</p>
              <p className="text-gray-400 text-sm mt-2">Try adjusting your difficulty or category selection</p>
            </div>
          ) : (
            paginatedQuestions.map((question, index) => {
              const isSolved = solvedQuestions.has(question._id);
              const difficulty = getDifficultyLabel(question.difficulty);
              const difficultyColor = getDifficultyColor(question.difficulty);
              const tags = getTags(question);
              const questionNumber = startIndex + index + 1;

              return (
                <div 
                  key={question._id} 
                  className={`bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-200 hover:border-gray-200 ${
                    isSolved ? 'bg-green-50 border-green-100' : ''
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      {isSolved ? (
                        <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                      ) : (
                        <Circle className="w-5 h-5 text-gray-400 flex-shrink-0" />
                      )}
                      <h3 className="text-lg font-semibold text-gray-800">
                        {question.title || 'Untitled Problem'}
                      </h3>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${difficultyColor}`}>
                        {difficulty}
                      </span>
                      {tags.length > 0 && (
                        <span className="px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                          {tags[0]}
                        </span>
                      )}
                      <button
                        onClick={() => {
                          const currentIndex = filteredQuestions.findIndex(q => q._id === question._id);
                          navigate(`/coding-editor/${question._id}`, {
                            state: {
                              difficulty: filters.difficulty,
                              category: filters.category,
                              questionIndex: currentIndex,
                              totalQuestions: filteredQuestions.length,
                              filteredQuestions: filteredQuestions
                            }
                          });
                        }}
                        className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium rounded-lg transition-colors"
                      >
                        {isSolved ? 'Solve Again' : 'Solve'}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>



        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 bg-white border border-gray-200 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors text-gray-700"
            >
              Previous
            </button>
            <span className="px-4 py-2 text-gray-600">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className="px-4 py-2 bg-white border border-gray-200 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors text-gray-700"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
