import { useNavigate } from 'react-router-dom'

const Error = () => {
  const navigate = useNavigate()

  const handleRefresh = () => {
    window.location.reload()
  }

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
            <div className="absolute inset-0 h-32 w-32 animate-ping rounded-full bg-red-500/20 opacity-75"></div>
          </div>
        </div>

        {/* Título */}
        <h1 className="mb-2 text-4xl font-bold text-white sm:text-5xl">
          ¡Ups! Algo salió mal
        </h1>
        <p className="mb-8 text-gray-400">
          Hemos encontrado un problema inesperado.
        </p>

        {/* Descripción */}
        <p className="mx-auto mb-8 max-w-lg text-base text-gray-400">
          No te preocupes, nuestro equipo ha sido notificado. Mientras tanto, puedes intentar recargar la página o volver al inicio.
        </p>

        {/* Botones */}
        <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
          <button
            onClick={handleRefresh}
            className="rounded-lg bg-amber-300/80 px-6 py-3 font-semibold text-black transition hover:bg-amber-300"
          >
            Recargar página
          </button>
          <button
            onClick={() => navigate('/')}
            className="rounded-lg border border-white/10 bg-white/5 px-6 py-3 font-semibold text-white transition hover:bg-white/10"
          >
            Volver al inicio
          </button>
        </div>

        {/* Información de ayuda */}
        <div className="mt-12">
          <p className="mb-4 text-sm text-gray-500">¿Necesitas ayuda?</p>
          <div className="flex flex-wrap justify-center gap-6 text-sm">
            <a 
              href="mailto:support@moments.com" 
              className="flex items-center gap-2 text-amber-300/80 transition hover:text-amber-300"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              Contactar soporte
            </a>
            <button 
              onClick={() => navigate('/about')} 
              className="flex items-center gap-2 text-amber-300/80 transition hover:text-amber-300"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Más información
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Error
