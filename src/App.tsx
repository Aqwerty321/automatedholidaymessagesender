import { Form } from './components/Form';
import { Alert } from './components/Alert';
import { WEBHOOK_URL, isWebhookUrlUnconfigured, getBackendLabel } from './config';

/**
 * Main application component.
 * Renders a centered card with the holiday email orchestrator form.
 */
function App() {
  const showConfigWarning = isWebhookUrlUnconfigured();

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

        {/* Main card */}
        <div className="bg-slate-800 rounded-xl shadow-2xl border border-slate-700 p-8">
          {/* Header */}
          <header className="text-center mb-8">
            <h1 className="text-3xl font-bold text-slate-100 mb-2">
              🎄 Holiday Email Orchestrator
            </h1>
            <p className="text-slate-400 text-sm">
              Send personalized AI-generated holiday emails to your contacts using 
              <span className="text-blue-400"> Toolhouse</span> + 
              <span className="text-orange-400"> n8n</span>.
            </p>
          </header>

          {/* Form component */}
          <Form webhookUrl={WEBHOOK_URL} />

          {/* Developer section */}
          <footer className="mt-8 pt-6 border-t border-slate-700">
            <div className="text-xs text-slate-500 space-y-1">
              <p className="font-semibold text-slate-400">Developer Info</p>
              <p>
                <span className="text-slate-400">Backend: </span>
                <span className="text-blue-400 font-medium">{getBackendLabel()}</span>
              </p>
              <p>
                <span className="text-slate-400">Webhook URL: </span>
                <code className={`bg-slate-900 px-2 py-0.5 rounded break-all ${
                  showConfigWarning ? 'text-amber-400' : 'text-slate-300'
                }`}>
                  {WEBHOOK_URL}
                </code>
              </p>
              <p className="text-slate-500">
                💡 Set <code className="text-slate-400">VITE_WEBHOOK_URL</code> in{' '}
                <code className="text-slate-400">.env.local</code> (local) or Vercel/Render settings (production).
              </p>
            </div>
          </footer>
        </div>
      </div>
    </div>
  );
}

export default App;
