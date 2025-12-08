import { useState, FormEvent } from 'react';
import { Field, inputStyles, selectStyles } from './Field';
import { Alert } from './Alert';
import { validateForm, FormFields, extractEmails } from '../lib/validation';
import { LANGUAGE_OPTIONS, AUDIENCE_OPTIONS, API_BASE_URL, N8N_SECRET } from '../config';
import { useAuth, getAuthHeaders, handleAuthError } from '../context/AuthContext';

/**
 * Props for the Form component.
 */
interface FormProps {
  /** The webhook URL to send the form data to */
  webhookUrl: string;
}

/**
 * Submission state for tracking the async operation.
 */
type SubmissionState =
  | { status: 'idle' }
  | { status: 'submitting' }
  | { status: 'success'; message: string }
  | { status: 'error'; message: string };

/**
 * The payload structure expected by the n8n webhook.
 */
interface WebhookPayload {
  holiday_name: string;
  tone: string;
  sender_name: string;
  audience_type: string;
  language: string;
  recipients: string;
}

/**
 * The payload structure for logging to the backend API.
 */
interface LogBatchPayload {
  holidayName: string;
  tone: string | null;
  audienceType: string | null;
  language: string | null;
  senderName: string;
  recipients: string[];
  status: 'queued' | 'sent' | 'error';
  errorMessage?: string | null;
}

/**
 * Logs the email batch to the backend API.
 * This is a non-blocking operation - failures are logged but don't affect user experience.
 */
