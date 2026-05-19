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

    const socket = io('/participants', {
      path: '/socket.io',
      transports: ['websocket']
    })

    socket.on('connect', () => {})
    socket.on('participante:nuevo', (nuevoParticipante) => {
      if (nuevoParticipante.evento_id === eventoId) {
        setParticipantes(prev => [...prev, nuevoParticipante])
        toast.success(`Nuevo participante: ${nuevoParticipante.nombre_completo}`)
      }
    })
    socket.on('participante:confirmado', (participanteConfirmado) => {
      if (participanteConfirmado.evento_id === eventoId) {
        setParticipantes(prev =>
          prev.map(p => p.id === participanteConfirmado.id ? { ...p, confirmado: true } : p)
        )
        toast.success(`Participante confirmado: ${participanteConfirmado.nombre_completo}`)
      }
    })
    socket.on('disconnect', () => {})

    return () => {
      socket.disconnect()
    }
  }, [eventoId, token])

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Kameron:wght@400;700&family=DM+Sans:wght@400;500;600;700&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html, body, #root { min-height: 100%; }

        /* ── PAGE ROOT ── */
        .zpp-root {
          min-height: 100dvh;
          font-family: 'DM Sans', sans-serif;
          color: #0c2340;
          position: relative;
          background:
            radial-gradient(ellipse at 20% 0%, #e0f7ff 0%, transparent 55%),
            radial-gradient(ellipse at 80% 10%, #cde8f5 0%, transparent 50%),
            radial-gradient(ellipse at 60% 80%, rgba(147,197,253,0.35) 0%, transparent 55%),
            radial-gradient(ellipse at 10% 90%, rgba(125,211,252,0.27) 0%, transparent 50%),
            #f0f9ff;
        }

        /* ── FLOATING BUBBLES ── */
        .zpp-bubble {
          position: fixed;
          border-radius: 50%;
          pointer-events: none;
          z-index: 0;
          animation: zpp-float linear infinite;
        }
        .zpp-bubble-1 {
          width: clamp(180px, 28vw, 340px);
          height: clamp(180px, 28vw, 340px);
          top: -80px; right: -60px;
          background: radial-gradient(circle, rgba(125,211,252,0.28) 0%, rgba(147,197,253,0.08) 60%, transparent 100%);
          animation-duration: 9s;
        }
        .zpp-bubble-2 {
          width: clamp(120px, 20vw, 220px);
          height: clamp(120px, 20vw, 220px);
          bottom: 10%; left: -50px;
          background: radial-gradient(circle, rgba(56,189,248,0.18) 0%, rgba(14,165,233,0.05) 65%, transparent 100%);
          animation-duration: 12s;
          animation-delay: -4s;
        }
        .zpp-bubble-3 {
          width: clamp(90px, 14vw, 160px);
          height: clamp(90px, 14vw, 160px);
          top: 40%; right: 5%;
          background: radial-gradient(circle, rgba(186,230,255,0.22) 0%, transparent 70%);
          animation-duration: 7.5s;
          animation-delay: -2s;
        }
        .zpp-bubble-4 {
          width: clamp(60px, 10vw, 110px);
          height: clamp(60px, 10vw, 110px);
          top: 70%; left: 20%;
          background: radial-gradient(circle, rgba(125,211,252,0.2) 0%, transparent 70%);
          animation-duration: 10s;
          animation-delay: -6s;
        }
        @keyframes zpp-float {
          0%, 100% { transform: translateY(0px) scale(1); }
          50% { transform: translateY(-18px) scale(1.03); }
        }

        /* ── LAYOUT ── */
        .zpp-inner {
          position: relative;
          z-index: 1;
          max-width: min(480px, 96vw);
          margin: 0 auto;
          padding: 0 0 clamp(32px, 5vw, 56px);
        }

        @media (min-width: 900px) {
          .zpp-inner {
            max-width: min(1200px, 96vw);
          }
        }

        /* ── STICKY HEADER ── */
        .zpp-header {
          display: flex;
          align-items: center;
          gap: clamp(10px, 2vw, 14px);
          padding: clamp(12px, 2vw, 16px) clamp(14px, 2.5vw, 24px);
          position: sticky;
          top: 0;
          z-index: 10;
          background: rgba(240, 249, 255, 0.82);
          backdrop-filter: blur(22px);
          -webkit-backdrop-filter: blur(22px);
          border-bottom: 1.5px solid rgba(147, 197, 253, 0.35);
        }

        .zpp-btn-volver {
          display: flex;
          align-items: center;
          gap: 5px;
          border: 1.5px solid rgba(56, 189, 248, 0.4);
          background: rgba(240, 249, 255, 0.7);
          color: #0369a1;
          font-family: 'DM Sans', sans-serif;
          font-size: clamp(11px, 1.3vw, 13px);
          font-weight: 700;
          padding: clamp(7px, 1.2vw, 9px) clamp(12px, 2vw, 15px);
          border-radius: clamp(12px, 2vw, 16px);
          cursor: pointer;
          transition: all 0.18s;
          flex-shrink: 0;
          min-height: 38px;
        }
        .zpp-btn-volver:hover {
          background: rgba(56, 189, 248, 0.15);
          border-color: #38bdf8;
          transform: translateX(-2px);
        }

        .zpp-header-info {
          flex: 1;
          min-width: 0;
        }
        .zpp-header-label {
          font-family: 'DM Sans', sans-serif;
          font-size: clamp(8px, 1vw, 10px);
          font-weight: 700;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: #0369a1;
        }
        .zpp-header-title {
          font-family: 'Kameron', serif;
          font-size: clamp(15px, 2.5vw, 20px);
          font-weight: 700;
          color: #0c2340;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          line-height: 1.2;
          margin-top: 2px;
        }

        /* ── HERO CARD ── */
        .zpp-hero {
          margin: clamp(14px, 2.5vw, 20px) clamp(14px, 2.5vw, 24px) 0;
          background: rgba(255, 255, 255, 0.88);
          backdrop-filter: blur(28px);
          -webkit-backdrop-filter: blur(28px);
          border: 1.5px solid rgba(255, 255, 255, 0.9);
          border-radius: clamp(20px, 3.5vw, 28px);
          box-shadow:
            0 20px 60px rgba(14, 120, 180, 0.16),
            0 8px 24px rgba(14, 120, 180, 0.1),
            inset 0 1px 0 rgba(255, 255, 255, 1);
          overflow: hidden;
          animation: zpp-fadeUp 0.45s ease both;
        }
        .zpp-hero-bar {
          height: 4px;
          background: linear-gradient(90deg, #38bdf8, #7dd3fc, #38bdf8);
          background-size: 200% 100%;
          animation: zpp-shimmer 2s linear infinite;
        }
        @keyframes zpp-shimmer {
          from { background-position: 0% 0%; }
          to { background-position: 200% 0%; }
        }
        .zpp-hero-body {
          padding: clamp(14px, 2.5vw, 22px) clamp(14px, 2.5vw, 24px);
        }
        .zpp-hero-subtitle {
          font-family: 'DM Sans', sans-serif;
          font-size: clamp(9px, 1vw, 11px);
          font-weight: 700;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: #0369a1;
          margin-bottom: 4px;
        }
        .zpp-hero-name {
          font-family: 'Kameron', serif;
          font-size: clamp(17px, 3vw, 24px);
          font-weight: 700;
          color: #0c2340;
          line-height: 1.25;
        }
        .zpp-hero-meta {
          font-family: 'DM Sans', sans-serif;
          font-size: clamp(11px, 1.5vw, 13px);
          color: #475569;
          margin-top: 6px;
          font-weight: 500;
        }
        .zpp-ws-dot {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          font-size: clamp(9px, 1vw, 11px);
          color: #16a34a;
          font-weight: 600;
          margin-top: 8px;
        }
        .zpp-ws-dot::before {
          content: '';
          display: block;
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #22c55e;
          animation: zpp-pulse 1.8s infinite;
        }
        @keyframes zpp-pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(0.8); }
        }

        /* ── CONTENT ── */
        .zpp-content {
          padding: clamp(14px, 2.5vw, 20px) clamp(14px, 2.5vw, 24px);
        }

        /* ── FOOTER ── */
        .zpp-footer {
          text-align: center;
          padding: clamp(20px, 3vw, 28px) 16px 0;
          border-top: 1px solid rgba(147, 197, 253, 0.25);
          margin: clamp(16px, 3vw, 24px) clamp(14px, 2.5vw, 24px) 0;
        }
        .zpp-footer-text {
          font-family: 'DM Sans', sans-serif;
          font-size: clamp(10px, 1.2vw, 12px);
          color: #475569;
          font-weight: 500;
        }
        .zpp-footer-brand {
          font-family: 'Kameron', serif;
          font-weight: 700;
          color: #0ea5e9;
        }

        @keyframes zpp-fadeUp {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      <div className="zpp-root">
        <div className="zpp-bubble zpp-bubble-1" />
        <div className="zpp-bubble zpp-bubble-2" />
        <div className="zpp-bubble zpp-bubble-3" />
        <div className="zpp-bubble zpp-bubble-4" />

        <div className="zpp-inner">

          <div className="zpp-header">
            <button onClick={() => navigate(-1)} className="zpp-btn-volver">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="15 18 9 12 15 6" />
              </svg>
              Volver
            </button>
            <div className="zpp-header-info">
              <p className="zpp-header-label">Gestión de participantes</p>
              <p className="zpp-header-title">{evento?.nombre || 'Cargando...'}</p>
            </div>
          </div>

          <div className="zpp-hero">
            <div className="zpp-hero-bar" />
            <div className="zpp-hero-body">
              <p className="zpp-hero-subtitle">Evento activo</p>
              <p className="zpp-hero-name">{evento?.nombre || '...'}</p>
              {evento?.fecha && (
                <p className="zpp-hero-meta">📅 {new Date(evento.fecha).toLocaleDateString('es-CO', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
              )}
              <p className="zpp-ws-dot">Sincronización en tiempo real activa</p>
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

          <div className="zpp-footer">
            <p className="zpp-footer-text">
              <span className="zpp-footer-brand">Zeno Marketing</span> · Gestión de participantes
            </p>
          </div>

        </div>
      </div>
    </>
  )
}