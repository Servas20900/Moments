import { useState, type ChangeEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import Button from '../components/Button'
import Card from '../components/Card'
import { requestPasswordReset } from '../api/api'

const ForgotPassword = () => {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setMessage(null)

    try {
      setLoading(true)
      const response = await requestPasswordReset(email)
      setMessage(response.message || 'Si el correo existe, te enviaremos instrucciones para restablecer tu contraseña.')
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'No se pudo procesar la solicitud'
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const inputClasses = 'w-full rounded-xl border border-[color:var(--color-input-border)] bg-[var(--color-input-bg)] px-4 py-2 text-[color:var(--color-text)] placeholder-[color:var(--color-input-placeholder)] transition focus:outline-none focus:ring-2 focus:ring-[#c9a24d] focus:border-[#c9a24d]/60'

  return (
    <div className="px-4 py-12 sm:px-6 lg:px-8">
      <header className="mx-auto max-w-3xl mb-8">
        <p className="text-xs font-semibold uppercase tracking-widest mb-2 text-[color:var(--color-accent)]">Recuperación</p>
        <h1 className="text-4xl sm:text-5xl font-bold mb-3 text-[color:var(--color-text)]">¿Olvidaste tu contraseña?</h1>
        <p className="text-lg text-[color:var(--color-muted)]">Ingresa tu correo y te enviaremos un enlace seguro para restablecerla.</p>
      </header>

      <div className="mx-auto max-w-3xl">
        <Card title="Solicitar enlace de recuperación">
          <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
            {error && <div className="rounded-lg border border-rose-400/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-400">{error}</div>}
            {message && <div className="rounded-lg border border-emerald-400/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300">{message}</div>}

            <label className="flex flex-col gap-2">
              <span className="text-sm font-medium text-[color:var(--color-text)]">Email</span>
              <input
                name="email"
                type="email"
                value={email}
                onChange={handleChange}
                required
                className={inputClasses}
                placeholder="tu-correo@ejemplo.com"
              />
            </label>

            <div className="flex flex-col sm:flex-row gap-3 mt-2">
              <Button variant="primary" type="submit" disabled={loading} className="w-full sm:w-auto">
                {loading ? 'Enviando...' : 'Enviar enlace'}
              </Button>
              <Button variant="ghost" type="button" onClick={() => navigate('/login')} className="w-full sm:w-auto">
                Volver a iniciar sesión
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  )
}

export default ForgotPassword
