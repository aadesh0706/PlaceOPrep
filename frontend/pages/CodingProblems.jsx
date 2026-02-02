import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, ChevronDown, CheckCircle, Circle, ChevronLeft, ChevronRight } from 'lucide-react';
import api from '../services/api';

export default function CodingProblems() {
  const navigate = useNavigate();
  const [questions, setQuestions] = useState([]);
  const [filteredQuestions, setFilteredQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    difficulty: 'all',
    tags: 'all',
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
        percentage: stats.easy.total > 0 ? Math.round((stats.easy.solved / stats.easy.total) * 100) : 0,
        thisWeek: stats.easy.solved > 0 ? Math.min(stats.easy.solved, 10) : 0
      },
      medium: {
        ...stats.medium,
        percentage: stats.medium.total > 0 ? Math.round((stats.medium.solved / stats.medium.total) * 100) : 0,
        thisWeek: stats.medium.solved > 0 ? Math.min(stats.medium.solved, 5) : 0
      },
      hard: {
        ...stats.hard,
        percentage: stats.hard.total > 0 ? Math.round((stats.hard.solved / stats.hard.total) * 100) : 0,
        thisWeek: stats.hard.solved > 0 ? 'Steady pace' : 0
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
    if (diff === 'beginner' || diff === 'easy') return 'bg-green-500';
    if (diff === 'intermediate' || diff === 'medium') return 'bg-orange-500';
    if (diff === 'advanced' || diff === 'hard' || diff === 'pro') return 'bg-red-500';
    return 'bg-gray-500';
  };

  const getDifficultyProgressColor = (difficulty) => {
    if (difficulty === 'easy') return 'text-green-500';
    if (difficulty === 'medium') return 'text-blue-500';
    return 'text-red-500';
  };

  const getTags = (question) => {
    const tags = [];
    const desc = (question.description || '').toLowerCase();
    const title = (question.title || '').toLowerCase();
    
    if (title.includes('two sum') || title.includes('three sum')) tags.push('ARRAY', 'HASH');
    if (title.includes('valid parentheses') || desc.includes('parentheses') || desc.includes('bracket')) tags.push('STACK', 'STRING');
    if (title.includes('linked list') || desc.includes('linked list')) tags.push('LINKEDLIST');
    if (title.includes('substring') || desc.includes('substring')) tags.push('STRING', 'SLIDING WINDOW');
    if (title.includes('subarray') || desc.includes('subarray')) tags.push('ARRAY', 'DP');
    if (title.includes('merge') || desc.includes('merge')) tags.push('LINKEDLIST', 'TWO POINTERS');
    if (title.includes('stock') || desc.includes('stock')) tags.push('ARRAY', 'DP');
    if (title.includes('stairs') || desc.includes('stairs') || desc.includes('climb')) tags.push('DP', 'MATH');
    if (desc.includes('graph')) tags.push('GRAPH');
    if (desc.includes('tree')) tags.push('TREE');
    if (desc.includes('dynamic') || desc.includes('dp')) tags.push('DP');
    if (desc.includes('hash') || desc.includes('map') || desc.includes('dictionary')) tags.push('HASH');
    
    if (tags.length === 0) tags.push('ARRAY');
    return tags.slice(0, 4);
  };

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
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">Progress Overview</h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <div className="text-sm text-gray-400 mb-4">EASY</div>
            <div className="relative w-24 h-24 mb-4">
              <svg className="transform -rotate-90 w-24 h-24">
                <circle
                  cx="48"
                  cy="48"
                  r="40"
                  stroke="currentColor"
                  strokeWidth="8"
                  fill="none"
                  className="text-gray-700"
                />
                <circle
                  cx="48"
                  cy="48"
                  r="40"
                  stroke="currentColor"
                  strokeWidth="8"
                  fill="none"
                  strokeDasharray={`${2 * Math.PI * 40}`}
                  strokeDashoffset={`${2 * Math.PI * 40 * (1 - stats.easy.percentage / 100)}`}
                  className="text-green-500"
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-2xl font-bold">{stats.easy.percentage}%</span>
              </div>
            </div>
            <div className="text-3xl font-bold mb-1">{stats.easy.solved}/{stats.easy.total}</div>
            <div className={`text-sm ${getDifficultyProgressColor('easy')}`}>+{stats.easy.thisWeek} this week</div>
          </div>

          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <div className="text-sm text-gray-400 mb-4">MEDIUM</div>
            <div className="relative w-24 h-24 mb-4">
              <svg className="transform -rotate-90 w-24 h-24">
                <circle
                  cx="48"
                  cy="48"
                  r="40"
                  stroke="currentColor"
                  strokeWidth="8"
                  fill="none"
                  className="text-gray-700"
                />
                <circle
                  cx="48"
                  cy="48"
                  r="40"
                  stroke="currentColor"
                  strokeWidth="8"
                  fill="none"
                  strokeDasharray={`${2 * Math.PI * 40}`}
                  strokeDashoffset={`${2 * Math.PI * 40 * (1 - stats.medium.percentage / 100)}`}
                  className="text-blue-500"
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-2xl font-bold">{stats.medium.percentage}%</span>
              </div>
            </div>
            <div className="text-3xl font-bold mb-1">{stats.medium.solved}/{stats.medium.total}</div>
            <div className={`text-sm ${getDifficultyProgressColor('medium')}`}>+{stats.medium.thisWeek} this week</div>
          </div>

          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <div className="text-sm text-gray-400 mb-4">HARD</div>
            <div className="relative w-24 h-24 mb-4">
              <svg className="transform -rotate-90 w-24 h-24">
                <circle
                  cx="48"
                  cy="48"
                  r="40"
                  stroke="currentColor"
                  strokeWidth="8"
                  fill="none"
                  className="text-gray-700"
                />
                <circle
                  cx="48"
                  cy="48"
                  r="40"
                  stroke="currentColor"
                  strokeWidth="8"
                  fill="none"
                  strokeDasharray={`${2 * Math.PI * 40}`}
                  strokeDashoffset={`${2 * Math.PI * 40 * (1 - stats.hard.percentage / 100)}`}
                  className="text-red-500"
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-2xl font-bold">{stats.hard.percentage}%</span>
              </div>
            </div>
            <div className="text-3xl font-bold mb-1">{stats.hard.solved}/{stats.hard.total}</div>
            <div className={`text-sm ${getDifficultyProgressColor('hard')}`}>
              {typeof stats.hard.thisWeek === 'string' ? stats.hard.thisWeek : `+${stats.hard.thisWeek} this week`}
            </div>
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search by title, ID or tag..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg pl-10 pr-4 py-2.5 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
          <div className="flex gap-3">
            <div className="relative">
              <select
                value={filters.difficulty}
                onChange={(e) => setFilters({ ...filters, difficulty: e.target.value })}
                className="bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 pr-8 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 cursor-pointer appearance-none"
              >
                <option value="all">Difficulty</option>
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
              <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
            </div>
            <div className="relative">
              <select
                value={filters.tags}
                onChange={(e) => setFilters({ ...filters, tags: e.target.value })}
                className="bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 pr-8 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 cursor-pointer appearance-none"
              >
                <option value="all">Tags</option>
                <option value="array">Array</option>
                <option value="graph">Graph</option>
                <option value="tree">Tree</option>
                <option value="dp">DP</option>
              </select>
              <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
            </div>
            <div className="relative">
              <select
                value={filters.status}
                onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                className="bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 pr-8 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 cursor-pointer appearance-none"
              >
                <option value="all">Status</option>
                <option value="solved">Solved</option>
                <option value="unsolved">Unsolved</option>
              </select>
              <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
            </div>
            <button
              onClick={() => {
                fetchSolvedQuestions();
                applyFilters();
              }}
              className="bg-green-600 hover:bg-green-700 text-white px-6 py-2.5 rounded-lg font-medium transition-colors"
            >
              Refresh
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {paginatedQuestions.map((question, index) => {
            const isSolved = solvedQuestions.has(question._id);
            const difficulty = getDifficultyLabel(question.difficulty);
            const difficultyColor = getDifficultyColor(question.difficulty);
            const tags = getTags(question);
            const questionNumber = startIndex + index + 1;

            return (
              <div key={question._id} className="bg-gray-800 rounded-lg p-6 border border-gray-700 hover:border-gray-600 transition-colors relative">
                <div className="absolute top-4 right-4">
                  {isSolved ? (
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  ) : (
                    <Circle className="w-5 h-5 text-gray-600" />
                  )}
                </div>
                <div className="text-gray-400 text-sm mb-2">#{question._id?.toString().slice(-3) || questionNumber}</div>
                <h3 className="text-xl font-bold mb-4">{question.title || 'Untitled Problem'}</h3>
                <div className="flex flex-wrap gap-2 mb-4">
                  <span className={`${difficultyColor} text-white text-xs font-semibold px-2.5 py-1 rounded`}>
                    {difficulty}
                  </span>
                  {isSolved && (
                    <span className="bg-green-500 text-white text-xs font-semibold px-2.5 py-1 rounded">
                      SUBMITTED
                    </span>
                  )}
                  {tags.map((tag, i) => (
                    <span key={`tag-${i}-${tag}`} className="bg-gray-700 text-gray-300 text-xs px-2.5 py-1 rounded">
                      {tag}
                    </span>
                  ))}
                </div>
                <button
                  onClick={() => navigate(`/coding-editor/${question._id}`)}
                  className="w-full py-2.5 rounded-lg font-semibold transition-colors bg-blue-600 hover:bg-blue-700 text-white"
                >
                  {isSolved ? 'Solve Again' : 'Solve Now'}
                </button>
              </div>
            );
          })}
        </div>

        {filteredQuestions.length === 0 && (
          <div className="text-center py-16">
            <p className="text-gray-400 text-lg">No problems found matching your criteria.</p>
          </div>
        )}

        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="p-2 bg-gray-800 border border-gray-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-700 transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let pageNum;
              if (totalPages <= 5) {
                pageNum = i + 1;
              } else if (currentPage <= 3) {
                pageNum = i + 1;
              } else if (currentPage >= totalPages - 2) {
                pageNum = totalPages - 4 + i;
              } else {
                pageNum = currentPage - 2 + i;
              }
              
              if (pageNum > totalPages) return null;
              
              return (
                <button
                  key={`page-${pageNum}`}
                  onClick={() => setCurrentPage(pageNum)}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    currentPage === pageNum
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-800 border border-gray-700 text-white hover:bg-gray-700'
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}
            {totalPages > 5 && currentPage < totalPages - 2 && (
              <span className="px-2 text-gray-400">...</span>
            )}
            {totalPages > 5 && (
              <button
                key="last-page"
                onClick={() => setCurrentPage(totalPages)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  currentPage === totalPages
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-800 border border-gray-700 text-white hover:bg-gray-700'
                }`}
              >
                {totalPages}
              </button>
            )}
            <button
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className="p-2 bg-gray-800 border border-gray-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-700 transition-colors"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
