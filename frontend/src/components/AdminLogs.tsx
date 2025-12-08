/**
 * Admin Logs View Component
 * 
 * Displays recent email batch logs fetched from the backend API.
 * This is a simple, functional view for debugging and monitoring.
 */

import { useState, useEffect, useCallback } from 'react';
import { API_BASE_URL } from '../config';
import { useAuth, getAuthHeaders, handleAuthError } from '../context/AuthContext';
import { Alert } from './Alert';

/**
 * Email log entry from the API.
 */
interface EmailLog {
  id: string;
  createdAt: string;
  holidayName: string;
  tone: string | null;
  audienceType: string | null;
  language: string | null;
  senderName: string;
  status: string;
  errorMessage: string | null;
  recipientCount: number;
}

/**
 * API response for email logs.
 */
interface EmailLogsResponse {
  ok: boolean;
  logs: EmailLog[];
  total: number;
  limit: number;
  offset: number;
}

/**
 * Props for the AdminLogs component.
 */
interface AdminLogsProps {
  /** Callback to close the admin view */
  onClose: () => void;
}

/**
 * Formats a date string for display.
 */
function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleString();
}

/**
 * Returns a colored badge for the status.
 */
function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    sent: 'bg-green-600 text-green-100',
    queued: 'bg-yellow-600 text-yellow-100',
    error: 'bg-red-600 text-red-100',
  };
  
  return (
    <span className={`px-2 py-0.5 rounded text-xs font-medium ${colors[status] || 'bg-slate-600 text-slate-100'}`}>
      {status}
    </span>
  );
}

/**
 * Admin logs view component.
 */
export function AdminLogs({ onClose }: AdminLogsProps) {
  const { token, logout } = useAuth();
  const [logs, setLogs] = useState<EmailLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /**
   * Fetches email logs from the backend.
   */
  const fetchLogs = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE_URL}/api/email-logs?limit=50`, {
        headers: getAuthHeaders(token),
      });
      
      if (!response.ok) {
        if (handleAuthError(response)) {
          logout();
          return;
        }
        throw new Error(`HTTP ${response.status}`);
      }

      const data: EmailLogsResponse = await response.json();
      
      if (data.ok) {
        setLogs(data.logs);
      } else {
        throw new Error('API returned error');
      }
    } catch (err) {
      setError(
        err instanceof Error 
          ? `Failed to fetch logs: ${err.message}` 
          : 'Failed to fetch logs'
      );
    } finally {
      setLoading(false);
    }
  }, [token, logout]);

  // Fetch logs on mount
  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-slate-100">📊 Email Logs</h2>
        <div className="flex items-center gap-2">
          <button
            onClick={fetchLogs}
            disabled={loading}
            className="px-3 py-1 text-sm bg-slate-700 hover:bg-slate-600 rounded text-slate-200 transition-colors disabled:opacity-50"
          >
            {loading ? 'Loading...' : '🔄 Refresh'}
          </button>
          <button
            onClick={onClose}
            className="px-3 py-1 text-sm bg-slate-700 hover:bg-slate-600 rounded text-slate-200 transition-colors"
          >
            ✕ Close
          </button>
        </div>
      </div>

      {/* Error message */}
      {error && (
        <Alert type="error" message={error} onDismiss={() => setError(null)} />
      )}

      {/* API info */}
      <p className="text-xs text-slate-500">
        Fetching from: <code className="text-slate-400">{API_BASE_URL}/api/email-logs</code>
      </p>

      {/* Logs table */}
      {loading ? (
        <div className="text-center py-8 text-slate-400">
          Loading logs...
        </div>
      ) : logs.length === 0 ? (
        <div className="text-center py-8 text-slate-400">
          No email logs found. Send some emails first!
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-slate-400 border-b border-slate-700">
                <th className="py-2 px-2">Time</th>
                <th className="py-2 px-2">Holiday</th>
                <th className="py-2 px-2">Lang</th>
                <th className="py-2 px-2">Recipients</th>
                <th className="py-2 px-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <tr 
                  key={log.id} 
                  className="border-b border-slate-700/50 hover:bg-slate-700/30"
                >
                  <td className="py-2 px-2 text-slate-300 whitespace-nowrap">
                    {formatDate(log.createdAt)}
                  </td>
                  <td className="py-2 px-2 text-slate-200">
                    {log.holidayName}
                  </td>
                  <td className="py-2 px-2 text-slate-400 uppercase">
                    {log.language || '-'}
                  </td>
                  <td className="py-2 px-2 text-slate-300">
                    {log.recipientCount}
                  </td>
                  <td className="py-2 px-2">
                    <StatusBadge status={log.status} />
                    {log.errorMessage && (
                      <span className="ml-2 text-xs text-red-400" title={log.errorMessage}>
                        ⚠️
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Total count */}
      {logs.length > 0 && (
        <p className="text-xs text-slate-500 text-right">
          Showing {logs.length} most recent logs
        </p>
      )}
    </div>
  );
}
