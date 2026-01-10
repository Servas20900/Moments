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
    <div className="page">
      <header className="section">
        <p className="eyebrow">Mi carrito</p>
        <h1 className="display">Carrito de compras</h1>
        <p className="section__copy">Agrega accesorios para personalizar tu experiencia Moments.</p>
      </header>

      <div className="cart-layout">
        <section className="cart-main">
          {cart.length === 0 ? (
            <Card>
              <div className="cart-empty">
                <FaShoppingCart size={48} className="opacity-30 mb-lg" />
                <p className="text-muted">Tu carrito está vacío</p>
                <p className="text-sm text-muted">Explora la tienda para agregar accesorios</p>
              </div>
            </Card>
          ) : (
            <div className="cart-items">
              {cart.map((item) => (
                <div key={item.id} className="cart-item">
                  <div className="cart-item__image">
                    <SafeImage src={item.imageUrl} alt={item.name} />
                  </div>
                  <div className="cart-item__details">
                    <h3 className="cart-item__name">{item.name}</h3>
                    <p className="cart-item__price">${item.price}</p>
                  </div>
                  <div className="cart-item__quantity">
                    <label>Cantidad</label>
                    <div className="quantity-input">
                      <button onClick={() => updateQuantity(item.id, item.quantity - 1)}>−</button>
                      <input
                        type="number"
                        value={item.quantity}
                        onChange={(e) => updateQuantity(item.id, Number(e.target.value))}
                        min="1"
                      />
                      <button onClick={() => updateQuantity(item.id, item.quantity + 1)}>+</button>
                    </div>
                  </div>
                  <div className="cart-item__subtotal">
                    <label>Subtotal</label>
                    <p>${(item.price * item.quantity).toFixed(2)}</p>
                  </div>
                  <button
                    className="cart-item__remove"
                    onClick={() => removeFromCart(item.id)}
                    aria-label="Eliminar del carrito"
                  >
                    <FaTrash size={18} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>

        <aside className="cart-sidebar">
          <Card title="Resumen de compra">
            <div className="cart-summary">
              <div className="cart-summary__row">
                <span>Subtotal</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              <div className="cart-summary__row">
                <span>Impuesto (13%)</span>
                <span>${tax.toFixed(2)}</span>
              </div>
              <div className="cart-summary__row cart-summary__total">
                <span>Total</span>
                <span>${total.toFixed(2)}</span>
              </div>
            </div>
            <Button
              variant="primary"
              onClick={() => setShowCheckout(!showCheckout)}
              disabled={cart.length === 0}
              className="w-full mt-lg"
            >
              {showCheckout ? 'Cancelar' : 'Proceder al pago'}
            </Button>
          </Card>

          {showCheckout && (
            <Card title="Datos de envío" className="mt-3xl">
              <form className="form" onSubmit={handleCheckout} noValidate>
                <label className="form__label">
                  Nombre completo
                  <input
                    type="text"
                    value={checkoutForm.name}
                    onChange={(e) => setCheckoutForm((s) => ({ ...s, name: e.target.value }))}
                    required
                  />
                </label>
                <label className="form__label">
                  Email
                  <input
                    type="email"
                    value={checkoutForm.email}
                    onChange={(e) => setCheckoutForm((s) => ({ ...s, email: e.target.value }))}
                    required
                  />
                </label>
                <label className="form__label">
                  Teléfono (opcional)
                  <input
                    type="tel"
                    value={checkoutForm.phone}
                    onChange={(e) => setCheckoutForm((s) => ({ ...s, phone: e.target.value }))}
                  />
                </label>
                <Button
                  variant="primary"
                  type="submit"
                  disabled={loading}
                  className="w-full mt-md"
                >
                  {loading ? 'Procesando...' : 'Completar compra'}
                </Button>
                {success && <div className="form__success mt-md">{success}</div>}
              </form>
            </Card>
          )}
        </aside>
      </div>
    </div>
  )
}

export default Cart
