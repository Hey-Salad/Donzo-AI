import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Signup: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { signup, isAuthenticated } = useAuth();
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

    // Validate password match
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      setIsLoading(false);
      return;
    }

    // Password strength validation
    if (password.length < 8) {
      setError('Password must be at least 8 characters long');
      setIsLoading(false);
      return;
    }

    try {
      await signup(email, password);
      navigate('/dashboard');
    } catch (err: any) {
      // Map Firebase error codes to user-friendly messages
      const errorMessages: { [key: string]: string } = {
        'auth/email-already-in-use': 'Email address is already in use.',
        'auth/invalid-email': 'Invalid email address.',
        'auth/weak-password': 'Password is too weak. Please use a stronger password.',
        'auth/operation-not-allowed': 'Account creation is currently disabled.',
      };

      const errorMessage = errorMessages[err.code] || 'Signup failed. Please try again.';
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
            Create Your Donzo Account
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
                className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-hidden focus:ring-donzo-primary focus:border-donzo-primary sm:text-sm"
                placeholder="Password (min 8 characters)"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="confirm-password" className="sr-only">Confirm Password</label>
              <input
                id="confirm-password"
                name="confirm-password"
                type="password"
                required
                className="appearance-none rounded-b-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-hidden focus:ring-donzo-primary focus:border-donzo-primary sm:text-sm"
                placeholder="Confirm Password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
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
              {isLoading ? 'Creating Account...' : 'Sign Up'}
            </button>
          </div>
        </form>
        <div className="text-center">
          <p className="mt-2 text-sm text-gray-600">
            Already have an account?{' '}
            <a 
              href="/login" 
              className="font-medium text-donzo-primary hover:text-donzo-secondary"
            >
              Log in
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Signup;