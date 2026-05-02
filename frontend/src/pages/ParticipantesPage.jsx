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

    socket.on('connect', () => console.log('✅ WebSocket conectado (participantes page)'))
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
    socket.on('disconnect', () => console.log('❌ WebSocket desconectado (participantes page)'))

    return () => {
      console.log('🔌 Desconectando WebSocket (participantes page)')
      socket.disconnect()
    }
  }, [eventoId, token])

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html, body, #root { min-height: 100%; }

        .zpp-root {
          min-height: 100dvh;
          background: #030b18;
          font-family: 'DM Sans', sans-serif;
          color: #e0eeff;
          position: relative;
        }
        .zpp-bg-glow {
          position: fixed; inset: 0; z-index: 0; pointer-events: none;
        }
        .zpp-bg-glow::before {
          content: ''; position: absolute; top: -80px; left: 20%;
          width: 500px; height: 300px;
          background: radial-gradient(ellipse, rgba(30,111,255,0.12) 0%, transparent 70%);
        }
        .zpp-bg-glow::after {
          content: ''; position: absolute; bottom: 0; right: -60px;
          width: 350px; height: 350px;
          background: radial-gradient(ellipse, rgba(255,140,0,0.07) 0%, transparent 70%);
        }

        .zpp-inner {
          position: relative; z-index: 1;
          max-width: 480px; margin: 0 auto;
          padding: 0 0 48px;
        }

        /* ── Header ── */
        .zpp-header {
          display: flex; align-items: center; gap: 12px;
          padding: 14px 16px 12px;
          border-bottom: 1px solid rgba(30,111,255,0.1);
          background: linear-gradient(180deg, rgba(10,22,40,0.98) 0%, transparent 100%);
          position: sticky; top: 0; z-index: 10;
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
        }
        .zpp-btn-volver {
          display: flex; align-items: center; gap: 5px;
          background: rgba(30,111,255,0.12);
          border: 1px solid rgba(30,111,255,0.3);
          color: #7eb8ff;
          font-family: 'DM Sans', sans-serif;
          font-size: 11px; font-weight: 500;
          padding: 6px 13px; border-radius: 50px;
          cursor: pointer; transition: all 0.2s;
          flex-shrink: 0;
        }
        .zpp-btn-volver:hover { background: rgba(30,111,255,0.22); color: #aed4ff; }
        .zpp-btn-volver svg { width: 12px; height: 12px; stroke: currentColor; fill: none; stroke-width: 2; stroke-linecap: round; stroke-linejoin: round; }

        .zpp-header-info { flex: 1; min-width: 0; }
        .zpp-header-label {
          font-size: 9px; font-weight: 500; letter-spacing: 0.1em;
          text-transform: uppercase; color: rgba(148,180,220,0.45);
        }
        .zpp-header-title {
          font-family: 'Syne', sans-serif;
          font-size: 15px; font-weight: 800;
          background: linear-gradient(90deg, #1e6fff, #ff8c00);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent;
          background-clip: text;
          white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
        }

        .zpp-content { padding: 14px 16px 0; }
      `}</style>

      <div className="zpp-root">
        <div className="zpp-bg-glow" />
        <div className="zpp-inner">

          {/* HEADER */}
          <div className="zpp-header">
            <button onClick={() => navigate('/dashboard')} className="zpp-btn-volver">
              <svg viewBox="0 0 24 24"><polyline points="15 18 9 12 15 6" /></svg>
              Volver
            </button>
            <div className="zpp-header-info">
              <p className="zpp-header-label">Gestión</p>
              <p className="zpp-header-title">{evento?.nombre || 'Cargando...'}</p>
            </div>
          </div>

          <div className="zpp-content">
            <ParticipantesList
              participantes={participantes}
              token={token}
              eventoId={eventoId}
              onParticipanteRegistrado={fetchData}
            />
          </div>

        </div>
      </div>
    </>
  )
}