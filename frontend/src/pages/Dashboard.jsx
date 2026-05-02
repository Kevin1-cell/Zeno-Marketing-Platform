import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import axios from 'axios'
import EventosList from '../components/EventosList'

export default function Dashboard() {
  const navigate = useNavigate()
  const { token } = useAuthStore()
  const [eventos, setEventos] = useState([])

  useEffect(() => {
    const fetchEventos = async () => {
      try {
        const res = await axios.get('/eventos', { headers: { Authorization: `Bearer ${token}` } })
        const eventosData = Array.isArray(res.data) ? res.data : [res.data]
        setEventos(eventosData)
      } catch (err) {
        console.error('Error cargando eventos:', err)
        setEventos([])
      }
    }
    if (token) fetchEventos()
  }, [token])

  const handleEventClick = (evento) => {
    navigate(`/evento/${evento.id}`)
  }

  return (
    <div className="min-h-screen bg-zeno-dark p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-zeno-blue">Panel Zeno</h1>
          <button
            onClick={() => { useAuthStore.getState().logout(); window.location.href = '/' }}
            className="bg-zeno-orange px-4 py-2 rounded-lg"
          >
            Cerrar sesión
          </button>
        </div>

        <EventosList eventos={eventos} onSelectEvento={handleEventClick} />
      </div>
    </div>
  )
}