import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err: any) {
      // Map Firebase error codes to user-friendly messages
      const errorMessages: { [key: string]: string } = {
        'auth/invalid-email': 'Invalid email address.',
        'auth/user-disabled': 'This user account has been disabled.',
        'auth/user-not-found': 'No account found with this email.',
        'auth/wrong-password': 'Incorrect password.',
        'auth/too-many-requests': 'Too many login attempts. Please try again later.'
      };

      const errorMessage = errorMessages[err.code] || 'Login failed. Please try again.';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-8 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-6 bg-white shadow-md rounded-xl p-6 sm:p-10">
        <div className="text-center">
          <img 
            src="/donzo-logo.svg" 
            alt="Donzo Logo" 
            className="mx-auto h-12 w-auto" 
            onError={(e) => {
              // Fallback if image doesn't load
              const target = e.target as HTMLImageElement;
              target.onerror = null;
              target.style.display = 'none';
              const parent = target.parentElement;
              if (parent) {
                const div = document.createElement('div');
                div.className = 'h-12 w-12 bg-donzo-primary rounded-full flex items-center justify-center mx-auto';
                div.innerHTML = '<span class="text-white font-bold text-xl">D</span>';
                parent.insertBefore(div, target);
              }
            }}
          />
          <h2 className="mt-4 text-2xl sm:text-3xl font-extrabold text-gray-900">
            Sign in to Donzo
          </h2>
        </div>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-xs -space-y-px">
            <div>
              <label htmlFor="email" className="sr-only">Email address</label>
              <input
                id="email"
                name="email"
                type="email"
                required
                className="appearance-none rounded-t-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-hidden focus:ring-donzo-primary focus:border-donzo-primary sm:text-sm"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">Password</label>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="appearance-none rounded-b-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-hidden focus:ring-donzo-primary focus:border-donzo-primary sm:text-sm"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          {error && (
            <div className="text-red-500 text-center text-sm">
              {error}
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-donzo-primary hover:bg-donzo-secondary focus:outline-hidden focus:ring-2 focus:ring-offset-2 focus:ring-donzo-primary disabled:opacity-50"
            >
              {isLoading ? 'Signing in...' : 'Sign in'}
            </button>
          </div>
        </form>
        <div className="text-center">
          <p className="mt-2 text-sm text-gray-600">
            Don't have an account?{' '}
            <a 
              href="/signup" 
              className="font-medium text-donzo-primary hover:text-donzo-secondary"
            >
              Sign up
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;