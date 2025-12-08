/**
 * Props for the Alert component.
 */
interface AlertProps {
  /** The type of alert - determines styling */
  type: 'success' | 'error';
  /** The message to display in the alert */
  message: string;
  /** Optional callback when the alert is dismissed */
  onDismiss?: () => void;
}

/**
 * Alert component for displaying success or error messages.
 * Shows a colored banner with the message and an optional dismiss button.
 */
export function Alert({ type, message, onDismiss }: AlertProps) {
  // Determine styles based on alert type
  const styles = {
    success: {
      container: 'bg-green-900/50 border-green-700 text-green-200',
      icon: '✓',
    },
    error: {
      container: 'bg-red-900/50 border-red-700 text-red-200',
      icon: '✕',
    },
  };

  const { container, icon } = styles[type];

  return (
    <div
      className={`
        ${container}
        border rounded-lg p-4
        flex items-start gap-3
        animate-in fade-in duration-200
      `}
      role="alert"
    >
      {/* Icon */}
      <span className="text-lg font-bold flex-shrink-0">{icon}</span>

      {/* Message */}
      <p className="flex-1 text-sm">{message}</p>

      {/* Dismiss button (optional) */}
      {onDismiss && (
        <button
          onClick={onDismiss}
          className="flex-shrink-0 text-current opacity-60 hover:opacity-100 transition-opacity"
          aria-label="Dismiss"
        >
          ✕
        </button>
      )}
    </div>
  );
}
