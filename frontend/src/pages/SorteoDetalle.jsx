import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import axios from 'axios'
import toast from 'react-hot-toast'
import { Trophy, RotateCcw, CheckCircle, XCircle, ArrowLeft } from 'lucide-react'
import Roulette from '../components/Roulette'

export default function SorteoDetalle() {
  const { id } = useParams()
  const navigate = useNavigate()
  const token = localStorage.getItem('token')
  const [sorteo, setSorteo] = useState(null)
  const [girando, setGirando] = useState(false)
  const [ultimoGanador, setUltimoGanador] = useState(null)
  const [numerosElegibles, setNumerosElegibles] = useState([])
  const [numeroParaRuleta, setNumeroParaRuleta] = useState(null)

  const cargarSorteo = async () => {
    try {
      const res = await axios.get(`/sorteos/${id}`, { headers: { Authorization: `Bearer ${token}` } })
      setSorteo(res.data)
    } catch (err) {
      console.error('Error cargando sorteo:', err)
    }
  }

  useEffect(() => {
    if (!id) return
    cargarSorteo()
    cargarNumerosElegibles()
  }, [id, token])

  const cargarNumerosElegibles = async () => {
    try {
      const res = await axios.get(`/sorteos/${id}/numeros-elegibles`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setNumerosElegibles(Array.isArray(res.data) ? res.data : [])
    } catch (err) {
      console.error('Error cargando números elegibles:', err)
    }
  }

  const girarRuleta = async () => {
    if (!sorteo) return toast.error('Sorteo no encontrado')
    if (sorteo.estado === 'FINALIZADO') return toast.error('Este sorteo ya finalizó')
    if (numerosElegibles.length === 0) return toast.error('No hay números elegibles.')
    setGirando(true)
    setUltimoGanador(null)
    setNumeroParaRuleta(null)

    // Llamar al servidor de inmediato, en paralelo con la animación
    try {
      const res = await axios.post(`/sorteos/girar`, { sorteo_id: id }, {
        headers: { Authorization: `Bearer ${token}` }
      })
      // Pasamos el número a la ruleta para que frene en él
      setNumeroParaRuleta(res.data.numero)
      setUltimoGanador(res.data)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error al girar la ruleta')
      setGirando(false)
    }
  }

  const handleSpinEnd = () => {
    setNumeroParaRuleta(null)
    setGirando(false)
    if (ultimoGanador) {
      toast.success(`🎉 ¡Número ${ultimoGanador.numero} seleccionado!`)
    }
  }

  const confirmarGanador = async () => {
    if (!ultimoGanador) return
    try {
      const premio = prompt('Escribe el premio para el ganador:', 'Premio manual')
      if (!premio) return
      await axios.post(`/sorteos/confirmar-ganador`, {
        sorteo_id: id,
        numero_ganador: ultimoGanador.numero,
        participante_id: ultimoGanador.participante_id,
        premio_descripcion: premio
      }, { headers: { Authorization: `Bearer ${token}` } })
      toast.success('🏆 Ganador confirmado')
      setUltimoGanador(null)
      await Promise.all([cargarSorteo(), cargarNumerosElegibles()])
    } catch (err) {
      toast.error('Error al confirmar ganador')
    }
  }

  const repetir = async () => {
    if (!ultimoGanador) return
    try {
      await axios.post(`/sorteos/repetir`, {
        sorteo_id: id,
        numero: ultimoGanador.numero
      }, { headers: { Authorization: `Bearer ${token}` } })
      toast.success('🔄 Número excluido temporalmente')
      setUltimoGanador(null)
      cargarNumerosElegibles()
    } catch (err) {
      toast.error('Error al excluir número')
    }
  }

  const finalizarSorteo = async () => {
    if (!sorteo) return
    if (sorteo.estado === 'FINALIZADO') return toast.info('El sorteo ya está finalizado')
    try {
      await axios.post(`/sorteos/${id}/finalizar`, {}, { headers: { Authorization: `Bearer ${token}` } })
      toast.success('Sorteo finalizado')
      cargarSorteo()
    } catch (err) {
      toast.error('Error al finalizar sorteo')
    }
  }

  if (!sorteo) return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0d1b4b 0%, #1a1060 40%, #0e2060 100%)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: "'Kameron', serif", color: 'rgba(180,200,255,0.6)', fontSize: 18,
    }}>
      Cargando sorteo...
    </div>
  )

  const finalizado = sorteo.estado === 'FINALIZADO'

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Kameron:wght@400;700&family=DM+Sans:wght@300;400;500&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        .sd-root {
          min-height: 100vh;
          background:
            radial-gradient(ellipse at 20% 0%, rgba(120,80,255,0.22) 0%, transparent 55%),
            radial-gradient(ellipse at 80% 10%, rgba(30,111,255,0.28) 0%, transparent 50%),
            radial-gradient(ellipse at 50% 100%, rgba(20,60,180,0.3) 0%, transparent 60%),
            linear-gradient(160deg, #0c1a50 0%, #160d48 35%, #0b1a55 65%, #0d1440 100%);
          font-family: 'DM Sans', sans-serif;
          position: relative;
          overflow-x: hidden;
        }

        .sd-root::before {
          content: '';
          position: fixed; inset: 0;
          background-image: radial-gradient(rgba(100,140,255,0.06) 1px, transparent 1px);
          background-size: 26px 26px;
          pointer-events: none; z-index: 0;
        }

        .sd-root::after {
          content: '';
          position: fixed;
          top: -150px; left: 50%;
          transform: translateX(-50%);
          width: 700px; height: 400px;
          background: radial-gradient(ellipse, rgba(80,100,255,0.18) 0%, transparent 65%);
          pointer-events: none; z-index: 0;
        }

        .sd-inner {
          position: relative; z-index: 1;
          max-width: 960px;
          margin: 0 auto;
          padding: 20px 16px 48px;
        }

        .sd-topbar {
          display: flex; align-items: center;
          justify-content: space-between;
          margin-bottom: 22px;
          flex-wrap: wrap; gap: 10px;
        }
        .sd-topbar-left { display: flex; align-items: center; gap: 12px; }
        .sd-btn-back {
          display: flex; align-items: center; gap: 6px;
          background: rgba(255,255,255,0.07);
          border: 1px solid rgba(255,255,255,0.12);
          color: #b0c8ff;
          font-family: 'DM Sans', sans-serif;
          font-size: 13px; font-weight: 500;
          padding: 8px 16px; border-radius: 50px;
          cursor: pointer; transition: all 0.2s;
          backdrop-filter: blur(8px);
        }
        .sd-btn-back:hover { background: rgba(255,255,255,0.12); color: #d0e0ff; }

        .sd-title {
          font-family: 'Kameron', serif;
          font-size: clamp(18px, 3.5vw, 26px);
          font-weight: 700;
          color: #e8f0ff;
          letter-spacing: 0.02em;
        }
        .sd-title span {
          background: linear-gradient(90deg, #5b9bff, #ff8c00);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .sd-btn-finalizar {
          display: flex; align-items: center; gap: 6px;
          background: rgba(220,38,38,0.1);
          border: 1px solid rgba(220,38,38,0.28);
          color: #f87171;
          font-family: 'DM Sans', sans-serif;
          font-size: 13px; font-weight: 500;
          padding: 8px 16px; border-radius: 50px;
          cursor: pointer; transition: all 0.2s;
        }
        .sd-btn-finalizar:hover { background: rgba(220,38,38,0.18); }

        .sd-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 16px;
        }
        @media (min-width: 680px) {
          .sd-grid { grid-template-columns: 1fr 1fr; }
        }

        .sd-card {
          background: rgba(255,255,255,0.05);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 20px;
          overflow: hidden;
          position: relative;
          box-shadow: 0 8px 32px rgba(0,0,30,0.3);
        }
        .sd-card::before {
          content: '';
          position: absolute; top: 0; left: 0; right: 0; height: 1.5px;
          background: linear-gradient(90deg, rgba(100,140,255,0.6), rgba(255,140,0,0.5), rgba(100,140,255,0.3));
        }
        .sd-card-body { padding: 20px; }

        .sd-card-title {
          font-family: 'Kameron', serif;
          font-size: 13px; font-weight: 700;
          color: rgba(160,190,255,0.65);
          letter-spacing: 0.1em; text-transform: uppercase;
          margin-bottom: 16px;
          display: flex; align-items: center; gap: 8px;
        }

        .sd-stats-grid {
          display: grid; grid-template-columns: 1fr 1fr; gap: 10px;
        }
        .sd-stat {
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 12px; padding: 12px; text-align: center;
        }
        .sd-stat-label {
          font-size: 10px; font-weight: 500;
          letter-spacing: 0.1em; text-transform: uppercase;
          color: rgba(160,190,255,0.4); margin-bottom: 5px;
        }
        .sd-stat-value {
          font-family: 'Kameron', serif;
          font-size: 24px; font-weight: 700; color: #e8f0ff;
        }
        .sd-stat-value.blue { color: #5b9bff; }
        .sd-stat-value.orange { color: #ff8c00; }

        .sd-nivel-badge {
          display: inline-flex; padding: 4px 14px; border-radius: 50px;
          font-family: 'Kameron', serif; font-size: 14px; font-weight: 700;
          background: rgba(100,140,255,0.15);
          border: 1px solid rgba(100,140,255,0.3); color: #90b8ff;
          letter-spacing: 0.05em;
        }
        .sd-estado-badge {
          display: inline-flex; align-items: center; gap: 5px;
          padding: 4px 14px; border-radius: 50px;
          font-size: 12px; font-weight: 500;
        }
        .sd-estado-badge.activo {
          background: rgba(34,197,94,0.1);
          border: 1px solid rgba(34,197,94,0.28); color: #4ade80;
        }
        .sd-estado-badge.finalizado {
          background: rgba(248,113,113,0.1);
          border: 1px solid rgba(248,113,113,0.28); color: #f87171;
        }

        .sd-numeros-wrap {
          display: flex; flex-wrap: wrap; gap: 6px;
          max-height: 130px; overflow-y: auto;
          scrollbar-width: thin;
          scrollbar-color: rgba(100,140,255,0.3) transparent;
        }
        .sd-numero-chip {
          padding: 4px 11px; border-radius: 50px;
          background: rgba(100,140,255,0.1);
          border: 1px solid rgba(100,140,255,0.22);
          color: #90b8ff;
          font-family: 'Kameron', serif;
          font-size: 12px; font-weight: 700; letter-spacing: 0.04em;
        }

        .sd-card-ruleta { grid-column: 1 / -1; }
        .sd-ruleta-wrap {
          display: flex; flex-direction: column;
          align-items: center; padding: 8px 0 4px;
        }

        .sd-ganador-card {
          grid-column: 1 / -1;
          background: rgba(255,255,255,0.06);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255,140,0,0.25);
          border-radius: 20px; padding: 28px 20px;
          text-align: center; position: relative; overflow: hidden;
          box-shadow: 0 8px 40px rgba(255,140,0,0.1), 0 0 0 1px rgba(255,255,255,0.05);
          animation: ganadorIn 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
        @keyframes ganadorIn {
          from { opacity: 0; transform: scale(0.88) translateY(12px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
        .sd-ganador-card::before {
          content: '';
          position: absolute; top: 0; left: 0; right: 0; height: 2px;
          background: linear-gradient(90deg, #ff8c00, #5b9bff, #ff8c00);
        }
        .sd-ganador-card::after {
          content: '';
          position: absolute; top: 50%; left: 50%;
          transform: translate(-50%, -50%);
          width: 200px; height: 200px;
          background: radial-gradient(ellipse, rgba(255,140,0,0.08) 0%, transparent 70%);
          pointer-events: none;
        }

        .sd-trophy-icon { color: #ff8c00; margin: 0 auto 10px; display: flex; align-items: center; justify-content: center; }
        .sd-ganador-title {
          font-family: 'Kameron', serif;
          font-size: 12px; letter-spacing: 0.14em; text-transform: uppercase;
          color: rgba(160,190,255,0.45); margin-bottom: 10px;
        }
        .sd-ganador-numero {
          font-family: 'Kameron', serif;
          font-size: clamp(64px, 18vw, 90px);
          font-weight: 700; line-height: 1;
          color: #fff;
          -webkit-text-stroke: 2px rgba(255,140,0,0.65);
          letter-spacing: 0.06em;
          animation: numBounce 0.55s cubic-bezier(0.34, 1.56, 0.64, 1) 0.1s both;
          position: relative; z-index: 1;
        }
        @keyframes numBounce {
          from { transform: scale(0.4); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
        .sd-ganador-underline {
          width: 48px; height: 3px;
          background: linear-gradient(90deg, #ff8c00, #5b9bff);
          border-radius: 2px; margin: 12px auto 16px;
        }
        .sd-ganador-nombre {
          font-family: 'Kameron', serif;
          font-size: 20px; font-weight: 700; color: #e8f0ff; margin-bottom: 4px;
        }
        .sd-ganador-tel {
          font-size: 14px; color: rgba(160,190,255,0.5);
          font-family: 'DM Sans', sans-serif; margin-bottom: 22px;
        }
        .sd-ganador-actions { display: flex; gap: 10px; justify-content: center; flex-wrap: wrap; }

        .sd-btn-confirmar {
          display: flex; align-items: center; gap: 7px;
          padding: 12px 26px; border-radius: 50px; border: none;
          background: linear-gradient(90deg, #16a34a, #22c55e);
          color: #fff; font-family: 'Kameron', serif;
          font-size: 14px; font-weight: 700; letter-spacing: 0.04em;
          cursor: pointer; transition: all 0.2s;
          box-shadow: 0 4px 16px rgba(34,197,94,0.22);
        }
        .sd-btn-confirmar:hover { opacity: 0.9; transform: translateY(-1px); }

        .sd-btn-repetir {
          display: flex; align-items: center; gap: 7px;
          padding: 12px 26px; border-radius: 50px;
          border: 1px solid rgba(255,140,0,0.35);
          background: rgba(255,140,0,0.08);
          color: #ffaa33; font-family: 'Kameron', serif;
          font-size: 14px; font-weight: 700; letter-spacing: 0.04em;
          cursor: pointer; transition: all 0.2s;
        }
        .sd-btn-repetir:hover { background: rgba(255,140,0,0.16); }

        .sd-historial-card { grid-column: 1 / -1; }
        .sd-table-wrap {
          overflow-x: auto; border-radius: 12px;
          border: 1px solid rgba(255,255,255,0.08);
        }
        .sd-table {
          width: 100%; border-collapse: collapse;
          font-size: 13px; font-family: 'DM Sans', sans-serif; min-width: 400px;
        }
        .sd-table thead { background: rgba(255,255,255,0.04); }
        .sd-table th {
          text-align: left; padding: 11px 14px;
          font-family: 'Kameron', serif;
          font-size: 11px; font-weight: 700;
          letter-spacing: 0.1em; text-transform: uppercase;
          color: rgba(160,190,255,0.45);
          border-bottom: 1px solid rgba(255,255,255,0.07);
        }
        .sd-table td {
          padding: 12px 14px;
          border-bottom: 1px solid rgba(255,255,255,0.05);
          color: #c0d8ff; vertical-align: middle;
        }
        .sd-table tr:last-child td { border-bottom: none; }
        .sd-table tr:hover td { background: rgba(255,255,255,0.03); }

        .sd-num-badge {
          display: inline-flex; align-items: center; justify-content: center;
          width: 36px; height: 36px; border-radius: 50%;
          background: linear-gradient(135deg, #1e6fff, #ff8c00);
          font-family: 'Kameron', serif;
          font-size: 13px; font-weight: 700; color: #fff;
          flex-shrink: 0; box-shadow: 0 2px 8px rgba(30,111,255,0.3);
        }

        .sd-premio-tag {
          padding: 3px 10px; border-radius: 50px;
          background: rgba(255,140,0,0.1);
          border: 1px solid rgba(255,140,0,0.22);
          color: #ffaa33; font-size: 12px;
        }

        .sd-empty {
          text-align: center; padding: 28px 16px;
          color: rgba(160,190,255,0.3);
          font-size: 13px; font-family: 'DM Sans', sans-serif;
        }
      `}</style>

      <div className="sd-root">
        <div className="sd-inner">

          <div className="sd-topbar">
            <div className="sd-topbar-left">
              <button onClick={() => navigate('/dashboard')} className="sd-btn-back">
                <ArrowLeft size={14} /> Dashboard
              </button>
              <h1 className="sd-title">Ruleta · <span>{sorteo.nombre}</span></h1>
            </div>
            {!finalizado && (
              <button onClick={finalizarSorteo} className="sd-btn-finalizar">
                <XCircle size={14} /> Finalizar sorteo
              </button>
            )}
          </div>

          <div className="sd-grid">

            <div className="sd-card">
              <div className="sd-card-body">
                <div className="sd-card-title">📊 Estado del sorteo</div>
                <div className="sd-stats-grid">
                  <div className="sd-stat">
                    <div className="sd-stat-label">Estado</div>
                    <span className={`sd-estado-badge ${finalizado ? 'finalizado' : 'activo'}`}>
                      {finalizado ? '● Finalizado' : '● Activo'}
                    </span>
                  </div>
                  <div className="sd-stat">
                    <div className="sd-stat-label">Nivel</div>
                    <span className="sd-nivel-badge">{sorteo.nivel_filtro}</span>
                  </div>
                  <div className="sd-stat">
                    <div className="sd-stat-label">Elegibles</div>
                    <div className="sd-stat-value blue">{numerosElegibles.length}</div>
                  </div>
                  <div className="sd-stat">
                    <div className="sd-stat-label">Ganadores</div>
                    <div className="sd-stat-value orange">{sorteo.ganadores?.length || 0}</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="sd-card">
              <div className="sd-card-body">
                <div className="sd-card-title">🎫 Números elegibles</div>
                <div className="sd-numeros-wrap">
                  {numerosElegibles.length === 0
                    ? <p className="sd-empty">Sin números elegibles</p>
                    : numerosElegibles.map(n => (
                        <span key={n.numero} className="sd-numero-chip">{n.numero}</span>
                      ))
                  }
                </div>
              </div>
            </div>

            <div className="sd-card sd-card-ruleta">
              <div className="sd-card-body">
                <div className="sd-card-title" style={{ justifyContent: 'center' }}>🎡 Ruleta de sorteo</div>
                <div className="sd-ruleta-wrap">
                  <Roulette
                    onSpin={girarRuleta}
                    isSpinning={girando}
                    disabled={finalizado || numerosElegibles.length === 0}
                    numeros={numerosElegibles}
                    numeroGanador={numeroParaRuleta}
                    onSpinEnd={handleSpinEnd}
                  />
                </div>
              </div>
            </div>

            {ultimoGanador && !girando && (
              <div className="sd-ganador-card">
                <div className="sd-trophy-icon"><Trophy size={34} /></div>
                <div className="sd-ganador-title">¡Tenemos ganador!</div>
                <div className="sd-ganador-numero">{ultimoGanador.numero}</div>
                <div className="sd-ganador-underline" />
                <div className="sd-ganador-nombre">{ultimoGanador.nombre}</div>
                <div className="sd-ganador-tel">{ultimoGanador.telefono}</div>
                <div className="sd-ganador-actions">
                  <button onClick={confirmarGanador} className="sd-btn-confirmar">
                    <CheckCircle size={16} /> Confirmar ganador
                  </button>
                  <button onClick={repetir} className="sd-btn-repetir">
                    <RotateCcw size={16} /> Repetir (excluir)
                  </button>
                </div>
              </div>
            )}

            <div className="sd-card sd-historial-card">
              <div className="sd-card-body">
                <div className="sd-card-title">
                  <Trophy size={15} style={{ color: '#ff8c00' }} />
                  Historial de ganadores
                </div>
                {(!sorteo.ganadores || sorteo.ganadores.length === 0) ? (
                  <div className="sd-empty">Aún no hay ganadores en este sorteo.</div>
                ) : (
                  <div className="sd-table-wrap">
                    <table className="sd-table">
                      <thead>
                        <tr>
                          <th>N°</th>
                          <th>Nombre</th>
                          <th>Teléfono</th>
                          <th>Premio</th>
                        </tr>
                      </thead>
                      <tbody>
                        {sorteo.ganadores.map(g => (
                          <tr key={g.id}>
                            <td><span className="sd-num-badge">{g.numero_ganador}</span></td>
                            <td style={{ fontWeight: 500 }}>{g.participante?.nombre_completo || 'N/A'}</td>
                            <td style={{ color: 'rgba(160,190,255,0.5)' }}>{g.participante?.telefon || 'N/A'}</td>
                            <td><span className="sd-premio-tag">{g.premio_descripcion || g.premio?.descripcion || 'Sin especificar'}</span></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>

          </div>
        </div>
      </div>
    </>
  )
}