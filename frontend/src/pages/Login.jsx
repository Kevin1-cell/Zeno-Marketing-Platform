import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import toast, { Toaster } from 'react-hot-toast'
import { Lock, User } from 'lucide-react'

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
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500&family=Oswald:wght@700&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        html, body, #root {
          height: 100%;
          overflow: hidden;
        }

        .zl-root {
          height: 100dvh;
          background: #030b18;
          display: flex;
          align-items: stretch;
          justify-content: center;
          font-family: 'DM Sans', sans-serif;
          position: relative;
          overflow: hidden;
        }

        /* ── Glow ambiental ── */
        .zl-bg-glow {
          position: fixed; inset: 0;
          z-index: 0; pointer-events: none;
        }
        .zl-bg-glow::before {
          content: '';
          position: absolute;
          top: -100px; left: 50%;
          transform: translateX(-50%);
          width: 500px; height: 350px;
          background: radial-gradient(ellipse, rgba(30,111,255,0.18) 0%, transparent 70%);
        }
        .zl-bg-glow::after {
          content: '';
          position: absolute;
          bottom: -60px; right: -80px;
          width: 350px; height: 350px;
          background: radial-gradient(ellipse, rgba(255,140,0,0.10) 0%, transparent 70%);
        }

        /* ── Card principal ── */
        .zl-card {
          position: relative; z-index: 1;
          width: 100%; max-width: 430px;
          height: 100dvh;
          background: linear-gradient(180deg, #0a1628 0%, #060e1c 100%);
          display: flex; flex-direction: column;
          border-left: 1px solid rgba(30,111,255,0.08);
          border-right: 1px solid rgba(30,111,255,0.08);
        }

        /* ── Top bar con botón Volver ── */
        .zl-topbar {
          flex-shrink: 0;
          display: flex; align-items: center;
          padding: 14px 16px 0;
        }
        .zl-btn-volver {
          display: flex; align-items: center; gap: 5px;
          background: rgba(30,111,255,0.12);
          border: 1px solid rgba(30,111,255,0.35);
          color: #7eb8ff;
          font-family: 'DM Sans', sans-serif;
          font-size: 12px; font-weight: 500;
          padding: 6px 14px; border-radius: 50px;
          cursor: pointer; transition: all 0.2s;
        }
        .zl-btn-volver:hover { background: rgba(30,111,255,0.24); color: #aed4ff; }
        .zl-btn-volver svg { width: 13px; height: 13px; stroke: currentColor; fill: none; stroke-width: 2; stroke-linecap: round; stroke-linejoin: round; }

        /* ── Logo ── */
        .zl-logo-wrap {
          flex-shrink: 0;
          display: flex; flex-direction: column; align-items: center;
          padding: 8px 16px 6px;
        }
        .zl-logo-img {
          width: clamp(120px, 38vw, 160px);
          height: auto;
          filter: drop-shadow(0 0 22px rgba(30,111,255,0.4)) drop-shadow(0 0 8px rgba(255,140,0,0.25));
          animation: logoFloat 4s ease-in-out infinite;
        }
        @keyframes logoFloat {
          0%, 100% { transform: translateY(0px); }
          50%       { transform: translateY(-6px); }
        }
        .zl-badge {
          margin-top: 4px;
          font-family: 'Syne', sans-serif;
          font-size: clamp(15px, 4.5vw, 19px);
          font-weight: 700;
          background: linear-gradient(90deg, #1e6fff, #ff8c00);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          letter-spacing: 0.04em;
        }

        /* ── Divider ── */
        .zl-divider {
          flex-shrink: 0;
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(30,111,255,0.2), transparent);
          margin: 6px 16px;
        }

        /* ── Body scrolleable ── */
        .zl-body {
          flex: 1;
          overflow-y: auto;
          overflow-x: hidden;
          padding: 20px 20px 32px;
          display: flex; flex-direction: column;
          justify-content: center;
          gap: 14px;
          -webkit-overflow-scrolling: touch;
          scrollbar-width: none;
        }
        .zl-body::-webkit-scrollbar { display: none; }

        /* ── Subtítulo ── */
        .zl-subtitle {
          text-align: center;
          color: rgba(148,180,220,0.5);
          font-size: 13px;
          margin-bottom: 4px;
        }

        /* ── Labels ── */
        .zl-label {
          display: block;
          font-size: 10px; font-weight: 500;
          letter-spacing: 0.08em; text-transform: uppercase;
          color: rgba(148,180,220,0.65);
          margin-bottom: 6px; padding-left: 2px;
        }

        /* ── Input wrapper con ícono ── */
        .zl-input-wrap {
          position: relative;
        }
        .zl-input-icon {
          position: absolute;
          left: 14px; top: 50%;
          transform: translateY(-50%);
          color: rgba(100,160,255,0.45);
          display: flex; align-items: center;
          pointer-events: none;
          transition: color 0.2s;
        }
        .zl-input {
          width: 100%;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(30,111,255,0.2);
          border-radius: 14px;
          padding: 13px 14px 13px 42px;
          color: #e0eeff;
          font-family: 'DM Sans', sans-serif;
          font-size: 15px; outline: none;
          transition: border-color 0.2s, box-shadow 0.2s;
          -webkit-appearance: none;
        }
        .zl-input::placeholder { color: rgba(148,180,220,0.28); }
        .zl-input:focus {
          border-color: rgba(30,111,255,0.65);
          box-shadow: 0 0 0 3px rgba(30,111,255,0.1);
        }
        .zl-input:focus + .zl-input-icon,
        .zl-input-wrap:focus-within .zl-input-icon {
          color: rgba(100,160,255,0.75);
        }

        /* ── Botón primario ── */
        .zl-btn-primary {
          width: 100%; padding: 15px; border-radius: 50px; border: none;
          background: linear-gradient(90deg, #1e6fff 0%, #ff8c00 100%);
          color: #fff;
          font-family: 'Syne', sans-serif;
          font-size: 15px; font-weight: 700; letter-spacing: 0.05em;
          cursor: pointer; position: relative; overflow: hidden;
          transition: opacity 0.2s, transform 0.15s;
          box-shadow: 0 4px 24px rgba(30,111,255,0.3);
          margin-top: 4px;
        }
        .zl-btn-primary::before {
          content: ''; position: absolute; inset: 0;
          background: linear-gradient(90deg, rgba(255,255,255,0.13) 0%, transparent 60%);
          pointer-events: none;
        }
        .zl-btn-primary:hover:not(:disabled) { opacity: 0.9; transform: translateY(-1px); }
        .zl-btn-primary:active:not(:disabled) { transform: translateY(0px) scale(0.98); }
        .zl-btn-primary:disabled { opacity: 0.45; cursor: not-allowed; }

        /* ── Spinner dentro del botón ── */
        .zl-spinner {
          display: inline-block;
          width: 15px; height: 15px;
          border: 2px solid rgba(255,255,255,0.35);
          border-top-color: #fff;
          border-radius: 50%;
          animation: spin 0.7s linear infinite;
          vertical-align: middle;
          margin-right: 8px;
        }
        @keyframes spin { to { transform: rotate(360deg); } }

        /* ── Línea decorativa de acento ── */
        .zl-accent-line {
          width: 40px; height: 2px;
          background: linear-gradient(90deg, #1e6fff, #ff8c00);
          border-radius: 2px;
          margin: 0 auto 6px;
        }
      `}</style>

      <Toaster
        position="top-center"
        toastOptions={{
          style: {
            background: '#0d1e38', color: '#e0eeff',
            border: '1px solid rgba(30,111,255,0.25)',
            borderRadius: '12px', fontSize: '13px',
            fontFamily: 'DM Sans, sans-serif',
          },
        }}
      />

      <div className="zl-root">
        <div className="zl-bg-glow" />
        <div className="zl-card">

          {/* TOP BAR */}
          <div className="zl-topbar">
            <button onClick={() => navigate('/')} className="zl-btn-volver">
              <svg viewBox="0 0 24 24"><polyline points="15 18 9 12 15 6" /></svg>
              Volver
            </button>
          </div>

          {/* LOGO */}
          <div className="zl-logo-wrap">
            <img src="/zeno-logo.png" alt="Zeno Marketing" className="zl-logo-img" />
            <span className="zl-badge">Inicio Sesión</span>
          </div>

          <div className="zl-divider" />

          {/* BODY */}
          <div className="zl-body">
            <div className="zl-accent-line" />
            <p className="zl-subtitle">Ingresa tus credenciales para continuar</p>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label className="zl-label">Usuario</label>
                <div className="zl-input-wrap">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="zl-input"
                    placeholder="correo@ejemplo.com"
                    required
                    autoComplete="email"
                  />
                  <span className="zl-input-icon">
                    <User size={17} />
                  </span>
                </div>
              </div>

              <div>
                <label className="zl-label">Contraseña</label>
                <div className="zl-input-wrap">
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="zl-input"
                    placeholder="••••••••"
                    required
                    autoComplete="current-password"
                  />
                  <span className="zl-input-icon">
                    <Lock size={17} />
                  </span>
                </div>
              </div>

              <button type="submit" disabled={loading} className="zl-btn-primary">
                {loading && <span className="zl-spinner" />}
                {loading ? 'Ingresando...' : 'Ingresar'}
              </button>
            </form>
          </div>

        </div>
      </div>
    </>
  )
}