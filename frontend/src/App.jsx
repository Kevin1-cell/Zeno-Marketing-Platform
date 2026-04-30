import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from './store/authStore'
import Registro from './pages/Registro'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import SorteoDetalle from './pages/SorteoDetalle'
import ParticipantesPage from './pages/ParticipantesPage'
import ProtectedRoute from './components/ProtectedRoute'

function App() {
  const { token } = useAuthStore()
  return (
    <Routes>
      <Route path="/" element={<Registro />} />
      <Route path="/login" element={<Login />} />
      <Route path="/dashboard" element={
        <ProtectedRoute>
          <Dashboard />
        </ProtectedRoute>
      } />
      <Route path="/sorteos/:id" element={
        <ProtectedRoute>
          <SorteoDetalle />
        </ProtectedRoute>
      } />
      <Route path="/participantes/:eventoId" element={
        <ProtectedRoute>
          <ParticipantesPage />
        </ProtectedRoute>
      } />
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  )
}

export default App