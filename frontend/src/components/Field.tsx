import { ReactNode } from 'react';

/**
 * Props for the Field component.
 */
interface FieldProps {
  /** The label text displayed above the input */
  label: string;
  /** Unique identifier for the field */
  name: string;
  /** Whether the field is required (shows asterisk) */
  required?: boolean;
  /** Error message to display below the field */
  error?: string;
  /** The input, textarea, or select element */
  children: ReactNode;
}

/**
 * Reusable Field component that wraps form inputs with a label and error display.
 * Provides consistent styling and structure for all form fields.
 */
export function Field({ label, name, required, error, children }: FieldProps) {
  return (
    <div className="space-y-1">
      <label
        htmlFor={name}
        className="block text-sm font-medium text-slate-300"
      >
        {label}
        {required && <span className="text-red-400 ml-1">*</span>}
      </label>
      {children}
      {error && (
        <p className="text-red-400 text-xs mt-1">{error}</p>
      )}
    </div>
  );
}

/**
 * Common Tailwind classes for input elements.
 * Use these in input, textarea, and select elements for consistent styling.
 */
export const inputStyles = `
  w-full px-3 py-2 
  bg-slate-700 border border-slate-600 
  rounded-lg text-slate-100 
  placeholder:text-slate-400
  hover:border-slate-500
  focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-slate-800
  transition-colors
`.trim();

/**
 * Common Tailwind classes for select elements.
 */
export const selectStyles = `
  ${inputStyles}
  cursor-pointer
  appearance-none
  bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20fill%3D%22none%22%20viewBox%3D%220%200%2020%2020%22%3E%3Cpath%20stroke%3D%22%236b7280%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%20stroke-width%3D%221.5%22%20d%3D%22m6%208%204%204%204-4%22%2F%3E%3C%2Fsvg%3E')]
  bg-[length:1.5rem_1.5rem]
  bg-[right_0.5rem_center]
  bg-no-repeat
  pr-10
`.trim();
