import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Button from '../components/Button'
import Card from '../components/Card'
import { getCurrentUser, updateUser } from '../api/api'

const Profile = () => {
  const [user, setUser] = useState<any>(null)
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState({ name: '', email: '', phone: '' })

  useEffect(() => {
    let mounted = true
    getCurrentUser().then((u) => { if (!mounted) return; setUser(u); if (u) setForm({ name: u.name, email: u.email, phone: u.phone ?? '' }) })
    return () => { mounted = false }
  }, [])

  const navigate = useNavigate()

  if (!user) return (
    <div className="page">
      <header className="section">
        <p className="eyebrow">Cuenta</p>
        <h1 className="display">Perfil de usuario</h1>
      </header>
      <div className="section">
        <Card title="No has iniciado sesión">
          <p className="section__copy">Inicia sesión para ver y editar tu perfil. Si no tienes cuenta puedes crear una o usar Google.</p>
          <div className="stack mt-md">
            <Button variant="primary" onClick={() => navigate('/login')}>Iniciar sesión</Button>
            <Button variant="ghost" onClick={() => { /* stub for Google */ alert('Google Sign-In (stub)') }}>Continuar con Google</Button>
            <Button variant="ghost" onClick={() => navigate('/register')}>Crear cuenta</Button>
          </div>
        </Card>
      </div>
    </div>
  )

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => setForm(s => ({ ...s, [e.target.name]: e.target.value }))

  const save = async () => {
    await updateUser(user.id, form)
    const updated = await getCurrentUser()
    setUser(updated)
    setEditing(false)
  }

  return (
    <div className="page">
      <header className="section">
        <p className="eyebrow">Cuenta</p>
        <h1 className="display">Perfil de usuario</h1>
        <p className="section__copy">Edita tus datos de contacto y preferencias.</p>
      </header>

      <div className="section__split">
        <Card title={user.name} subtitle={user.email}>
          {!editing ? (
            <div>
              <p>Teléfono: {user.phone ?? '-'}</p>
              <div className="stack mt-md">
                <Button variant="primary" onClick={() => setEditing(true)}>Editar perfil</Button>
              </div>
            </div>
          ) : (
            <form className="form" onSubmit={(e) => { e.preventDefault(); save() }}>
              <label className="form__label">Nombre<input name="name" value={form.name} onChange={handleChange} /></label>
              <label className="form__label">Email<input name="email" value={form.email} onChange={handleChange} /></label>
              <label className="form__label">Teléfono<input name="phone" value={form.phone} onChange={handleChange} /></label>
              <div className="stack mt-md">
                <Button variant="primary" type="submit">Guardar</Button>
                <Button variant="ghost" onClick={() => setEditing(false)}>Cancelar</Button>
              </div>
            </form>
          )}
        </Card>

        <Card title="Reservas" subtitle="Historial">
          <p>Aquí aparecerán tus reservas (futuro).</p>
        </Card>
      </div>
    </div>
  )
}

export default Profile
