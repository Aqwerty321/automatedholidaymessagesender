/**
 * Authentication Context
 * 
 * Provides authentication state and methods throughout the app.
 * Handles JWT storage, login, logout, and automatic logout on token expiry.
 */

import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import { API_BASE_URL, API_KEY_FRONTEND } from '../config';

// ============================================================
// Types
// ============================================================

interface AuthContextType {
  /** Whether the user is authenticated */
  isAuthenticated: boolean;
  /** The current JWT token, if authenticated */
  token: string | null;
  /** Whether a login is in progress */
  isLoading: boolean;
  /** Error message from last login attempt */
  error: string | null;
  /** Attempt to log in with a password */
  login: (password: string) => Promise<boolean>;
  /** Log out and clear credentials */
  logout: () => void;
  /** Clear any error message */
  clearError: () => void;
}

interface AuthProviderProps {
  children: ReactNode;
}

interface LoginResponse {
  ok: boolean;
  token?: string;
  expiresIn?: number;
  error?: string;
  code?: string;
}

// ============================================================
// Constants
// ============================================================

const JWT_STORAGE_KEY = 'jwt';
const JWT_EXPIRY_KEY = 'jwt_expiry';

// ============================================================
// Context
// ============================================================

const AuthContext = createContext<AuthContextType | null>(null);

/**
 * Hook to access auth context.
 * Must be used within an AuthProvider.
 */
export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

/**
 * Provides authentication state to the app.
 */
export function AuthProvider({ children }: AuthProviderProps) {
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [initialized, setInitialized] = useState(false);

  // Check for existing token on mount
  useEffect(() => {
    const storedToken = localStorage.getItem(JWT_STORAGE_KEY);
    const storedExpiry = localStorage.getItem(JWT_EXPIRY_KEY);
    
    if (storedToken && storedExpiry) {
      const expiryTime = parseInt(storedExpiry, 10);
      if (Date.now() < expiryTime) {
        setToken(storedToken);
      } else {
        // Token expired, clean up
        localStorage.removeItem(JWT_STORAGE_KEY);
        localStorage.removeItem(JWT_EXPIRY_KEY);
      }
    }
    setInitialized(true);
  }, []);

  // Set up auto-logout when token expires
  useEffect(() => {
    if (!token) return;

    const storedExpiry = localStorage.getItem(JWT_EXPIRY_KEY);
    if (!storedExpiry) return;

    const expiryTime = parseInt(storedExpiry, 10);
    const timeUntilExpiry = expiryTime - Date.now();

    if (timeUntilExpiry <= 0) {
      // Already expired
      setToken(null);
      localStorage.removeItem(JWT_STORAGE_KEY);
      localStorage.removeItem(JWT_EXPIRY_KEY);
      return;
    }

    // Set timer to logout when token expires
    const timer = setTimeout(() => {
      setToken(null);
      localStorage.removeItem(JWT_STORAGE_KEY);
      localStorage.removeItem(JWT_EXPIRY_KEY);
    }, timeUntilExpiry);

    return () => clearTimeout(timer);
  }, [token]);

  /**
   * Attempt to log in with the provided password.
   */
  const login = useCallback(async (password: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ password }),
      });

      const data: LoginResponse = await response.json();

      if (response.ok && data.ok && data.token) {
        // Calculate expiry time (store as timestamp)
        const expiryTime = Date.now() + (data.expiresIn || 28800) * 1000;
        
        // Store in memory and localStorage
        setToken(data.token);
        localStorage.setItem(JWT_STORAGE_KEY, data.token);
        localStorage.setItem(JWT_EXPIRY_KEY, expiryTime.toString());
        
        setIsLoading(false);
        return true;
      } else {
        setError(data.error || 'Login failed');
        setIsLoading(false);
        return false;
      }
    } catch (err) {
      setError('Network error. Please check your connection.');
      setIsLoading(false);
      return false;
    }
  }, []);

  /**
   * Log out and clear all credentials.
   */
  const logout = useCallback(() => {
    setToken(null);
    setError(null);
    localStorage.removeItem(JWT_STORAGE_KEY);
    localStorage.removeItem(JWT_EXPIRY_KEY);
  }, []);

  /**
   * Clear any error message.
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Don't render children until we've checked for existing token
  if (!initialized) {
    return null;
  }

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated: !!token,
        token,
        isLoading,
        error,
        login,
        logout,
        clearError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// ============================================================
// Utility Functions
// ============================================================

/**
 * Gets headers for authenticated backend API requests.
 * Includes both JWT and API key.
 */
export function getAuthHeaders(token: string | null): Record<string, string> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  if (API_KEY_FRONTEND) {
    headers['X-API-Key'] = API_KEY_FRONTEND;
  }

  return headers;
}

/**
 * Checks if a response indicates an auth error (401/403).
 * If so, clears stored credentials.
 */
export function handleAuthError(response: Response): boolean {
  if (response.status === 401 || response.status === 403) {
    localStorage.removeItem(JWT_STORAGE_KEY);
    localStorage.removeItem(JWT_EXPIRY_KEY);
    return true;
  }
  return false;
}
