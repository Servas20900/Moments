import { useState, type FormEvent } from 'react'
import Button from '../components/Button'
import Card from '../components/Card'
import SafeImage from '../components/SafeImage'
import { FaTrash, FaShoppingCart } from 'react-icons/fa'

type CartItem = {
  id: string
  name: string
  price: number
  quantity: number
  imageUrl: string
}

const Cart = () => {
  const [cart, setCart] = useState<CartItem[]>([])
  const [showCheckout, setShowCheckout] = useState(false)
  const [checkoutForm, setCheckoutForm] = useState({ name: '', email: '', phone: '' })
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState<string | null>(null)

  const removeFromCart = (id: string) => {
    setCart((prev) => prev.filter((x) => x.id !== id))
  }

  const updateQuantity = (id: string, qty: number) => {
    if (qty <= 0) {
      removeFromCart(id)
      return
    }
    setCart((prev) => prev.map((x) => (x.id === id ? { ...x, quantity: qty } : x)))
  }

  const subtotal = cart.reduce((acc, item) => acc + item.price * item.quantity, 0)
  const tax = subtotal * 0.13
  const total = subtotal + tax

  const handleCheckout = async (e: FormEvent) => {
    e.preventDefault()
    if (!checkoutForm.name.trim() || !checkoutForm.email.trim()) {
      alert('Por favor completa nombre y email')
      return
    }

    setLoading(true)
    try {
      // Mock checkout - in real app would call API
      await new Promise((r) => setTimeout(r, 600))
      setSuccess(`¡Compra completada! Confirmación enviada a ${checkoutForm.email}`)
      setCart([])
      setCheckoutForm({ name: '', email: '', phone: '' })
      setShowCheckout(false)
      setTimeout(() => setSuccess(null), 4000)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="px-4 py-12 sm:px-6 lg:px-8">
      <header className="mx-auto max-w-6xl mb-12">
        <p className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: '#c9a24d' }}>Mi carrito</p>
        <h1 className="text-4xl sm:text-5xl font-bold mb-3" style={{ color: '#f4f6fb' }}>Carrito de compras</h1>
        <p className="text-lg" style={{ color: '#b3b7c2' }}>Agrega accesorios para personalizar tu experiencia Moments.</p>
      </header>

      <div className="mx-auto max-w-6xl grid grid-cols-1 lg:grid-cols-3 gap-8">
        <section className="lg:col-span-2">
          {cart.length === 0 ? (
            <Card>
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <FaShoppingCart size={48} className="mb-6" style={{ opacity: 0.3 }} />
                <p className="text-lg" style={{ color: '#f4f6fb' }}>Tu carrito está vacío</p>
                <p className="text-sm mt-2" style={{ color: '#b3b7c2' }}>Explora la tienda para agregar accesorios</p>
              </div>
            </Card>
          ) : (
            <div className="flex flex-col gap-4">
              {cart.map((item) => (
                <div key={item.id} className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center rounded-xl border p-4" style={{ borderColor: 'rgba(201, 162, 77, 0.12)', background: 'linear-gradient(180deg, rgba(255, 255, 255, 0.06), rgba(255, 255, 255, 0.02))' }}>
                  <div className="sm:col-span-2 aspect-video rounded-lg overflow-hidden border" style={{ borderColor: 'rgba(201, 162, 77, 0.12)' }}>
                    <SafeImage src={item.imageUrl} alt={item.name} />
                  </div>
                  <div className="sm:col-span-3">
                    <h3 className="font-semibold text-lg" style={{ color: '#f4f6fb' }}>{item.name}</h3>
                    <p className="text-lg font-bold mt-1" style={{ color: '#c9a24d' }}>${item.price}</p>
                  </div>
                  <div className="sm:col-span-2 flex flex-col gap-1">
                    <label className="text-xs font-medium" style={{ color: '#b3b7c2' }}>Cantidad</label>
                    <div className="flex items-center gap-1 rounded-lg w-fit" style={{ background: 'rgba(255, 255, 255, 0.06)', border: '1px solid rgba(201, 162, 77, 0.12)' }}>
                      <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="px-2 py-1 transition" style={{ color: 'rgba(244, 246, 251, 0.7)' }}>−</button>
                      <input
                        type="number"
                        value={item.quantity}
                        onChange={(e) => updateQuantity(item.id, Number(e.target.value))}
                        min="1"
                        className="w-10 bg-transparent text-center text-sm border-0 focus:ring-0"
                        style={{ color: '#f4f6fb' }}
                      />
                      <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="px-2 py-1 transition" style={{ color: 'rgba(244, 246, 251, 0.7)' }}>+</button>
                    </div>
                  </div>
                  <div className="sm:col-span-2 flex flex-col gap-1">
                    <label className="text-xs font-medium" style={{ color: '#b3b7c2' }}>Subtotal</label>
                    <p className="font-bold" style={{ color: '#f4f6fb' }}>${(item.price * item.quantity).toFixed(2)}</p>
                  </div>
                  <div className="sm:col-span-2 flex justify-end">
                    <button
                      className="inline-flex items-center justify-center w-10 h-10 rounded-lg transition border"
                      onClick={() => removeFromCart(item.id)}
                      aria-label="Eliminar del carrito"
                      style={{ color: 'rgba(244, 246, 251, 0.7)', borderColor: 'rgba(255, 255, 255, 0.1)' }}
                    >
                      <FaTrash size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        <aside className="flex flex-col gap-6">
          <Card title="Resumen de compra">
            <div className="flex flex-col gap-3 mb-6">
              <div className="flex justify-between" style={{ color: '#b3b7c2' }}>
                <span>Subtotal</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between" style={{ color: '#b3b7c2' }}>
                <span>Impuesto (13%)</span>
                <span>${tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-bold text-lg border-t pt-3" style={{ color: '#f4f6fb', borderColor: 'rgba(255, 255, 255, 0.1)' }}>
                <span>Total</span>
                <span>${total.toFixed(2)}</span>
              </div>
            </div>
            <Button
              variant="primary"
              onClick={() => setShowCheckout(!showCheckout)}
              disabled={cart.length === 0}
              className="w-full"
            >
              {showCheckout ? 'Cancelar' : 'Proceder al pago'}
            </Button>
          </Card>

          {showCheckout && (
            <Card title="Datos de envío">
              <form className="flex flex-col gap-4" onSubmit={handleCheckout} noValidate>
                <label className="flex flex-col gap-2">
                  <span className="text-sm font-medium" style={{ color: '#f4f6fb' }}>Nombre completo</span>
                  <input
                    type="text"
                    value={checkoutForm.name}
                    onChange={(e) => setCheckoutForm((s) => ({ ...s, name: e.target.value }))}
                    required
                    className="rounded-xl border px-4 py-2 focus:ring-2 transition"
                    style={{ borderColor: 'rgba(201, 162, 77, 0.2)', background: 'rgba(255, 255, 255, 0.06)', color: '#f4f6fb' }}
                    placeholder="Tu nombre"
                  />
                </label>
                <label className="flex flex-col gap-2">
                  <span className="text-sm font-medium" style={{ color: '#f4f6fb' }}>Email</span>
                  <input
                    type="email"
                    value={checkoutForm.email}
                    onChange={(e) => setCheckoutForm((s) => ({ ...s, email: e.target.value }))}
                    required
                    className="rounded-xl border px-4 py-2 focus:ring-2 transition"
                    style={{ borderColor: 'rgba(201, 162, 77, 0.2)', background: 'rgba(255, 255, 255, 0.06)', color: '#f4f6fb' }}
                    placeholder="tu@email.com"
                  />
                </label>
                <label className="flex flex-col gap-2">
                  <span className="text-sm font-medium" style={{ color: '#f4f6fb' }}>Teléfono (opcional)</span>
                  <input
                    type="tel"
                    value={checkoutForm.phone}
                    onChange={(e) => setCheckoutForm((s) => ({ ...s, phone: e.target.value }))}
                    className="rounded-xl border px-4 py-2 focus:ring-2 transition"
                    style={{ borderColor: 'rgba(201, 162, 77, 0.2)', background: 'rgba(255, 255, 255, 0.06)', color: '#f4f6fb' }}
                    placeholder="Tu teléfono"
                  />
                </label>
                <Button
                  variant="primary"
                  type="submit"
                  disabled={loading}
                  className="w-full mt-2"
                >
                  {loading ? 'Procesando...' : 'Completar compra'}
                </Button>
                {success && <div className="rounded-lg border px-4 py-3 text-sm" style={{ borderColor: 'rgba(76, 175, 80, 0.3)', background: 'rgba(76, 175, 80, 0.1)', color: '#81c784' }}>{success}</div>}
              </form>
            </Card>
          )}
        </aside>
      </div>
    </div>
  )
}

export default Cart
