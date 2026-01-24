import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Layout, PageHeader, Section } from '../components/Layout'
import { getCurrentUser, updateUser, changePassword } from '../api/api'

interface User {
  id: string
  nombre: string
  email: string
  telefono: string
  identificacion?: string
  estado: 'ACTIVO' | 'INACTIVO' | 'SUSPENDIDO'
  ultimoAcceso?: string
  creadoEn: string
  actualizadoEn: string
  distrito?: { id: number; nombre: string }
}

interface Message {
  type: 'success' | 'error'
  text: string
}

const Profile = () => {
  const [user, setUser] = useState<User | null>(null)
  const [editing, setEditing] = useState(false)
  const [showPasswordModal, setShowPasswordModal] = useState(false)
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<Message | null>(null)
  const navigate = useNavigate()

  const [form, setForm] = useState({
    nombre: '',
    email: '',
    telefono: '',
    identificacion: '',
  })

  const [passwordForm, setPasswordForm] = useState({
    actual: '',
    nueva: '',
    confirmar: '',
  })

  const [paymentForm, setPaymentForm] = useState({
    tipo: 'TARJETA',
    referencia: '',
  })

  useEffect(() => {
    let mounted = true
    const loadUser = async () => {
      try {
        const u = await getCurrentUser()
        if (mounted && u) {
          setUser(u)
          setForm({
            nombre: u.nombre || '',
            email: u.email || '',
            telefono: u.telefono || '',
            identificacion: u.identificacion || '',
          })
        }
      } catch (error) {
        console.error('Error loading user:', error)
        if (mounted) setMessage({ type: 'error', text: 'Error cargando perfil' })
      } finally {
        if (mounted) setLoading(false)
      }
    }
    loadUser()
    return () => { mounted = false }
  }, [])

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center py-12">
          <div className="text-gray-400">Cargando perfil...</div>
        </div>
      </Layout>
    )
  }

  if (!user) {
    return (
      <Layout>
        <PageHeader
          eyebrow="Cuenta"
          title="No has iniciado sesión"
          description="Inicia sesión para acceder a tu perfil, reservas y configuración."
        />
        <Section spacing="lg">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6 sm:p-8">
            <div className="flex flex-col gap-4">
              <button
                onClick={() => navigate('/login')}
                className="rounded-lg bg-amber-300/80 px-6 py-3 font-semibold text-black transition hover:bg-amber-300 sm:px-8"
              >
                Iniciar sesión
              </button>
              <button
                onClick={() => navigate('/register')}
                className="rounded-lg border border-white/10 bg-white/5 px-6 py-3 font-semibold text-white transition hover:bg-white/10"
              >
                Crear cuenta
              </button>
            </div>
          </div>
        </Section>
      </Layout>
    )
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm(s => ({ ...s, [e.target.name]: e.target.value }))
  }

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPasswordForm(s => ({ ...s, [e.target.name]: e.target.value }))
  }

  const handlePaymentChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setPaymentForm(s => ({ ...s, [e.target.name]: e.target.value }))
  }

  const save = async () => {
    try {
      setSaving(true)
      await updateUser(user.id, {
        name: form.nombre,
        phone: form.telefono,
      })
      const updated = await getCurrentUser()
      if (updated) {
        setUser(updated)
        setForm({
          nombre: updated.nombre || '',
          email: updated.email || '',
          telefono: updated.telefono || '',
          identificacion: updated.identificacion || '',
        })
        setEditing(false)
        setMessage({ type: 'success', text: 'Perfil actualizado correctamente' })
        setTimeout(() => setMessage(null), 3000)
      }
    } catch (error) {
      console.error('Error updating profile:', error)
      setMessage({ type: 'error', text: 'Error al actualizar perfil' })
    } finally {
      setSaving(false)
    }
  }

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

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validar contraseña nueva
    const validation = validatePassword(passwordForm.nueva)
    if (!validation.isValid) {
      setMessage({ type: 'error', text: validation.errors.join(', ') })
      return
    }
    
    if (passwordForm.nueva !== passwordForm.confirmar) {
      setMessage({ type: 'error', text: 'Las contraseñas no coinciden' })
      return
    }
    
    try {
      setSaving(true)
      await changePassword(passwordForm.actual, passwordForm.nueva, passwordForm.confirmar)
      setPasswordForm({ actual: '', nueva: '', confirmar: '' })
      setShowPasswordModal(false)
      setMessage({ type: 'success', text: 'Contraseña actualizada correctamente' })
      setTimeout(() => setMessage(null), 3000)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error al cambiar contraseña'
      setMessage({ type: 'error', text: errorMessage })
    } finally {
      setSaving(false)
    }
  }

  const handleAddPayment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!paymentForm.referencia.trim()) {
      setMessage({ type: 'error', text: 'Ingresa una referencia válida' })
      return
    }
    try {
      setSaving(true)
      // TODO: Implementar endpoint en backend para agregar método de pago
      await new Promise(resolve => setTimeout(resolve, 500))
      setPaymentForm({ tipo: 'TARJETA', referencia: '' })
      setShowPaymentModal(false)
      setMessage({ type: 'success', text: 'Método de pago agregado correctamente' })
      setTimeout(() => setMessage(null), 3000)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error al agregar método de pago'
      setMessage({ type: 'error', text: errorMessage })
    } finally {
      setSaving(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('authToken')
    navigate('/login')
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-CR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVO':
        return 'bg-green-500/20 text-green-300 border-green-500/30'
      case 'INACTIVO':
        return 'bg-gray-500/20 text-gray-300 border-gray-500/30'
      case 'SUSPENDIDO':
        return 'bg-red-500/20 text-red-300 border-red-500/30'
      default:
        return 'bg-gray-500/20 text-gray-300 border-gray-500/30'
    }
  }

  return (
    <Layout>
      <PageHeader
        eyebrow="Cuenta"
        title="Mi Perfil"
        description="Gestiona tu información personal, reservas y configuración de cuenta."
      />

      {/* Mensaje de Estado */}
      {message && (
        <div className={`mb-6 rounded-lg border px-4 py-3 text-sm font-medium ${
          message.type === 'success'
            ? 'border-green-500/30 bg-green-500/10 text-green-300'
            : 'border-red-500/30 bg-red-500/10 text-red-300'
        }`}>
          {message.text}
        </div>
      )}

      {/* Información Principal */}
      <Section spacing="lg">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {/* Avatar y Estado */}
          <div className="rounded-2xl border border-white/10 bg-gradient-to-b from-white/10 to-white/5 p-6 sm:col-span-2 lg:col-span-1">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-300/20">
              <span className="text-2xl font-bold text-amber-300">{user.nombre.charAt(0).toUpperCase()}</span>
            </div>
            <h3 className="text-lg font-semibold text-white">{user.nombre}</h3>
            <p className="mb-4 text-sm text-gray-400">{user.email}</p>
            <div className={`inline-block rounded-full px-3 py-1 text-xs font-semibold border ${getStatusColor(user.estado)}`}>
              {user.estado}
            </div>
          </div>

          {/* Estadísticas Rápidas */}
          <div className="rounded-2xl border border-white/10 bg-gradient-to-b from-white/10 to-white/5 p-6">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-amber-300/80">Miembro desde</p>
            <p className="text-sm text-white">{formatDate(user.creadoEn).split(',')[0]}</p>
            <p className="mt-4 text-xs text-gray-400">{new Date(user.creadoEn).toLocaleDateString('es-CR', { year: 'numeric', month: 'long' })}</p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-gradient-to-b from-white/10 to-white/5 p-6">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-amber-300/80">Último acceso</p>
            <p className="text-sm text-white">
              {user.ultimoAcceso ? formatDate(user.ultimoAcceso).split(',')[0] : 'Esta es tu primera sesión'}
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-gradient-to-b from-white/10 to-white/5 p-6">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-amber-300/80">Actualizado</p>
            <p className="text-sm text-white">{formatDate(user.actualizadoEn).split(',')[0]}</p>
          </div>
        </div>
      </Section>

      {/* Sección de Información Personal */}
      <Section spacing="lg" className="mt-8">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6 sm:p-8">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-semibold text-white">Información Personal</h2>
              <p className="text-sm text-gray-400">Actualiza tus datos de contacto</p>
            </div>
            {!editing && (
              <button
                onClick={() => setEditing(true)}
                className="rounded-lg bg-amber-300/80 px-4 py-2 font-semibold text-black transition hover:bg-amber-300 sm:px-6"
              >
                Editar
              </button>
            )}
          </div>

          {!editing ? (
            <div className="grid gap-6 sm:grid-cols-2">
              <div>
                <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-gray-400">Nombre completo</p>
                <p className="text-white">{user.nombre}</p>
              </div>
              <div>
                <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-gray-400">Email</p>
                <p className="text-white">{user.email}</p>
              </div>
              <div>
                <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-gray-400">Teléfono</p>
                <p className="text-white">{user.telefono || '-'}</p>
              </div>
              <div>
                <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-gray-400">Identificación</p>
                <p className="text-white">{user.identificacion || '-'}</p>
              </div>
              {user.distrito && (
                <div>
                  <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-gray-400">Distrito</p>
                  <p className="text-white">{user.distrito.nombre}</p>
                </div>
              )}
            </div>
          ) : (
            <form className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="flex flex-col gap-2">
                  <span className="text-sm font-medium text-gray-300">Nombre completo</span>
                  <input
                    name="nombre"
                    value={form.nombre}
                    onChange={handleChange}
                    className="rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-white placeholder-gray-500 transition focus:border-amber-300/50 focus:outline-none focus:ring-1 focus:ring-amber-300/20"
                    placeholder="Tu nombre"
                  />
                </label>
                <label className="flex flex-col gap-2">
                  <span className="text-sm font-medium text-gray-300">Email (no editable)</span>
                  <input
                    disabled
                    value={form.email}
                    className="rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-gray-500 placeholder-gray-500"
                  />
                </label>
                <label className="flex flex-col gap-2">
                  <span className="text-sm font-medium text-gray-300">Teléfono</span>
                  <input
                    name="telefono"
                    value={form.telefono}
                    onChange={handleChange}
                    className="rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-white placeholder-gray-500 transition focus:border-amber-300/50 focus:outline-none focus:ring-1 focus:ring-amber-300/20"
                    placeholder="+506 XXXX XXXX"
                  />
                </label>
                <label className="flex flex-col gap-2">
                  <span className="text-sm font-medium text-gray-300">Identificación</span>
                  <input
                    name="identificacion"
                    value={form.identificacion}
                    onChange={handleChange}
                    disabled
                    className="rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-gray-500 placeholder-gray-500"
                  />
                </label>
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  onClick={save}
                  disabled={saving}
                  className="rounded-lg bg-amber-300/80 px-6 py-2.5 font-semibold text-black transition hover:bg-amber-300 disabled:opacity-50"
                >
                  {saving ? 'Guardando...' : 'Guardar cambios'}
                </button>
                <button
                  onClick={() => setEditing(false)}
                  className="rounded-lg border border-white/10 bg-white/5 px-6 py-2.5 font-semibold text-white transition hover:bg-white/10"
                >
                  Cancelar
                </button>
              </div>
            </form>
          )}
        </div>
      </Section>

      {/* Acciones de Seguridad */}
      <Section spacing="lg" className="mt-8">
        <div className="grid gap-8 sm:grid-cols-2">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
            <h3 className="mb-2 text-lg font-semibold text-white">Contraseña</h3>
            <p className="mb-4 text-sm text-gray-400">Cambia tu contraseña periódicamente para mayor seguridad</p>
            <button
              onClick={() => setShowPasswordModal(true)}
              className="rounded-lg border border-white/10 bg-white/5 px-4 py-2 font-semibold text-white transition hover:bg-white/10"
            >
              Cambiar contraseña
            </button>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
            <h3 className="mb-2 text-lg font-semibold text-white">Métodos de Pago</h3>
            <p className="mb-4 text-sm text-gray-400">Gestiona tus métodos de pago para reservas</p>
            <button
              onClick={() => setShowPaymentModal(true)}
              className="rounded-lg border border-white/10 bg-white/5 px-4 py-2 font-semibold text-white transition hover:bg-white/10"
            >
              Agregar método
            </button>
          </div>
        </div>
      </Section>

      {/* Peligro - Cerrar Sesión */}
      <Section spacing="lg" className="mt-8">
        <div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-6 sm:p-8">
          <h2 className="mb-2 text-2xl font-semibold text-white">Sesión</h2>
          <p className="mb-4 text-sm text-gray-400">Cierra tu sesión en este dispositivo</p>
          <button
            onClick={handleLogout}
            className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-1.5 text-sm font-semibold text-red-300 transition hover:bg-red-500/20"
          >
            Cerrar sesión
          </button>
        </div>
      </Section>

      {/* Modal Cambiar Contraseña */}
      {showPasswordModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-white/10 bg-[#0f1016] p-6 sm:p-8">
            <h2 className="mb-6 text-2xl font-semibold text-white">Cambiar contraseña</h2>
            {message && message.type === 'error' && (
              <div className="mb-4 rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-300">
                {message.text}
              </div>
            )}
            {message && message.type === 'success' && (
              <div className="mb-4 rounded-lg border border-green-500/30 bg-green-500/10 p-3 text-sm text-green-300">
                {message.text}
              </div>
            )}
            <form onSubmit={handleChangePassword} className="space-y-4">
              <label className="flex flex-col gap-2">
                <span className="text-sm font-medium text-gray-300">Contraseña actual</span>
                <input
                  name="actual"
                  type="password"
                  value={passwordForm.actual}
                  onChange={handlePasswordChange}
                  disabled={saving}
                  required
                  className="rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-white placeholder-gray-500 transition focus:border-amber-300/50 focus:outline-none focus:ring-1 focus:ring-amber-300/20 disabled:opacity-50"
                  placeholder="••••••••"
                />
              </label>
              <label className="flex flex-col gap-2">
                <span className="text-sm font-medium text-gray-300">Nueva contraseña</span>
                <input
                  name="nueva"
                  type="password"
                  value={passwordForm.nueva}
                  onChange={handlePasswordChange}
                  disabled={saving}
                  required
                  className="rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-white placeholder-gray-500 transition focus:border-amber-300/50 focus:outline-none focus:ring-1 focus:ring-amber-300/20 disabled:opacity-50"
                  placeholder="••••••••"
                />
                {passwordForm.nueva && (
                  <div className="space-y-1 text-xs">
                    <div className={passwordForm.nueva.length >= 6 ? 'text-green-400' : 'text-gray-500'}>
                      {passwordForm.nueva.length >= 6 ? '✓' : '○'} Mínimo 6 caracteres
                    </div>
                    <div className={/[A-Za-z]/.test(passwordForm.nueva) ? 'text-green-400' : 'text-gray-500'}>
                      {/[A-Za-z]/.test(passwordForm.nueva) ? '✓' : '○'} Al menos una letra
                    </div>
                    <div className={/\d/.test(passwordForm.nueva) ? 'text-green-400' : 'text-gray-500'}>
                      {/\d/.test(passwordForm.nueva) ? '✓' : '○'} Al menos un número
                    </div>
                    <div className={/[@$!%*#?&._-]/.test(passwordForm.nueva) ? 'text-green-400' : 'text-gray-500'}>
                      {/[@$!%*#?&._-]/.test(passwordForm.nueva) ? '✓' : '○'} Al menos un símbolo (@$!%*#?&._-)
                    </div>
                  </div>
                )}
              </label>
              <label className="flex flex-col gap-2">
                <span className="text-sm font-medium text-gray-300">Confirmar contraseña</span>
                <input
                  name="confirmar"
                  type="password"
                  value={passwordForm.confirmar}
                  onChange={handlePasswordChange}
                  disabled={saving}
                  required
                  className="rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-white placeholder-gray-500 transition focus:border-amber-300/50 focus:outline-none focus:ring-1 focus:ring-amber-300/20 disabled:opacity-50"
                  placeholder="••••••••"
                />
                {passwordForm.confirmar && passwordForm.nueva && (
                  <div className={`text-xs ${passwordForm.confirmar === passwordForm.nueva ? 'text-green-400' : 'text-red-400'}`}>
                    {passwordForm.confirmar === passwordForm.nueva ? '✓ Las contraseñas coinciden' : '✗ Las contraseñas no coinciden'}
                  </div>
                )}
              </label>
              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 rounded-lg bg-amber-300/80 px-4 py-2.5 font-semibold text-black transition hover:bg-amber-300 disabled:opacity-50"
                >
                  {saving ? 'Actualizando...' : 'Actualizar'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowPasswordModal(false)
                    setMessage(null)
                  }}
                  disabled={saving}
                  className="flex-1 rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 font-semibold text-white transition hover:bg-white/10 disabled:opacity-50"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Agregar Método de Pago */}
      {showPaymentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-white/10 bg-[#0f1016] p-6 sm:p-8">
            <h2 className="mb-6 text-2xl font-semibold text-white">Agregar método de pago</h2>
            <form onSubmit={handleAddPayment} className="space-y-4">
              <label className="flex flex-col gap-2">
                <span className="text-sm font-medium text-gray-300">Tipo de pago</span>
                <select
                  name="tipo"
                  value={paymentForm.tipo}
                  onChange={handlePaymentChange}
                  className="rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-white transition focus:border-amber-300/50 focus:outline-none focus:ring-1 focus:ring-amber-300/20"
                >
                  <option value="TARJETA" className="bg-[#0f1016]">Tarjeta de crédito</option>
                  <option value="SINPE" className="bg-[#0f1016]">SINPE</option>
                  <option value="TRANSFERENCIA" className="bg-[#0f1016]">Transferencia bancaria</option>
                </select>
              </label>
              <label className="flex flex-col gap-2">
                <span className="text-sm font-medium text-gray-300">
                  {paymentForm.tipo === 'TARJETA' ? 'Últimos 4 dígitos' : 'Referencia'}
                </span>
                <input
                  name="referencia"
                  value={paymentForm.referencia}
                  onChange={handlePaymentChange}
                  className="rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-white placeholder-gray-500 transition focus:border-amber-300/50 focus:outline-none focus:ring-1 focus:ring-amber-300/20"
                  placeholder={paymentForm.tipo === 'TARJETA' ? 'XXXX' : 'Ingresa referencia'}
                  maxLength={paymentForm.tipo === 'TARJETA' ? 4 : undefined}
                />
              </label>
              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 rounded-lg bg-amber-300/80 px-4 py-2.5 font-semibold text-black transition hover:bg-amber-300 disabled:opacity-50"
                >
                  {saving ? 'Agregando...' : 'Agregar'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowPaymentModal(false)}
                  className="flex-1 rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 font-semibold text-white transition hover:bg-white/10"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Layout>
  )
}

export default Profile