async function logEmailBatch(payload: LogBatchPayload, token: string | null, onAuthError: () => void): Promise<void> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/log-email-batch`, {
      method: 'POST',
      headers: getAuthHeaders(token),
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      if (handleAuthError(response)) {
        onAuthError();
        return;
      }
      console.warn('[LogBatch] Failed to log email batch:', response.status);
    } else {
      const data = await response.json();
      console.log('[LogBatch] Logged batch:', data.batchId);
    }
  } catch (error) {
    console.warn('[LogBatch] Error logging email batch:', error);
  }
}

/**
 * Main form component for the Holiday Email Orchestrator.
 * Manages form state, validation, and submission to the webhook.
 */
export function Form({ webhookUrl }: FormProps) {
  const { token, logout } = useAuth();
  
  // Form field state
  const [fields, setFields] = useState<FormFields>({
    holidayName: '',
    tone: '',
    audienceType: 'business',
    language: 'en',
    senderName: '',
    recipients: '',
  });

  // Validation errors state
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Submission state (idle, submitting, success, error)
  const [submission, setSubmission] = useState<SubmissionState>({ status: 'idle' });

  /**
   * Updates a single form field value.
   */
  const updateField = (name: keyof FormFields, value: string) => {
    setFields((prev) => ({ ...prev, [name]: value }));
    // Clear the error for this field when user starts typing
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  /**
   * Handles form submission.
   */
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    // Validate the form
    const validation = validateForm(fields);
    if (!validation.valid) {
      setErrors(validation.errors);
      return;
    }

    // Clear any previous errors and set submitting state
    setErrors({});
    setSubmission({ status: 'submitting' });

    // Extract emails array for logging
    const emailsArray = extractEmails(fields.recipients);

    // Build the payload for the webhook
    const payload: WebhookPayload = {
      holiday_name: fields.holidayName.trim(),
      tone: fields.tone.trim() || 'warm', // Default to 'warm' if not specified
      sender_name: fields.senderName.trim(),
      audience_type: fields.audienceType,
      language: fields.language,
      recipients: fields.recipients, // Send raw string; backend handles splitting
    };

    try {
      // Build headers for n8n webhook (includes secret)
      const webhookHeaders: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      if (N8N_SECRET) {
        webhookHeaders['X-N8N-SECRET'] = N8N_SECRET;
      }

      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: webhookHeaders,
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        // Success! Log to backend (non-blocking)
        logEmailBatch({
          holidayName: fields.holidayName.trim(),
          tone: fields.tone.trim() || null,
          audienceType: fields.audienceType || null,
          language: fields.language || null,
          senderName: fields.senderName.trim(),
          recipients: emailsArray,
          status: 'sent',
        }, token, logout);

        setSubmission({
          status: 'success',
          message: 'Request accepted! Emails will be generated and sent.',
        });
        // Reset the form
        setFields({
          holidayName: '',
          tone: '',
          audienceType: 'business',
          language: 'en',
          senderName: '',
          recipients: '',
        });
      } else {
        // HTTP error (non-2xx status)
        let errorDetail = '';
        try {
          const errorBody = await response.text();
          errorDetail = errorBody ? `: ${errorBody}` : '';
        } catch {
          // Ignore if we can't read the body
        }

        // Log the error to backend (non-blocking)
        logEmailBatch({
          holidayName: fields.holidayName.trim(),
          tone: fields.tone.trim() || null,
          audienceType: fields.audienceType || null,
          language: fields.language || null,
          senderName: fields.senderName.trim(),
          recipients: emailsArray,
          status: 'error',
          errorMessage: `HTTP ${response.status}${errorDetail}`,
        }, token, logout);

        setSubmission({
          status: 'error',
          message: `Server error (HTTP ${response.status})${errorDetail}`,
        });
      }
    } catch (error) {
      // Log the error to backend (non-blocking)
      logEmailBatch({
        holidayName: fields.holidayName.trim(),
        tone: fields.tone.trim() || null,
        audienceType: fields.audienceType || null,
        language: fields.language || null,
        senderName: fields.senderName.trim(),
        recipients: emailsArray,
        status: 'error',
        errorMessage: 'Network error: Unable to reach automation server',
      }, token, logout);

      // Network error or fetch failed
      setSubmission({
        status: 'error',
        message: 'Unable to reach the automation server. Is n8n running?',
      });
    }
  };

  /**
   * Dismisses the current alert/notification.
   */
  const dismissAlert = () => {
    setSubmission({ status: 'idle' });
  };

  const isSubmitting = submission.status === 'submitting';

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Alert messages */}
      {submission.status === 'success' && (
        <Alert
          type="success"
          message={submission.message}
          onDismiss={dismissAlert}
        />
      )}
      {submission.status === 'error' && (
        <Alert
          type="error"
          message={submission.message}
          onDismiss={dismissAlert}
        />
      )}

      {/* Holiday Name */}
      <Field
        label="Holiday Name"
        name="holidayName"
        required
        error={errors.holidayName}
      >
        <input
          type="text"
          id="holidayName"
          name="holidayName"
          value={fields.holidayName}
          onChange={(e) => updateField('holidayName', e.target.value)}
          placeholder="e.g., Diwali, Christmas, New Year"
          className={inputStyles}
          disabled={isSubmitting}
        />
      </Field>

      {/* Tone */}
      <Field
        label="Tone"
        name="tone"
        error={errors.tone}
      >
        <input
          type="text"
          id="tone"
          name="tone"
          value={fields.tone}
          onChange={(e) => updateField('tone', e.target.value)}
          placeholder="warm, formal, playful…"
          className={inputStyles}
          disabled={isSubmitting}
        />
      </Field>

      {/* Two-column layout for Audience Type and Language */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Audience Type */}
        <Field
          label="Audience Type"
          name="audienceType"
          error={errors.audienceType}
        >
          <select
            id="audienceType"
            name="audienceType"
            value={fields.audienceType}
            onChange={(e) => updateField('audienceType', e.target.value)}
            className={selectStyles}
            disabled={isSubmitting}
          >
            {AUDIENCE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </Field>

        {/* Language */}
        <Field
          label="Language"
          name="language"
          error={errors.language}
        >
          <select
            id="language"
            name="language"
            value={fields.language}
            onChange={(e) => updateField('language', e.target.value)}
            className={selectStyles}
            disabled={isSubmitting}
          >
            {LANGUAGE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </Field>
      </div>

      {/* Sender Name */}
      <Field
        label="Sender Name"
        name="senderName"
        required
        error={errors.senderName}
      >
        <input
          type="text"
          id="senderName"
          name="senderName"
          value={fields.senderName}
          onChange={(e) => updateField('senderName', e.target.value)}
          placeholder="Your name (will sign the emails)"
          className={inputStyles}
          disabled={isSubmitting}
        />
      </Field>

      {/* Recipients */}
      <Field
        label="Recipients"
        name="recipients"
        required
        error={errors.recipients}
      >
        <textarea
          id="recipients"
          name="recipients"
          value={fields.recipients}
          onChange={(e) => updateField('recipients', e.target.value)}
          placeholder="Enter email addresses (comma or newline separated)"
          rows={4}
          className={inputStyles + ' resize-y'}
          disabled={isSubmitting}
        />
      </Field>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isSubmitting}
        className={`
          w-full py-3 px-4
          bg-blue-600 hover:bg-blue-500
          text-white font-semibold
          rounded-lg
          transition-colors
          disabled:opacity-50 disabled:cursor-not-allowed
          flex items-center justify-center gap-2
        `}
      >
        {isSubmitting ? (
          <>
            {/* Simple spinner */}
            <svg
              className="animate-spin h-5 w-5"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            Sending…
          </>
        ) : (
          <>
            🚀 Generate & Send Emails
          </>
        )}
      </button>
    </form>
  );
}
