import Button from '../components/Button'
import SafeImage from '../components/SafeImage'
import { Layout, PageHeader, Section } from '../components/Layout'
import { useReservation } from '../contexts/ReservationContext'
import { useNavigate } from 'react-router-dom'

const formatMoney = (value: number) => `$${value.toFixed(2)}`

const Cart = () => {
  const { cart, clearReservation } = useReservation()
  const navigate = useNavigate()

  if (!cart) {
    return (
      <Layout>
        <PageHeader
          eyebrow="Carrito"
          title="Aún no tienes una reserva"
          description="Selecciona un paquete y configura tu reserva para continuar al pago."
        />
        <Section spacing="md">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-8 text-center space-y-4">
            <p className="text-lg text-gray-200">Tu carrito está vacío.</p>
            <div className="flex gap-3 justify-center">
              <Button variant="ghost" onClick={() => navigate('/paquetes')}>Ver paquetes</Button>
            </div>
          </div>
        </Section>
      </Layout>
    )
  }

  const extrasTotal = cart.extras.reduce((acc, extra) => acc + extra.price, 0)
  const vehicleLabel = cart.vehicle ? `${cart.vehicle.name} · ${cart.vehicle.seats} asientos` : 'Asignaremos el mejor disponible'

  return (
    <Layout>
      <PageHeader
        eyebrow="Carrito"
        title="Confirma tu reserva"
        description="Revisa los detalles antes de confirmar y proceder al pago."
      />

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
                <Button variant="ghost" onClick={() => navigate('/reservar', { state: { packageId: cart.package.id } })}>Editar</Button>
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
                  <p className="text-white font-semibold">{vehicleLabel}</p>
                </div>
              </div>

              <div className="border-t border-white/10 pt-4 space-y-2">
                <p className="text-sm text-gray-200">Extras</p>
                {cart.extras.length === 0 && <p className="text-sm text-gray-400">Sin extras</p>}
                {cart.extras.map((extra) => (
                  <div key={extra.id} className="flex items-center justify-between text-sm text-gray-200">
                    <span>{extra.name}</span>
                    <span>{formatMoney(extra.price)}</span>
                  </div>
                ))}
              </div>

              {cart.notes && (
                <div className="border-t border-white/10 pt-4">
                  <p className="text-sm text-gray-200 mb-1">Notas</p>
                  <p className="text-sm text-gray-400 whitespace-pre-line">{cart.notes}</p>
                </div>
              )}
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
              <div className="flex items-center justify-between text-sm text-gray-300">
                <span>Vehículo</span>
                <span>{cart.vehicle ? cart.vehicle.rate : 'Incluido'}</span>
              </div>
              <div className="border-t border-white/10 pt-3 flex items-center justify-between text-lg font-bold text-white">
                <span>Total</span>
                <span>{formatMoney(cart.total)}</span>
              </div>
              <div className="flex items-center justify-between text-sm text-amber-200">
                <span>Anticipo (50%)</span>
                <span>{formatMoney(cart.deposit)}</span>
              </div>
              <div className="rounded-xl border border-amber-300/40 bg-amber-300/10 px-3 py-2 text-xs text-amber-100">
                No se ha realizado ningún cobro. Confirmarás en el siguiente paso.
              </div>
              <div className="flex flex-col gap-2">
                <Button
                  variant="ghost"
                  onClick={() => navigate('/reservar', { state: { packageId: cart.package.id } })}
                >
                  Volver a editar
                </Button>
                <Button
                  variant="primary"
                  onClick={() => navigate('/pago')}
                  className="w-full"
                >
                  Confirmar y continuar al pago
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => clearReservation()}
                  className="w-full text-red-300 border-red-300/30 hover:bg-red-300/10"
                >
                  Vaciar carrito
                </Button>
              </div>
            </div>
          </aside>
        </div>
      </Section>
    </Layout>
  )
}

export default Cart
