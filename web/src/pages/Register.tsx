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
        <p className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: '#c9a24d' }}>Registro</p>
        <h1 className="text-4xl sm:text-5xl font-bold mb-3" style={{ color: '#f4f6fb' }}>Crea tu cuenta</h1>
        <p className="text-lg" style={{ color: '#b3b7c2' }}>Regístrate para completar reservas y ver tu historial.</p>
      </header>

      <div className="mx-auto max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card title="Crear cuenta">
          <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
            {error && <div className="rounded-lg border px-4 py-3 text-sm" style={{ borderColor: 'rgba(244, 67, 54, 0.3)', background: 'rgba(244, 67, 54, 0.1)', color: '#ef5350' }}>{error}</div>}
            <label className="flex flex-col gap-2">
              <span className="text-sm font-medium" style={{ color: '#f4f6fb' }}>Nombre</span>
              <input name="name" value={form.name} onChange={handleChange} className="rounded-xl border px-4 py-2 transition" style={{ borderColor: 'rgba(201, 162, 77, 0.2)', background: 'rgba(255, 255, 255, 0.06)', color: '#f4f6fb' }} />
            </label>
            <label className="flex flex-col gap-2">
              <span className="text-sm font-medium" style={{ color: '#f4f6fb' }}>Email</span>
              <input name="email" type="email" value={form.email} onChange={handleChange} className="rounded-xl border px-4 py-2 transition" style={{ borderColor: 'rgba(201, 162, 77, 0.2)', background: 'rgba(255, 255, 255, 0.06)', color: '#f4f6fb' }} />
            </label>
            <label className="flex flex-col gap-2">
              <span className="text-sm font-medium" style={{ color: '#f4f6fb' }}>Teléfono</span>
              <input name="phone" value={form.phone} onChange={handleChange} className="rounded-xl border px-4 py-2 transition" style={{ borderColor: 'rgba(201, 162, 77, 0.2)', background: 'rgba(255, 255, 255, 0.06)', color: '#f4f6fb' }} />
            </label>
            <label className="flex flex-col gap-2">
              <span className="text-sm font-medium" style={{ color: '#f4f6fb' }}>Contraseña</span>
              <input name="password" type="password" value={form.password} onChange={handleChange} required className="rounded-xl border px-4 py-2 transition" style={{ borderColor: 'rgba(201, 162, 77, 0.2)', background: 'rgba(255, 255, 255, 0.06)', color: '#f4f6fb' }} />
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
            <div className="mt-2">
              <Button variant="primary" type="submit" disabled={loading} className="w-full">{loading ? 'Creando...' : 'Crear cuenta'}</Button>
            </div>
          </form>
        </Card>

        <Card title="Beneficios">
          <ul className="flex flex-col gap-3">
            <li className="flex items-center gap-2" style={{ color: '#b3b7c2' }}><span style={{ color: '#c9a24d' }}>✓</span> Guardar reservas</li>
            <li className="flex items-center gap-2" style={{ color: '#b3b7c2' }}><span style={{ color: '#c9a24d' }}>✓</span> Recibir confirmaciones</li>
            <li className="flex items-center gap-2" style={{ color: '#b3b7c2' }}><span style={{ color: '#c9a24d' }}>✓</span> Historial y perfiles</li>
          </ul>
        </Card>
      </div>
    </div>
  )
}

export default Register
