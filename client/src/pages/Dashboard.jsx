import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { apiService } from '../services/api';
import { useNavigate } from 'react-router-dom';
import HackerBackground from '../components/HackerBackground';
import { getQwenResponse } from '../services/ai';

const Dashboard = () => {
  const { user, signOut } = useAuth();
  const [items, setItems] = useState([]);
  const [newItem, setNewItem] = useState('');
  const [loading, setLoading] = useState(false);
  const [serverStatus, setServerStatus] = useState('unknown');

  const quickActionsRef = useRef(null);
  const [targetModel, setTargetModel] = useState('llama2-7b');
  const navigate = useNavigate();

  useEffect(() => {
    checkServerHealth();
    fetchItems();
  }, []);

  const checkServerHealth = async () => {
    try {
      await apiService.healthCheck();
      setServerStatus('connected');
    } catch (error) {
      setServerStatus('disconnected');
    }
  };

  const fetchItems = async () => {
    try {
      setLoading(true);
      const data = await apiService.getItems();
      setItems(data);
    } catch (error) {
      console.error('Failed to fetch items:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddItem = async (e) => {
    e.preventDefault();
    if (!newItem.trim()) return;

    try {
      setLoading(true);
      const item = await apiService.createItem({ 
        name: newItem, 
        completed: false 
      });
      setItems([...items, item]);
      setNewItem('');
    } catch (error) {
      console.error('Failed to add item:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleItem = async (id) => {
    try {
      const item = items.find(item => item.id === id);
      const updatedItem = await apiService.updateItem(id, {
        ...item,
        completed: !item.completed
      });
      setItems(items.map(item => 
        item.id === id ? updatedItem : item
      ));
    } catch (error) {
      console.error('Failed to toggle item:', error);
    }
  };

  const handleDeleteItem = async (id) => {
    try {
      await apiService.deleteItem(id);
      setItems(items.filter(item => item.id !== id));
    } catch (error) {
      console.error('Failed to delete item:', error);
    }
  };
  const [showNewJobModal, setShowNewJobModal] = useState(false);
  const [newJobName, setNewJobName] = useState('');
  const [newJobPrompt, setNewJobPrompt] = useState('');
  const [newJobLoading, setNewJobLoading] = useState(false);
  const [newJobResult, setNewJobResult] = useState(null);
  
  const scrollToQuickActions = () => {
    if (quickActionsRef.current) {
    const yOffset = -100;
    const y = quickActionsRef.current.getBoundingClientRect().top + window.pageYOffset + yOffset;
    window.scrollTo({ top: y, behavior: 'smooth' });
  }
  };

  return (
    <div className="min-h-screen bg-black">
      {/* Hero Section with Animated Background */}
      <div className="relative overflow-hidden pb-20">
        <HackerBackground />
        <div className="max-w-7xl mx-auto py-20 sm:px-6 lg:px-8 relative z-10">
          {/* Mission Box Section */}
          <div className="mt-60 mb-20 glass-card p-8 max-w-4xl mx-auto border-l-4 border-red-600">
            <h1 className="text-5xl font-bold text-white mb-4 text-glow-intense">
              A platform for AI red-teaming
            </h1>
            <p className="text-xl text-gray-300 mb-6">
              We built an autonomous AI red-teaming agent using Letta to continuously generate and test jailbreaks for small open source LLMs.
            </p>
            <div className="flex flex-wrap gap-4">

              <button
              className="bg-red-600 hover:bg-red-700 cyber-button text-lg"
              onClick={scrollToQuickActions}>
                Get started
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content with Solid Background */}
      <main className="max-w-7xl mx-auto py-20 sm:px-6 lg:px-8 bg-black relative z-20">

        {/* Quick Actions Section */}
        <div ref={quickActionsRef} className="mb-16">
          <h2 className="text-2xl font-semibold mb-6 text-white text-glow">Quick Actions</h2>
          <div className="flex flex-wrap gap-4">
            <button
            className="bg-red-600 hover:bg-red-700 cyber-button"
            onClick={() => setShowNewJobModal(true)}
            >
              Run new job
            </button>
            <button className="bg-red-600 hover:bg-red-700 cyber-button">
              Re-run last failing job
            </button>
            <button className="bg-red-600 hover:bg-red-700 cyber-button"
            onClick={() => navigate('/settings')}>
              View active jobs
            </button>
            <button className="bg-red-600 hover:bg-red-700 cyber-button">
              Export report
            </button>
          </div>
        </div>

        {/* Metrics */}
        <div className="mt-20">
          <h2 className="text-2xl font-semibold mb-6 text-white text-glow">Metrics & Analytics</h2>

          {/* Top Row - Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {/* Current Model Version Card */}
            <div className="glass-card p-6 border-l-4 border-red-500">
              <h3 className="text-sm font-medium text-gray-400 mb-2">Current Model Version</h3>
              <div className="text-3xl font-bold text-white mb-1">Llama-3.2-1B</div>
              <p className="text-sm text-gray-400">Deployed: 2 days ago</p>
              <div className="mt-4 text-xs text-gray-400">
                <div className="flex justify-between mb-1">
                  <span>Vulnerability Score:</span>
                  <span className="font-semibold text-red-400">7.2/10</span>
                </div>
                <div className="flex justify-between">
                  <span>Tests Passed:</span>
                  <span className="font-semibold text-green-400">67%</span>
                </div>
              </div>
            </div>

            {/* Total Tests Card */}
            <div className="glass-card p-6 border-l-4 border-red-500">
              <h3 className="text-sm font-medium text-gray-400 mb-2">Total Tests Run</h3>
              <div className="text-3xl font-bold text-white mb-1">2,847</div>
              <p className="text-sm text-green-400">+342 from last week</p>
              <div className="mt-4">
                <div className="text-xs text-gray-400 mb-1">This week</div>
                <div className="w-full bg-gray-800 rounded-full h-2">
                  <div className="bg-red-500 h-2 rounded-full" style={{width: '78%'}}></div>
                </div>
              </div>
            </div>

            {/* Successful Canary Hits Card */}
            <div className="glass-card p-6 border-l-4 border-red-500">
              <h3 className="text-sm font-medium text-gray-400 mb-2">Successful Canary Hits</h3>
              <div className="text-3xl font-bold text-white mb-1">1,204</div>
              <p className="text-sm text-gray-400">42.3% success rate</p>
              <div className="mt-4 text-xs text-gray-400">
                <div className="flex justify-between mb-1">
                  <span>Critical:</span>
                  <span className="font-semibold text-red-400">89</span>
                </div>
                <div className="flex justify-between">
                  <span>Medium:</span>
                  <span className="font-semibold text-yellow-400">315</span>
                </div>
              </div>
            </div>
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Tests Over Time - CSS Bar Chart */}
            <div className="glass-card p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Tests Run Over Time</h3>
              <div className="h-64 flex flex-col">
                <div className="flex-1 flex items-end justify-between gap-3 pb-2">
                  {[
                    { day: 'Mon', value: 320 },
                    { day: 'Tue', value: 445 },
                    { day: 'Wed', value: 380 },
                    { day: 'Thu', value: 510 },
                    { day: 'Fri', value: 425 },
                    { day: 'Sat', value: 390 },
                    { day: 'Sun', value: 377 }
                  ].map((item, i) => {
                    const maxValue = 510;
                    const heightPercent = (item.value / maxValue) * 100;
                    return (
                      <div key={i} className="flex-1 flex flex-col items-center justify-end h-full">
                        <div
                          className="w-full bg-red-500 rounded-t hover:bg-red-700 transition-colors relative group cursor-pointer min-h-[20px]"
                          style={{height: `${heightPercent}%`}}
                          title={`${item.value} tests`}
                        >
                          <span className="absolute -top-7 left-1/2 transform -translate-x-1/2 text-xs font-semibold bg-black border border-red-600 text-white px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                            {item.value}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div className="flex justify-between pt-2 border-t border-gray-700">
                  {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, i) => (
                    <span key={i} className="flex-1 text-center text-xs text-gray-400">{day}</span>
                  ))}
                </div>
              </div>
            </div>

            {/* Success Rate - CSS Donut Chart */}
            <div className="glass-card p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Canary Hit Distribution</h3>
              <div className="h-64 flex items-center justify-center">
                <div className="relative w-48 h-48">
                  {/* Donut segments */}
                  <svg viewBox="0 0 100 100" className="transform -rotate-90">
                    {/* Successful Hits - 42.3% (light red) */}
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      fill="none"
                      stroke="rgb(252, 165, 165)"
                      strokeWidth="20"
                      strokeDasharray="106 314"
                      strokeDashoffset="0"
                    />
                    {/* Failed Attempts - 52.1% (red) */}
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      fill="none"
                      stroke="rgba(239, 68, 68, 1)"
                      strokeWidth="20"
                      strokeDasharray="164 314"
                      strokeDashoffset="-106"
                    />
                    {/* Inconclusive - 5.6% (gray) */}
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      fill="none"
                      stroke="rgb(156, 163, 175)"
                      strokeWidth="20"
                      strokeDasharray="18 314"
                      strokeDashoffset="-270"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-white">2,847</div>
                      <div className="text-xs text-gray-400">Total</div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex justify-center gap-4 mt-4 text-xs text-gray-300">
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 bg-red-300 rounded"></div>
                  <span>Successful (1,204)</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 bg-red-500 rounded"></div>
                  <span>Failed (1,483)</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 bg-gray-400 rounded"></div>
                  <span>Inconclusive (160)</span>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Findings Timeline */}
          <div className="glass-card p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Recent Findings Timeline (Last 30 Days)</h3>
            <div className="h-80 relative">
              {/* Y-axis labels */}
              <div className="absolute left-0 top-0 bottom-8 flex flex-col justify-between text-xs text-gray-400 w-8">
                <span>120</span>
                <span>90</span>
                <span>60</span>
                <span>30</span>
                <span>0</span>
              </div>

              {/* Chart area */}
              <div className="ml-10 h-full pb-8 relative">
                {/* Grid lines */}
                <div className="absolute inset-0 flex flex-col justify-between">
                  {[0, 1, 2, 3, 4].map(i => (
                    <div key={i} className="border-t border-gray-800"></div>
                  ))}
                </div>

                {/* Data visualization */}
                <svg className="w-full h-full" preserveAspectRatio="none">
                  {/* Low Findings - Light Red */}
                  <polyline
                    points="0,230 80,180 160,130 240,90 320,60 400,40 480,20"
                    fill="rgba(252, 165, 165, 0.1)"
                    stroke="rgb(252, 165, 165)"
                    strokeWidth="2"
                    vectorEffect="non-scaling-stroke"
                  />
                  {/* Medium Findings - Orange Red */}
                  <polyline
                    points="0,260 80,240 160,220 240,190 320,180 400,150 480,140"
                    fill="rgba(251, 113, 133, 0.1)"
                    stroke="rgb(251, 113, 133)"
                    strokeWidth="2"
                    vectorEffect="non-scaling-stroke"
                  />
                  {/* Critical Findings - Dark Red */}
                  <polyline
                    points="0,285 80,275 160,270 240,265 320,260 400,255 480,250"
                    fill="rgba(220, 38, 38, 0.1)"
                    stroke="rgb(220, 38, 38)"
                    strokeWidth="2"
                    vectorEffect="non-scaling-stroke"
                  />
                </svg>

                {/* X-axis labels */}
                <div className="absolute bottom-0 left-0 right-0 flex justify-between text-xs text-gray-400">
                  <span>Day 1</span>
                  <span>Day 5</span>
                  <span>Day 10</span>
                  <span>Day 15</span>
                  <span>Day 20</span>
                  <span>Day 25</span>
                  <span>Day 30</span>
                </div>
              </div>
            </div>

            {/* Legend */}
            <div className="flex justify-center gap-6 mt-4 text-sm text-gray-300">
              <div className="flex items-center gap-2">
                <div className="w-4 h-0.5 bg-red-600"></div>
                <span>Critical (22)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-0.5 bg-rose-400"></div>
                <span>Medium (67)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-0.5 bg-red-300"></div>
                <span>Low (108)</span>
              </div>
            </div>
          </div>
        </div>
        {showNewJobModal && (
  <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-80 z-50 backdrop-blur-sm">
    <div className="glass-card w-full max-w-lg p-6 border-l-4 border-red-600">
      <h2 className="text-xl font-semibold mb-4 text-white text-glow">New Job</h2>

      {/* Job Name */}
      <label className="block mb-4">
        <span className="text-gray-300">Job Name</span>
        <input
          type="text"
          value={newJobName}
          onChange={(e) => setNewJobName(e.target.value)}
          className="cyber-input mt-1"
          placeholder="e.g. Unicode attack test"
        />
      </label>

      {/* Target Model */}
      <label className="block mb-6">
        <span className="text-gray-300">Target Model</span>
        <select
          value={targetModel}
          onChange={(e) => setTargetModel(e.target.value)}
          className="cyber-input mt-1"
        >
          <option value="llama2-7b">LLaMA 2 - 7B</option>
          <option value="llama2-13b">LLaMA 2 - 13B</option>
          <option value="mistral-7b">Mistral 7B</option>
          <option value="falcon-7b">Falcon 7B</option>
          <option value="gemma-7b">Gemma 7B</option>
          <option value="openchat-3.5">OpenChat 3.5</option>
          <option value="phi-2">Phi-2</option>
        </select>
      </label>

      {/* Prompt */}
      <label className="block mb-6">
        <span className="text-gray-300">Prompt</span>
        <textarea
          value={newJobPrompt}
          onChange={(e) => setNewJobPrompt(e.target.value)}
          className="cyber-input mt-1"
          rows={4}
          placeholder="Enter the exact prompt to run..."
        ></textarea>
      </label>

      {/* Buttons */}
      <div className="flex justify-end gap-4">
        <button
          className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition"
          onClick={() => setShowNewJobModal(false)}
        >
          Cancel
        </button>
        <button
          className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
          onClick={async () => {
            if (!newJobName.trim() || !newJobPrompt.trim()) {
              alert('Please fill out job name and prompt.');
              return;
            }
            console.log('Creating job:', { name: newJobName, model: targetModel, prompt: newJobPrompt });

            setShowNewJobModal(false);

            try {
              setNewJobLoading(true);
              setNewJobResult(null);
              // Call the ai API helper - pass the prompt (adjust if your ai service expects different args)
              const res = await getQwenResponse(newJobPrompt);
              // store/display response
              setNewJobResult(res);
              console.log('AI response for job:', { name: newJobName, response: res });

              // Optionally create a lightweight job entry in items list
              setItems(prev => [...prev, { id: Date.now(), name: newJobName, result: res }]);

              // close modal (or keep open to show result) — keep open so user can see result
              // setShowNewJobModal(false);
            } catch (err) {
              console.error('Failed to run AI job:', err);
              alert('Failed to run AI job. See console for details.');
            } finally {
              setNewJobLoading(false);
            }
          }}
        >
           Launch Job
         </button>
      </div>
      {/* Result / Loading */}
      <div className="mt-4">
        {newJobLoading && <div className="text-sm text-gray-600">Running job...</div>}
        {newJobResult && (
          <div className="mt-3 p-3 bg-gray-100 rounded text-sm text-gray-800 max-h-48 overflow-auto">
            <strong>Result:</strong>
            <pre className="whitespace-pre-wrap text-xs mt-2">{typeof newJobResult === 'string' ? newJobResult : JSON.stringify(newJobResult, null, 2)}</pre>
          </div>
        )}
      </div>
    </div>
  </div>
)}
      </main>
    </div>
  );
};

export default Dashboard;
