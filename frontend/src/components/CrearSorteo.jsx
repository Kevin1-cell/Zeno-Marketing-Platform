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
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@400;500&display=swap');

        .zcs-wrap { display: flex; flex-direction: column; gap: 10px; }

        .zcs-btn-toggle {
          display: flex; align-items: center; gap: 8px;
          width: fit-content;
          background: linear-gradient(90deg, rgba(255,140,0,0.18), rgba(255,140,0,0.08));
          border: 1px solid rgba(255,140,0,0.35);
          color: #ffb347;
          font-family: 'Syne', sans-serif;
          font-size: 12px; font-weight: 700; letter-spacing: 0.05em;
          padding: 9px 20px; border-radius: 50px;
          cursor: pointer; transition: all 0.2s;
        }
        .zcs-btn-toggle:hover { background: rgba(255,140,0,0.28); color: #ffd080; }
        .zcs-btn-toggle.open {
          background: rgba(255,80,80,0.1);
          border-color: rgba(255,80,80,0.25);
          color: rgba(255,140,140,0.8);
        }

        .zcs-form {
          background: rgba(255,140,0,0.04);
          border: 1px solid rgba(255,140,0,0.15);
          border-radius: 18px;
          padding: 16px;
          display: flex; flex-direction: column; gap: 12px;
          animation: fadeSlideIn 0.2s ease;
        }
        @keyframes fadeSlideIn {
          from { opacity: 0; transform: translateY(-6px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        .zcs-form-title {
          font-family: 'Syne', sans-serif;
          font-size: 12px; font-weight: 700;
          text-transform: uppercase; letter-spacing: 0.07em;
          color: rgba(255,179,71,0.7);
        }

        .zcs-label {
          display: block;
          font-size: 9px; font-weight: 500;
          letter-spacing: 0.08em; text-transform: uppercase;
          color: rgba(148,180,220,0.5);
          margin-bottom: 5px;
        }

        .zcs-input {
          width: 100%;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(30,111,255,0.2);
          border-radius: 10px;
          padding: 11px 12px;
          color: #e0eeff;
          font-family: 'DM Sans', sans-serif;
          font-size: 14px; outline: none;
          transition: border-color 0.2s, box-shadow 0.2s;
          -webkit-appearance: none;
        }
        .zcs-input::placeholder { color: rgba(148,180,220,0.25); }
        .zcs-input:focus {
          border-color: rgba(30,111,255,0.55);
          box-shadow: 0 0 0 3px rgba(30,111,255,0.08);
        }

        /* Nivel pills */
        .zcs-nivel-wrap { display: flex; gap: 7px; }
        .zcs-nivel-btn {
          flex: 1; padding: 10px 0;
          border-radius: 10px;
          font-family: 'Syne', sans-serif;
          font-size: 12px; font-weight: 700;
          letter-spacing: 0.04em; cursor: pointer;
          border: 1px solid rgba(30,111,255,0.18);
          background: rgba(255,255,255,0.02);
          color: rgba(148,180,220,0.45);
          transition: all 0.2s;
        }
        .zcs-nivel-btn:hover { border-color: rgba(30,111,255,0.35); color: #aed4ff; }
        .zcs-nivel-btn.active {
          background: linear-gradient(135deg, rgba(255,140,0,0.2), rgba(255,140,0,0.08));
          border-color: rgba(255,140,0,0.5); color: #ffb347;
          box-shadow: 0 0 12px rgba(255,140,0,0.12);
        }

        .zcs-btn-submit {
          width: 100%; padding: 13px; border-radius: 50px; border: none;
          background: linear-gradient(90deg, #ff8c00, #e67300);
          color: #fff;
          font-family: 'Syne', sans-serif;
          font-size: 13px; font-weight: 700; letter-spacing: 0.05em;
          cursor: pointer; transition: opacity 0.2s, transform 0.15s;
          box-shadow: 0 4px 18px rgba(255,140,0,0.25);
        }
        .zcs-btn-submit:hover:not(:disabled) { opacity: 0.88; transform: translateY(-1px); }
        .zcs-btn-submit:disabled { opacity: 0.45; cursor: not-allowed; }
      `}</style>

      <div className="zcs-wrap">
        <button
          onClick={() => setMostrarForm(!mostrarForm)}
          className={`zcs-btn-toggle${mostrarForm ? ' open' : ''}`}
        >
          {mostrarForm ? '✕ Cancelar' : '🎰 + Nuevo sorteo'}
        </button>

        {mostrarForm && (
          <form onSubmit={handleSubmit} className="zcs-form">
            <span className="zcs-form-title">Crear sorteo</span>

            <div>
              <label className="zcs-label">Nombre del sorteo</label>
              <input
                type="text" required
                placeholder="Ej: Sorteo principal"
                className="zcs-input"
                value={nombre}
                onChange={e => setNombre(e.target.value)}
              />
            </div>

            <div>
              <label className="zcs-label">Filtrar por nivel</label>
              <div className="zcs-nivel-wrap">
                {['TODOS', 'C1', 'C2', 'C3'].map(n => (
                  <button
                    key={n} type="button"
                    onClick={() => setNivelFiltro(n)}
                    className={`zcs-nivel-btn${nivelFiltro === n ? ' active' : ''}`}
                  >
                    {n}
                  </button>
                ))}
              </div>
            </div>

            <button type="submit" disabled={cargando} className="zcs-btn-submit">
              {cargando ? 'Creando...' : 'Crear sorteo'}
            </button>
          </form>
        )}
      </div>
    </>
  )
}