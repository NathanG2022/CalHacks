import { useState } from 'react';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import EnhancedAI from './components/EnhancedAI';
import { BrowserRouter as Router, Routes, Route, Navigate, Link } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { SignIn, SignUp } from './components/Auth';
import LoadingScreen from './components/LoadingScreen';

function AppContent() {
  const { user, loading, isAuthenticated } = useAuth();
  const [showSignUp, setShowSignUp] = useState(false);

  if (loading) {
    return <LoadingScreen />;
  }

  if (!isAuthenticated) {
    return showSignUp ? (
      <SignUp onSuccess={() => setShowSignUp(false)} onSwitchToSignIn={() => setShowSignUp(false)} />
    ) : (
      <SignIn onSuccess={() => {}} onSwitchToSignUp={() => setShowSignUp(true)} />
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-red-700/20 backdrop-blur-md border-b border-black/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <h1 className="text-xl font-bold text-gray-900">CalHacks App</h1>
              </div>
              <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                <Link
                  to="/"
                  className="border-transparent text-gray-900 hover:text-gray-700 hover:border-gray-300 whitespace-nowrap py-6 px-5 border-b-2 font-medium text-sm"
                >
                  Dashboard
                </Link>
                <Link
                  to="/enhanced-ai"
                  className="border-transparent text-gray-900 hover:text-gray-700 hover:border-gray-300 whitespace-nowrap py-6 px-1 border-b-2 font-medium text-sm"
                >
                  Enhanced AI
                </Link>
                <Link
                  to="/Settings"
                  className="border-transparent text-gray-900 hover:text-gray-700 hover:border-gray-300 whitespace-nowrap py-6 px-1 border-b-2 font-medium text-sm"
                >
                  Jobs
                </Link>
                <Link
                  to="/Profile"
                  className="border-transparent text-gray-900 hover:text-gray-700 hover:border-gray-300 whitespace-nowrap py-6 px-4 border-b-2 font-medium text-sm"
                >
                  Profile
                </Link>
              </div>
            </div>
            <div className="flex items-center">
              <span className="text-sm text-gray-900">Welcome, {user?.user_metadata?.name?.split(' ')[0] || 'User'}!</span>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/enhanced-ai" element={<EnhancedAI />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </div>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </Router>
  );
}

export default App
