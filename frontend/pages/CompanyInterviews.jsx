import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Trophy, Target, Calendar, TrendingUp, Building2, Code, Users, Brain } from 'lucide-react';
import api from '../services/api';

const COMPANIES = [
  { name: 'Google', logo: '🔍', color: 'from-blue-500 to-blue-600' },
  { name: 'Amazon', logo: '📦', color: 'from-orange-500 to-orange-600' },
  { name: 'Microsoft', logo: '🪟', color: 'from-cyan-500 to-cyan-600' },
  { name: 'Facebook', logo: '👥', color: 'from-blue-600 to-indigo-600' },
  { name: 'Apple', logo: '🍎', color: 'from-gray-600 to-gray-700' },
  { name: 'Netflix', logo: '🎬', color: 'from-red-500 to-red-600' },
  { name: 'Tesla', logo: '⚡', color: 'from-red-600 to-pink-600' },
  { name: 'Uber', logo: '🚗', color: 'from-black to-gray-800' },
  { name: 'Adobe', logo: '🎨', color: 'from-red-500 to-pink-600' },
  { name: 'Salesforce', logo: '☁️', color: 'from-blue-500 to-cyan-500' }
];

export default function CompanyInterviews() {
  const navigate = useNavigate();
  const [selectedCompany, setSelectedCompany] = useState(null);

  const startCompanyInterview = (company, mode) => {
    navigate('/interview/live', { 
      state: { 
        mode, 
        company: company.name,
        isCompanyMode: true 
      } 
    });
  };

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-800 mb-2 flex items-center space-x-3">
          <Building2 className="w-10 h-10 text-purple-600" />
          <span>Company-Specific Interviews</span>
        </h1>
        <p className="text-gray-600 text-lg">Practice with real questions from top tech companies</p>
      </div>

      {/* Company Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
        {COMPANIES.map((company) => (
          <div
            key={company.name}
            onClick={() => setSelectedCompany(company)}
            className={`cursor-pointer transition-all duration-300 transform hover:scale-105 ${
              selectedCompany?.name === company.name
                ? 'ring-4 ring-purple-500'
                : 'hover:shadow-xl'
            }`}
          >
            <div className={`bg-gradient-to-br ${company.color} rounded-xl p-6 text-white shadow-lg`}>
              <div className="text-5xl mb-3 text-center">{company.logo}</div>
              <h3 className="text-xl font-bold text-center">{company.name}</h3>
            </div>
          </div>
        ))}
      </div>

      {/* Interview Modes */}
      {selectedCompany && (
        <div className="animate-slide-up">
          <div className="bg-white rounded-xl shadow-lg p-8 mb-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              Select Interview Round for {selectedCompany.name}
            </h2>
            <p className="text-gray-600 mb-6">
              Choose the type of interview round you want to practice
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Technical Round */}
              <div
                onClick={() => startCompanyInterview(selectedCompany, 'Technical')}
                className="cursor-pointer group"
              >
                <div className="bg-gradient-to-br from-blue-50 to-indigo-100 border-2 border-blue-200 rounded-xl p-6 transition-all duration-300 hover:shadow-xl hover:scale-105">
                  <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <Code className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-blue-900 mb-2">Technical Round</h3>
                  <p className="text-sm text-blue-700">Coding & DSA problems</p>
                </div>
              </div>

              {/* Aptitude Round */}
              <div
                onClick={() => startCompanyInterview(selectedCompany, 'Aptitude')}
                className="cursor-pointer group"
              >
                <div className="bg-gradient-to-br from-green-50 to-emerald-100 border-2 border-green-200 rounded-xl p-6 transition-all duration-300 hover:shadow-xl hover:scale-105">
                  <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <Brain className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-green-900 mb-2">Aptitude Round</h3>
                  <p className="text-sm text-green-700">Logical & quantitative</p>
                </div>
              </div>

              {/* HR Round */}
              <div
                onClick={() => startCompanyInterview(selectedCompany, 'HR')}
                className="cursor-pointer group"
              >
                <div className="bg-gradient-to-br from-purple-50 to-pink-100 border-2 border-purple-200 rounded-xl p-6 transition-all duration-300 hover:shadow-xl hover:scale-105">
                  <div className="w-12 h-12 bg-purple-500 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <Users className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-purple-900 mb-2">HR Round</h3>
                  <p className="text-sm text-purple-700">Behavioral questions</p>
                </div>
              </div>

              {/* Full Simulation */}
              <div
                onClick={() => startCompanyInterview(selectedCompany, 'Full Simulation')}
                className="cursor-pointer group"
              >
                <div className="bg-gradient-to-br from-orange-50 to-red-100 border-2 border-orange-200 rounded-xl p-6 transition-all duration-300 hover:shadow-xl hover:scale-105">
                  <div className="w-12 h-12 bg-orange-500 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <Trophy className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-orange-900 mb-2">Full Simulation</h3>
                  <p className="text-sm text-orange-700">Complete interview</p>
                </div>
              </div>
            </div>
          </div>

          {/* Company Info */}
          <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-6 border border-gray-200">
            <h3 className="text-lg font-bold text-gray-800 mb-2">About {selectedCompany.name} Interviews</h3>
            <p className="text-gray-600">
              Practice with questions specifically asked by {selectedCompany.name} in their interview process.
              Our AI will evaluate your responses based on {selectedCompany.name}'s hiring standards.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
