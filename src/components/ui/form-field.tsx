/**
 * Enhanced Form Field Components
 *
 * Provides consistent form field layouts with validation, errors, and help text
 * Follows accessibility best practices with proper ARIA attributes
 *
 * Features:
 * - Automatic error state styling
 * - Help text support
 * - Character count for text inputs
 * - Required field indicators
 * - Accessible error announcements
 */

import * as React from 'react'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'
import { AlertCircle, CheckCircle2, Info } from 'lucide-react'

interface FormFieldProps {
  /**
   * Unique identifier for the field
   */
  id: string

  /**
   * Field label text
   */
  label: string

  /**
   * Whether the field is required
   */
  required?: boolean

  /**
   * Help text to display below the field
   */
  helpText?: string

  /**
   * Error message to display
   */
  error?: string

  /**
   * Success message to display (e.g., "Saved!")
   */
  success?: string

  /**
   * Additional CSS classes for the container
   */
  className?: string

  /**
   * Children (the actual form control)
   */
  children: React.ReactNode
}

export function FormField({
  id,
  label,
  required = false,
  helpText,
  error,
  success,
  className,
  children,
}: FormFieldProps) {
  const hasError = !!error
  const hasSuccess = !!success && !hasError

  return (
    <div className={cn('grid gap-2', className)}>
      <Label htmlFor={id} className="flex items-center gap-1.5">
        {label}
        {required && (
          <span className="text-destructive" aria-label="required">
            *
          </span>
        )}
      </Label>

      {children}

      {/* Help text */}
      {helpText && !hasError && !hasSuccess && (
        <p className="text-xs text-muted-foreground flex items-start gap-1.5">
          <Info className="h-3 w-3 mt-0.5 shrink-0" aria-hidden="true" />
          <span>{helpText}</span>
        </p>
      )}

      {/* Error message */}
      {hasError && (
        <p
          className="text-xs text-destructive flex items-start gap-1.5 animate-in fade-in slide-in-from-top-1 duration-200"
          role="alert"
          aria-live="assertive"
        >
          <AlertCircle className="h-3 w-3 mt-0.5 shrink-0" aria-hidden="true" />
          <span>{error}</span>
        </p>
      )}

      {/* Success message */}
      {hasSuccess && (
        <p
          className="text-xs text-green-600 dark:text-green-400 flex items-start gap-1.5 animate-in fade-in slide-in-from-top-1 duration-200"
          role="status"
          aria-live="polite"
        >
          <CheckCircle2 className="h-3 w-3 mt-0.5 shrink-0" aria-hidden="true" />
          <span>{success}</span>
        </p>
      )}
    </div>
  )
}

/**
 * Text Input with Character Count
 */
interface TextInputFieldProps
  extends Omit<React.ComponentProps<typeof Input>, 'id'>,
    Omit<FormFieldProps, 'children'> {
  /**
   * Show character count
   */
  showCount?: boolean
}

export function TextInputField({
  id,
  label,
  required,
  helpText,
  error,
  success,
  className,
  maxLength,
  showCount = false,
  value,
  defaultValue,
  onChange,
  ...inputProps
}: TextInputFieldProps) {
  const [charCount, setCharCount] = React.useState(
    (value as string)?.length || (defaultValue as string)?.length || 0
  )

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCharCount(e.target.value.length)
    onChange?.(e)
  }

  const hasError = !!error

  return (
    <FormField
      id={id}
      label={label}
      required={required}
      helpText={helpText}
      error={error}
      success={success}
      className={className}
    >
      <div className="relative">
        <Input
          id={id}
          required={required}
          maxLength={maxLength}
          value={value}
          defaultValue={defaultValue}
          onChange={handleChange}
          aria-invalid={hasError}
          aria-describedby={
            hasError
              ? `${id}-error`
              : helpText
                ? `${id}-help`
                : undefined
          }
          className={cn(
            hasError && 'border-destructive focus-visible:ring-destructive/20'
          )}
          {...inputProps}
        />
        {showCount && maxLength && (
          <span
            className={cn(
              'absolute right-3 top-1/2 -translate-y-1/2 text-xs tabular-nums',
              charCount > maxLength
                ? 'text-destructive'
                : 'text-muted-foreground'
            )}
            aria-live="polite"
          >
            {charCount}/{maxLength}
          </span>
        )}
      </div>
    </FormField>
  )
}

/**
 * Textarea with Character Count
 */
interface TextareaFieldProps
  extends Omit<React.ComponentProps<typeof Textarea>, 'id'>,
    Omit<FormFieldProps, 'children'> {
  /**
   * Show character count
   */
  showCount?: boolean
}

export function TextareaField({
  id,
  label,
  required,
  helpText,
  error,
  success,
  className,
  maxLength,
  showCount = false,
  value,
  defaultValue,
  onChange,
  ...textareaProps
}: TextareaFieldProps) {
  const [charCount, setCharCount] = React.useState(
    (value as string)?.length || (defaultValue as string)?.length || 0
  )

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setCharCount(e.target.value.length)
    onChange?.(e)
  }

  const hasError = !!error

  return (
    <FormField
      id={id}
      label={label}
      required={required}
      helpText={helpText}
      error={error}
      success={success}
      className={className}
    >
      <div className="relative">
        <Textarea
          id={id}
          required={required}
          maxLength={maxLength}
          value={value}
          defaultValue={defaultValue}
          onChange={handleChange}
          aria-invalid={hasError}
          aria-describedby={
            hasError
              ? `${id}-error`
              : helpText
                ? `${id}-help`
                : undefined
          }
          className={cn(
            hasError && 'border-destructive focus-visible:ring-destructive/20'
          )}
          {...textareaProps}
        />
        {showCount && maxLength && (
          <span
            className={cn(
              'absolute right-3 bottom-3 text-xs tabular-nums',
              charCount > maxLength
                ? 'text-destructive'
                : 'text-muted-foreground'
            )}
            aria-live="polite"
          >
            {charCount}/{maxLength}
          </span>
        )}
      </div>
    </FormField>
  )
}
