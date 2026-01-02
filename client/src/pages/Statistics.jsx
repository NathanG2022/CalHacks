import React, { useState, useEffect } from 'react';
import { apiService } from '../services/api';

export default function Statistics() {
  const [modelStats, setModelStats] = useState([]);
  const [attackMethodStats, setAttackMethodStats] = useState([]);
  const [viewMode, setViewMode] = useState('models'); // 'models' or 'methods'
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStatistics();
  }, []);

  const fetchStatistics = async () => {
    setLoading(true);
    try {
      const [models, methods] = await Promise.all([
        apiService.getModelStatistics(),
        apiService.getAttackMethodStatistics()
      ]);
      setModelStats(models);
      setAttackMethodStats(methods);
    } catch (error) {
      console.error('Failed to fetch statistics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading statistics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="statistics-page p-6 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">📊 Statistics Dashboard</h1>

      {/* View Toggle */}
      <div className="mb-6 flex gap-2">
        <button
          onClick={() => setViewMode('models')}
          className={`px-6 py-2 rounded-lg font-medium transition-colors ${
            viewMode === 'models'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          By Model
        </button>
        <button
          onClick={() => setViewMode('methods')}
          className={`px-6 py-2 rounded-lg font-medium transition-colors ${
            viewMode === 'methods'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          By Attack Method
        </button>
      </div>

      {viewMode === 'models' ? (
        <ModelStatistics stats={modelStats} />
      ) : (
        <AttackMethodStatistics stats={attackMethodStats} />
      )}
    </div>
  );
}

function ModelStatistics({ stats }) {
  // Sort by vulnerability (most vulnerable first)
  const sortedStats = [...stats].sort((a, b) => {
    const aRate = a.total_tests > 0 ? a.successful_attacks / a.total_tests : 0;
    const bRate = b.total_tests > 0 ? b.successful_attacks / b.total_tests : 0;
    return bRate - aRate;
  });

  if (sortedStats.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-8 text-center">
        <p className="text-gray-600 text-lg">No model statistics available yet.</p>
        <p className="text-gray-500 text-sm mt-2">Run some multi-model tests to see statistics here.</p>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Model Vulnerability Rankings</h2>
      <div className="grid gap-4">
        {sortedStats.map((stat, idx) => {
          const successRate = stat.total_tests > 0 ? (stat.successful_attacks / stat.total_tests) * 100 : 0;
          const isHighRisk = successRate > 50;

          return (
            <div
              key={stat.model_id}
              className={`p-6 border rounded-lg shadow-md ${
                isHighRisk ? 'bg-red-50 border-red-300' : 'bg-green-50 border-green-300'
              }`}
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-bold text-lg">
                    #{idx + 1} {stat.model_id}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {stat.total_tests} tests • {stat.successful_attacks} vulnerabilities found
                  </p>
                </div>
                <div className="text-right">
                  <div className={`text-2xl font-bold ${isHighRisk ? 'text-red-600' : 'text-green-600'}`}>
                    {successRate.toFixed(1)}%
                  </div>
                  <div className="text-xs text-gray-600">
                    Attack Success Rate
                  </div>
                </div>
              </div>

              {/* Vulnerability Breakdown */}
              <div className="mt-4 grid grid-cols-4 gap-2 text-center text-sm">
                <div className="p-3 bg-red-100 rounded-lg">
                  <div className="font-bold text-red-700 text-lg">{stat.critical_vulnerabilities}</div>
                  <div className="text-xs text-gray-600">Critical</div>
                </div>
                <div className="p-3 bg-orange-100 rounded-lg">
                  <div className="font-bold text-orange-700 text-lg">{stat.high_vulnerabilities}</div>
                  <div className="text-xs text-gray-600">High</div>
                </div>
                <div className="p-3 bg-yellow-100 rounded-lg">
                  <div className="font-bold text-yellow-700 text-lg">{stat.medium_vulnerabilities}</div>
                  <div className="text-xs text-gray-600">Medium</div>
                </div>
                <div className="p-3 bg-green-100 rounded-lg">
                  <div className="font-bold text-green-700 text-lg">{stat.low_vulnerabilities}</div>
                  <div className="text-xs text-gray-600">Low</div>
                </div>
              </div>

              {/* Safety Score */}
              <div className="mt-4">
                <div className="flex justify-between items-center mb-1">
                  <div className="text-xs text-gray-600">Average Safety Score</div>
                  <div className="text-xs font-medium">{(stat.average_safety_score * 100).toFixed(1)}%</div>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className={`h-3 rounded-full transition-all ${
                      stat.average_safety_score > 0.7
                        ? 'bg-green-500'
                        : stat.average_safety_score > 0.4
                        ? 'bg-yellow-500'
                        : 'bg-red-500'
                    }`}
                    style={{ width: `${stat.average_safety_score * 100}%` }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function AttackMethodStatistics({ stats }) {
  const sortedStats = [...stats].sort((a, b) => (b.success_rate || 0) - (a.success_rate || 0));

  if (sortedStats.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-8 text-center">
        <p className="text-gray-600 text-lg">No attack method statistics available yet.</p>
        <p className="text-gray-500 text-sm mt-2">Run some multi-model tests to see statistics here.</p>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Attack Method Effectiveness</h2>
      <div className="grid gap-4">
        {sortedStats.map((stat, idx) => (
          <div key={stat.attack_method} className="p-6 border rounded-lg bg-white shadow-md">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-bold text-lg capitalize">
                  {stat.attack_method.replace(/_/g, ' ')}
                </h3>
                <p className="text-sm text-gray-600">
                  {stat.total_tests} tests performed
                </p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-purple-600">
                  {((stat.success_rate || 0) * 100).toFixed(1)}%
                </div>
                <div className="text-xs text-gray-600">
                  Success Rate
                </div>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
              <div className="p-3 bg-red-50 rounded-lg">
                <div className="text-gray-600 mb-1">Most Vulnerable Model:</div>
                <div className="font-medium break-words">
                  {stat.most_vulnerable_model || 'N/A'}
                </div>
              </div>
              <div className="p-3 bg-green-50 rounded-lg">
                <div className="text-gray-600 mb-1">Least Vulnerable Model:</div>
                <div className="font-medium break-words">
                  {stat.least_vulnerable_model || 'N/A'}
                </div>
              </div>
            </div>

            <div className="mt-3 flex items-center justify-between text-sm">
              <span className="text-gray-600">Successful Attacks:</span>
              <span className="font-medium">{stat.successful_attacks}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Failed Attacks:</span>
              <span className="font-medium">{stat.failed_attacks}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Avg Response Time:</span>
              <span className="font-medium">{stat.average_response_time_ms}ms</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
