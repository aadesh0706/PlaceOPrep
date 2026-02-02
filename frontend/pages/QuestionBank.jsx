import { useEffect, useState } from 'react';
import { Search, Filter, Code, Users, Brain, BookOpen } from 'lucide-react';
import api from '../services/api';

export default function QuestionBank() {
  const [questions, setQuestions] = useState([]);
  const [filteredQuestions, setFilteredQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    category: 'all',
    difficulty: 'all',
    search: ''
  });

  useEffect(() => {
    fetchQuestions();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [filters, questions]);

  const fetchQuestions = async () => {
    try {
      const response = await api.get('/questions');
      setQuestions(response.data.questions);
      setFilteredQuestions(response.data.questions);
    } catch (error) {
      console.error('Error fetching questions:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...questions];

    if (filters.category !== 'all') {
      filtered = filtered.filter(q => q.category === filters.category);
    }

    if (filters.difficulty !== 'all') {
      filtered = filtered.filter(q => q.difficulty === filters.difficulty);
    }

    if (filters.search) {
      filtered = filtered.filter(q =>
        q.title.toLowerCase().includes(filters.search.toLowerCase()) ||
        q.description.toLowerCase().includes(filters.search.toLowerCase())
      );
    }

    setFilteredQuestions(filtered);
  };

  const getIcon = (category) => {
    switch(category) {
      case 'technical': return <Code className="w-5 h-5" />;
      case 'hr': return <Users className="w-5 h-5" />;
      case 'aptitude': return <Brain className="w-5 h-5" />;
      default: return <BookOpen className="w-5 h-5" />;
    }
  };

  const getCategoryColor = (category) => {
    switch(category) {
      case 'technical': return 'bg-blue-100 text-blue-700';
      case 'hr': return 'bg-purple-100 text-purple-700';
      case 'aptitude': return 'bg-green-100 text-green-700';
      default: return 'bg-orange-100 text-orange-700';
    }
  };

  const getDifficultyColor = (difficulty) => {
    switch(difficulty) {
      case 'beginner': return 'bg-green-100 text-green-700';
      case 'intermediate': return 'bg-yellow-100 text-yellow-700';
      case 'advanced': return 'bg-orange-100 text-orange-700';
      case 'pro': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const handlePractice = (questionId, category, difficulty) => {
    if (category === 'technical') {
      window.location.href = `/technical-practice?questionId=${questionId}`;
    } else {
      window.location.href = `/practice?type=${category}&questionId=${questionId}`;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-purple-500"></div>
      </div>
    );
  }

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <h1 className="text-4xl font-bold text-gray-800 mb-8">Question Bank</h1>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-md p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Search Questions
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search by title or description..."
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Category Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Category
            </label>
            <select
              value={filters.category}
              onChange={(e) => setFilters({ ...filters, category: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="all">All Categories</option>
              <option value="technical">Technical</option>
              <option value="hr">HR</option>
              <option value="aptitude">Aptitude</option>
              <option value="general">General</option>
            </select>
          </div>

          {/* Difficulty Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Difficulty
            </label>
            <select
              value={filters.difficulty}
              onChange={(e) => setFilters({ ...filters, difficulty: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="all">All Levels</option>
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
              <option value="pro">Pro</option>
            </select>
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between">
          <p className="text-sm text-gray-600">
            Showing <span className="font-semibold">{filteredQuestions.length}</span> of{' '}
            <span className="font-semibold">{questions.length}</span> questions
          </p>
          <button
            onClick={() => setFilters({ category: 'all', difficulty: 'all', search: '' })}
            className="text-sm text-purple-600 hover:text-purple-700 font-medium"
          >
            Clear Filters
          </button>
        </div>
      </div>

      {/* Questions List */}
      <div className="grid grid-cols-1 gap-4">
        {filteredQuestions.map((question, index) => (
          <div
            key={index}
            className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-3">
                  <div className={`p-2 rounded-lg ${getCategoryColor(question.category)}`}>
                    {getIcon(question.category)}
                  </div>
                  <h3 className="text-xl font-bold text-gray-800">{question.title}</h3>
                </div>

                <p className="text-gray-600 mb-4 line-clamp-2">{question.description}</p>

                <div className="flex flex-wrap items-center gap-2 mb-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getDifficultyColor(question.difficulty)}`}>
                    {question.difficulty.charAt(0).toUpperCase() + question.difficulty.slice(1)}
                  </span>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getCategoryColor(question.category)}`}>
                    {question.category.charAt(0).toUpperCase() + question.category.slice(1)}
                  </span>
                  {question.company && question.company.length > 0 && (
                    <div className="flex items-center space-x-1">
                      {question.company.slice(0, 3).map((company, idx) => (
                        <span key={idx} className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                          {company}
                        </span>
                      ))}
                    </div>
                  )}
                  <span className="text-xs text-gray-500">
                    {question.points || 10} points
                  </span>
                </div>
              </div>

              <button
                onClick={() => handlePractice(question._id, question.category, question.difficulty)}
                className="ml-4 px-6 py-2 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition-colors whitespace-nowrap"
              >
                Practice
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {filteredQuestions.length === 0 && (
        <div className="text-center py-16 bg-white rounded-xl shadow-md">
          <Filter className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 text-lg mb-2">No questions found</p>
          <p className="text-gray-400 text-sm">Try adjusting your filters</p>
        </div>
      )}
    </div>
  );
}
