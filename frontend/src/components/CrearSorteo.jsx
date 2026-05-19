import { useState } from 'react'
import axios from 'axios'
import toast from 'react-hot-toast'

export default function CrearSorteo({ eventoId, token, onSorteoCreado }) {
  const [mostrarForm, setMostrarForm] = useState(false)
  const [nombre, setNombre] = useState('')
  const [nivelFiltro, setNivelFiltro] = useState('TODOS')
  const [cargando, setCargando] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!eventoId) return toast.error('Selecciona un evento primero')
    setCargando(true)
    try {
      await axios.post('/sorteos', {
        evento_id: eventoId,
        nombre,
        nivel_filtro: nivelFiltro,
        modo_premios: 'MANUAL'
      }, { headers: { Authorization: `Bearer ${token}` } })
      toast.success('Sorteo creado')
      setNombre('')
      setMostrarForm(false)
      if (onSorteoCreado) onSorteoCreado()
    } catch (err) {
      toast.error('Error al crear sorteo')
    } finally {
      setCargando(false)
    }
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Kameron:wght@400;700&family=DM+Sans:wght@400;500;600;700&display=swap');

        .zcs-wrap {
          display: flex;
          flex-direction: column;
          gap: 12px;
          margin-bottom: clamp(14px, 2vw, 22px);
        }

        .zcs-btn-toggle {
          display: inline-flex;
          align-items: center;
          gap: 9px;
          width: fit-content;
          background: rgba(255,255,255,0.75);
          border: 1.5px solid rgba(255, 140, 0, 0.4);
          color: #b96a00;
          font-family: 'DM Sans', sans-serif;
          font-size: 13px;
          font-weight: 700;
          letter-spacing: 0.04em;
          padding: 11px 24px;
          border-radius: 50px;
          cursor: pointer;
          transition: all 0.22s;
          backdrop-filter: blur(10px);
          box-shadow: 0 2px 12px rgba(255,140,0,0.1);
        }
        .zcs-btn-toggle:hover {
          background: rgba(255,255,255,0.95);
          border-color: rgba(255, 140, 0, 0.65);
          color: #955300;
          box-shadow: 0 4px 18px rgba(255,140,0,0.18);
          transform: translateY(-1px);
        }
        .zcs-btn-toggle.open {
          background: rgba(255,255,255,0.75);
          border-color: rgba(203, 68, 68, 0.35);
          color: #b03a3a;
          box-shadow: 0 2px 10px rgba(200,60,60,0.08);
        }
        .zcs-btn-toggle.open:hover {
          border-color: rgba(203, 68, 68, 0.6);
          color: #8b2a2a;
          box-shadow: 0 4px 16px rgba(200,60,60,0.15);
        }

        .zcs-toggle-icon {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: rgba(255,140,0,0.12);
          font-size: 13px;
          line-height: 1;
          transition: transform 0.22s, background 0.22s;
        }
        .zcs-btn-toggle.open .zcs-toggle-icon {
          background: rgba(200,60,60,0.1);
          transform: rotate(45deg);
        }

        /* Card del formulario */
        .zcs-form-card {
          background: rgba(255,255,255,0.92);
          backdrop-filter: blur(32px);
          border: 1.5px solid rgba(255,140,0,0.22);
          border-radius: clamp(20px, 3vw, 28px);
          overflow: hidden;
          box-shadow:
            0 20px 60px rgba(14,120,180,0.12),
            0 4px 16px rgba(255,140,0,0.06),
            inset 0 1px 0 rgba(255,255,255,1);
          animation: zcsSlideDown 0.25s cubic-bezier(0.34,1.56,0.64,1) both;
        }
        @keyframes zcsSlideDown {
          from { opacity: 0; transform: translateY(-10px) scale(0.98); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }

        /* Franja superior decorativa */
        .zcs-card-stripe {
          height: 4px;
          background: linear-gradient(90deg, #f59e0b, #fbbf24, #f59e0b, #fb923c);
          background-size: 300% 100%;
          animation: zcsStripeFlow 3s linear infinite;
        }
        @keyframes zcsStripeFlow {
          0% { background-position: 0% 50%; }
          100% { background-position: 300% 50%; }
        }

        .zcs-form-inner {
          padding: clamp(18px, 3vw, 28px);
          display: flex;
          flex-direction: column;
          gap: 18px;
        }

        .zcs-form-header {
          display: flex;
          align-items: center;
          gap: 10px;
          padding-bottom: 14px;
          border-bottom: 1px solid rgba(147,197,253,0.2);
        }
        .zcs-form-icon {
          width: 36px;
          height: 36px;
          border-radius: 10px;
          background: linear-gradient(135deg, rgba(251,191,36,0.2), rgba(245,158,11,0.1));
          border: 1.5px solid rgba(255,140,0,0.25);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 16px;
          flex-shrink: 0;
        }
        .zcs-form-title {
          font-family: 'Kameron', serif;
          font-size: clamp(15px, 2vw, 18px);
          font-weight: 700;
          color: #0c2340;
          line-height: 1.2;
        }
        .zcs-form-subtitle {
          font-size: 11px;
          color: #64748b;
          font-weight: 500;
          margin-top: 1px;
        }

        /* Campo */
        .zcs-field { display: flex; flex-direction: column; gap: 6px; }

        .zcs-label {
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: #475569;
        }

        .zcs-input-wrap { position: relative; }
        .zcs-input {
          width: 100%;
          background: #f0f9ff;
          border: 1.5px solid rgba(56,189,248,0.3);
          border-radius: 14px;
          padding: 12px 16px;
          color: #0c2340;
          font-family: 'DM Sans', sans-serif;
          font-size: 14px;
          font-weight: 500;
          outline: none;
          transition: border-color 0.2s, box-shadow 0.2s, background 0.2s;
          box-sizing: border-box;
        }
        .zcs-input::placeholder { color: #94a3b8; font-weight: 400; }
        .zcs-input:hover {
          border-color: rgba(56,189,248,0.5);
          background: #e9f5ff;
        }
        .zcs-input:focus {
          border-color: rgba(14,165,233,0.65);
          background: #fff;
          box-shadow: 0 0 0 4px rgba(14,165,233,0.1);
        }

        /* Pills de nivel */
        .zcs-nivel-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 8px;
        }
        .zcs-nivel-btn {
          padding: 10px 6px;
          border-radius: 12px;
          font-family: 'Kameron', serif;
          font-size: 13px;
          font-weight: 700;
          letter-spacing: 0.03em;
          cursor: pointer;
          border: 1.5px solid rgba(56,189,248,0.25);
          background: rgba(240,249,255,0.8);
          color: #64748b;
          transition: all 0.18s;
          text-align: center;
        }
        .zcs-nivel-btn:hover {
          border-color: rgba(14,165,233,0.45);
          color: #0369a1;
          background: rgba(224,242,254,0.9);
          transform: translateY(-1px);
        }
        .zcs-nivel-btn.active {
          background: linear-gradient(135deg, rgba(251,191,36,0.18), rgba(245,158,11,0.08));
          border-color: rgba(245,158,11,0.55);
          color: #92400e;
          box-shadow: 0 2px 10px rgba(245,158,11,0.15);
        }

        /* Pie del form */
        .zcs-form-footer {
          display: flex;
          align-items: center;
          gap: 10px;
          padding-top: 4px;
        }

        .zcs-btn-submit {
          flex: 1;
          padding: 13px 20px;
          border-radius: 50px;
          border: none;
          background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
          color: #fff;
          font-family: 'Kameron', serif;
          font-size: 14px;
          font-weight: 700;
          letter-spacing: 0.04em;
          cursor: pointer;
          transition: all 0.2s;
          box-shadow: 0 6px 20px rgba(217,119,6,0.35);
          min-height: 46px;
        }
        .zcs-btn-submit:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 10px 28px rgba(217,119,6,0.45);
        }
        .zcs-btn-submit:active:not(:disabled) {
          transform: translateY(0);
        }
        .zcs-btn-submit:disabled {
          opacity: 0.55;
          cursor: not-allowed;
          transform: none;
        }

        .zcs-btn-cancel-sm {
          padding: 13px 18px;
          border-radius: 50px;
          background: rgba(248,250,252,0.8);
          border: 1.5px solid rgba(203,213,225,0.6);
          color: #64748b;
          font-family: 'DM Sans', sans-serif;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.18s;
          white-space: nowrap;
          min-height: 46px;
        }
        .zcs-btn-cancel-sm:hover {
          background: rgba(241,245,249,1);
          border-color: rgba(148,163,184,0.7);
          color: #475569;
        }
      `}</style>

      <div className="zcs-wrap">
        <button
          onClick={() => setMostrarForm(!mostrarForm)}
          className={`zcs-btn-toggle${mostrarForm ? ' open' : ''}`}
        >
          <span className="zcs-toggle-icon">{mostrarForm ? '×' : '+'}</span>
          {mostrarForm ? 'Cancelar' : 'Nuevo sorteo'}
        </button>

        {mostrarForm && (
          <div className="zcs-form-card">
            <div className="zcs-card-stripe" />
            <div className="zcs-form-inner">
              <div className="zcs-form-header">
                <div className="zcs-form-icon">🎰</div>
                <div>
                  <div className="zcs-form-title">Crear sorteo</div>
                  <div className="zcs-form-subtitle">El sorteo quedará vinculado a este evento</div>
                </div>
              </div>

              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                <div className="zcs-field">
                  <label className="zcs-label">Nombre del sorteo</label>
                  <div className="zcs-input-wrap">
                    <input
                      type="text"
                      required
                      placeholder="Ej: Sorteo principal"
                      className="zcs-input"
                      value={nombre}
                      onChange={e => setNombre(e.target.value)}
                    />
                  </div>
                </div>

                <div className="zcs-field">
                  <label className="zcs-label">Filtrar por nivel</label>
                  <div className="zcs-nivel-grid">
                    {['TODOS', 'C1', 'C2', 'C3'].map(n => (
                      <button
                        key={n}
                        type="button"
                        onClick={() => setNivelFiltro(n)}
                        className={`zcs-nivel-btn${nivelFiltro === n ? ' active' : ''}`}
                      >
                        {n}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="zcs-form-footer">
                  <button
                    type="button"
                    className="zcs-btn-cancel-sm"
                    onClick={() => setMostrarForm(false)}
                  >
                    Cancelar
                  </button>
                  <button type="submit" disabled={cargando} className="zcs-btn-submit">
                    {cargando ? 'Creando...' : 'Crear sorteo'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </>
  )
}