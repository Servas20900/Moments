import { Component, ErrorInfo, ReactNode } from 'react'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = {
      hasError: false,
      error: null,
    }
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
    }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[ErrorBoundary] Error capturado:', error, errorInfo)
  }

  handleRefresh = () => {
    window.location.href = '/'
  }

  handleReload = () => {
    window.location.reload()
  }

  render() {
    if (this.state.hasError) {
      const isDev = import.meta.env.DEV
      
      return (
        <div className="flex min-h-screen items-center justify-center bg-[#0a0b0f] px-4">
          <div className="max-w-2xl text-center">
            {/* Icono de error */}
            <div className="mb-8 flex justify-center">
              <div className="relative">
                <div className="h-32 w-32 rounded-full bg-red-500/10 flex items-center justify-center">
                  <svg 
                    className="h-16 w-16 text-red-400" 
                    fill="none" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth={2} 
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" 
                    />
                  </svg>
                </div>
              </div>
            </div>

            {/* Título */}
            <h1 className="mb-4 text-4xl font-bold text-white sm:text-5xl">
              ¡Ups! Algo salió mal
            </h1>
            <p className="mb-8 text-lg text-gray-400">
              Ha ocurrido un error inesperado en la aplicación.
            </p>

            {/* Mensaje de error en desarrollo */}
            {this.state.error && isDev && (
              <div className="mx-auto mb-8 max-w-lg rounded-lg border border-red-500/30 bg-red-500/10 p-4 text-left">
                <p className="mb-2 text-xs font-semibold text-red-300">Error (solo visible en desarrollo):</p>
                <p className="text-xs text-red-400 font-mono">{this.state.error.message}</p>
              </div>
            )}

            {/* Botones */}
            <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
              <button
                onClick={this.handleRefresh}
                className="rounded-lg bg-amber-300/80 px-6 py-3 font-semibold text-black transition hover:bg-amber-300"
              >
                Volver al inicio
              </button>
              <button
                onClick={this.handleReload}
                className="rounded-lg border border-white/10 bg-white/5 px-6 py-3 font-semibold text-white transition hover:bg-white/10"
              >
                Recargar página
              </button>
            </div>

            {/* Información de ayuda */}
            <div className="mt-12">
              <p className="mb-4 text-sm text-gray-500">Si el problema persiste, contacta a soporte</p>
              <a 
                href="mailto:support@moments.com" 
                className="text-sm text-amber-300/80 transition hover:text-amber-300"
              >
                support@moments.com
              </a>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary
