import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import axios from 'axios'
import { useAuthStore } from '../store/authStore'
import { io } from 'socket.io-client'
import ParticipantesList from '../components/ParticipantesList'
import toast from 'react-hot-toast'

const WS_PARTICIPANTES = import.meta.env.VITE_WS_PARTICIPANTES || 'ws://localhost:3003/participants'

export default function ParticipantesPage() {
  const { eventoId } = useParams()
  const navigate = useNavigate()
  const { token } = useAuthStore()
  const [evento, setEvento] = useState(null)
  const [participantes, setParticipantes] = useState([])

  const fetchData = async () => {
    try {
      const [eventoRes, participantesRes] = await Promise.all([
        axios.get(`/eventos/${eventoId}`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`/participantes?evento_id=${eventoId}`, { headers: { Authorization: `Bearer ${token}` } })
      ])
      setEvento(eventoRes.data)
      setParticipantes(participantesRes.data)
    } catch (err) {
      toast.error('Error al cargar datos')
    }
  }

  useEffect(() => {
    if (!eventoId || !token) return
    fetchData()

    console.log('🔌 Conectando WebSocket en página de participantes')
    const socket = io(WS_PARTICIPANTES, { transports: ['websocket'] })

    socket.on('connect', () => {
      console.log('✅ WebSocket conectado (participantes page)')
    })

    socket.on('participante:nuevo', (nuevoParticipante) => {
      console.log('🆕 participante:nuevo recibido:', nuevoParticipante)
      if (nuevoParticipante.evento_id === eventoId) {
        setParticipantes(prev => [...prev, nuevoParticipante])
        toast.success(`Nuevo participante: ${nuevoParticipante.nombre_completo}`)
      }
    })

    socket.on('participante:confirmado', (participanteConfirmado) => {
      console.log('✅ participante:confirmado recibido:', participanteConfirmado)
      if (participanteConfirmado.evento_id === eventoId) {
        setParticipantes(prev =>
          prev.map(p => p.id === participanteConfirmado.id ? { ...p, confirmado: true } : p)
        )
        toast.success(`Participante confirmado: ${participanteConfirmado.nombre_completo}`)
      }
    })

    socket.on('disconnect', () => {
      console.log('❌ WebSocket desconectado (participantes page)')
    })

    return () => {
      console.log('🔌 Desconectando WebSocket (participantes page)')
      socket.disconnect()
    }
  }, [eventoId, token])

  return (
    <div className="min-h-screen bg-zeno-dark p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-zeno-blue">
            Gestión de participantes - {evento?.nombre || 'Cargando...'}
          </h1>
          <button
            onClick={() => navigate('/dashboard')}
            className="bg-zeno-orange px-4 py-2 rounded-lg"
          >
            ← Volver al Dashboard
          </button>
        </div>
        <ParticipantesList
          participantes={participantes}
          token={token}
          eventoId={eventoId}
          onParticipanteRegistrado={() => {
            // Refrescar lista completa después de registro manual (por si el WebSocket falla)
            fetchData()
          }}
        />
      </div>
    </div>
  )
}