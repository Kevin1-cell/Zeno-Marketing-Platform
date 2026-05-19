import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import toast, { Toaster } from 'react-hot-toast'
import { Lock, User, ArrowLeft, ShieldCheck } from 'lucide-react'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const login = useAuthStore((s) => s.login)
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    const ok = await login(email, password)
    setLoading(false)
    if (ok) {
      toast.success('Bienvenido')
      navigate('/dashboard')
    } else {
      toast.error('Credenciales incorrectas')
    }
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Kameron:wght@400;700&family=DM+Sans:wght@400;500;600;700&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        /* ─── PAGE ─── */
        .zl-page {
          min-height: 100vh;
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: clamp(16px, 3vw, 48px) clamp(12px, 4vw, 24px);
          font-family: 'DM Sans', sans-serif;
          position: relative;
          overflow: hidden;
          background:
            radial-gradient(ellipse 70% 50% at 15% 15%, #93c5fd55 0%, transparent 60%),
            radial-gradient(ellipse 60% 60% at 85% 85%, #7dd3fc44 0%, transparent 60%),
            radial-gradient(ellipse 100% 80% at 50% 50%, #e0f7ff 0%, #cde8f5 100%);
        }

        /* ─── BURBUJAS ─── */
        .zl-bubble { position: fixed; border-radius: 50%; pointer-events: none; z-index: 0; }
        .zl-b1 { width: clamp(200px,25vw,420px); height: clamp(200px,25vw,420px); background: radial-gradient(circle, #a5d8f388 0%, transparent 70%); top: -80px; left: -80px; animation: bf1 9s ease-in-out infinite; }
        .zl-b2 { width: clamp(140px,18vw,300px); height: clamp(140px,18vw,300px); background: radial-gradient(circle, #7ec8e366 0%, transparent 70%); bottom: 5%; right: -50px; animation: bf2 11s ease-in-out infinite; }
        .zl-b3 { width: clamp(80px,10vw,160px); height: clamp(80px,10vw,160px); background: radial-gradient(circle, #93c5fd55 0%, transparent 70%); top: 40%; left: -30px; animation: bf1 14s ease-in-out infinite reverse; }
        .zl-b4 { width: clamp(60px,7vw,120px); height: clamp(60px,7vw,120px); background: radial-gradient(circle, #60a5fa44 0%, transparent 70%); top: 15%; right: 10%; animation: bf2 8s ease-in-out infinite; }
        @keyframes bf1 { 0%,100%{transform:translate(0,0) scale(1)} 33%{transform:translate(18px,-14px) scale(1.04)} 66%{transform:translate(-10px,18px) scale(0.97)} }
        @keyframes bf2 { 0%,100%{transform:translate(0,0) scale(1)} 50%{transform:translate(-16px,-20px) scale(1.06)} }

        /* ─── LAYOUT: mobile=columna, desktop=dos columnas ─── */
        .zl-layout {
          position: relative;
          z-index: 10;
          width: 100%;
          max-width: min(420px, 96vw);
          border-radius: clamp(24px, 3vw, 36px);
          overflow: hidden;
          background: rgba(255,255,255,0.88);
          backdrop-filter: blur(28px);
          -webkit-backdrop-filter: blur(28px);
          border: 1.5px solid rgba(255,255,255,0.92);
          box-shadow:
            0 clamp(16px,3vw,48px) clamp(40px,6vw,100px) rgba(14,120,180,0.22),
            0 clamp(4px,1vw,10px) clamp(16px,2vw,36px) rgba(14,120,180,0.12),
            0 2px 6px rgba(0,0,0,0.05),
            inset 0 1px 0 rgba(255,255,255,1);
          margin: 0 auto;
          display: flex;
          flex-direction: column;
        }

        @media (min-width: 768px) {
          .zl-layout {
            max-width: 780px;
            flex-direction: row;
            align-items: stretch;
            min-height: 500px;
          }
        }

        /* ─── COLUMNA IZQUIERDA ─── */
        .zl-col-left {
          position: relative;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          background: linear-gradient(160deg, #daf4fb 0%, #b8e5f5 60%, #a5d8f0 100%);
          min-height: clamp(130px, 24vw, 200px);
        }

        @media (min-width: 768px) {
          .zl-col-left {
            flex: 0 0 40%;
            min-height: unset;
            padding: 48px 32px;
            border-right: 1px solid rgba(147,197,253,0.35);
          }
        }

        .zl-col-left-bg {
          position: absolute; inset: 0;
          background:
            radial-gradient(ellipse 80% 60% at 30% 20%, rgba(255,255,255,0.55) 0%, transparent 60%),
            radial-gradient(ellipse 60% 80% at 80% 90%, rgba(14,165,233,0.12) 0%, transparent 60%);
          pointer-events: none;
        }

        /* Logo */
        .zl-logo-wrap {
          position: relative; z-index: 1;
          width: 100%;
          padding: 16px 24px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        @media (min-width: 768px) {
          .zl-logo-wrap {
            padding: 0;
            flex-direction: column;
            gap: 24px;
          }
        }

        .zl-logo-wrap img {
          width: 100%;
          max-width: 240px;
          height: auto;
          display: block;
          animation: logoFloat 3.5s ease-in-out infinite;
          filter: drop-shadow(0 8px 24px rgba(14,120,180,0.18));
        }
        @media (min-width: 768px) {
          .zl-logo-wrap img { max-width: 180px; }
        }
        @keyframes logoFloat {
          0%,100% { transform: translateY(0px) scale(1); }
          50%      { transform: translateY(-8px) scale(1.015); }
        }

        /* Branding text — solo desktop */
        .zl-brand-text { display: none; }
        @media (min-width: 768px) {
          .zl-brand-text {
            display: block;
            text-align: center;
            position: relative; z-index: 1;
          }
          .zl-brand-name {
            font-family: 'Kameron', serif;
            font-size: 24px;
            font-weight: 700;
            color: #0c2340;
            letter-spacing: -0.01em;
          }
          .zl-brand-tag {
            font-size: 10px;
            font-weight: 700;
            letter-spacing: 0.22em;
            text-transform: uppercase;
            color: #0284c7;
            margin-top: 4px;
          }
          /* Pill "panel seguro" */
          .zl-secure-pill {
            display: inline-flex;
            align-items: center;
            gap: 6px;
            background: rgba(255,255,255,0.75);
            border: 1.5px solid rgba(56,189,248,0.3);
            border-radius: 50px;
            padding: 5px 14px;
            font-size: 12px;
            font-weight: 600;
            color: #0369a1;
            margin-top: 18px;
            backdrop-filter: blur(6px);
          }
        }

        /* Botón volver — siempre en esquina superior izquierda del col-left */
        .zl-btn-volver {
          position: absolute;
          top: clamp(10px, 1.5vw, 14px);
          left: clamp(10px, 1.5vw, 14px);
          z-index: 20;
          display: flex;
          align-items: center;
          gap: 5px;
          background: rgba(255,255,255,0.9);
          border: 1.5px solid rgba(14,165,233,0.3);
          color: #0369a1;
          font-family: 'DM Sans', sans-serif;
          font-size: clamp(12px, 1.2vw, 14px);
          font-weight: 700;
          padding: 7px 16px;
          border-radius: 50px;
          cursor: pointer;
          backdrop-filter: blur(10px);
          transition: all 0.2s;
          box-shadow: 0 2px 12px rgba(14,165,233,0.15);
          white-space: nowrap;
        }
        .zl-btn-volver:hover {
          background: #fff;
          border-color: #0ea5e9;
          box-shadow: 0 4px 18px rgba(14,165,233,0.28);
        }

        /* ─── COLUMNA DERECHA ─── */
        .zl-col-right {
          display: flex;
          flex-direction: column;
          flex: 1;
          min-width: 0;
        }

        /* Título móvil */
        .zl-title-mobile {
          text-align: center;
          padding: 16px 24px 0;
        }
        .zl-title-mobile h1 {
          font-family: 'Kameron', serif;
          font-size: clamp(20px, 4vw, 24px);
          font-weight: 700;
          color: #0c2340;
        }
        .zl-title-mobile p {
          font-size: 12px;
          color: #475569;
          font-weight: 500;
          margin-top: 4px;
        }
        @media (min-width: 768px) {
          .zl-title-mobile { display: none; }
        }

        /* Divisor — solo móvil */
        .zl-divider-mobile {
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(56,189,248,0.3), transparent);
          margin: 12px 24px 0;
        }
        @media (min-width: 768px) {
          .zl-divider-mobile { display: none; }
        }

        /* Header desktop */
        .zl-col-right-header { display: none; }
        @media (min-width: 768px) {
          .zl-col-right-header {
            display: flex;
            align-items: center;
            gap: 14px;
            padding: 28px 32px 20px;
            border-bottom: 1px solid rgba(147,197,253,0.25);
          }
          .zl-col-right-header-icon {
            width: 44px; height: 44px;
            border-radius: 50%;
            background: linear-gradient(135deg, #e0f2fe 0%, #bae6fd 100%);
            border: 2px solid rgba(56,189,248,0.3);
            display: flex; align-items: center; justify-content: center;
            color: #0284c7;
            flex-shrink: 0;
            box-shadow: 0 3px 12px rgba(14,165,233,0.15);
          }
          .zl-col-right-header h2 {
            font-family: 'Kameron', serif;
            font-size: 20px;
            font-weight: 700;
            color: #0c2340;
          }
          .zl-col-right-header p {
            font-size: 12px;
            color: #475569;
            font-weight: 500;
            margin-top: 2px;
          }
        }

        /* ─── BODY ─── */
        .zl-body {
          flex: 1;
          padding: clamp(16px, 2vw, 24px) clamp(20px, 3vw, 32px) clamp(20px, 2.5vw, 28px);
          display: flex;
          flex-direction: column;
          gap: clamp(12px, 1.8vw, 16px);
        }

        /* Icono central decorativo — solo móvil */
        .zl-icon-wrap {
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 4px 0;
        }
        .zl-icon-circle {
          width: clamp(52px, 8vw, 60px);
          height: clamp(52px, 8vw, 60px);
          border-radius: 50%;
          background: linear-gradient(135deg, #e0f2fe 0%, #bae6fd 100%);
          border: 2px solid rgba(56,189,248,0.3);
          display: flex; align-items: center; justify-content: center;
          color: #0284c7;
          box-shadow: 0 4px 16px rgba(14,165,233,0.18);
        }
        @media (min-width: 768px) {
          .zl-icon-wrap { display: none; }
        }

        /* Badge separador */
        .zl-badge-wrap {
          display: flex; align-items: center; justify-content: center; gap: 8px;
        }
        .zl-badge-line { flex: 1; height: 1px; background: linear-gradient(90deg, transparent, rgba(56,189,248,0.25)); }
        .zl-badge-line.right { background: linear-gradient(270deg, transparent, rgba(56,189,248,0.25)); }
        .zl-badge-text {
          font-size: clamp(9px,1vw,11px); font-weight: 700;
          letter-spacing: 0.2em; text-transform: uppercase;
          color: #0284c7; white-space: nowrap;
        }
        @media (min-width: 768px) {
          .zl-badge-wrap { display: none; }
        }

        /* ─── LABEL ─── */
        .zl-lbl {
          display: block;
          font-size: clamp(9px,1vw,11px);
          font-weight: 700;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: #0369a1;
          margin-bottom: 7px;
        }

        /* ─── INPUT ─── */
        .zl-input-wrap { position: relative; }
        .zl-input-icon {
          position: absolute; left: 14px; top: 50%; transform: translateY(-50%);
          color: #7dd3fc; pointer-events: none; transition: color 0.2s;
        }
        .zl-input-wrap:focus-within .zl-input-icon { color: #0ea5e9; }
        .zl-input {
          width: 100%;
          background: rgba(240,249,255,0.8);
          border: 2px solid rgba(147,197,253,0.5);
          border-radius: clamp(12px,1.5vw,16px);
          padding: clamp(11px,1.3vw,13px) 16px clamp(11px,1.3vw,13px) 44px;
          color: #0c2340;
          font-family: 'DM Sans', sans-serif;
          font-size: clamp(13px,1.2vw,15px);
          font-weight: 600;
          outline: none;
          transition: all 0.2s;
          -webkit-appearance: none;
        }
        .zl-input::placeholder { color: #93c5fd; font-weight: 400; }
        .zl-input:focus {
          border-color: #38bdf8;
          background: #f0f9ff;
          box-shadow: 0 0 0 3px rgba(56,189,248,0.12);
        }

        /* ─── BTN PRIMARY ─── */
        .zl-btn-primary {
          width: 100%;
          padding: clamp(12px,1.3vw,15px);
          border-radius: clamp(16px,2vw,22px);
          border: none;
          background: linear-gradient(135deg, #38bdf8 0%, #0ea5e9 50%, #0284c7 100%);
          color: #fff;
          font-family: 'Kameron', serif;
          font-size: clamp(15px,1.6vw,18px);
          font-weight: 700;
          cursor: pointer;
          transition: all 0.2s;
          box-shadow: 0 6px 24px rgba(14,165,233,0.4);
          display: flex; align-items: center; justify-content: center; gap: 8px;
          margin-top: 4px;
        }
        .zl-btn-primary:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 10px 32px rgba(14,165,233,0.5); }
        .zl-btn-primary:active:not(:disabled) { transform: translateY(0); }
        .zl-btn-primary:disabled { opacity: 0.5; cursor: not-allowed; }

        /* ─── SPINNER ─── */
        .zl-spinner {
          width: clamp(14px,1.4vw,16px); height: clamp(14px,1.4vw,16px);
          border: 2px solid rgba(255,255,255,0.35);
          border-top-color: #fff;
          border-radius: 50%;
          animation: spin 0.7s linear infinite;
          flex-shrink: 0;
        }
        @keyframes spin { to { transform: rotate(360deg); } }

        /* ─── FOOTER ─── */
        .zl-footer {
          text-align: center;
          padding: clamp(12px,1.2vw,14px) clamp(16px,2.5vw,32px);
          border-top: 1px solid rgba(147,197,253,0.35);
          font-size: clamp(10px,1vw,12px);
          color: #64748b;
          font-weight: 500;
          line-height: 1.6;
        }

        /* ─── FADE UP ─── */
        .zl-fade-up { animation: fadeUp 0.4s ease both; }
        @keyframes fadeUp { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:translateY(0)} }
      `}</style>

      <Toaster
        position="top-center"
        toastOptions={{
          style: {
            background: '#fff', color: '#0c2340',
            border: '1.5px solid #bae6fd', borderRadius: '14px',
            fontSize: '13px', fontFamily: "'DM Sans', sans-serif",
            boxShadow: '0 4px 20px rgba(14,165,233,0.18)',
          },
        }}
      />

      <div className="zl-page">
        <div className="zl-bubble zl-b1" />
        <div className="zl-bubble zl-b2" />
        <div className="zl-bubble zl-b3" />
        <div className="zl-bubble zl-b4" />

        <div className="zl-layout">

          {/* ── Columna izquierda: logo + branding ── */}
          <div className="zl-col-left">
            <div className="zl-col-left-bg" />
            <div className="zl-logo-wrap">
              <img src="/zeno-logo.png" alt="Zeno Marketing" />
              {/* Branding solo desktop */}
              <div className="zl-brand-text">
                <p className="zl-brand-name">Zeno Marketing</p>
                <p className="zl-brand-tag">Panel de Administración</p>
                <div className="zl-secure-pill">
                  <ShieldCheck size={14} />
                  Acceso seguro y privado
                </div>
              </div>
            </div>
            {/* Botón volver */}
            <button onClick={() => navigate('/')} className="zl-btn-volver">
              <ArrowLeft size={13} />
              Volver
            </button>
          </div>

          {/* ── Columna derecha: formulario ── */}
          <div className="zl-col-right">

            {/* Título solo móvil */}
            <div className="zl-title-mobile">
              <h1>Zeno Marketing</h1>
              <p>Acceso al panel de administración</p>
            </div>
            <div className="zl-divider-mobile" />

            {/* Header desktop */}
            <div className="zl-col-right-header">
              <div className="zl-col-right-header-icon">
                <Lock size={20} strokeWidth={1.8} />
              </div>
              <div>
                <h2>Iniciar sesión</h2>
                <p>Acceso exclusivo para administradores</p>
              </div>
            </div>

            {/* Body */}
            <div className="zl-body zl-fade-up">

              {/* Icono central — solo móvil */}
              <div className="zl-icon-wrap">
                <div className="zl-icon-circle">
                  <Lock size={24} strokeWidth={1.8} />
                </div>
              </div>

              <div className="zl-badge-wrap">
                <div className="zl-badge-line" />
                <span className="zl-badge-text">Inicio de Sesión</span>
                <div className="zl-badge-line right" />
              </div>

              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div>
                  <label className="zl-lbl">Usuario</label>
                  <div className="zl-input-wrap">
                    <User size={17} className="zl-input-icon" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="zl-input"
                      placeholder="correo@ejemplo.com"
                      required
                      autoComplete="email"
                    />
                  </div>
                </div>

                <div>
                  <label className="zl-lbl">Contraseña</label>
                  <div className="zl-input-wrap">
                    <Lock size={17} className="zl-input-icon" />
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="zl-input"
                      placeholder="••••••••"
                      required
                      autoComplete="current-password"
                    />
                  </div>
                </div>

                <button type="submit" disabled={loading} className="zl-btn-primary">
                  {loading && <span className="zl-spinner" />}
                  {loading ? 'Ingresando...' : 'Ingresar al panel'}
                </button>
              </form>
            </div>

            <div className="zl-footer">
              Acceso exclusivo para administradores del sistema
            </div>
          </div>

        </div>
      </div>
    </>
  )
}