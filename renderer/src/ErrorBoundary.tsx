import type { ErrorInfo, ReactNode } from 'react'
import { ErrorBoundary as ReactErrorBoundary, getErrorMessage, type FallbackProps } from 'react-error-boundary'
import { AlertTriangle, RefreshCw } from 'lucide-react'

interface Props {
  children: ReactNode
}

function ErrorFallback({ error, resetErrorBoundary }: FallbackProps) {
  const message = getErrorMessage(error) ?? 'Unknown render error'

  return (
    <div className="relative h-full flex items-center justify-center rounded-[14px] overflow-hidden select-none macos-panel text-foreground p-6">
      <div className="max-w-sm text-center">
        <div className="mx-auto mb-3 flex size-10 items-center justify-center rounded-full bg-secondary text-destructive">
          <AlertTriangle className="size-5" aria-hidden="true" />
        </div>
        <div className="text-sm font-semibold mb-1">Summon hit a rendering error</div>
        <div className="text-xs text-muted-foreground mb-4 break-words">{message}</div>
        <button
          type="button"
          onClick={resetErrorBoundary}
          className="inline-flex h-7 items-center gap-1.5 rounded-md bg-secondary px-2.5 text-xs font-medium text-secondary-foreground hover:bg-accent outline-none"
        >
          <RefreshCw className="size-3" aria-hidden="true" />
          Try again
        </button>
      </div>
    </div>
  )
}

function logRenderError(error: unknown, info: ErrorInfo): void {
  console.error('[summon] render crash', error, info.componentStack)
}

export function ErrorBoundary({ children }: Props): ReactNode {
  return (
    <ReactErrorBoundary FallbackComponent={ErrorFallback} onError={logRenderError}>
      {children}
    </ReactErrorBoundary>
  )
}
