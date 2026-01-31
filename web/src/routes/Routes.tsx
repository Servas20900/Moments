import { lazy } from 'react'

const Home = lazy(() => import('../pages/Home'))
const Packages = lazy(() => import('../pages/Packages'))
const Vehicles = lazy(() => import('../pages/Vehicles'))
const VehicleDetail = lazy(() => import('../pages/VehicleDetail'))
const PackageDetail = lazy(() => import('../pages/PackageDetail'))
const CalendarPage = lazy(() => import('../pages/CalendarPage'))
const About = lazy(() => import('../pages/About'))
const Gallery = lazy(() => import('../pages/Gallery'))
const Admin = lazy(() => import('../pages/Admin'))
const Login = lazy(() => import('../pages/Login'))
const Register = lazy(() => import('../pages/Register'))
const Profile = lazy(() => import('../pages/Profile'))
const Cart = lazy(() => import('../pages/Cart'))
const Reserve = lazy(() => import('../pages/Reserve'))
const Payment = lazy(() => import('../pages/Payment'))
const Terms = lazy(() => import('../pages/Terms'))
const NotFound = lazy(() => import('../pages/NotFound'))
const Error = lazy(() => import('../pages/Error'))
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
    { path: '/paquetes/:id', element: <PackageDetail /> },
    { path: '/reservar', element: <Reserve /> },
    { path: '/vehiculos', element: <Vehicles /> },
    { path: '/vehiculos/:id', element: <VehicleDetail /> },
    { path: '/calendario', element: <CalendarPage /> },
    { path: '/galeria', element: <Gallery /> },
    { path: '/admin', element: <ProtectedRoute element={<Admin />} /> },
    { path: '/login', element: <Login /> },
    { path: '/about', element: <About /> },
    { path: '/register', element: <Register /> },
    { path: '/profile', element: <Profile /> },
    { path: '/carrito', element: <Cart /> },
    { path: '/pago', element: <Payment /> },
    { path: '/terminos', element: <Terms /> },
    { path: '/error', element: <Error /> },
    { path: '*', element: <NotFound /> }, // Catch-all para 404
  ]
}

export default AppRoutes
