import { createContext, useContext, useState, useEffect } from 'react';
import { signIn as supabaseSignIn, signUp as supabaseSignUp, signOut as supabaseSignOut, getCurrentUser } from '../lib/supabase';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Try Supabase first
        const { user } = await getCurrentUser();
        if (user) {
          setUser(user);
          setLoading(false);
          return;
        }
        
        // Fallback to backend auth
        const token = localStorage.getItem('auth_token');
        if (token) {
          const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3002';
          const response = await fetch(`${apiUrl}/api/auth/me`, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          
          if (response.ok) {
            const userData = await response.json();
            setUser(userData);
          } else {
            localStorage.removeItem('auth_token');
          }
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        localStorage.removeItem('auth_token');
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const signIn = async (email, password) => {
    try {
      // Try Supabase first
      const { data, error } = await supabaseSignIn(email, password);
      if (!error && data?.user) {
        setUser(data.user);
        return { success: true };
      }
      
      // Fallback to backend auth
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3002';
      const response = await fetch(`${apiUrl}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (response.ok) {
        const { user: userData, token } = await response.json();
        localStorage.setItem('auth_token', token);
        setUser(userData);
        return { success: true };
      } else {
        const error = await response.json();
        return { success: false, error: error.message };
      }
    } catch (error) {
      return { success: false, error: 'Network error' };
    }
  };

  const signUp = async (email, password, name) => {
    try {
      // Try Supabase first
      const { data, error } = await supabaseSignUp(email, password, name);  // Pass name here
      if (!error && data?.user) {
        setUser(data.user);
        return { success: true };
    }

      
      // Fallback to backend auth
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3002';
      const response = await fetch(`${apiUrl}/api/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password, name }),
      });

      if (response.ok) {
        const { user: userData, token } = await response.json();
        localStorage.setItem('auth_token', token);
        setUser(userData);
        return { success: true };
      } else {
        const error = await response.json();
        return { success: false, error: error.message };
      }
    } catch (error) {
      return { success: false, error: 'Network error' };
    }
  };

  const signOut = async () => {
    try {
      // Try Supabase first
      const { error } = await supabaseSignOut();
      if (error) {
        console.error('Supabase sign out error:', error);
      }
    } catch (error) {
      console.error('Supabase sign out error:', error);
    }
    
    // Always clear local state
    localStorage.removeItem('auth_token');
    setUser(null);
  };

  const isAuthenticated = !!user;

  const value = {
    user,
    loading,
    isAuthenticated,
    signIn,
    signUp,
    signOut,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
