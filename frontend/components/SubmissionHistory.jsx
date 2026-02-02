import React, { useState, useEffect } from 'react';
import { ChevronDown, ChevronUp, Clock, CheckCircle, XCircle } from 'lucide-react';
import api from '../services/api';

export default function SubmissionHistory({ questionId, refreshTrigger }) {
  const [submissions, setSubmissions] = useState([]);
  const [expandedId, setExpandedId] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchSubmissions = async () => {
    if (!questionId) return;
    
    try {
      const response = await api.get(`/submissions/history/${questionId}`);
      setSubmissions(response.data.submissions || []);
    } catch (error) {
      console.error('Error fetching submissions:', error.response?.data || error.message);
      setSubmissions([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setLoading(true);
    fetchSubmissions();
  }, [questionId, refreshTrigger]);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusIcon = (status) => {
    return status === 'accepted' ? 
      <CheckCircle className="w-4 h-4 text-green-500" /> : 
      <XCircle className="w-4 h-4 text-red-500" />;
  };

  if (loading) {
    return <div className="text-gray-400 text-sm">Loading submissions...</div>;
  }

  if (submissions.length === 0) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <h4 className="text-sm font-semibold text-gray-700 mb-2">Submission History</h4>
        <div className="text-gray-500 text-sm">No submissions yet for this problem</div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <h4 className="text-sm font-semibold text-gray-300 mb-3">Submission History</h4>
      {submissions.map((submission) => (
        <div key={submission._id} className="bg-gray-800 border border-gray-700 rounded-lg">
          <div 
            className="flex items-center justify-between p-3 cursor-pointer hover:bg-gray-750"
            onClick={() => setExpandedId(expandedId === submission._id ? null : submission._id)}
          >
            <div className="flex items-center space-x-3">
              {getStatusIcon(submission.status)}
              <div className="flex items-center space-x-2 text-sm">
                <Clock className="w-3 h-3 text-gray-400" />
                <span className="text-gray-300">{formatDate(submission.createdAt)}</span>
                <span className="text-gray-500">•</span>
                <span className="text-blue-400">{submission.language}</span>
              </div>
            </div>
            {expandedId === submission._id ? 
              <ChevronUp className="w-4 h-4 text-gray-400" /> : 
              <ChevronDown className="w-4 h-4 text-gray-400" />
            }
          </div>
          
          {expandedId === submission._id && (
            <div className="border-t border-gray-700 p-3">
              <pre className="bg-gray-900 text-green-400 p-3 rounded text-xs overflow-x-auto font-mono">
                {submission.code}
              </pre>
              <div className="flex justify-between text-xs text-gray-400 mt-2">
                <span>Runtime: {submission.runtime}</span>
                <span>Status: {submission.status}</span>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}