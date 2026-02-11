import { useNavigate } from 'react-router-dom'
import { useTheme } from '../../hooks/useTheme'
import { getThemeClasses } from '../../utils/themeClasses'

interface AdminSidebarProps {
  current?: 'admin' | 'sistema' | 'eventos' | 'paquetes' | 'vehiculos' | 'extras' | 'incluidos' | 'disponibilidad'
}

const AdminSidebar = ({ current }: AdminSidebarProps) => {
  const navigate = useNavigate()
  const { theme } = useTheme()
  const themeClasses = getThemeClasses(theme)

  const items = [
    { key: 'admin', label: 'Panel Principal', path: '/admin' },
    { key: 'sistema', label: 'Configuracion del Sistema', path: '/admin/sistema' },
    { key: 'eventos', label: 'Eventos', path: '/admin/eventos' },
    { key: 'paquetes', label: 'Paquetes', path: '/admin/paquetes' },
    { key: 'vehiculos', label: 'Vehiculos', path: '/admin/vehiculos' },
    { key: 'extras', label: 'Extras', path: '/admin/paquetes-extras' },
    { key: 'incluidos', label: 'Incluidos', path: '/admin/incluidos' },
    { key: 'disponibilidad', label: 'Disponibilidad de Vehiculos', path: '/admin/disponibilidad-vehiculos' },
  ]

  const sidebarBg = theme === 'dark'
    ? 'bg-[var(--card-bg,#11131a)] border-white/10'
    : 'bg-white border-gray-200'

  const labelColor = theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
  const inactiveBtnClass = theme === 'dark'
    ? 'bg-white/5 border border-white/10 text-white hover:border-white/20 hover:bg-white/10'
    : 'bg-gray-200 border border-gray-300 text-gray-900 hover:border-gray-400 hover:bg-gray-300'

  return (
    <aside className={`${sidebarBg} rounded-2xl p-4 flex flex-col gap-2.5 shadow-[0_12px_30px_rgba(0,0,0,0.3)] self-start max-w-xs border`}>
      <p className={`text-[11px] uppercase tracking-[0.24em] ${labelColor}`}>Navegacion</p>
      <div className="grid gap-2">
        {items.map((item) => (
          <button
            key={item.key}
            onClick={() => navigate(item.path)}
            className={`text-left px-3 py-2 rounded-xl cursor-pointer transition-colors text-sm ${
              current === item.key
                ? 'bg-amber-300/10 border border-amber-300/30 text-amber-300 font-semibold hover:border-amber-300/50 hover:bg-amber-300/20'
                : `border ${inactiveBtnClass}`
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>
    </aside>
  )
}

export default AdminSidebar
