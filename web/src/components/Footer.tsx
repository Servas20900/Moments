import { Link } from 'react-router-dom'

export default function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="border-t border-white/10 bg-[var(--color-surface)] text-[color:var(--color-text)]">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-12 space-y-8">
        {/* Main Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-3">
            <h3 className="font-bold text-lg">Moments</h3>
            <p className="text-sm text-[color:var(--color-muted)]">Transporte de lujo para momentos especiales. Chofer profesional, confort premium y disponibilidad garantizada.</p>
            <div className="flex gap-4 pt-2">
              <a href="https://wa.me/506 8703 2112" target="_blank" rel="noopener noreferrer" className="text-sm hover:text-[color:var(--color-accent)] transition">WhatsApp</a>
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="text-sm hover:text-[color:var(--color-accent)] transition">Facebook</a>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="text-sm hover:text-[color:var(--color-accent)] transition">Instagram</a>
            </div>
          </div>

          {/* Servicios */}
          <div className="space-y-3">
            <h4 className="font-semibold text-sm uppercase tracking-wide">Servicios</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/paquetes" className="hover:text-[color:var(--color-accent)] transition">Paquetes</Link></li>
              <li><Link to="/vehiculos" className="hover:text-[color:var(--color-accent)] transition">Vehículos</Link></li>
              <li><Link to="/calendario" className="hover:text-[color:var(--color-accent)] transition">Calendario</Link></li>
              <li><Link to="/reservar" className="hover:text-[color:var(--color-accent)] transition">Reservar</Link></li>
            </ul>
          </div>

          {/* Empresa */}
          <div className="space-y-3">
            <h4 className="font-semibold text-sm uppercase tracking-wide">Empresa</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/about" className="hover:text-[color:var(--color-accent)] transition">Sobre nosotros</Link></li>
              <li><Link to="/terms" className="hover:text-[color:var(--color-accent)] transition">Términos</Link></li>
              <li><a href="mailto:contact@momentswrld.com" className="hover:text-[color:var(--color-accent)] transition">Contacto</a></li>
              <li><a href="tel:+506 8703 2112" className="hover:text-[color:var(--color-accent)] transition">+506 8703 2112</a></li>
            </ul>
          </div>

          {/* Contacto */}
          <div className="space-y-3">
            <h4 className="font-semibold text-sm uppercase tracking-wide">Contacto</h4>
            <ul className="space-y-2 text-sm text-[color:var(--color-muted)]">
              <li className="flex items-start gap-2">
                <span className="text-[color:var(--color-accent)] mt-0.5">•</span>
                <span>San José, Costa Rica</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[color:var(--color-accent)] mt-0.5">•</span>
                <a href="mailto:contact@momentswrld.com" className="hover:text-[color:var(--color-accent)] transition">contact@momentswrld.com</a>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[color:var(--color-accent)] mt-0.5">•</span>
                <a href="tel:+50687032112" className="hover:text-[color:var(--color-accent)] transition">+506 8703 2112</a>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[color:var(--color-accent)] mt-0.5">•</span>
                <span>24/7 disponible</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-white/10"></div>

        {/* Bottom */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-[color:var(--color-muted)]">
          <p>&copy; {currentYear} Moments Luxury Chauffeur. Todos los derechos reservados.</p>
          <div className="flex gap-4">
            <a href="mailto:privacy@moments.cr" className="hover:text-[color:var(--color-accent)] transition">Privacidad</a>
            <a href="mailto:terms@moments.cr" className="hover:text-[color:var(--color-accent)] transition">Términos</a>
          </div>
        </div>
      </div>
    </footer>
  )
}
