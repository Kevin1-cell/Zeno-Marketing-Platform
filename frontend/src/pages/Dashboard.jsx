import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import axios from 'axios'
import EventosList from '../components/EventosList'
import { LogOut, CalendarDays, Users, Shuffle } from 'lucide-react'

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
        .zd-bubble { position: fixed; border-radius: 50%; pointer-events: none; }
        .zd-b1 { width: clamp(200px,30vw,380px); height: clamp(200px,30vw,380px); background: radial-gradient(circle,#a5d8f388 0%,transparent 70%); top: -80px; left: -80px; animation: bf1 9s ease-in-out infinite; }
        .zd-b2 { width: clamp(140px,20vw,260px); height: clamp(140px,20vw,260px); background: radial-gradient(circle,#7ec8e366 0%,transparent 70%); bottom: 5%; right: -50px; animation: bf2 11s ease-in-out infinite; }
        .zd-b3 { width: clamp(80px,10vw,140px); height: clamp(80px,10vw,140px); background: radial-gradient(circle,#93c5fd55 0%,transparent 70%); top: 40%; left: -30px; animation: bf1 14s ease-in-out infinite reverse; }
        .zd-b4 { width: clamp(60px,7vw,110px); height: clamp(60px,7vw,110px); background: radial-gradient(circle,#60a5fa44 0%,transparent 70%); top: 15%; right: 10%; animation: bf2 8s ease-in-out infinite; }
        @keyframes bf1 { 0%,100%{transform:translate(0,0) scale(1)} 33%{transform:translate(18px,-14px) scale(1.04)} 66%{transform:translate(-10px,18px) scale(0.97)} }
        @keyframes bf2 { 0%,100%{transform:translate(0,0) scale(1)} 50%{transform:translate(-16px,-20px) scale(1.06)} }

        /* Header */
        .zd-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          max-width: 1100px;
          margin: 0 auto clamp(18px,3vw,32px);
          gap: 12px;
          flex-wrap: wrap;
        }
        .zd-header-logo {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .zd-logo-img {
          height: clamp(32px,5vw,42px);
          width: auto;
          animation: logoFloat 3.5s ease-in-out infinite;
        }
        @keyframes logoFloat { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-5px)} }
        .zd-header-title {
          font-family: 'Kameron', serif;
          font-size: clamp(20px,3vw,26px);
          font-weight: 700;
          color: #0c2340;
        }
        .zd-header-title span { color: #0ea5e9; }

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
          padding: clamp(8px,1vw,10px) clamp(14px,2vw,20px);
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
        }

        /* Stats */
        .zd-stats {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: clamp(10px,2vw,18px);
          max-width: 1100px;
          margin: 0 auto clamp(16px,2.5vw,28px);
        }
        @media (max-width: 480px) {
          .zd-stats { grid-template-columns: 1fr; }
        }
        .zd-stat-card {
          background: rgba(255,255,255,0.88);
          backdrop-filter: blur(28px);
          border: 1.5px solid rgba(255,255,255,0.9);
          border-radius: clamp(18px,3vw,24px);
          box-shadow: 0 8px 32px rgba(14,120,180,0.14);
          padding: clamp(14px,2vw,22px) clamp(16px,2.5vw,26px);
          position: relative;
          overflow: hidden;
          animation: fadeUp 0.38s ease both;
        }
        .zd-stat-bar {
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 3px;
          background: linear-gradient(90deg, #38bdf8, #7dd3fc, #38bdf8);
          background-size: 200%;
          animation: shimmer 2s linear infinite;
        }
        @keyframes shimmer { 0%{background-position:0%} 100%{background-position:200%} }
        .zd-stat-icon {
          width: 36px; height: 36px;
          border-radius: 10px;
          background: linear-gradient(135deg, #e0f2fe, #bae6fd);
          border: 1px solid rgba(56,189,248,0.3);
          display: flex; align-items: center; justify-content: center;
          color: #0284c7;
          margin-bottom: 10px;
        }
        .zd-stat-lbl {
          font-size: clamp(9px,1vw,11px);
          font-weight: 700;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: #0369a1;
          margin-bottom: 5px;
        }
        .zd-stat-val {
          font-family: 'Kameron', serif;
          font-size: clamp(26px,4vw,36px);
          font-weight: 700;
          color: #0c2340;
          line-height: 1;
        }
        .zd-stat-sub {
          font-size: 11px;
          color: #475569;
          margin-top: 3px;
        }

        /* Main card */
        .zd-main-card {
          max-width: 1100px;
          margin: 0 auto;
          background: rgba(255,255,255,0.88);
          backdrop-filter: blur(28px);
          border: 1.5px solid rgba(255,255,255,0.9);
          border-radius: clamp(22px,4vw,32px);
          box-shadow:
            0 clamp(16px,4vw,40px) clamp(40px,8vw,100px) rgba(14,120,180,0.22),
            0 clamp(4px,1vw,10px) clamp(16px,3vw,36px) rgba(14,120,180,0.12),
            inset 0 1px 0 rgba(255,255,255,1);
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
        .zd-card-body {
          padding: clamp(16px,2.5vw,24px) clamp(20px,3vw,32px);
        }

        /* Empty state */
        .zd-empty {
          text-align: center;
          padding: clamp(32px,5vw,56px) 20px;
        }
        .zd-empty-icon {
          width: 64px; height: 64px;
          border-radius: 20px;
          background: linear-gradient(135deg, #e0f2fe, #bae6fd);
          border: 1.5px solid rgba(56,189,248,0.3);
          display: flex; align-items: center; justify-content: center;
          color: #7dd3fc;
          margin: 0 auto 14px;
        }
        .zd-empty-title {
          font-family: 'Kameron', serif;
          font-size: clamp(16px,2.5vw,20px);
          font-weight: 700;
          color: #0c2340;
          margin-bottom: 6px;
        }
        .zd-empty-sub {
          font-size: 13px;
          color: #475569;
        }

        /* Footer */
        .zd-footer {
          text-align: center;
          padding: clamp(12px,1.5vw,16px) clamp(16px,3vw,28px);
          border-top: 1px solid rgba(147,197,253,0.25);
          font-size: clamp(10px,1.1vw,12px);
          color: #64748b;
          font-weight: 500;
        }

        /* Fade up */
        @keyframes fadeUp { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:translateY(0)} }
      `}</style>

      <div className="zd-page">
        <div className="zd-bubble zd-b1" />
        <div className="zd-bubble zd-b2" />
        <div className="zd-bubble zd-b3" />
        <div className="zd-bubble zd-b4" />

        {/* Header */}
        <div className="zd-header">
          <div className="zd-header-logo">
            <img src="/zeno-logo.png" alt="Zeno" className="zd-logo-img" />
            <span className="zd-header-title">Panel <span>Zeno</span></span>
          </div>
          <button
            className="zd-btn-logout"
            onClick={() => { useAuthStore.getState().logout(); window.location.href = '/' }}
          >
            <LogOut size={15} />
            Cerrar sesión
          </button>
        </div>

        {/* Stats */}
        <div className="zd-stats">
          <div className="zd-stat-card" style={{ animationDelay: '0.05s' }}>
            <div className="zd-stat-bar" />
            <div className="zd-stat-icon"><CalendarDays size={18} /></div>
            <div className="zd-stat-lbl">Eventos</div>
            <div className="zd-stat-val">{eventos.length}</div>
            <div className="zd-stat-sub">registrados</div>
          </div>
          <div className="zd-stat-card" style={{ animationDelay: '0.1s' }}>
            <div className="zd-stat-bar" />
            <div className="zd-stat-icon"><Users size={18} /></div>
            <div className="zd-stat-lbl">Participantes</div>
            <div className="zd-stat-val">
              {eventos.reduce((acc, e) => acc + (e.participantes?.length ?? 0), 0)}
            </div>
            <div className="zd-stat-sub">en total</div>
          </div>
          <div className="zd-stat-card" style={{ animationDelay: '0.15s' }}>
            <div className="zd-stat-bar" />
            <div className="zd-stat-icon"><Shuffle size={18} /></div>
            <div className="zd-stat-lbl">Sorteos</div>
            <div className="zd-stat-val">
              {eventos.reduce((acc, e) => acc + (e.sorteos?.length ?? 0), 0)}
            </div>
            <div className="zd-stat-sub">realizados</div>
          </div>
        </div>

        {/* Main card */}
        <div className="zd-main-card">
          <div className="zd-card-header">
            <span className="zd-card-title">Mis Eventos</span>
            {eventos.length > 0 && (
              <span className="zd-badge">{eventos.length} evento{eventos.length !== 1 ? 's' : ''}</span>
            )}
          </div>

          <div className="zd-card-body">
            {eventos.length === 0 ? (
              <div className="zd-empty">
                <div className="zd-empty-icon">
                  <CalendarDays size={28} />
                </div>
                <div className="zd-empty-title">Sin eventos aún</div>
                <div className="zd-empty-sub">Los eventos aparecerán aquí una vez creados</div>
              </div>
            ) : (
              <EventosList eventos={eventos} onSelectEvento={handleEventClick} />
            )}
          </div>

          <div className="zd-footer">
            Zeno Marketing — Panel de administración
          </div>
        </div>
      </div>
    </>
  )
}