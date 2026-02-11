import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Button from '../components/Button'
import Card from '../components/Card'
import { createUser } from '../api/api'

const Register = () => {
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const navigate = useNavigate()

  const inputClasses = 'w-full rounded-xl border border-[color:var(--color-input-border)] bg-[var(--color-input-bg)] px-4 py-2 text-[color:var(--color-text)] placeholder-[color:var(--color-input-placeholder)] transition focus:outline-none focus:ring-2 focus:ring-[#c9a24d] focus:border-[#c9a24d]/60'

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => setForm(s => ({ ...s, [e.target.name]: e.target.value }))

  const validatePassword = (password: string): { isValid: boolean; errors: string[] } => {
    const errors: string[] = []
    if (password.length < 6) {
      errors.push('Mínimo 6 caracteres')
    }
    if (!/[A-Za-z]/.test(password)) {
      errors.push('Debe contener al menos una letra')
    }
    if (!/\d/.test(password)) {
      errors.push('Debe contener al menos un número')
    }
    if (!/[@$!%*#?&._-]/.test(password)) {
      errors.push('Debe contener al menos un símbolo (@$!%*#?&._-)')
    }
    return { isValid: errors.length === 0, errors }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    
    if (!form.name || !form.email) { 
      setError('Completa nombre y correo')
      return 
    }
    
    if (form.name.trim().length < 2) {
      setError('El nombre debe tener al menos 2 caracteres')
      return
    }
    
    const passwordValidation = validatePassword(form.password)
    if (!passwordValidation.isValid) {
      setError(passwordValidation.errors.join(', '))
      return
    }
    
    try {
      setLoading(true)
      await createUser({ 
        name: form.name, 
        email: form.email, 
        phone: form.phone, 
        password: form.password 
      })
      navigate('/profile')
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'No se pudo crear usuario'
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="px-4 py-12 sm:px-6 lg:px-8">
      <header className="mx-auto max-w-6xl mb-12">
        <p className="text-xs font-semibold uppercase tracking-widest mb-2 text-[color:var(--color-accent)]">Registro</p>
        <h1 className="text-4xl sm:text-5xl font-bold mb-3 text-[color:var(--color-text)]">Crea tu cuenta</h1>
        <p className="text-lg text-[color:var(--color-muted)]">Regístrate para acceder a tu historial, gestionar tus servicios y coordinar más rápidamente.</p>
      </header>

      <div className="mx-auto max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card title="Crear cuenta">
          <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
            {error && <div className="rounded-lg border border-rose-400/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-400">{error}</div>}
            <label className="flex flex-col gap-2">
              <span className="text-sm font-medium text-[color:var(--color-text)]">Nombre</span>
              <input name="name" value={form.name} onChange={handleChange} className={inputClasses} />
            </label>
            <label className="flex flex-col gap-2">
              <span className="text-sm font-medium text-[color:var(--color-text)]">Email</span>
              <input name="email" type="email" value={form.email} onChange={handleChange} className={inputClasses} />
            </label>
            <label className="flex flex-col gap-2">
              <span className="text-sm font-medium text-[color:var(--color-text)]">Teléfono</span>
              <input name="phone" value={form.phone} onChange={handleChange} className={inputClasses} />
            </label>
            <label className="flex flex-col gap-2">
              <span className="text-sm font-medium text-[color:var(--color-text)]">Contraseña</span>
              <input name="password" type="password" value={form.password} onChange={handleChange} required className={inputClasses} />
              {form.password && (
                <div className="space-y-1 text-xs">
                  <div className={form.password.length >= 6 ? 'text-green-400' : 'text-gray-500'}>
                    Mínimo 6 caracteres
                  </div>
                  <div className={/[A-Za-z]/.test(form.password) ? 'text-green-400' : 'text-gray-500'}>
                    Al menos una letra
                  </div>
                  <div className={/\d/.test(form.password) ? 'text-green-400' : 'text-gray-500'}>
                    Al menos un número
                  </div>
                  <div className={/[@$!%*#?&._-]/.test(form.password) ? 'text-green-400' : 'text-gray-500'}>
                    Al menos un símbolo (@$!%*#?&._-)
                  </div>
                </div>
              )}
            </label>
            <div className="mt-2">
              <Button variant="primary" type="submit" disabled={loading} className="w-full">{loading ? 'Creando...' : 'Crear cuenta'}</Button>
            </div>
          </form>
        </Card>

        <Card title="Beneficios">
          <ul className="flex flex-col gap-3">
            <li className="flex items-center gap-2 text-[color:var(--color-muted)]">• Historial de reservas</li>
            <li className="flex items-center gap-2 text-[color:var(--color-muted)]">• Estado del servicio</li>
            <li className="flex items-center gap-2 text-[color:var(--color-muted)]">• Coordinación más rápida</li>
          </ul>
        </Card>
      </div>
    </div>
  )
}

export default Register
