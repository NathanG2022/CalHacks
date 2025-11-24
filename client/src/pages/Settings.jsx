import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import jobsService from '../services/jobsService';
import HackerBackground from '../components/HackerBackground';

const Settings = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('jobs');
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [notifications, setNotifications] = useState(true);
  const [theme, setTheme] = useState('light');

  // Load jobs from Supabase
  useEffect(() => {
    const loadJobs = async () => {
      if (!user?.id) return;
      
      setLoading(true);
      try {
        const userJobs = await jobsService.getUserJobs(user.id);
        setJobs(userJobs);
        console.log('📋 Loaded jobs:', userJobs);
      } catch (error) {
        console.error('Failed to load jobs:', error);
      } finally {
        setLoading(false);
      }
    };

    loadJobs();
  }, [user?.id]);

  const handleDeleteJob = async (jobId) => {
    try {
      await jobsService.deleteJob(jobId);
      setJobs(prev => prev.filter(job => job.id !== jobId));
      console.log('🗑️ Job deleted:', jobId);
    } catch (error) {
      console.error('Failed to delete job:', error);
      alert('Failed to delete job. Please try again.');
    }
  };

  const handleRunJob = async (job) => {
    try {
      // Update job status to running
      await jobsService.updateJob(job.id, { status: 'running' });
      
      // Update local state
      setJobs(prev => prev.map(j => 
        j.id === job.id ? { ...j, status: 'running' } : j
      ));

      // Here you would typically redirect to dashboard or run the job
      // For now, we'll just show an alert
      alert(`Running job: ${job.name}\n\nThis would execute the job with:\n- Prompt: ${job.prompt}\n- Strategy: ${job.jailbreaking_strategy}\n- Model: ${job.ai_model}`);
      
      // Simulate job completion (in real implementation, this would be handled by the actual job execution)
      setTimeout(async () => {
        await jobsService.updateJob(job.id, { status: 'completed' });
        setJobs(prev => prev.map(j => 
          j.id === job.id ? { ...j, status: 'completed' } : j
        ));
      }, 2000);
      
    } catch (error) {
      console.error('Failed to run job:', error);
      alert('Failed to run job. Please try again.');
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'text-green-400 bg-green-900/30';
      case 'running': return 'text-yellow-400 bg-yellow-900/30';
      case 'failed': return 'text-red-400 bg-red-900/30';
      case 'pending': return 'text-gray-400 bg-gray-900/30';
      default: return 'text-gray-400 bg-gray-900/30';
    }
  };

  return (
    <div className="min-h-screen bg-black text-white relative">
      {/* Hacker Background */}
      <HackerBackground />
      
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8 relative z-10">
        <div className="px-4 py-6 sm:px-0">
          <div className="bg-gray-900/80 backdrop-blur-sm shadow rounded-lg border border-gray-700">
            <div className="px-4 py-5 sm:p-6">
              <h1 className="text-2xl font-bold text-white mb-6">Settings</h1>
              
              {/* Tab Navigation */}
              <div className="border-b border-gray-700 mb-6">
                <nav className="-mb-px flex space-x-8">
                  <button
                    onClick={() => setActiveTab('jobs')}
                    className={`py-2 px-1 border-b-2 font-medium text-sm ${
                      activeTab === 'jobs'
                        ? 'border-red-500 text-red-400'
                        : 'border-transparent text-gray-300 hover:text-white hover:border-gray-300'
                    }`}
                  >
                    Jobs ({jobs.length})
                  </button>
                  <button
                    onClick={() => setActiveTab('settings')}
                    className={`py-2 px-1 border-b-2 font-medium text-sm ${
                      activeTab === 'settings'
                        ? 'border-red-500 text-red-400'
                        : 'border-transparent text-gray-300 hover:text-white hover:border-gray-300'
                    }`}
                  >
                    Settings
                  </button>
                </nav>
              </div>

              {/* Jobs Tab */}
              {activeTab === 'jobs' && (
                <div className="space-y-6">
                  <div className="flex justify-between items-center">
                    <h2 className="text-xl font-semibold text-white">Your Jobs</h2>
                    <div className="text-sm text-gray-400">
                      {loading ? 'Loading...' : `${jobs.length} total jobs`}
                    </div>
                  </div>

                  {loading ? (
                    <div className="text-center py-8">
                      <div className="text-gray-400">Loading jobs...</div>
                    </div>
                  ) : jobs.length === 0 ? (
                    <div className="text-center py-8">
                      <div className="text-gray-400 mb-4">No jobs found</div>
                      <div className="text-sm text-gray-500">
                        Create your first job from the Dashboard to see it here.
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {jobs.map((job) => (
                        <div key={job.id} className="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
                          <div className="flex justify-between items-start mb-3">
                            <div className="flex-1">
                              <h3 className="text-lg font-semibold text-white mb-1">{job.name}</h3>
                              <p className="text-sm text-gray-300 mb-2 line-clamp-2">{job.prompt}</p>
                              <div className="flex items-center gap-4 text-xs text-gray-400">
                                <span>Strategy: {job.jailbreaking_strategy}</span>
                                <span>Model: {job.ai_model}</span>
                                <span>Created: {formatDate(job.created_at)}</span>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(job.status)}`}>
                                {job.status}
                              </span>
                              {job.status === 'pending' && (
                                <button
                                  onClick={() => handleRunJob(job)}
                                  className="text-blue-400 hover:text-blue-300 text-sm bg-blue-900/30 px-2 py-1 rounded"
                                >
                                  Run
                                </button>
                              )}
                              <button
                                onClick={() => handleDeleteJob(job.id)}
                                className="text-red-400 hover:text-red-300 text-sm"
                              >
                                Delete
                              </button>
                            </div>
                          </div>
                          
                          {job.results && (
                            <div className="mt-3 pt-3 border-t border-gray-700">
                              <div className="grid grid-cols-3 gap-4 text-sm">
                                <div className="text-center">
                                  <div className="text-green-400 font-semibold">{job.success_count || 0}</div>
                                  <div className="text-gray-400">Successful</div>
                                </div>
                                <div className="text-center">
                                  <div className="text-red-400 font-semibold">{job.failure_count || 0}</div>
                                  <div className="text-gray-400">Failed</div>
                                </div>
                                <div className="text-center">
                                  <div className="text-blue-400 font-semibold">{job.success_rate || 0}%</div>
                                  <div className="text-gray-400">Success Rate</div>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Settings Tab */}
              {activeTab === 'settings' && (
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Notifications
                    </label>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={notifications}
                        onChange={(e) => setNotifications(e.target.checked)}
                        className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
                      />
                      <span className="ml-2 text-sm text-gray-300">
                        Enable email notifications
                      </span>
                    </label>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Theme
                    </label>
                    <select
                      value={theme}
                      onChange={(e) => setTheme(e.target.value)}
                      className="mt-1 block w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm text-white"
                    >
                      <option value="light">Light</option>
                      <option value="dark">Dark</option>
                      <option value="auto">Auto</option>
                    </select>
                  </div>
                  
                  <div className="pt-6 border-t border-gray-700">
                    <button className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium">
                      Save Settings
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;



