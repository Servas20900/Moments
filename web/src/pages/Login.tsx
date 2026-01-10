import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Button from '../components/Button'
import Card from '../components/Card'
import { loginUser } from '../api/mocks'

const Login = () => {
  const [form, setForm] = useState({ email: '', password: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const navigate = useNavigate()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => setForm(s => ({ ...s, [e.target.name]: e.target.value }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    if (!form.email) { setError('Completa correo'); return }
    setLoading(true)
    const res = await loginUser({ email: form.email, password: form.password })
    setLoading(false)
    if (res.ok) navigate('/profile')
    else setError('Credenciales inválidas')
  }

  const handleGoogle = () => alert('Google Sign-In (stub)')

  return (
    <div className="page">
      <header className="section">
        <p className="eyebrow">Iniciar sesión</p>
        <h1 className="display">Bienvenido de vuelta</h1>
        <p className="section__copy">Inicia sesión para ver y gestionar tus reservas.</p>
      </header>

      <div className="section__split">
        <Card title="Accede a tu cuenta">
          <form className="form" onSubmit={handleSubmit}>
            {error && <div className="form__error">{error}</div>}
            <label className="form__label">Email<input name="email" type="email" value={form.email} onChange={handleChange} /></label>
            <label className="form__label">Contraseña<input name="password" type="password" value={form.password} onChange={handleChange} /></label>
            <div className="stack mt-md">
              <Button variant="primary" type="submit" disabled={loading}>{loading ? 'Entrando...' : 'Iniciar sesión'}</Button>
              <Button variant="ghost" type="button" onClick={handleGoogle}>Continuar con Google</Button>
            </div>
          </form>
        </Card>

        <Card title="No tienes cuenta?">
          <p className="section__copy">Crea una cuenta rápida para reservar y recibir confirmaciones.</p>
          <div className="stack mt-md">
            <Button variant="ghost" onClick={() => navigate('/register')}>Crear cuenta</Button>
          </div>
        </Card>
      </div>
    </div>
  )
}

export default Login
