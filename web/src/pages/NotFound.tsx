import { useNavigate } from 'react-router-dom'

const NotFound = () => {
  const navigate = useNavigate()

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0a0b0f] px-4">
      <div className="max-w-2xl text-center">
        {/* Número 404 Grande */}
        <div className="mb-8">
          <h1 className="text-[140px] font-bold leading-none tracking-tight sm:text-[200px]" 
              style={{ 
                background: 'linear-gradient(135deg, #f4f6fb 0%, #c9a24d 50%, #8b7332 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text'
              }}>
            404
          </h1>
        </div>

        {/* Título */}
        <h2 className="mb-2 text-2xl font-semibold text-white">
          Página no encontrada
        </h2>
        <p className="mb-8 text-gray-400">
          Lo sentimos, la página que buscas no existe o ha sido movida.
        </p>

        {/* Descripción */}
        <p className="mx-auto mb-8 max-w-lg text-base text-gray-400">
          Parece que te has desviado del camino. No te preocupes, te ayudaremos a regresar.
        </p>

        {/* Botones */}
        <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
          <button
            onClick={() => navigate('/')}
            className="rounded-lg bg-amber-300/80 px-6 py-3 font-semibold text-black transition hover:bg-amber-300"
          >
            Volver al inicio
          </button>
          <button
            onClick={() => navigate(-1)}
            className="rounded-lg border border-white/10 bg-white/5 px-6 py-3 font-semibold text-white transition hover:bg-white/10"
          >
            Página anterior
          </button>
        </div>

        {/* Links útiles */}
        <div className="mt-12">
          <p className="mb-4 text-sm text-gray-500">Enlaces útiles:</p>
          <div className="flex flex-wrap justify-center gap-4 text-sm">
            <button 
              onClick={() => navigate('/paquetes')} 
              className="text-amber-300/80 transition hover:text-amber-300"
            >
              Paquetes
            </button>
            <span className="text-gray-600">•</span>
            <button 
              onClick={() => navigate('/vehiculos')} 
              className="text-amber-300/80 transition hover:text-amber-300"
            >
              Vehículos
            </button>
            <span className="text-gray-600">•</span>
            <button 
              onClick={() => navigate('/calendario')} 
              className="text-amber-300/80 transition hover:text-amber-300"
            >
              Calendario
            </button>
            <span className="text-gray-600">•</span>
            <button 
              onClick={() => navigate('/about')} 
              className="text-amber-300/80 transition hover:text-amber-300"
            >
              Sobre nosotros
            </button>
          </div>
        </div>

        {/* Decoración */}
        <div className="mt-16 flex justify-center gap-2">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="h-1.5 w-1.5 rounded-full bg-amber-300/20"
              style={{
                animation: `pulse 2s ease-in-out ${i * 0.2}s infinite`,
              }}
            />
          ))}
        </div>
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% {
            opacity: 0.2;
            transform: scale(1);
          }
          50% {
            opacity: 1;
            transform: scale(1.2);
          }
        }
      `}</style>
    </div>
  )
}

export default NotFound
