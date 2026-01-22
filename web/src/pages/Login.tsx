import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Button from '../components/Button'
import Card from '../components/Card'
import { loginUser } from '../api/api'

const Login = () => {
  const [form, setForm] = useState({ email: '', password: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [touched, setTouched] = useState({ email: false, password: false })
  const navigate = useNavigate()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => setForm(s => ({ ...s, [e.target.name]: e.target.value }))
  
  const handleBlur = (field: 'email' | 'password') => {
    setTouched(s => ({ ...s, [field]: true }))
  }

  const validateEmail = (email: string): { isValid: boolean; error?: string } => {
    if (!email) return { isValid: false, error: 'El email es requerido' }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) return { isValid: false, error: 'Formato de email inválido' }
    return { isValid: true }
  }

  const validatePassword = (password: string): { isValid: boolean; errors: string[] } => {
    const errors: string[] = []
    if (password.length < 6) errors.push('Mínimo 6 caracteres')
    if (!/[A-Za-z]/.test(password)) errors.push('Debe contener al menos una letra')
    if (!/\d/.test(password)) errors.push('Debe contener al menos un número')
    if (!/[@$!%*#?&._-]/.test(password)) errors.push('Debe contener al menos un símbolo (@$!%*#?&._-)')
    return { isValid: errors.length === 0, errors }
  }

  const emailValidation = validateEmail(form.email)
  const passwordValidation = validatePassword(form.password)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setTouched({ email: true, password: true })
    
    if (!emailValidation.isValid) {
      setError(emailValidation.error || 'Email inválido')
      return
    }
    
    if (!passwordValidation.isValid) {
      setError('La contraseña no cumple los requisitos')
      return
    }
    
    try {
      setLoading(true)
      await loginUser({ email: form.email, password: form.password })
      navigate('/profile')
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error al iniciar sesión'
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const handleGoogle = () => alert('Google Sign-In (stub)')

  return (
    <div className="px-4 py-12 sm:px-6 lg:px-8">
      <header className="mx-auto max-w-6xl mb-12">
        <p className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: '#c9a24d' }}>Iniciar sesión</p>
        <h1 className="text-4xl sm:text-5xl font-bold mb-3" style={{ color: '#f4f6fb' }}>Bienvenido de vuelta</h1>
        <p className="text-lg" style={{ color: '#b3b7c2' }}>Inicia sesión para ver y gestionar tus reservas.</p>
      </header>

      <div className="mx-auto max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card title="Accede a tu cuenta">
          <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
            {error && <div className="rounded-lg border px-4 py-3 text-sm" style={{ borderColor: 'rgba(244, 67, 54, 0.3)', background: 'rgba(244, 67, 54, 0.1)', color: '#ef5350' }}>{error}</div>}
            
            <label className="flex flex-col gap-2">
              <span className="text-sm font-medium" style={{ color: '#f4f6fb' }}>Email</span>
              <div className="relative">
                <input 
                  name="email" 
                  type="email" 
                  value={form.email} 
                  onChange={handleChange}
                  onBlur={() => handleBlur('email')}
                  className="w-full rounded-xl border px-4 py-2 transition" 
                  style={{ borderColor: 'rgba(201, 162, 77, 0.2)', background: 'rgba(255, 255, 255, 0.06)', color: '#f4f6fb' }} 
                />
                {touched.email && form.email && (
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-lg">
                    {emailValidation.isValid ? '✓' : '✗'}
                  </span>
                )}
              </div>
              {touched.email && !emailValidation.isValid && form.email && (
                <span className="text-xs text-red-400">{emailValidation.error}</span>
              )}
            </label>

            <label className="flex flex-col gap-2">
              <span className="text-sm font-medium" style={{ color: '#f4f6fb' }}>Contraseña</span>
              <div className="relative">
                <input 
                  name="password" 
                  type="password" 
                  value={form.password} 
                  onChange={handleChange}
                  onBlur={() => handleBlur('password')}
                  className="w-full rounded-xl border px-4 py-2 transition" 
                  style={{ borderColor: 'rgba(201, 162, 77, 0.2)', background: 'rgba(255, 255, 255, 0.06)', color: '#f4f6fb' }} 
                />
                {touched.password && form.password && (
                  <span className={`absolute right-3 top-1/2 -translate-y-1/2 text-lg ${passwordValidation.isValid ? 'text-green-400' : 'text-red-400'}`}>
                    {passwordValidation.isValid ? '✓' : '✗'}
                  </span>
                )}
              </div>
              {form.password && (
                <div className="space-y-1 text-xs">
                  <div className={form.password.length >= 6 ? 'text-green-400' : 'text-gray-500'}>
                    {form.password.length >= 6 ? '✓' : '○'} Mínimo 6 caracteres
                  </div>
                  <div className={/[A-Za-z]/.test(form.password) ? 'text-green-400' : 'text-gray-500'}>
                    {/[A-Za-z]/.test(form.password) ? '✓' : '○'} Al menos una letra
                  </div>
                  <div className={/\d/.test(form.password) ? 'text-green-400' : 'text-gray-500'}>
                    {/\d/.test(form.password) ? '✓' : '○'} Al menos un número
                  </div>
                  <div className={/[@$!%*#?&._-]/.test(form.password) ? 'text-green-400' : 'text-gray-500'}>
                    {/[@$!%*#?&._-]/.test(form.password) ? '✓' : '○'} Al menos un símbolo (@$!%*#?&._-)
                  </div>
                </div>
              )}
            </label>
            <div className="flex flex-col gap-3 mt-2">
              <Button variant="primary" type="submit" disabled={loading} className="w-full">{loading ? 'Entrando...' : 'Iniciar sesión'}</Button>
              <Button variant="ghost" type="button" onClick={handleGoogle} className="w-full">Continuar con Google</Button>
            </div>
          </form>
        </Card>

        <Card title="¿No tienes cuenta?">
          <p className="mb-6" style={{ color: '#b3b7c2' }}>Crea una cuenta rápida para reservar y recibir confirmaciones.</p>
          <div className="flex gap-3">
            <Button variant="ghost" onClick={() => navigate('/register')} className="w-full">Crear cuenta</Button>
          </div>
        </Card>
      </div>
    </div>
  )
}

export default Login
