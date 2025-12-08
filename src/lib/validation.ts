/**
 * Validation utilities for the Holiday Email Orchestrator.
 * Provides email validation, extraction, and form validation helpers.
 */

/**
 * Simple email validation using regex.
 * This is a basic check - not RFC 5322 compliant, but sufficient for most use cases.
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim());
}

/**
 * Extracts emails from a raw string that may contain
 * comma-separated or newline-separated email addresses.
 * Trims whitespace and filters out empty strings.
 */
export function extractEmails(raw: string): string[] {
  return raw
    .split(/[,\n]+/) // Split on commas or newlines
    .map((email) => email.trim()) // Trim whitespace
    .filter((email) => email.length > 0); // Remove empty strings
}

/**
 * Form field values expected by the validation function.
 */
export interface FormFields {
  holidayName: string;
  tone: string;
  audienceType: string;
  language: string;
  senderName: string;
  recipients: string;
}

/**
 * Validation result structure.
 */
export interface ValidationResult {
  valid: boolean;
  errors: Record<string, string>;
}

/**
 * Validates the entire form and returns a validation result.
 * 
 * Required fields:
 * - holidayName
 * - senderName
 * - recipients (must contain at least one valid email)
 */
export function validateForm(fields: FormFields): ValidationResult {
  const errors: Record<string, string> = {};

  // Holiday name is required
  if (!fields.holidayName.trim()) {
    errors.holidayName = "Holiday name is required.";
  }

  // Sender name is required
  if (!fields.senderName.trim()) {
    errors.senderName = "Sender name is required.";
  }

  // Recipients is required and must contain at least one valid email
  if (!fields.recipients.trim()) {
    errors.recipients = "At least one recipient email is required.";
  } else {
    const emails = extractEmails(fields.recipients);
    
    if (emails.length === 0) {
      errors.recipients = "At least one recipient email is required.";
    } else {
      // Check if at least one email looks valid
      const hasValidEmail = emails.some(isValidEmail);
      if (!hasValidEmail) {
        errors.recipients = "Please enter at least one valid email address.";
      }
    }
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
}
