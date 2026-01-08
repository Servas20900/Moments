import React from 'react'
import Home from '../pages/Home'
import Packages from '../pages/Packages'
import Vehicles from '../pages/Vehicles'
import CalendarPage from '../pages/CalendarPage'
import About from '../pages/About'
import Admin from '../pages/Admin'
import Login from '../pages/Login'
import Register from '../pages/Register'
import Profile from '../pages/Profile'
import Reservar from '../pages/Reservar'

export class AppRoutes {
  static nav = [
    { to: '/', label: 'Inicio' },
    { to: '/paquetes', label: 'Paquetes' },
    { to: '/vehiculos', label: 'Vehículos' },
    { to: '/calendario', label: 'Calendario Eventos' },
    { to: '/about', label: 'Sobre nosotros' },
    { to: '/admin', label: 'Admin' },
  ]

  static list = [
    { path: '/', element: <Home /> },
    { path: '/paquetes', element: <Packages /> },
    { path: '/vehiculos', element: <Vehicles /> },
    { path: '/calendario', element: <CalendarPage /> },
    { path: '/admin', element: <Admin /> },
    { path: '/login', element: <Login /> },
    { path: '/about', element: <About /> },
    { path: '/register', element: <Register /> },
    { path: '/profile', element: <Profile /> },
    { path: '/reservar', element: <Reservar /> },
  ]
}

export default AppRoutes
