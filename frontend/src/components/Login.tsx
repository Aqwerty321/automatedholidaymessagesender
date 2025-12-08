/**
 * Login Component
 * 
 * Password-based login form for accessing the Holiday Email Orchestrator.
 */

import { useState, FormEvent } from 'react';
import { useAuth } from '../context/AuthContext';
import { ACCESS_PASSWORD_HINT } from '../config';
import { Alert } from './Alert';

/**
 * Login form component.
 * Displays a password input and handles authentication.
 */
export function Login() {
  const { login, isLoading, error, clearError } = useAuth();
  const [password, setPassword] = useState('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    clearError();
    
    if (!password.trim()) {
      return;
    }

    await login(password);
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center py-8 px-4">
      <div className="w-full max-w-md">
        {/* Main card */}
        <div className="bg-slate-800 rounded-xl shadow-2xl border border-slate-700 p-8">
          {/* Header */}
          <header className="text-center mb-8">
            <h1 className="text-3xl font-bold text-slate-100 mb-2">
              🎄 Holiday Email Orchestrator
            </h1>
            <p className="text-slate-400 text-sm">
              Enter your access password to continue
            </p>
          </header>

          {/* Login form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Error message */}
            {error && (
              <Alert 
                type="error" 
                message={error} 
                onDismiss={clearError}
              />
            )}

            {/* Password input */}
            <div>
              <label 
                htmlFor="password" 
                className="block text-sm font-medium text-slate-300 mb-2"
              >
                Access Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
                autoFocus
                autoComplete="current-password"
                className="w-full px-4 py-3 bg-slate-900 border border-slate-600 rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
                placeholder="Enter password"
              />
            </div>

            {/* Password hint */}
            {ACCESS_PASSWORD_HINT && (
              <p className="text-xs text-slate-500">
                💡 Hint: {ACCESS_PASSWORD_HINT}
              </p>
            )}

            {/* Submit button */}
            <button
              type="submit"
              disabled={isLoading || !password.trim()}
              className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-600/50 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-slate-800"
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle 
                      className="opacity-25" 
                      cx="12" 
                      cy="12" 
                      r="10" 
                      stroke="currentColor" 
                      strokeWidth="4"
                      fill="none"
                    />
                    <path 
                      className="opacity-75" 
                      fill="currentColor" 
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Logging in...
                </span>
              ) : (
                'Login'
              )}
            </button>
          </form>

          {/* Footer */}
          <footer className="mt-8 pt-6 border-t border-slate-700 text-center">
            <p className="text-xs text-slate-500">
              🔒 Secure access required
            </p>
          </footer>
        </div>
      </div>
    </div>
  );
}
