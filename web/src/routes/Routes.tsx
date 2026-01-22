import Home from '../pages/Home'
import Packages from '../pages/Packages'
import Vehicles from '../pages/Vehicles'
import CalendarPage from '../pages/CalendarPage'
import About from '../pages/About'
import Gallery from '../pages/Gallery'
import Admin from '../pages/Admin'
import Login from '../pages/Login'
import Register from '../pages/Register'
import Profile from '../pages/Profile'
import Cart from '../pages/Cart'
import NotFound from '../pages/NotFound'
import Error from '../pages/Error'
import ProtectedRoute from '../components/ProtectedRoute'

export class AppRoutes {
  static nav = [
    { to: '/', label: 'Inicio' },
    { to: '/about', label: 'Sobre nosotros' },
    { to: '/calendario', label: 'Calendario Eventos' },
    { to: '/paquetes', label: 'Paquetes' },
    { to: '/vehiculos', label: 'Vehículos' },
    { to: '/admin', label: 'Admin' },
  ]

  static list = [
    { path: '/', element: <Home /> },
    { path: '/paquetes', element: <Packages /> },
    { path: '/vehiculos', element: <Vehicles /> },
    { path: '/calendario', element: <CalendarPage /> },
    { path: '/galeria', element: <Gallery /> },
    { path: '/admin', element: <ProtectedRoute element={<Admin />} /> },
    { path: '/login', element: <Login /> },
    { path: '/about', element: <About /> },
    { path: '/register', element: <Register /> },
    { path: '/profile', element: <Profile /> },
    { path: '/carrito', element: <Cart /> },
    { path: '/error', element: <Error /> },
    { path: '*', element: <NotFound /> }, // Catch-all para 404
  ]
}

export default AppRoutes
