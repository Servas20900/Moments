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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    if (!form.name || !form.email) { setError('Completa nombre y correo'); return }
    setLoading(true)
    const res = await createUser({ name: form.name, email: form.email, phone: form.phone, password: form.password })
    setLoading(false)
    if (res.ok) navigate('/profile')
    else setError('No se pudo crear usuario')
  }

  return (
    <div className="page">
      <header className="section">
        <p className="eyebrow">Registro</p>
        <h1 className="display">Crea tu cuenta</h1>
        <p className="section__copy">Regístrate para completar reservas y ver tu historial.</p>
      </header>

      <div className="section__split">
        <Card title="Crear cuenta">
          <form className="form" onSubmit={handleSubmit}>
            {error && <div className="form__error">{error}</div>}
            <label className="form__label">Nombre<input name="name" value={form.name} onChange={handleChange} /></label>
            <label className="form__label">Email<input name="email" type="email" value={form.email} onChange={handleChange} /></label>
            <label className="form__label">Teléfono<input name="phone" value={form.phone} onChange={handleChange} /></label>
            <label className="form__label">Contraseña<input name="password" type="password" value={form.password} onChange={handleChange} /></label>
            <div className="stack mt-md">
              <Button variant="primary" type="submit" disabled={loading}>{loading ? 'Creando...' : 'Crear cuenta'}</Button>
            </div>
          </form>
        </Card>

        <Card title="Beneficios">
          <ul className="list">
            <li>Guardar reservas</li>
            <li>Recibir confirmaciones</li>
            <li>Historial y perfiles</li>
          </ul>
        </Card>
      </div>
    </div>
  )
}

export default Register
