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
      ? 'bg-green-900/20 text-green-400 border-green-700'
      : 'bg-red-900/20 text-red-400 border-red-700';
  };

  const getStatusIcon = (status) => {
    return status === 'success' ? '✓' : '✗';
  };

  const getModelColor = (model) => {
    const colors = {
      'Llama-2-7B': 'bg-rose-900/20 text-rose-400 border-rose-700',
      'GPT-3.5-Turbo': 'bg-red-900/20 text-red-400 border-red-700',
      'Mistral-7B': 'bg-red-900/20 text-red-400 border-red-700',
      'Phi-2': 'bg-pink-900/20 text-pink-400 border-pink-700',
      'TinyLlama-1.1B': 'bg-orange-900/20 text-orange-400 border-orange-700',
      'Gemma-2B': 'bg-amber-900/20 text-amber-400 border-amber-700'
    };
    return colors[model] || 'bg-gray-800/50 text-gray-400 border-gray-700';
  };

  return (
    <div className="min-h-screen bg-black p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="mt-20 text-3xl font-bold text-white mb-2 text-glow">Job History</h1>
          <p className="text-gray-400">View your previous AI-assisted tasks and their results</p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="glass-card p-6 border-l-4 border-red-600">
            <div className="text-sm text-gray-400 mb-1">Total Jobs</div>
            <div className="text-3xl font-bold text-white">{jobs.length}</div>
          </div>
          <div className="glass-card p-6 border-l-4 border-green-600">
            <div className="text-sm text-gray-400 mb-1">Successful</div>
            <div className="text-3xl font-bold text-green-400">
              {jobs.filter(j => j.status === 'success').length}
            </div>
          </div>
          <div className="glass-card p-6 border-l-4 border-red-500">
            <div className="text-sm text-gray-400 mb-1">Failed</div>
            <div className="text-3xl font-bold text-red-400">
              {jobs.filter(j => j.status === 'failed').length}
            </div>
          </div>
        </div>

        {/* Jobs List */}
        <div className="space-y-4">
          {jobs.map((job) => (
            <div
              key={job.id}
              className="glass-card p-6 hover:border-red-700 transition-all"
            >
              <div className="flex items-start justify-between">
                {/* Left Side - Prompt and Details */}
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(job.status)}`}>
                      {getStatusIcon(job.status)} {job.status.toUpperCase()}
                    </span>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getModelColor(job.model)}`}>
                      {job.model}
                    </span>
                  </div>

                  <h3 className="text-lg font-semibold text-white mb-2">
                    {job.prompt}
                  </h3>

                  <div className="flex items-center gap-4 text-sm text-gray-400">
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
                  <button className="px-4 py-2 text-sm font-medium text-gray-300 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors">
                    View Details
                  </button>
                  <button className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors">
                    Retry
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State (show when no jobs) */}
        {jobs.length === 0 && (
          <div className="glass-card p-12 text-center">
            <div className="text-gray-500 mb-4">
              <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">No jobs yet</h3>
            <p className="text-gray-400">Start a new AI-assisted task to see it here!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default JobsHistory;
