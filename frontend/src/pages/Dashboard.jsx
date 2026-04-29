import { useEffect, useState } from 'react'
import { useAuthStore } from '../store/authStore'
import axios from 'axios'
import { io } from 'socket.io-client'
import EventosList from '../components/EventosList'
import ParticipantesList from '../components/ParticipantesList'
import Ruleta from '../components/Ruleta'

const WS_PARTICIPANTES = import.meta.env.VITE_WS_PARTICIPANTES || 'ws://localhost:3003/participants'

export default function Dashboard() {
  const { token } = useAuthStore()
  const [eventos, setEventos] = useState([])
  const [eventoSeleccionado, setEventoSeleccionado] = useState(null)
  const [participantes, setParticipantes] = useState([])
  const [stats, setStats] = useState({ total: 0, confirmados: 0, porNivel: { C1: 0, C2: 0, C3: 0 } })

  // Cargar eventos
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

  // Cargar participantes y estadísticas al seleccionar evento
  useEffect(() => {
    if (!eventoSeleccionado) return

    const fetchData = async () => {
      try {
        const [participantesRes, statsRes] = await Promise.all([
          axios.get(`/participantes?evento_id=${eventoSeleccionado.id}`, { headers: { Authorization: `Bearer ${token}` } }),
          axios.get(`/eventos/${eventoSeleccionado.id}/estadisticas`, { headers: { Authorization: `Bearer ${token}` } })
        ])
        setParticipantes(participantesRes.data)
        setStats(statsRes.data)
      } catch (err) {
        console.error('Error cargando datos del evento:', err)
      }
    }

    fetchData()

    // WebSocket para actualizaciones en tiempo real (confirmaciones y nuevos registros manuales)
    const socket = io(WS_PARTICIPANTES, { transports: ['websocket'] })
    socket.on('participante:confirmado', (data) => {
      setParticipantes(prev =>
        prev.map(p => p.id === data.id ? { ...p, confirmado: true } : p)
      )
      setStats(prev => ({
        ...prev,
        confirmados: prev.confirmados + 1
      }))
    })
    return () => socket.disconnect()
  }, [eventoSeleccionado, token])

  return (
    <div className="min-h-screen bg-zeno-dark p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-zeno-blue">Panel Zeno</h1>
          <button
            onClick={() => useAuthStore.getState().logout()}
            className="bg-zeno-orange px-4 py-2 rounded-lg"
          >
            Cerrar sesión
          </button>
        </div>

        <EventosList eventos={eventos} onSelect={setEventoSeleccionado} />

        {eventoSeleccionado && (
          <>
            <div className="grid grid-cols-3 gap-4 my-6">
              <div className="bg-zeno-card p-4 rounded-lg text-center">
                <p className="text-zeno-text-sec">Total registrados</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <div className="bg-zeno-card p-4 rounded-lg text-center">
                <p className="text-zeno-text-sec">Confirmados</p>
                <p className="text-2xl font-bold text-zeno-success">{stats.confirmados}</p>
              </div>
              <div className="bg-zeno-card p-4 rounded-lg text-center">
                <p className="text-zeno-text-sec">Por nivel</p>
                <p>C1: {stats.porNivel?.C1 || 0} | C2: {stats.porNivel?.C2 || 0} | C3: {stats.porNivel?.C3 || 0}</p>
              </div>
            </div>

            <ParticipantesList
              participantes={participantes}
              token={token}
              eventoId={eventoSeleccionado.id}
            />
            <Ruleta eventoId={eventoSeleccionado.id} token={token} />
          </>
        )}
      </div>
    </div>
  )
}