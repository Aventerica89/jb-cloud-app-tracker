/**
 * LoadingButton Component
 *
 * Button with built-in loading, success, and error states
 * Provides better UX for async actions with visual feedback
 *
 * Features:
 * - Loading spinner
 * - Success/error state indicators
 * - Automatic state management (optional)
 * - Accessible announcements
 */

import * as React from 'react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { Loader2, CheckCircle2, XCircle } from 'lucide-react'

type ButtonState = 'idle' | 'loading' | 'success' | 'error'

interface LoadingButtonProps extends React.ComponentPropsWithoutRef<typeof Button> {
  /**
   * Current state of the button
   */
  state?: ButtonState

  /**
   * Loading text to display when in loading state
   */
  loadingText?: string

  /**
   * Success text to display when in success state
   */
  successText?: string

  /**
   * Error text to display when in error state
   */
  errorText?: string

  /**
   * Duration to show success/error state before reverting to idle (ms)
   * Set to 0 to disable auto-revert
   */
  resetDelay?: number

  /**
   * Callback when state reverts to idle
   */
  onStateReset?: () => void
}

export const LoadingButton = React.forwardRef<
  HTMLButtonElement,
  LoadingButtonProps
>(
  (
    {
      children,
      state = 'idle',
      loadingText,
      successText,
      errorText,
      resetDelay = 2000,
      onStateReset,
      disabled,
      className,
      ...props
    },
    ref
  ) => {
    const [internalState, setInternalState] = React.useState<ButtonState>(state)
    const timeoutRef = React.useRef<NodeJS.Timeout | undefined>(undefined)

    React.useEffect(() => {
      setInternalState(state)
    }, [state])

    React.useEffect(() => {
      // Clear any existing timeout before setting a new one
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
        timeoutRef.current = undefined
      }

      if (
        resetDelay > 0 &&
        (internalState === 'success' || internalState === 'error')
      ) {
        timeoutRef.current = setTimeout(() => {
          setInternalState('idle')
          onStateReset?.()
          timeoutRef.current = undefined
        }, resetDelay)

        return () => {
          if (timeoutRef.current) {
            clearTimeout(timeoutRef.current)
            timeoutRef.current = undefined
          }
        }
      }
    }, [internalState, resetDelay, onStateReset])

    const isLoading = internalState === 'loading'
    const isSuccess = internalState === 'success'
    const isError = internalState === 'error'
    const isDisabled = disabled || isLoading

    const getContent = () => {
      switch (internalState) {
        case 'loading':
          return (
            <>
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
              {loadingText || children}
            </>
          )
        case 'success':
          return (
            <>
              <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
              {successText || children}
            </>
          )
        case 'error':
          return (
            <>
              <XCircle className="h-4 w-4" aria-hidden="true" />
              {errorText || children}
            </>
          )
        default:
          return children
      }
    }

    const getAriaLabel = () => {
      switch (internalState) {
        case 'loading':
          return loadingText || 'Loading'
        case 'success':
          return successText || 'Success'
        case 'error':
          return errorText || 'Error'
        default:
          return undefined
      }
    }

    return (
      <Button
        ref={ref}
        disabled={isDisabled}
        className={cn(
          'transition-all duration-200',
          isSuccess && 'bg-green-600 hover:bg-green-600',
          isError && 'bg-destructive hover:bg-destructive',
          className
        )}
        aria-busy={isLoading}
        aria-live="polite"
        aria-label={getAriaLabel()}
        {...props}
      >
        {getContent()}
      </Button>
    )
  }
)

LoadingButton.displayName = 'LoadingButton'

/**
 * Hook for managing LoadingButton state with async actions
 */
interface UseLoadingButtonOptions {
  /**
   * Reset delay in milliseconds
   */
  resetDelay?: number

  /**
   * Callback when action succeeds
   */
  onSuccess?: () => void

  /**
   * Callback when action fails
   */
  onError?: (error: Error) => void
}

export function useLoadingButton({
  resetDelay = 2000,
  onSuccess,
  onError,
}: UseLoadingButtonOptions = {}) {
  const [state, setState] = React.useState<ButtonState>('idle')

  const execute = React.useCallback(
    async (action: () => Promise<void>) => {
      setState('loading')

      try {
        await action()
        setState('success')
        onSuccess?.()

        if (resetDelay > 0) {
          setTimeout(() => setState('idle'), resetDelay)
        }
      } catch (error) {
        setState('error')
        onError?.(error as Error)

        if (resetDelay > 0) {
          setTimeout(() => setState('idle'), resetDelay)
        }
      }
    },
    [resetDelay, onSuccess, onError]
  )

  const reset = React.useCallback(() => {
    setState('idle')
  }, [])

  return {
    state,
    execute,
    reset,
    isLoading: state === 'loading',
    isSuccess: state === 'success',
    isError: state === 'error',
  }
}
