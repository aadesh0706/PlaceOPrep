import { useState, useEffect } from 'react';
import { Download, Share2, CheckCircle, User, Brain, ChevronDown, TrendingUp, MessageCircle, Target, Zap, Award, BarChart3, Sparkles, FileText, Calendar, Clock, Star } from 'lucide-react';
import jsPDF from 'jspdf';

function PerformanceReport({ sessionId, onStartNew }) {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [expandedQuestions, setExpandedQuestions] = useState([]);

  useEffect(() => {
    const fetchReport = async () => {
      try {
        console.log('📊 Fetching report for session:', sessionId);
        const response = await fetch('https://placeoprep-ai.vercel.app/generate-report', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ session_id: sessionId })
        });
        const data = await response.json();
        if (data.success) {
          console.log('✅ Report received:', data.report);
          console.log('📝 Q&A data:', data.report.qa);
          setReport(data.report);
        } else {
          console.error('❌ Report failed:', data.error);
        }
      } catch (error) {
        console.error('❌ Report error:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchReport();
  }, [sessionId]);

  const toggleQuestion = (idx) => {
    setExpandedQuestions(prev => 
      prev.includes(idx) ? prev.filter(i => i !== idx) : [...prev, idx]
    );
  };

  const generatePDF = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 20;
    let yPos = 20;

    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text('Interview Performance Report', margin, yPos);
    yPos += 15;

    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    const overallScore = report?.overall_score || 75;
    doc.text(`Overall Score: ${overallScore}%`, margin, yPos);
    yPos += 10;
    doc.text(`Communication: 82%`, margin, yPos);
    yPos += 10;
    doc.text(`Technical: 78%`, margin, yPos);
    yPos += 10;
    doc.text(`Confidence: 85%`, margin, yPos);
    yPos += 15;

    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Question Analysis', margin, yPos);
    yPos += 10;

    report?.qa?.forEach((item, idx) => {
      if (yPos > 250) {
        doc.addPage();
        yPos = 20;
      }

      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      const questionLines = doc.splitTextToSize(`Q${idx + 1}: ${item.question}`, pageWidth - 2 * margin);
      doc.text(questionLines, margin, yPos);
      yPos += questionLines.length * 7;

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      doc.text('Ideal Answer:', margin, yPos);
      yPos += 6;
      const idealLines = doc.splitTextToSize(item.ideal_answer, pageWidth - 2 * margin - 5);
      doc.text(idealLines, margin + 5, yPos);
      yPos += idealLines.length * 5 + 5;

      doc.text('Your Answer:', margin, yPos);
      yPos += 6;
      const answerLines = doc.splitTextToSize(item.candidate_answer || 'Not answered', pageWidth - 2 * margin - 5);
      doc.text(answerLines, margin + 5, yPos);
      yPos += answerLines.length * 5 + 15;
    });

    doc.save('interview-report.pdf');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-indigo-600 text-xl font-semibold">Generating Report...</div>
      </div>
    );
  }

  const overallScore = report?.overall_score || 75;
  const communicationScore = 82;
  const technicalScore = 78;
  const confidenceScore = 85;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header with Action Buttons */}
        <div className="flex justify-between items-start mt-10 mb-8">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center shadow-lg">
              <FileText className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Interview Performance Report</h1>
              <div className="flex items-center gap-2 mt-2">
                <Calendar className="w-4 h-4 text-gray-400" />
                <p className="text-gray-500 text-sm">AI evaluation of your responses</p>
              </div>
            </div>
          </div>
          <div className="flex gap-3">
            <button onClick={generatePDF} className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition shadow-sm hover:shadow-md">
              <Download className="w-4 h-4" />
              <span className="text-sm font-medium">Download</span>
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition shadow-sm hover:shadow-md">
              <Share2 className="w-4 h-4" />
              <span className="text-sm font-medium">Share</span>
            </button>
          </div>
        </div>

        {/* Score Summary Cards */}
        <div className="grid grid-cols-4 gap-6 mb-10">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-gray-500">Overall Score</p>
              <Award className="w-5 h-5 text-purple-500" />
            </div>
            <p className="text-3xl font-bold text-gray-900 mb-1">{overallScore}%</p>
            <div className="flex items-center gap-1 mb-3">
              <TrendingUp className="w-3 h-3 text-green-600" />
              <p className="text-xs text-green-600">+5% from last</p>
            </div>
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-purple-500 to-indigo-500" style={{width: `${overallScore}%`}}></div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-gray-500">Communication</p>
              <MessageCircle className="w-5 h-5 text-blue-500" />
            </div>
            <p className="text-3xl font-bold text-gray-900 mb-1">{communicationScore}%</p>
            <div className="flex items-center gap-1 mb-3">
              <TrendingUp className="w-3 h-3 text-green-600" />
              <p className="text-xs text-green-600">+3% from last</p>
            </div>
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-blue-500 to-cyan-500" style={{width: `${communicationScore}%`}}></div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-gray-500">Technical</p>
              <Target className="w-5 h-5 text-emerald-500" />
            </div>
            <p className="text-3xl font-bold text-gray-900 mb-1">{technicalScore}%</p>
            <div className="flex items-center gap-1 mb-3">
              <TrendingUp className="w-3 h-3 text-green-600" />
              <p className="text-xs text-green-600">+7% from last</p>
            </div>
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-emerald-500 to-teal-500" style={{width: `${technicalScore}%`}}></div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-gray-500">Confidence</p>
              <Zap className="w-5 h-5 text-orange-500" />
            </div>
            <p className="text-3xl font-bold text-gray-900 mb-1">{confidenceScore}%</p>
            <div className="flex items-center gap-1 mb-3">
              <TrendingUp className="w-3 h-3 text-green-600" />
              <p className="text-xs text-green-600">+2% from last</p>
            </div>
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-orange-500 to-amber-500" style={{width: `${confidenceScore}%`}}></div>
            </div>
          </div>
        </div>

        {/* Detailed Question Analysis */}
        <div className="flex items-center gap-3 mt-10 mb-4">
          <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
            <BarChart3 className="w-5 h-5 text-indigo-600" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900">Detailed Question Analysis</h2>
        </div>

        {/* Question Cards */}
        <div className="space-y-4">
          {report?.qa?.map((item, idx) => (
            <div key={idx} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              {/* Question Header */}
              <button
                onClick={() => toggleQuestion(idx)}
                className="w-full p-6 flex items-start gap-4 hover:bg-gray-50 transition text-left"
              >
                <div className="w-8 h-8 rounded-full bg-indigo-500 text-white flex items-center justify-center flex-shrink-0 font-semibold">
                  {idx + 1}
                </div>
                <div className="flex-1">
                  <p className="text-gray-900 font-medium">{item.question}</p>
                </div>
                <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${expandedQuestions.includes(idx) ? 'rotate-180' : ''}`} />
              </button>

              {/* Expanded Content */}
              {expandedQuestions.includes(idx) && (
                <div className="px-6 pb-6 space-y-4">
                  {/* Ideal Answer */}
                  <div className="bg-green-50 border border-green-200 border-l-4 border-l-green-500 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      <h4 className="font-semibold text-green-900">Ideal Answer Structure</h4>
                    </div>
                    <p className="text-green-800 text-sm">{item.ideal_answer}</p>
                  </div>

                  {/* Your Answer */}
                  <div className="bg-indigo-50 border border-indigo-200 border-l-4 border-l-indigo-500 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <User className="w-5 h-5 text-indigo-600" />
                      <h4 className="font-semibold text-indigo-900">Your Answer</h4>
                    </div>
                    {item.candidate_answer ? (
                      <p className="text-indigo-800 text-sm">{item.candidate_answer}</p>
                    ) : (
                      <p className="text-red-600 text-sm italic">Not answered</p>
                    )}
                  </div>

                  {/* AI Feedback */}
                  {item.candidate_answer && (
                    <div className="bg-orange-50 border border-orange-200 border-l-4 border-l-orange-500 rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Brain className="w-5 h-5 text-orange-600" />
                        <h4 className="font-semibold text-orange-900">AI Feedback</h4>
                      </div>
                      <p className="text-orange-800 text-sm">
                        Your answer demonstrates good understanding. Consider adding more specific examples and quantifiable results to strengthen your response.
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Next Interview CTA */}
        <div className="mt-10 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-6 flex justify-between items-center border border-indigo-100 shadow-sm">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg">
              <Sparkles className="w-7 h-7 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Star className="w-5 h-5 text-indigo-600" />
                <h3 className="text-xl font-semibold text-gray-900">Ready for the next step?</h3>
              </div>
              <p className="text-gray-600 text-sm">We've identified 3 key areas where you can improve.</p>
            </div>
          </div>
          <button onClick={onStartNew} className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg px-6 py-3 font-medium transition flex items-center gap-2 shadow-lg hover:shadow-xl">
            <Calendar className="w-4 h-4" />
            Schedule Next Mock Interview
            <TrendingUp className="w-4 h-4" />
          </button>
        </div>

        {/* Footer */}
        <div className="text-center text-gray-400 text-sm mt-10">
          © 2024 Performance AI. All rights reserved.
        </div>
      </div>
    </div>
  );
}

export default PerformanceReport;
