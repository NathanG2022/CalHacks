import { useState } from 'react';

const JobsHistory = () => {
  // Sample data - you'll replace this with real data from your backend/Supabase
  const [jobs, setJobs] = useState([
    {
      id: 1,
      prompt: "Test content filter bypass using role-play scenarios on Llama-2-7B",
      status: "success",
      model: "Llama-2-7B",
      timestamp: "2 hours ago",
      duration: "45s"
    },
    {
      id: 2,
      prompt: "Evaluate prompt injection vulnerabilities in GPT-3.5 instruction following",
      status: "success",
      model: "GPT-3.5-Turbo",
      timestamp: "5 hours ago",
      duration: "1m 20s"
    },
    {
      id: 3,
      prompt: "Attempt context window overflow to extract system prompt from Mistral-7B",
      status: "failed",
      model: "Mistral-7B",
      timestamp: "1 day ago",
      duration: "30s"
    },
    {
      id: 4,
      prompt: "Test ethical boundary detection with ambiguous harm scenarios on Phi-2",
      status: "success",
      model: "Phi-2",
      timestamp: "2 days ago",
      duration: "2m 10s"
    },
    {
      id: 5,
      prompt: "Probe for training data leakage using adversarial prompts on TinyLlama",
      status: "failed",
      model: "TinyLlama-1.1B",
      timestamp: "3 days ago",
      duration: "1m 5s"
    },
    {
      id: 6,
      prompt: "Evaluate refusal mechanisms with multi-turn jailbreak attempts on Gemma-2B",
      status: "success",
      model: "Gemma-2B",
      timestamp: "4 days ago",
      duration: "3m 30s"
    }
  ]);

  const getStatusColor = (status) => {
    return status === 'success' 
      ? 'bg-green-100 text-green-800 border-green-300' 
      : 'bg-red-100 text-red-800 border-red-300';
  };

  const getStatusIcon = (status) => {
    return status === 'success' ? '✓' : '✗';
  };

  const getModelColor = (model) => {
    const colors = {
      'Llama-2-7B': 'bg-purple-100 text-purple-800',
      'GPT-3.5-Turbo': 'bg-blue-100 text-blue-800',
      'Mistral-7B': 'bg-indigo-100 text-indigo-800',
      'Phi-2': 'bg-pink-100 text-pink-800',
      'TinyLlama-1.1B': 'bg-green-100 text-green-800',
      'Gemma-2B': 'bg-orange-100 text-orange-800'
    };
    return colors[model] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="mt-20 text-3xl font-bold text-gray-900 mb-2">Job History</h1>
          <p className="text-gray-600">View your previous AI-assisted tasks and their results</p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="text-sm text-gray-600 mb-1">Total Jobs</div>
            <div className="text-3xl font-bold text-gray-900">{jobs.length}</div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="text-sm text-gray-600 mb-1">Successful</div>
            <div className="text-3xl font-bold text-green-600">
              {jobs.filter(j => j.status === 'success').length}
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="text-sm text-gray-600 mb-1">Failed</div>
            <div className="text-3xl font-bold text-red-600">
              {jobs.filter(j => j.status === 'failed').length}
            </div>
          </div>
        </div>

        {/* Jobs List */}
        <div className="space-y-4">
          {jobs.map((job) => (
            <div 
              key={job.id} 
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between">
                {/* Left Side - Prompt and Details */}
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(job.status)}`}>
                      {getStatusIcon(job.status)} {job.status.toUpperCase()}
                    </span>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getModelColor(job.model)}`}>
                      {job.model}
                    </span>
                  </div>
                  
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {job.prompt}
                  </h3>
                  
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <span className="flex items-center gap-1">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {job.timestamp}
                    </span>
                    <span className="flex items-center gap-1">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                      {job.duration}
                    </span>
                  </div>
                </div>

                {/* Right Side - Actions */}
                <div className="flex gap-2">
                  <button className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">
                    View Details
                  </button>
                  <button className="px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors">
                    Retry
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State (show when no jobs) */}
        {jobs.length === 0 && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
            <div className="text-gray-400 mb-4">
              <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No jobs yet</h3>
            <p className="text-gray-600">Start a new AI-assisted task to see it here!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default JobsHistory;
