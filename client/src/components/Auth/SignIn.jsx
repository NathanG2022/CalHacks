import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { signInWithGoogle, signInWithMicrosoft } from '../../lib/supabase';

const SignIn = ({ onSuccess, onSwitchToSignUp }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { signIn } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const result = await signIn(email, password);
    
    if (result.success) {
      onSuccess();
    } else {
      setError(result.error);
    }
    
    setLoading(false);
  };

  // Google OAuth with Supabase
  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError('');
    
    try {
      const { data, error } = await signInWithGoogle();
      if (error) {
        setError(error.message);
      } else if (data?.user) {
        onSuccess();
      }
    } catch (error) {
      setError('Google OAuth failed');
    } finally {
      setLoading(false);
    }
  };

  // Microsoft OAuth with Supabase
  const handleMicrosoftSignIn = async () => {
    setLoading(true);
    setError('');
    
    try {
      const { data, error } = await signInWithMicrosoft();
      if (error) {
        setError(error.message);
      } else if (data?.user) {
        onSuccess();
      }
    } catch (error) {
      setError('Microsoft OAuth failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-white text-glow-intense">
            Sign in to PromptBreakr
          </h2>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-primary-900/20 border border-primary-500 text-primary-300 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}
          <div className="space-y-4">
            <div>
              <input
                type="email"
                required
                className="cyber-input"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <input
                type="password"
                required
                className="cyber-input"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="cyber-button w-full disabled:opacity-50"
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </div>
        </form>

        {/* Divider */}
        <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-700" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-black text-gray-400">Or continue with</span>
            </div>
          </div>
        </div>

        {/* OAuth Buttons */}
        <div className="mt-6 space-y-3">
          <button
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="w-full flex justify-center items-center px-4 py-2 border border-gray-700 rounded-lg shadow-sm bg-black/50 text-sm font-medium text-gray-300 hover:bg-gray-900 hover:border-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-600 disabled:opacity-50 transition-all"
          >
            <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Continue with Google
          </button>

          <button
            onClick={handleMicrosoftSignIn}
            disabled={loading}
            className="w-full flex justify-center items-center px-4 py-2 border border-gray-700 rounded-lg shadow-sm bg-black/50 text-sm font-medium text-gray-300 hover:bg-gray-900 hover:border-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-600 disabled:opacity-50 transition-all"
          >
            <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
              <path fill="#f25022" d="M1 1h10v10H1z"/>
              <path fill="#7fba00" d="M13 1h10v10H13z"/>
              <path fill="#00a4ef" d="M1 13h10v10H1z"/>
              <path fill="#ffb900" d="M13 13h10v10H13z"/>
            </svg>
            Continue with Microsoft
          </button>
        </div>

        {/* Switch to Sign Up */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-400">
            Don't have an account?{' '}
            <button
              onClick={onSwitchToSignUp}
              className="font-medium text-primary-500 hover:text-primary-400"
            >
              Sign up
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignIn;
