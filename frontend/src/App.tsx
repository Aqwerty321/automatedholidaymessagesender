import { useState } from 'react';
import { Form } from './components/Form';
import { Alert } from './components/Alert';
import { AdminLogs } from './components/AdminLogs';
import { Login } from './components/Login';
import { AuthProvider, useAuth } from './context/AuthContext';
import { WEBHOOK_URL, API_BASE_URL, isWebhookUrlUnconfigured, getBackendLabel, isSecurityConfigured } from './config';

/**
 * Main application content.
 * Renders the form or admin logs based on state.
 */
function AppContent() {
  const { isAuthenticated, logout } = useAuth();
  const showConfigWarning = isWebhookUrlUnconfigured();
  const showSecurityWarning = !isSecurityConfigured();
  const [showAdminLogs, setShowAdminLogs] = useState(false);

  // Show login if not authenticated
  if (!isAuthenticated) {
    return <Login />;
  }

  return (
    <div className="min-h-screen bg-slate-900 py-8 px-4">
      {/* Centered container */}
      <div className="max-w-2xl mx-auto">
        {/* Configuration warning banner */}
        {showConfigWarning && (
          <div className="mb-4">
            <Alert
              type="error"
              message="⚠️ WEBHOOK_URL is not configured. Set the VITE_WEBHOOK_URL environment variable or create a .env.local file."
            />
          </div>
        )}

        {/* Security warning banner */}
        {showSecurityWarning && (
          <div className="mb-4">
            <Alert
              type="error"
              message="⚠️ Security not fully configured. Set VITE_API_KEY_FRONTEND and VITE_N8N_SECRET environment variables."
            />
          </div>
        )}

        {/* Main card */}
        <div className="bg-slate-800 rounded-xl shadow-2xl border border-slate-700 p-8">
          {/* Header */}
          <header className="text-center mb-8">
            <div className="flex items-center justify-center gap-4 mb-2">
              <h1 className="text-3xl font-bold text-slate-100">
                🎄 Holiday Email Orchestrator
              </h1>
            </div>
            <p className="text-slate-400 text-sm">
              Send personalized AI-generated holiday emails to your contacts using 
              <span className="text-blue-400"> Toolhouse</span> + 
              <span className="text-orange-400"> n8n</span>.
            </p>
          </header>

          {/* Toggle between form and admin logs */}
          {showAdminLogs ? (
            <AdminLogs onClose={() => setShowAdminLogs(false)} />
          ) : (
            <Form webhookUrl={WEBHOOK_URL} />
          )}

          {/* Developer section */}
          <footer className="mt-8 pt-6 border-t border-slate-700">
            <div className="text-xs text-slate-500 space-y-2">
              <div className="flex items-center justify-between">
                <p className="font-semibold text-slate-400">Developer Info</p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShowAdminLogs(!showAdminLogs)}
                    className="text-blue-400 hover:text-blue-300 transition-colors"
                  >
                    {showAdminLogs ? '← Back to Form' : '📊 View Logs'}
                  </button>
                  <span className="text-slate-600">|</span>
                  <button
                    onClick={logout}
                    className="text-red-400 hover:text-red-300 transition-colors"
                  >
                    🚪 Logout
                  </button>
                </div>
              </div>
              <p>
                <span className="text-slate-400">Backend: </span>
                <span className="text-blue-400 font-medium">{getBackendLabel()}</span>
              </p>
              <p>
                <span className="text-slate-400">Webhook: </span>
                <code className={`bg-slate-900 px-2 py-0.5 rounded break-all ${
                  showConfigWarning ? 'text-amber-400' : 'text-slate-300'
                }`}>
                  {WEBHOOK_URL}
                </code>
              </p>
              <p>
                <span className="text-slate-400">API: </span>
                <code className="bg-slate-900 px-2 py-0.5 rounded break-all text-slate-300">
                  {API_BASE_URL}
                </code>
              </p>
              <p className="text-slate-500">
                💡 Set <code className="text-slate-400">VITE_WEBHOOK_URL</code> and{' '}
                <code className="text-slate-400">VITE_API_BASE_URL</code> in{' '}
                <code className="text-slate-400">.env.local</code> or deploy settings.
              </p>
            </div>
          </footer>
        </div>
      </div>
    </div>
  );
}

/**
 * Main application component.
 * Wraps the app in AuthProvider for authentication context.
 */
function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
