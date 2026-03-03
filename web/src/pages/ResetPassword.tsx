import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import Button from '../components/Button'
import Card from '../components/Card'
import { resetPasswordWithToken } from '../api/api'

const ResetPassword = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const token = useMemo(() => (searchParams.get('token') || '').trim(), [searchParams])

  const [nuevaPassword, setNuevaPassword] = useState('')
  const [confirmarPassword, setConfirmarPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const [redirectSeconds, setRedirectSeconds] = useState<number | null>(null)
  const [tokenInvalidOrExpired, setTokenInvalidOrExpired] = useState(false)

  useEffect(() => {
    if (!message) {
      setRedirectSeconds(null)
      return
    }

    setRedirectSeconds(4)

    const tick = setInterval(() => {
      setRedirectSeconds((current) => {
        if (current == null) return null
        if (current <= 1) {
          clearInterval(tick)
          navigate('/login')
          return 0
        }
        return current - 1
      })
    }, 1000)

    return () => clearInterval(tick)
  }, [message, navigate])

  const validatePassword = (password: string): { isValid: boolean; errors: string[] } => {
    const errors: string[] = []
    if (password.length < 6) errors.push('Mínimo 6 caracteres')
    if (!/[A-Za-z]/.test(password)) errors.push('Debe contener al menos una letra')
    if (!/\d/.test(password)) errors.push('Debe contener al menos un número')
    if (!/[@$!%*#?&._-]/.test(password)) errors.push('Debe contener al menos un símbolo (@$!%*#?&._-)')
    return { isValid: errors.length === 0, errors }
  }

  const passwordValidation = validatePassword(nuevaPassword)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setMessage(null)

    if (!token) {
      setError('Token de recuperación inválido o ausente')
      setTokenInvalidOrExpired(true)
      return
    }

    if (!passwordValidation.isValid) {
      setError('La contraseña no cumple los requisitos')
      return
    }

    if (nuevaPassword !== confirmarPassword) {
      setError('Las contraseñas no coinciden')
      return
    }

    try {
      setLoading(true)
      const response = await resetPasswordWithToken({
        token,
        nuevaPassword,
        confirmarPassword,
      })
      setMessage(response.message || 'Contraseña restablecida correctamente')
      setTokenInvalidOrExpired(false)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'No se pudo restablecer la contraseña'
      setError(errorMessage)
      if (/token|expirad|inválid|invalido/i.test(errorMessage)) {
        setTokenInvalidOrExpired(true)
      }
    } finally {
      setLoading(false)
    }
  }

  const inputClasses = 'w-full rounded-xl border border-[color:var(--color-input-border)] bg-[var(--color-input-bg)] px-4 py-2 text-[color:var(--color-text)] placeholder-[color:var(--color-input-placeholder)] transition focus:outline-none focus:ring-2 focus:ring-[#c9a24d] focus:border-[#c9a24d]/60'

  return (
    <div className="px-4 py-12 sm:px-6 lg:px-8">
      <header className="mx-auto max-w-3xl mb-8">
        <p className="text-xs font-semibold uppercase tracking-widest mb-2 text-[color:var(--color-accent)]">Seguridad</p>
        <h1 className="text-4xl sm:text-5xl font-bold mb-3 text-[color:var(--color-text)]">Restablecer contraseña</h1>
        <p className="text-lg text-[color:var(--color-muted)]">Define una nueva contraseña para tu cuenta.</p>
      </header>

      <div className="mx-auto max-w-3xl">
        <Card title="Nueva contraseña">
          <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
            {error && <div className="rounded-lg border border-rose-400/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-400">{error}</div>}
            {message && (
              <div className="rounded-lg border border-emerald-400/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300">
                <p>{message}</p>
                {redirectSeconds !== null && redirectSeconds > 0 && (
                  <p className="mt-1 text-xs text-emerald-200">Redirigiendo a inicio de sesión en {redirectSeconds}s...</p>
                )}
              </div>
            )}

            {tokenInvalidOrExpired && !message && (
              <div className="rounded-lg border border-amber-400/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-200">
                <p className="font-semibold">Enlace inválido o expirado</p>
                <p className="mt-1">Solicita un nuevo enlace de recuperación para continuar.</p>
                <div className="mt-3 flex flex-col sm:flex-row gap-2">
                  <Button variant="primary" type="button" onClick={() => navigate('/forgot-password')} className="w-full sm:w-auto">
                    Solicitar nuevo enlace
                  </Button>
                  <Button variant="ghost" type="button" onClick={() => navigate('/login')} className="w-full sm:w-auto">
                    Volver a login
                  </Button>
                </div>
              </div>
            )}

            <label className="flex flex-col gap-2">
              <span className="text-sm font-medium text-[color:var(--color-text)]">Nueva contraseña</span>
              <input
                type="password"
                value={nuevaPassword}
                onChange={(e) => setNuevaPassword(e.target.value)}
                required
                className={inputClasses}
              />
            </label>

            <label className="flex flex-col gap-2">
              <span className="text-sm font-medium text-[color:var(--color-text)]">Confirmar contraseña</span>
              <input
                type="password"
                value={confirmarPassword}
                onChange={(e) => setConfirmarPassword(e.target.value)}
                required
                className={inputClasses}
              />
            </label>

            {nuevaPassword && (
              <div className="space-y-1 text-xs">
                <div className={nuevaPassword.length >= 6 ? 'text-green-400' : 'text-[color:var(--color-muted)]'}>Mínimo 6 caracteres</div>
                <div className={/[A-Za-z]/.test(nuevaPassword) ? 'text-green-400' : 'text-[color:var(--color-muted)]'}>Al menos una letra</div>
                <div className={/\d/.test(nuevaPassword) ? 'text-green-400' : 'text-[color:var(--color-muted)]'}>Al menos un número</div>
                <div className={/[@$!%*#?&._-]/.test(nuevaPassword) ? 'text-green-400' : 'text-[color:var(--color-muted)]'}>Al menos un símbolo (@$!%*#?&._-)</div>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3 mt-2">
              <Button variant="primary" type="submit" disabled={loading || !token || tokenInvalidOrExpired} className="w-full sm:w-auto">
                {loading ? 'Actualizando...' : 'Actualizar contraseña'}
              </Button>
              <Button variant="ghost" type="button" onClick={() => navigate('/login')} className="w-full sm:w-auto">
                Ir a iniciar sesión
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  )
}

export default ResetPassword
