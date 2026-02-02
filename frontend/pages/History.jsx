import { useEffect, useState } from 'react';
import { Code, Users, Brain, Zap, Clock, Calendar, TrendingUp } from 'lucide-react';
import api from '../services/api';

export default function History() {
  const [sessions, setSessions] = useState([]);
  const [aptitudeResults, setAptitudeResults] = useState([]);
  const [codingHistory, setCodingHistory] = useState([]);
  const [combinedHistory, setCombinedHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalSessions: 0,
    totalTime: 0,
    averageScore: 0
  });
  const [filter, setFilter] = useState('all');

  // Create combined history from all session types
  const allCombinedHistory = [
    ...sessions.map(item => ({ ...item, sessionType: "general" })),
    ...aptitudeResults.map(item => ({ ...item, sessionType: "aptitude" })),
    ...codingHistory.map(item => ({ ...item, sessionType: "coding" }))
  ].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  useEffect(() => {
    fetchHistory();
  }, [filter]);

  const fetchHistory = async () => {
    try {
      // Fetch interview sessions
      const params = filter !== 'all' ? { type: filter } : {};
      const sessionResponse = await api.get('/sessions', { params });
      const sessions = sessionResponse.data.sessions || [];
      setSessions(sessions);

      // Fetch aptitude results
      let aptitudeResults = [];
      try {
        const aptitudeResponse = await api.get('/aptitude/results');
        aptitudeResults = aptitudeResponse?.data?.results || [];
        setAptitudeResults(aptitudeResults);
      } catch (error) {
        console.error('Error fetching aptitude results:', error);
        setAptitudeResults([]);
      }

      // Fetch coding submissions if coding tab is selected
      if (filter === 'coding') {
        try {
          const codingResponse = await api.get('/submissions');
          const codingSubmissions = codingResponse?.data?.submissions || [];
          setCodingHistory(codingSubmissions);
        } catch (error) {
          console.error('Error fetching coding history:', error);
          setCodingHistory([]);
        }
      }
      
      // Create combined history
      const combined = [
        ...sessions.map(s => ({ ...s, historyType: 'session' })),
        ...aptitudeResults.map(r => ({ ...r, historyType: 'aptitude', type: 'aptitude' }))
      ].sort((a, b) => {
        const dateA = new Date(a.createdAt || 0);
        const dateB = new Date(b.createdAt || 0);
        return dateB - dateA;
      });
      
      setCombinedHistory(combined);
      
      // Calculate combined stats
      const totalSessions = sessions.length;
      const totalAptitude = aptitudeResults.length;
      const totalTime = sessions.reduce((sum, s) => sum + (s.duration || 0), 0) +
                       aptitudeResults.reduce((sum, r) => sum + (r.timeSpent || 0), 0);
      const sessionAvgScore = totalSessions > 0 
        ? Math.round(sessions.reduce((sum, s) => sum + (s.score || 0), 0) / totalSessions)
        : 0;
      const aptitudeAvgScore = totalAptitude > 0
        ? Math.round(aptitudeResults.reduce((sum, r) => sum + (r.score || 0), 0) / totalAptitude)
        : 0;
      const avgScore = (totalSessions + totalAptitude) > 0
        ? Math.round(((sessionAvgScore * totalSessions) + (aptitudeAvgScore * totalAptitude)) / (totalSessions + totalAptitude))
        : 0;

      setStats({
        totalSessions: totalSessions + totalAptitude,
        totalTime: Math.floor(totalTime / 60),
        averageScore: avgScore
      });
    } catch (error) {
      console.error('Error fetching history:', error);
    } finally {
      setLoading(false);
    }
  };

  const getIcon = (type) => {
    switch(type) {
      case 'technical': return <Code className="w-5 h-5" />;
      case 'hr': return <Users className="w-5 h-5" />;
      case 'aptitude': return <Brain className="w-5 h-5" />;
      default: return <Zap className="w-5 h-5" />;
    }
  };

  const getTypeColor = (type) => {
    switch(type) {
      case 'technical': return 'bg-blue-100 text-blue-600';
      case 'hr': return 'bg-purple-100 text-purple-600';
      case 'aptitude': return 'bg-green-100 text-green-600';
      default: return 'bg-orange-100 text-orange-600';
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const filters = [
    { value: 'all', label: 'All Sessions' },
    { value: 'technical', label: 'Technical' },
    { value: 'hr', label: 'HR' },
    { value: 'aptitude', label: 'Aptitude' },
    { value: 'general', label: 'General' },
    { value: 'coding', label: 'Coding' }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-purple-500"></div>
      </div>
    );
  }

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <h1 className="text-4xl font-bold text-gray-800 mb-8">Practice History</h1>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium mb-1">Total Sessions</p>
              <p className="text-3xl font-bold text-gray-800">{stats.totalSessions}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <Calendar className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium mb-1">Total Practice Time</p>
              <p className="text-3xl font-bold text-gray-800">{stats.totalTime} min</p>
            </div>
            <div className="p-3 bg-purple-100 rounded-lg">
              <Clock className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium mb-1">Average Score</p>
              <p className="text-3xl font-bold text-gray-800">{stats.averageScore}%</p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-6 flex space-x-2">
        {filters.map(f => (
          <button
            key={f.value}
            onClick={() => setFilter(f.value)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === f.value
                ? 'bg-purple-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* History List */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        {filter === 'all' && (
          <div className="mt-6 bg-white rounded-2xl shadow-sm border border-gray-100">
            <div className="overflow-x-auto">
              <table className="min-w-full border-collapse">
                <thead className="border-b border-gray-200">
                  <tr className="text-xs font-semibold text-gray-500 tracking-wide">
                    <th className="px-8 py-4 text-left">DATE & TIME</th>
                    <th className="px-8 py-4 text-left">TYPE</th>
                    <th className="px-8 py-4 text-left">DETAILS</th>
                    <th className="px-8 py-4 text-left">SCORE</th>
                    <th className="px-8 py-4 text-left">DURATION</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-100 text-sm">
                  {allCombinedHistory.filter(item => item.sessionType === "aptitude").map(item => (
                    <tr key={item._id} className="hover:bg-gray-50">
                      <td className="px-8 py-5">
                        {new Date(item.createdAt).toLocaleString()}
                      </td>

                      <td className="px-8 py-5">
                        <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-green-100 text-green-600 text-xs font-semibold">
                          <Brain className="w-4 h-4" />
                          Aptitude
                        </span>
                      </td>

                      <td className="px-8 py-5 text-gray-700">
                        Aptitude Exam - {item.category || "General"} ({item.correctAnswers}/{item.totalQuestions})
                      </td>

                      <td className="px-8 py-5 font-semibold">
                        <span className="text-red-500">{item.score}%</span>
                      </td>

                      <td className="px-8 py-5 text-gray-600">
                        {item.timeSpent ? `${Math.floor(item.timeSpent / 60)} min ${item.timeSpent % 60} sec` : "N/A"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
        {filter === 'coding' && (
          <div className="mt-6 bg-white rounded-2xl shadow-sm border border-gray-100">
            <div className="overflow-x-auto">
              <table className="min-w-full border-collapse">
                <thead className="bg-white border-b border-gray-200">
                  <tr className="text-xs font-semibold text-gray-500 tracking-wide">
                    <th className="px-8 py-4 text-left">DATE & TIME</th>
                    <th className="px-8 py-4 text-left">TYPE</th>
                    <th className="px-8 py-4 text-left">PROBLEM</th>
                    <th className="px-8 py-4 text-left">LANGUAGE</th>
                    <th className="px-8 py-4 text-left">STATUS</th>
                    <th className="px-8 py-4 text-left">RUNTIME</th>
                    <th className="px-8 py-4 text-left">TEST CASES</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-100 text-sm">
                  {codingHistory.map((item) => (
                    <tr key={item._id} className="hover:bg-gray-50">
                      <td className="px-8 py-5 text-gray-700">
                        {new Date(item.createdAt).toLocaleString()}
                      </td>

                      <td className="px-8 py-5">
                        <span className="px-4 py-1.5 text-xs font-semibold rounded-full bg-blue-100 text-blue-600">
                          Coding
                        </span>
                      </td>

                      <td className="px-8 py-5 font-medium text-gray-800">
                        Problem #{item.questionId}
                      </td>

                      <td className="px-8 py-5 text-gray-600 capitalize">
                        {item.language}
                      </td>

                      <td className="px-8 py-5">
                        <span
                          className={`px-4 py-1.5 text-xs font-semibold rounded-full ${
                            item.status === "accepted"
                              ? "bg-green-100 text-green-600"
                              : "bg-red-100 text-red-600"
                          }`}
                        >
                          {item.status}
                        </span>
                      </td>

                      <td className="px-8 py-5 text-gray-600">
                        {item.runtime}
                      </td>

                      <td className="px-8 py-5 text-gray-700 font-medium">
                        {item.testCasesPassed}/{item.totalTestCases}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
        {filter !== 'coding' && filter !== 'all' && (
          <>
            {combinedHistory.length > 0 && (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date & Time
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Type
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Details
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Score
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Duration
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {combinedHistory
                      .filter(item => filter === 'all' || item.type === filter)
                      .map((item, index) => (
                      <tr key={index} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatDate(item.createdAt)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className={`inline-flex items-center space-x-2 px-3 py-1 rounded-full ${getTypeColor(item.type)}`}>
                            {getIcon(item.type)}
                            <span className="text-sm font-medium capitalize">{item.type}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900 max-w-md">
                          {item.historyType === 'session' 
                            ? (item.questionId?.title || 'Practice Session')
                            : `Aptitude Exam - ${item.category} (${item.correctAnswers}/${item.totalQuestions})`
                          }
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`text-lg font-bold ${
                            item.score >= 80 ? 'text-green-600' :
                            item.score >= 60 ? 'text-yellow-600' :
                            'text-red-600'
                          }`}>
                            {item.score}%
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {item.historyType === 'session' 
                            ? `${Math.floor((item.duration || 0) / 60)} min`
                            : item.timeSpent 
                              ? `${Math.floor((item.timeSpent || 0) / 60)} min ${(item.timeSpent % 60)} sec`
                              : 'N/A'
                          }
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            {combinedHistory.length === 0 && (
              <div className="text-center py-16">
                <Clock className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 text-lg mb-2">No practice sessions yet</p>
                <p className="text-gray-400 text-sm mb-4">Start practicing to see your history here</p>
                <button
                  onClick={() => window.location.href = '/practice'}
                  className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                >
                  Start Practice
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
