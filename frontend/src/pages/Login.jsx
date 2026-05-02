import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import toast, { Toaster } from 'react-hot-toast'
import { Lock, User, ArrowLeft } from 'lucide-react'

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

        /* Burbujas fondo */
        .zl-bubble { position: fixed; border-radius: 50%; pointer-events: none; }
        .zl-b1 { width: clamp(200px,30vw,380px); height: clamp(200px,30vw,380px); background: radial-gradient(circle, #a5d8f388 0%, transparent 70%); top: -80px; left: -80px; animation: bf1 9s ease-in-out infinite; }
        .zl-b2 { width: clamp(140px,20vw,260px); height: clamp(140px,20vw,260px); background: radial-gradient(circle, #7ec8e366 0%, transparent 70%); bottom: 5%; right: -50px; animation: bf2 11s ease-in-out infinite; }
        .zl-b3 { width: clamp(80px,10vw,140px); height: clamp(80px,10vw,140px); background: radial-gradient(circle, #93c5fd55 0%, transparent 70%); top: 40%; left: -30px; animation: bf1 14s ease-in-out infinite reverse; }
        .zl-b4 { width: clamp(60px,7vw,110px); height: clamp(60px,7vw,110px); background: radial-gradient(circle, #60a5fa44 0%, transparent 70%); top: 15%; right: 10%; animation: bf2 8s ease-in-out infinite; }
        @keyframes bf1 { 0%,100%{transform:translate(0,0) scale(1)} 33%{transform:translate(18px,-14px) scale(1.04)} 66%{transform:translate(-10px,18px) scale(0.97)} }
        @keyframes bf2 { 0%,100%{transform:translate(0,0) scale(1)} 50%{transform:translate(-16px,-20px) scale(1.06)} }

        /* Tarjeta */
        .zl-card {
          position: relative;
          z-index: 10;
          width: 100%;
          max-width: min(420px, 96vw);
          border-radius: clamp(24px, 4vw, 36px);
          overflow: hidden;
          background: rgba(255,255,255,0.88);
          backdrop-filter: blur(28px);
          -webkit-backdrop-filter: blur(28px);
          border: 1.5px solid rgba(255,255,255,0.92);
          box-shadow:
            0 clamp(16px,4vw,40px) clamp(40px,8vw,100px) rgba(14,120,180,0.22),
            0 clamp(4px,1vw,10px) clamp(16px,3vw,36px) rgba(14,120,180,0.12),
            0 2px 6px rgba(0,0,0,0.05),
            inset 0 1px 0 rgba(255,255,255,1);
          margin: 0 auto;
        }

        /* Logo hero */
        .zl-logo-hero {
          width: 100%;
          position: relative;
          overflow: hidden;
          background: linear-gradient(180deg, #daf0fb 0%, rgba(224,247,255,0) 100%);
          min-height: clamp(130px, 24vw, 210px);
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .zl-logo-hero img {
          width: 100%;
          max-width: 100%;
          height: auto;
          display: block;
          animation: logoFloat 3.5s ease-in-out infinite;
        }
        @keyframes logoFloat {
          0%,100% { transform: translateY(0px) scale(1); }
          50%      { transform: translateY(-7px) scale(1.012); }
        }

        /* Botón volver — esquina superior izquierda sobre el logo */
        .zl-btn-volver {
          position: absolute;
          top: clamp(10px, 2vw, 16px);
          left: clamp(10px, 2vw, 16px);
          z-index: 20;
          display: flex;
          align-items: center;
          gap: 5px;
          background: rgba(255,255,255,0.9);
          border: 1.5px solid rgba(14,165,233,0.3);
          color: #0369a1;
          font-family: 'DM Sans', sans-serif;
          font-size: clamp(12px, 1.3vw, 14px);
          font-weight: 700;
          padding: clamp(6px,1vw,9px) clamp(12px,1.8vw,18px);
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

        /* Body */
        .zl-body {
          padding: clamp(8px,1.5vw,14px) clamp(20px,4vw,32px) clamp(22px,3.5vw,32px);
          display: flex;
          flex-direction: column;
          gap: clamp(12px,2vw,18px);
        }

        /* Bloque título */
        .zl-title-block {
          text-align: center;
          padding: clamp(10px,1.5vw,16px) 0 clamp(4px,0.8vw,8px);
        }
        .zl-title {
          font-family: 'Kameron', serif;
          font-size: clamp(20px, 3.5vw, 26px);
          font-weight: 700;
          color: #0c2340;
          letter-spacing: -0.01em;
          line-height: 1.15;
        }
        .zl-subtitle {
          font-size: clamp(11px, 1.2vw, 13px);
          color: #475569;
          font-weight: 500;
          margin-top: 5px;
          line-height: 1.5;
        }

        /* Divider */
        .zl-divider {
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(56,189,248,0.3), transparent);
          margin: 0;
        }

        /* Insignia de acceso */
        .zl-badge-wrap {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          margin-bottom: 2px;
        }
        .zl-badge-line {
          flex: 1;
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(56,189,248,0.25));
        }
        .zl-badge-line.right {
          background: linear-gradient(270deg, transparent, rgba(56,189,248,0.25));
        }
        .zl-badge-text {
          font-size: clamp(9px, 1vw, 11px);
          font-weight: 700;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          color: #0284c7;
          white-space: nowrap;
        }

        /* Icono central decorativo */
        .zl-icon-wrap {
          display: flex;
          align-items: center;
          justify-content: center;
          margin: clamp(4px,1vw,8px) 0;
        }
        .zl-icon-circle {
          width: clamp(52px, 8vw, 64px);
          height: clamp(52px, 8vw, 64px);
          border-radius: 50%;
          background: linear-gradient(135deg, #e0f2fe 0%, #bae6fd 100%);
          border: 2px solid rgba(56,189,248,0.3);
          display: flex;
          align-items: center;
          justify-content: center;
          color: #0284c7;
          box-shadow: 0 4px 16px rgba(14,165,233,0.18);
        }

        /* Label */
        .zl-lbl {
          display: block;
          font-size: clamp(9px,1vw,11px);
          font-weight: 700;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: #0369a1;
          margin-bottom: 7px;
        }

        /* Input */
        .zl-input-wrap { position: relative; }
        .zl-input-icon {
          position: absolute;
          left: 14px;
          top: 50%;
          transform: translateY(-50%);
          color: #7dd3fc;
          pointer-events: none;
          transition: color 0.2s;
        }
        .zl-input-wrap:focus-within .zl-input-icon { color: #0ea5e9; }
        .zl-input {
          width: 100%;
          background: rgba(240,249,255,0.8);
          border: 2px solid rgba(147,197,253,0.5);
          border-radius: clamp(12px,2vw,16px);
          padding: clamp(11px,1.5vw,14px) 16px clamp(11px,1.5vw,14px) 44px;
          color: #0c2340;
          font-family: 'DM Sans', sans-serif;
          font-size: clamp(13px,1.5vw,15px);
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

        /* Botón primario */
        .zl-btn-primary {
          width: 100%;
          padding: clamp(13px,1.8vw,16px);
          border-radius: clamp(16px,2.5vw,22px);
          border: none;
          background: linear-gradient(135deg, #38bdf8 0%, #0ea5e9 50%, #0284c7 100%);
          color: #fff;
          font-family: 'Kameron', serif;
          font-size: clamp(16px,2vw,19px);
          font-weight: 700;
          cursor: pointer;
          transition: all 0.2s;
          box-shadow: 0 6px 24px rgba(14,165,233,0.4);
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          margin-top: 4px;
        }
        .zl-btn-primary:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 10px 32px rgba(14,165,233,0.5);
        }
        .zl-btn-primary:active:not(:disabled) { transform: translateY(0); }
        .zl-btn-primary:disabled { opacity: 0.5; cursor: not-allowed; }

        /* Spinner */
        .zl-spinner {
          width: clamp(14px,1.5vw,17px);
          height: clamp(14px,1.5vw,17px);
          border: 2px solid rgba(255,255,255,0.35);
          border-top-color: #fff;
          border-radius: 50%;
          animation: spin 0.7s linear infinite;
          flex-shrink: 0;
        }
        @keyframes spin { to { transform: rotate(360deg); } }

        /* Footer */
        .zl-footer {
          text-align: center;
          padding: clamp(12px,1.5vw,16px) clamp(16px,3vw,28px);
          border-top: 1px solid rgba(147,197,253,0.35);
          font-size: clamp(10px,1.1vw,12px);
          color: #64748b;
          font-weight: 500;
          line-height: 1.6;
        }

        /* Fade up */
        .zl-fade-up { animation: fadeUp 0.4s ease both; }
        @keyframes fadeUp { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:translateY(0)} }
      `}</style>

      <Toaster
        position="top-center"
        toastOptions={{
          style: {
            background: '#fff',
            color: '#0c2340',
            border: '1.5px solid #bae6fd',
            borderRadius: '14px',
            fontSize: '13px',
            fontFamily: "'DM Sans', sans-serif",
            boxShadow: '0 4px 20px rgba(14,165,233,0.18)',
          },
        }}
      />

      <div className="zl-page">
        <div className="zl-bubble zl-b1" />
        <div className="zl-bubble zl-b2" />
        <div className="zl-bubble zl-b3" />
        <div className="zl-bubble zl-b4" />

        <div className="zl-card">

          {/* Hero logo con botón volver encima */}
          <div className="zl-logo-hero">
            <img src="/zeno-logo.png" alt="Zeno Marketing" />
            <button onClick={() => navigate('/')} className="zl-btn-volver">
              <ArrowLeft size={13} />
              Volver
            </button>
          </div>

          {/* Título */}
          <div className="zl-title-block">
            <h1 className="zl-title">Zeno Marketing</h1>
            <p className="zl-subtitle">Acceso al panel de administración</p>
          </div>

          <div className="zl-divider" />

          {/* Body */}
          <div className="zl-body zl-fade-up">

            {/* Icono + badge */}
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
    </>
  )
}