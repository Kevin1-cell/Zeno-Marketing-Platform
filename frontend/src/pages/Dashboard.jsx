import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import axios from 'axios'
import EventosList from '../components/EventosList'
import { LogOut, CalendarDays, Sparkles } from 'lucide-react'

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
        setEventos([])
      }
    }
    if (token) fetchEventos()
  }, [token])

  const handleEventClick = (evento) => {
    navigate(`/evento/${evento.id}`)
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Kameron:wght@400;700&family=DM+Sans:wght@400;500;600;700&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        .zd-page {
          min-height: 100vh;
          width: 100%;
          padding: clamp(16px,3vw,32px) clamp(12px,3vw,28px);
          font-family: 'DM Sans', sans-serif;
          position: relative;
          overflow-x: hidden;
          background:
            radial-gradient(ellipse 70% 50% at 15% 15%, #93c5fd55 0%, transparent 60%),
            radial-gradient(ellipse 60% 60% at 85% 85%, #7dd3fc44 0%, transparent 60%),
            radial-gradient(ellipse 100% 80% at 50% 50%, #e0f7ff 0%, #cde8f5 100%);
        }

        /* Burbujas */
        .zd-bubble { position: fixed; border-radius: 50%; pointer-events: none; z-index: 0; }
        .zd-b1 { width: clamp(200px,30vw,380px); height: clamp(200px,30vw,380px); background: radial-gradient(circle,#a5d8f388 0%,transparent 70%); top: -80px; left: -80px; animation: bf1 9s ease-in-out infinite; }
        .zd-b2 { width: clamp(140px,20vw,260px); height: clamp(140px,20vw,260px); background: radial-gradient(circle,#7ec8e366 0%,transparent 70%); bottom: 5%; right: -50px; animation: bf2 11s ease-in-out infinite; }
        .zd-b3 { width: clamp(80px,10vw,140px); height: clamp(80px,10vw,140px); background: radial-gradient(circle,#93c5fd55 0%,transparent 70%); top: 40%; left: -30px; animation: bf1 14s ease-in-out infinite reverse; }
        .zd-b4 { width: clamp(60px,7vw,110px); height: clamp(60px,7vw,110px); background: radial-gradient(circle,#60a5fa44 0%,transparent 70%); top: 15%; right: 10%; animation: bf2 8s ease-in-out infinite; }
        @keyframes bf1 { 0%,100%{transform:translate(0,0) scale(1)} 33%{transform:translate(18px,-14px) scale(1.04)} 66%{transform:translate(-10px,18px) scale(0.97)} }
        @keyframes bf2 { 0%,100%{transform:translate(0,0) scale(1)} 50%{transform:translate(-16px,-20px) scale(1.06)} }

        /* HERO HEADER */
        .zd-hero {
          position: relative;
          z-index: 10;
          max-width: 1100px;
          margin: 0 auto clamp(20px, 3vw, 36px);
          background: rgba(255, 255, 255, 0.82);
          backdrop-filter: blur(32px);
          -webkit-backdrop-filter: blur(32px);
          border: 1.5px solid rgba(255, 255, 255, 0.95);
          border-radius: clamp(24px, 4vw, 36px);
          box-shadow:
            0 24px 64px rgba(14, 120, 180, 0.18),
            0 4px 16px rgba(14, 120, 180, 0.10),
            inset 0 1px 0 rgba(255,255,255,1);
          overflow: hidden;
          animation: fadeUp 0.4s ease both;
        }

        .zd-hero-bar {
          height: 4px;
          background: linear-gradient(90deg, #38bdf8, #7dd3fc, #0ea5e9, #38bdf8);
          background-size: 300%;
          animation: barFlow 3.5s linear infinite;
        }
        @keyframes barFlow { 0%{background-position:0%} 100%{background-position:300%} }

        .zd-hero-inner {
          padding: clamp(20px, 3vw, 32px) clamp(20px, 3.5vw, 40px);
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: clamp(16px, 2.5vw, 28px);
        }

        .zd-hero-left {
          display: flex;
          align-items: center;
          gap: clamp(14px, 2.5vw, 22px);
          flex: 1;
          min-width: 0;
        }

        .zd-logo-wrap {
          position: relative;
          flex-shrink: 0;
        }
        .zd-logo-glow {
          position: absolute;
          inset: -8px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(56, 189, 248, 0.35) 0%, transparent 70%);
          animation: glowPulse 2.8s ease-in-out infinite;
        }
        @keyframes glowPulse { 0%,100%{opacity:0.6; transform:scale(1)} 50%{opacity:1; transform:scale(1.12)} }
        .zd-logo-img {
          position: relative;
          height: clamp(48px, 7vw, 64px);
          width: auto;
          animation: logoFloat 3.5s ease-in-out infinite;
          filter: drop-shadow(0 4px 12px rgba(14, 165, 233, 0.3));
        }
        @keyframes logoFloat { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-5px)} }

        .zd-hero-texts { min-width: 0; }
        .zd-hero-eyebrow {
          display: flex;
          align-items: center;
          gap: 6px;
          font-family: 'DM Sans', sans-serif;
          font-size: clamp(9px, 1vw, 11px);
          font-weight: 700;
          letter-spacing: 0.22em;
          text-transform: uppercase;
          color: #0ea5e9;
          margin-bottom: 4px;
        }
        .zd-hero-eyebrow-dot {
          width: 5px; height: 5px; border-radius: 50%;
          background: #38bdf8;
          animation: dotPulse 1.8s ease-in-out infinite;
        }
        @keyframes dotPulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.5;transform:scale(0.7)} }

        .zd-hero-title {
          font-family: 'Kameron', serif;
          font-size: clamp(24px, 4vw, 38px);
          font-weight: 700;
          color: #0c2340;
          line-height: 1.05;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .zd-hero-title-accent {
          background: linear-gradient(135deg, #0ea5e9 0%, #38bdf8 50%, #0284c7 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .zd-hero-subtitle {
          font-family: 'DM Sans', sans-serif;
          font-size: clamp(11px, 1.3vw, 13px);
          color: #475569;
          margin-top: 4px;
          font-weight: 500;
        }

        .zd-hero-divider {
          width: 1px;
          height: clamp(44px, 6vw, 60px);
          background: linear-gradient(to bottom, transparent, rgba(56,189,248,0.4), transparent);
          flex-shrink: 0;
        }

        .zd-hero-stat {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 2px;
          flex-shrink: 0;
        }
        .zd-hero-stat-num {
          font-family: 'Kameron', serif;
          font-size: clamp(32px, 5vw, 48px);
          font-weight: 700;
          color: #0c2340;
          line-height: 1;
          background: linear-gradient(135deg, #0c2340 0%, #0369a1 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .zd-hero-stat-label {
          font-family: 'DM Sans', sans-serif;
          font-size: clamp(9px, 1vw, 11px);
          font-weight: 700;
          letter-spacing: 0.16em;
          text-transform: uppercase;
          color: #64748b;
        }
        .zd-hero-stat-icon {
          width: clamp(28px, 4vw, 36px);
          height: clamp(28px, 4vw, 36px);
          border-radius: 10px;
          background: linear-gradient(135deg, #e0f2fe, #bae6fd);
          border: 1px solid rgba(56, 189, 248, 0.35);
          display: flex;
          align-items: center;
          justify-content: center;
          color: #0284c7;
          margin-bottom: 4px;
        }

        .zd-hero-right {
          display: flex;
          align-items: center;
          gap: 12px;
          flex-shrink: 0;
        }

        .zd-btn-logout {
          display: flex;
          align-items: center;
          gap: 7px;
          background: rgba(255,255,255,0.88);
          border: 1.5px solid rgba(56,189,248,0.4);
          color: #0369a1;
          font-family: 'DM Sans', sans-serif;
          font-size: clamp(12px,1.3vw,14px);
          font-weight: 700;
          padding: clamp(10px,1.2vw,12px) clamp(16px,2vw,22px);
          border-radius: 50px;
          cursor: pointer;
          backdrop-filter: blur(10px);
          transition: all 0.2s;
          box-shadow: 0 2px 12px rgba(14,165,233,0.12);
          white-space: nowrap;
        }
        .zd-btn-logout:hover {
          background: #fff;
          border-color: #0ea5e9;
          box-shadow: 0 4px 18px rgba(14,165,233,0.28);
          transform: translateY(-1px);
        }

        /* Main card */
        .zd-main-card {
          position: relative; z-index: 10;
          max-width: 1100px;
          margin: 0 auto;
          background: rgba(255,255,255,0.88);
          backdrop-filter: blur(28px);
          border: 1.5px solid rgba(255,255,255,0.9);
          border-radius: clamp(22px,4vw,32px);
          box-shadow: 0 clamp(16px,4vw,40px) clamp(40px,8vw,100px) rgba(14,120,180,0.22);
          overflow: hidden;
          animation: fadeUp 0.38s 0.1s ease both;
        }
        .zd-card-header {
          padding: clamp(16px,2.5vw,24px) clamp(20px,3vw,32px);
          border-bottom: 1px solid rgba(147,197,253,0.3);
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .zd-card-title {
          font-family: 'Kameron', serif;
          font-size: clamp(16px,2.5vw,20px);
          font-weight: 700;
          color: #0c2340;
          flex: 1;
        }
        .zd-badge {
          background: linear-gradient(135deg, #e0f2fe, #bae6fd);
          color: #0284c7;
          font-size: 11px;
          font-weight: 700;
          padding: 4px 12px;
          border-radius: 50px;
          border: 1px solid rgba(56,189,248,0.3);
        }
        .zd-card-body { padding: clamp(16px,2.5vw,24px) clamp(20px,3vw,32px); }

        .zd-empty { text-align: center; padding: clamp(32px,5vw,56px) 20px; }
        .zd-empty-icon {
          width: 64px; height: 64px; border-radius: 20px;
          background: linear-gradient(135deg, #e0f2fe, #bae6fd);
          display: flex; align-items: center; justify-content: center;
          color: #7dd3fc; margin: 0 auto 14px;
        }
        .zd-empty-title { font-family: 'Kameron', serif; font-size: 20px; font-weight: 700; color: #0c2340; }
        .zd-footer { text-align: center; padding: 16px; font-size: 12px; color: #64748b; border-top: 1px solid rgba(147,197,253,0.25); }

        @keyframes fadeUp { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:translateY(0)} }

        /* ══════════════════════════════════════
            AJUSTES ESPECÍFICOS PARA MÓVIL
        ══════════════════════════════════════ */
        @media (max-width: 640px) {
          .zd-hero-inner {
            padding: 20px;
            flex-direction: column;
            gap: 20px;
            text-align: center;
          }
          .zd-hero-left {
            flex-direction: column;
            width: 100%;
          }
          .zd-hero-eyebrow { justify-content: center; }
          .zd-hero-title { white-space: normal; }
          .zd-hero-divider { display: none; }
          .zd-hero-stat {
            flex-direction: row;
            background: rgba(56, 189, 248, 0.08);
            padding: 10px 20px;
            border-radius: 16px;
            width: fit-content;
          }
          .zd-hero-stat-icon { margin-bottom: 0; width: 28px; height: 28px; }
          .zd-hero-stat-num { font-size: 28px; }
          .zd-hero-right { width: 100%; justify-content: center; }
          .zd-btn-logout { width: 100%; justify-content: center; }
        }
      `}</style>

      <div className="zd-page">
        <div className="zd-bubble zd-b1" />
        <div className="zd-bubble zd-b2" />
        <div className="zd-bubble zd-b3" />
        <div className="zd-bubble zd-b4" />

        <div className="zd-hero">
          <div className="zd-hero-bar" />
          <div className="zd-hero-inner">
            <div className="zd-hero-left">
              <div className="zd-logo-wrap">
                <div className="zd-logo-glow" />
                <img src="/zeno-logo.png" alt="Zeno" className="zd-logo-img" />
              </div>
              <div className="zd-hero-texts">
                <div className="zd-hero-eyebrow">
                  <span className="zd-hero-eyebrow-dot" />
                  Panel de administración
                </div>
                <div className="zd-hero-title">
                  Panel <span className="zd-hero-title-accent">Zeno</span>
                </div>
                <div className="zd-hero-subtitle">
                  Gestión de eventos y participantes
                </div>
              </div>
            </div>

            <div className="zd-hero-divider" />
            <div className="zd-hero-stat">
              <div className="zd-hero-stat-icon">
                <CalendarDays size={16} />
              </div>
              <div className="zd-hero-stat-num">{eventos.length}</div>
              <div className="zd-hero-stat-label">Eventos</div>
            </div>
            <div className="zd-hero-divider" />

            <div className="zd-hero-right">
              <button
                className="zd-btn-logout"
                onClick={() => { useAuthStore.getState().logout(); window.location.href = '/' }}
              >
                <LogOut size={15} />
                Cerrar sesión
              </button>
            </div>
          </div>
        </div>

       <div className="zd-main-card">
  <div className="zd-card-header">
    <span className="zd-card-title">Mis Eventos</span>
    {eventos.length > 0 && (
      <span className="zd-badge">{eventos.length} evento{eventos.length !== 1 ? 's' : ''}</span>
    )}
  </div>
  <div className="zd-card-body">
    <EventosList eventos={eventos} onSelectEvento={handleEventClick} />
  </div>
  <div className="zd-footer">Zeno Marketing — Panel de administración</div>
</div>
      </div>
    </>
  )
}