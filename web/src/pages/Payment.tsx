import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Layout, Section } from '../components/Layout'
import Button from '../components/Button'
import SafeImage from '../components/SafeImage'
import Modal from '../components/Modal'
import { useReservation } from '../contexts/ReservationContext'
import { useAlert } from '../contexts/AlertContext'
import { getCurrentUser, isAuthenticated } from '../utils/auth'
import { submitReservation } from '../api/api'

const formatMoney = (value: number) => `$${value.toFixed(2)}`

const SINPE_PHONE = '8888-8888'  // Cambiar por el número real

const Payment = () => {
  const { cart, clearReservation } = useReservation()
  const navigate = useNavigate()
  const { showAlert } = useAlert()
  const [showSinpeModal, setShowSinpeModal] = useState(false)
  const [reservationId, setReservationId] = useState<string | null>(null)

  const [contact, setContact] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    identificationType: 'Cédula',
    identificationNumber: '',
    paymentMethod: 'SINPE',
  })
  const [acceptedTerms, setAcceptedTerms] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!cart) return
    if (isAuthenticated()) {
      const user = getCurrentUser()
      if (user) {
        setContact((prev) => ({
          ...prev,
          name: user.nombre || prev.name,
          email: user.email || prev.email,
          phone: user.telefono || prev.phone,
        }))
      }
    }
  }, [cart])

  const extrasTotal = useMemo(() => cart?.extras.reduce((acc, e) => acc + e.price, 0) ?? 0, [cart])

  if (!cart) {
    return (
      <Layout>
        <header className="mb-12 space-y-4 lg:mb-16">
          <span className="text-xs font-semibold uppercase tracking-[0.3em] text-amber-300/80">
            Pago
          </span>
          <h1 className="text-3xl font-semibold text-white sm:text-4xl md:text-5xl">
            No hay reserva en el carrito
          </h1>
          <p className="max-w-3xl text-sm text-gray-300 sm:text-base">
            Configura una reserva antes de proceder al pago.
          </p>
        </header>
        <Section spacing="md">
          <Button variant="primary" onClick={() => navigate('/paquetes')}>Ver paquetes</Button>
        </Section>
      </Layout>
    )
  }

  const handleConfirm = async () => {
    if (!contact.name.trim() || !contact.email.trim()) {
      showAlert('Datos incompletos', 'Completa nombre y email para continuar', 'warning')
      return
    }
    if (!contact.phone.trim()) {
      showAlert('Teléfono requerido', 'El número de teléfono es requerido', 'warning')
      return
    }
    if (contact.phone.replace(/[^\d]/g, '').length < 8) {
      showAlert('Teléfono inválido', 'El teléfono debe tener mínimo 8 dígitos', 'warning')
      return
    }
    if (!contact.address.trim()) {
      showAlert('Dirección requerida', 'La dirección física es requerida', 'warning')
      return
    }
    if (!contact.identificationNumber.trim()) {
      showAlert('Identificación requerida', 'El número de identificación es requerido', 'warning')
      return
    }
    if (contact.identificationNumber.replace(/[^\d]/g, '').length < 9) {
      showAlert('Identificación inválida', 'La identificación debe tener mínimo 9 dígitos', 'warning')
      return
    }
    if (!acceptedTerms) {
      showAlert('Términos y condiciones', 'Debes aceptar los términos y condiciones', 'warning')
      return
    }
    setLoading(true)
    try {
      // Crear reserva en backend antes de pasar al proveedor de pagos
      const fecha = cart.date
      const horaInicio = `${fecha}T${cart.time}:00`
      // Por ahora, estimar 2 horas de duración
      const [hh, mm] = cart.time.split(':').map(Number)
      const endDate = new Date(`${fecha}T${cart.time}:00`)
      endDate.setHours(hh + 2, mm || 0, 0, 0)
      const isoEnd = endDate.toISOString()
      const horaFin = `${isoEnd.slice(0, 10)}T${isoEnd.slice(11, 19)}`

      const payload = {
        nombre: contact.name,
        email: contact.email,
        telefono: contact.phone,
        direccion: contact.address || '',
        tipoIdentificacion: contact.identificationType || 'Cédula',
        numeroIdentificacion: contact.identificationNumber || '',
        tipoEvento: cart.package.category || 'Evento',
        fechaEvento: `${fecha}T00:00:00.000Z`,  // Convertir a ISO format
        horaInicio,
        horaFin,
        origen: cart.origin,
        destino: cart.destination,
        numeroPersonas: cart.people,
        paqueteId: cart.package.id,
        vehiculoId: cart.vehicle?.id || null,  // ← Convertir undefined a null
        tipoPago: contact.paymentMethod,
        precioBase: cart.package.price,
        precioTotal: cart.total,
        anticipo: cart.deposit,
        restante: Math.max(0, cart.total - cart.deposit),
        extras: cart.extras.map((e) => ({ extraId: e.id, precioUnitario: e.price, cantidad: 1 })),
        incluidos: cart.incluidos?.map((i) => ({ incluidoId: i.id })) || [],
        notasInternas: cart.notes || undefined,
      }

      const res = await submitReservation(payload)
      if (res?.ok) {
        setReservationId(res.id)
        
        if (contact.paymentMethod === 'SINPE') {
          // Mostrar modal de SINPE con instrucciones
          setShowSinpeModal(true)
        } else {
          // Redirigir a CompraClick (futuro)
          showAlert('Reserva creada', `Reserva creada (#${res.id}). Redirección a CompraClick pendiente de implementar.`, 'success')
          // TODO: Integrar con CompraClick
          // window.location.href = compraClickUrl
        }
      } else {
        showAlert('Error', 'No se pudo crear la reserva. Intenta de nuevo.', 'error')
      }
    } catch (error) {
      console.error('Error al crear reserva:', error)
      showAlert('Error', 'Error al procesar la reserva. Por favor intenta nuevamente.', 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Layout>
      <header className="mb-12 space-y-4 lg:mb-16">
        <span className="text-xs font-semibold uppercase tracking-[0.3em] text-amber-300/80">
          Pago
        </span>
        <h1 className="text-3xl font-semibold text-white sm:text-4xl md:text-5xl">
          <Link to="/" className="transition hover:text-amber-200">
            Confirmación previa al pago
          </Link>
        </h1>
        <p className="max-w-3xl text-sm text-gray-300 sm:text-base">
          Una vez confirmado el pago, recibirás un correo y/o mensaje de WhatsApp con el resumen oficial de tu reserva.
        </p>
      </header>

      <Section spacing="lg">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
              <div className="flex items-start gap-4">
                <div className="w-32 h-20 rounded-lg overflow-hidden border border-white/10">
                  <SafeImage src={cart.package.imageUrl} alt={cart.package.name} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1">
                  <p className="text-xs font-semibold uppercase tracking-widest text-amber-300 mb-1">{cart.package.category}</p>
                  <h2 className="text-xl font-bold text-white mb-1">{cart.package.name}</h2>
                  <p className="text-sm text-gray-300">Hasta {cart.package.maxPeople} personas</p>
                </div>
                <Button variant="ghost" onClick={() => navigate('/carrito')}>Volver al carrito</Button>
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-400">Fecha</p>
                  <p className="text-white font-semibold">{cart.date}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-400">Horario</p>
                  <p className="text-white font-semibold">{cart.time}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-400">Origen</p>
                  <p className="text-white font-semibold">{cart.origin}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-400">Destino</p>
                  <p className="text-white font-semibold">{cart.destination}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-400">Personas</p>
                  <p className="text-white font-semibold">{cart.people}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-400">Vehículo</p>
                  <p className="text-white font-semibold">{cart.vehicle ? `${cart.vehicle.name} · ${cart.vehicle.seats} asientos` : 'Asignaremos el mejor disponible'}</p>
                </div>
              </div>

              {cart.notes && (
                <div className="border-t border-white/10 pt-4">
                  <p className="text-sm text-gray-200 mb-1">Notas</p>
                  <p className="text-sm text-gray-400 whitespace-pre-line">{cart.notes}</p>
                </div>
              )}
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 p-6 space-y-4">
              <p className="text-white font-semibold">Datos de contacto</p>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <label className="flex flex-col gap-2">
                  <span className="text-sm text-gray-200">Nombre completo</span>
                  <input
                    type="text"
                    value={contact.name}
                    onChange={(e) => setContact((s) => ({ ...s, name: e.target.value }))}
                    className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-white focus:border-amber-300/60 focus:outline-none"
                    placeholder="Tu nombre"
                    required
                  />
                </label>
                <label className="flex flex-col gap-2">
                  <span className="text-sm text-gray-200">Email</span>
                  <input
                    type="email"
                    value={contact.email}
                    onChange={(e) => setContact((s) => ({ ...s, email: e.target.value }))}
                    className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-white focus:border-amber-300/60 focus:outline-none"
                    placeholder="tu@email.com"
                    required
                  />
                </label>
                <label className="flex flex-col gap-2">
                  <span className="text-sm text-gray-200">Teléfono</span>
                  <input
                    type="tel"
                    value={contact.phone}
                    onChange={(e) => setContact((s) => ({ ...s, phone: e.target.value }))}
                    className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-white focus:border-amber-300/60 focus:outline-none"
                    placeholder="Tu teléfono (mínimo 8 dígitos)"
                    required
                  />
                  {contact.phone && contact.phone.replace(/[^\d]/g, '').length < 8 && (
                    <span className="text-xs text-red-400">Mínimo 8 dígitos requeridos</span>
                  )}
                </label>
              </div>

              <label className="flex flex-col gap-2">
                <span className="text-sm text-gray-200">Dirección física</span>
                <input
                  type="text"
                  value={contact.address}
                  onChange={(e) => setContact((s) => ({ ...s, address: e.target.value }))}
                  className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-white focus:border-amber-300/60 focus:outline-none"
                  placeholder="Calle, ciudad, código postal"
                  required
                />
              </label>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <label className="flex flex-col gap-2">
                  <span className="text-sm text-gray-200">Tipo de identificación</span>
                  <select
                    value={contact.identificationType}
                    onChange={(e) => setContact((s) => ({ ...s, identificationType: e.target.value }))}
                    className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-white focus:border-amber-300/60 focus:outline-none"
                  >
                    <option value="Cédula">Cédula</option>
                    <option value="Pasaporte">Pasaporte</option>
                  </select>
                </label>
                <label className="flex flex-col gap-2">
                  <span className="text-sm text-gray-200">Número de identificación</span>
                  <input
                    type="text"
                    value={contact.identificationNumber}
                    onChange={(e) => setContact((s) => ({ ...s, identificationNumber: e.target.value }))}
                    className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-white focus:border-amber-300/60 focus:outline-none"
                    placeholder="Mínimo 9 dígitos"
                    minLength={9}
                    required
                  />
                  {contact.identificationNumber && contact.identificationNumber.replace(/[^\d]/g, '').length < 9 && (
                    <span className="text-xs text-red-400">Mínimo 9 dígitos requeridos</span>
                  )}
                </label>
              </div>

              <div className="flex flex-col gap-2">
                <span className="text-sm text-gray-200">Método de pago</span>
                <div className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-white">
                  <p className="font-medium">SINPE Móvil</p>
                  <p className="text-xs text-gray-400">Por el momento, solo se aceptan pagos mediante SINPE Móvil</p>
                </div>
              </div>

              <label className="flex items-start gap-3 p-4 rounded-lg border border-white/10 bg-white/5 cursor-pointer hover:bg-white/10 transition-colors">
                <input
                  type="checkbox"
                  checked={acceptedTerms}
                  onChange={(e) => setAcceptedTerms(e.target.checked)}
                  className="mt-1 w-4 h-4 rounded border-white/20 bg-white/5 text-amber-300 focus:ring-amber-300/60"
                  required
                />
                <span className="text-sm text-gray-200">
                  Acepto los{' '}
                  <a href="/terminos" target="_blank" className="text-amber-300 underline hover:text-amber-200">
                    términos y condiciones
                  </a>
                  {' '}y{' '}
                  <a href="/privacidad" target="_blank" className="text-amber-300 underline hover:text-amber-200">
                    políticas de privacidad
                  </a>
                </span>
              </label>
            </div>

              <div className="rounded-xl border border-amber-300/40 bg-amber-300/10 px-4 py-3 text-sm text-amber-100">
                Aún no se realiza ningún cobro. Continuar te llevará al proveedor de pagos.
              </div>

              <div className="rounded-xl border border-sky-400/30 bg-sky-400/10 px-4 py-3 space-y-1">
                <p className="text-sm text-sky-100 font-semibold">Nota de seguridad</p>
                <p className="text-xs text-sky-100/90">La coordinación final del servicio se realiza únicamente por los canales oficiales indicados en la confirmación.</p>
              </div>

              <div className="flex flex-col gap-3">
                <Button variant="primary" onClick={handleConfirm} disabled={loading} className="w-full">
                  {loading ? 'Procesando...' : 'Confirmar y pagar'}
                </Button>
                <Button variant="ghost" onClick={() => navigate('/carrito')} className="w-full">
                  Volver al carrito
                </Button>
                <Button variant="ghost" onClick={() => clearReservation()} className="w-full text-red-300 border-red-300/30 hover:bg-red-300/10">
                  Cancelar
                </Button>
              </div>
            </div>
          </div>

          <aside className="space-y-4">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-5 space-y-3">
              <div className="flex items-center justify-between text-sm text-gray-300">
                <span>Paquete</span>
                <span>{formatMoney(cart.package.price)}</span>
              </div>
              <div className="flex items-center justify-between text-sm text-gray-300">
                <span>Extras</span>
                <span>{formatMoney(extrasTotal)}</span>
              </div>
              <div className="border-t border-white/10 pt-3 flex items-center justify-between text-lg font-bold text-white">
                <span>Total</span>
                <span>{formatMoney(cart.total)}</span>
              </div>
              <div className="flex items-center justify-between text-sm text-amber-200">
                <span>Anticipo (50%)</span>
                <span>{formatMoney(cart.deposit)}</span>
              </div>
              <div className="rounded-xl border border-sky-400/30 bg-sky-400/10 px-3 py-2 space-y-1">
                <p className="text-xs text-sky-100 font-semibold">Importante:</p>
                <p className="text-xs text-sky-100/90">Todos los montos se muestran en dólares estadounidenses (USD).</p>
                <p className="text-xs text-sky-100/90">El estimado en colones es únicamente de referencia.</p>
              </div>
            </div>
          </aside>
        </div>
      </Section>

      <Modal open={showSinpeModal} onClose={() => {}} title="Confirmación de Pago">
        <div className="space-y-6">
          <div className="rounded-xl border border-green-500/30 bg-green-500/10 p-4">
            <div className="flex items-start gap-3">
              <svg className="w-6 h-6 text-green-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <p className="text-green-100 font-semibold mb-1">¡Reserva recibida exitosamente!</p>
                <p className="text-sm text-green-200">Número de reserva: <span className="font-mono font-bold">#{reservationId}</span></p>
                <p className="text-sm text-green-200 mt-2">Hemos recibido tu pago y comenzaremos la coordinación de tu experiencia.</p>
                <p className="text-sm text-green-200">En breve recibirás la confirmación oficial con los detalles del servicio.</p>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-4">
            <p className="text-amber-100 font-semibold text-sm">Nota importante</p>
            <p className="text-amber-100/90 text-sm mt-1">Recuerda mantener tu teléfono disponible para la coordinación previa al evento.</p>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-bold text-white">Pasos para completar tu pago</h3>
            
            <div className="space-y-3">
              <div className="flex gap-3">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-300 font-bold">1</div>
                <div className="flex-1">
                  <p className="text-white font-semibold">Realiza el SINPE Móvil</p>
                  <p className="text-sm text-gray-300 mt-1">Envía el anticipo del <span className="text-amber-300 font-bold">{formatMoney(cart.deposit)}</span> (50% del total) al siguiente número:</p>
                  <div className="mt-2 p-3 rounded-lg bg-white/5 border border-white/10">
                    <p className="text-xs text-gray-400 mb-1">Número de SINPE Móvil</p>
                    <p className="text-2xl font-mono font-bold text-white">{SINPE_PHONE}</p>
                  </div>
                  <p className="text-xs text-gray-400 mt-2">Nombre: Moments Transportation CR</p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-300 font-bold">2</div>
                <div className="flex-1">
                  <p className="text-white font-semibold">Envía el comprobante</p>
                  <p className="text-sm text-gray-300 mt-1">
                    Toma una captura de pantalla del comprobante y envíala al correo <a href={`mailto:pagos@moments.cr?subject=Comprobante Reserva ${reservationId}`} className="text-amber-300 underline">pagos@moments.cr</a>
                  </p>
                  <p className="text-xs text-gray-400 mt-2">Asunto: Comprobante Reserva #{reservationId}</p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-300 font-bold">3</div>
                <div className="flex-1">
                  <p className="text-white font-semibold">Espera la confirmación</p>
                  <p className="text-sm text-gray-300 mt-1">Te enviaremos un correo a <span className="text-amber-300 font-semibold">{contact.email}</span> confirmando tu reserva en un máximo de 24 horas.</p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-300 font-bold">4</div>
                <div className="flex-1">
                  <p className="text-white font-semibold">Pago del restante</p>
                  <p className="text-sm text-gray-300 mt-1">El restante de <span className="text-amber-300 font-bold">{formatMoney(cart.total - cart.deposit)}</span> se paga antes del servicio.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-blue-500/30 bg-blue-500/10 p-4">
            <p className="text-sm text-blue-100">
              <span className="font-semibold">Recibirás por correo:</span>
            </p>
            <ul className="mt-2 space-y-1 text-sm text-blue-200">
              <li>• Confirmación de tu reserva</li>
              <li>• Términos y condiciones del servicio</li>
              <li>• Detalles del paquete y extras</li>
              <li>• Información de contacto para coordinar pickup 48h antes</li>
            </ul>
          </div>

          <div className="rounded-xl border border-yellow-500/30 bg-yellow-500/10 p-4">
            <p className="text-sm text-yellow-100">
              <span className="font-semibold">Importante:</span> Nos pondremos en contacto contigo 48 horas antes del servicio para coordinar la hora y lugar de recogida.
            </p>
          </div>

          <div className="flex flex-col gap-2">
            <Button
              variant="primary"
              onClick={() => {
                clearReservation()
                navigate('/')
              }}
              className="w-full"
            >
              Volver al inicio
            </Button>
          </div>
        </div>
      </Modal>
    </Layout>
  )
}

export default Payment
