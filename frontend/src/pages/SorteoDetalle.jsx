import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import axios from 'axios'
import toast from 'react-hot-toast'
import { Trophy, RotateCcw, CheckCircle, XCircle, ArrowLeft, Gift } from 'lucide-react'
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

  const [showModalPremio, setShowModalPremio] = useState(false)
  const [premioTexto, setPremioTexto] = useState('Ingresa el premio para el ganador')

  const cargarSorteo = async () => {
    try {
      const res = await axios.get(`/sorteos/${id}`, { headers: { Authorization: `Bearer ${token}` } })
      setSorteo(res.data)
    } catch (err) {}
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
    } catch (err) {}
  }

  const girarRuleta = async () => {
    if (!sorteo) return toast.error('Sorteo no encontrado')
    if (sorteo.estado === 'FINALIZADO') return toast.error('Este sorteo ya finalizó')
    if (numerosElegibles.length === 0) return toast.error('No hay números elegibles.')
    setGirando(true)
    setUltimoGanador(null)
    setNumeroParaRuleta(null)

    try {
      const res = await axios.post(`/sorteos/girar`, { sorteo_id: id }, {
        headers: { Authorization: `Bearer ${token}` }
      })
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

  const abrirModalConfirmar = () => {
    setPremioTexto('')
    setShowModalPremio(true)
  }

  const confirmarGanadorFinal = async () => {
    if (!ultimoGanador || !premioTexto) return
    try {
      await axios.post(`/sorteos/confirmar-ganador`, {
        sorteo_id: id,
        numero_ganador: ultimoGanador.numero,
        participante_id: ultimoGanador.participante_id,
        premio_descripcion: premioTexto
      }, { headers: { Authorization: `Bearer ${token}` } })
      
      toast.success('🏆 Ganador confirmado')
      setShowModalPremio(false)
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
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Kameron:wght@400;700&family=DM+Sans:wght@400;500;600;700&display=swap');
      `}</style>
      <div style={{
        minHeight: '100vh',
        background: 'radial-gradient(ellipse at 30% 20%, #e0f7ff 0%, transparent 60%), radial-gradient(ellipse at 80% 80%, #cde8f5 0%, transparent 55%), #eaf6ff',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontFamily: "'Kameron', serif", color: '#0369a1', fontSize: 20,
      }}>
        Cargando sorteo...
      </div>
    </>
  )

  const finalizado = sorteo.estado === 'FINALIZADO'

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Kameron:wght@400;700&family=DM+Sans:wght@400;500;600;700&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        .sdt-page {
          min-height: 100vh;
          background:
            radial-gradient(ellipse at 10% 0%, #e0f7ff 0%, transparent 55%),
            radial-gradient(ellipse at 90% 10%, #cde8f5 0%, transparent 50%),
            radial-gradient(ellipse at 50% 100%, #93c5fd55 0%, transparent 60%),
            radial-gradient(ellipse at 20% 60%, #7dd3fc44 0%, transparent 40%),
            #eaf6ff;
          font-family: 'DM Sans', sans-serif;
          position: relative;
          overflow-x: hidden;
          padding: clamp(16px, 3vw, 40px);
        }

        /* Burbujas */
        .sdt-bubble {
          position: fixed; border-radius: 50%;
          pointer-events: none; z-index: 0;
          animation: sdtFloat linear infinite;
        }
        .sdt-bubble-1 {
          width: clamp(200px, 28vw, 400px); height: clamp(200px, 28vw, 400px);
          top: -80px; left: -80px;
          background: radial-gradient(circle at 35% 35%, #bae6fd 0%, #7dd3fc55 50%, transparent 70%);
          animation-duration: 9s;
        }
        .sdt-bubble-2 {
          width: clamp(130px, 18vw, 260px); height: clamp(130px, 18vw, 260px);
          top: 30%; right: -50px;
          background: radial-gradient(circle at 40% 40%, #e0f2fe 0%, #93c5fd44 50%, transparent 70%);
          animation-duration: 12s; animation-delay: -4s;
        }
        .sdt-bubble-3 {
          width: clamp(90px, 13vw, 180px); height: clamp(90px, 13vw, 180px);
          bottom: 12%; left: 12%;
          background: radial-gradient(circle at 40% 40%, #bfdbfe 0%, #60a5fa33 50%, transparent 70%);
          animation-duration: 10s; animation-delay: -6s;
        }
        .sdt-bubble-4 {
          width: clamp(150px, 20vw, 300px); height: clamp(150px, 20vw, 300px);
          bottom: -50px; right: 8%;
          background: radial-gradient(circle at 40% 35%, #e0f7ff 0%, #7dd3fc33 50%, transparent 70%);
          animation-duration: 14s; animation-delay: -8s;
        }
        @keyframes sdtFloat {
          0% { transform: translateY(0px) rotate(0deg); }
          33% { transform: translateY(-16px) rotate(2deg); }
          66% { transform: translateY(-7px) rotate(-1deg); }
          100% { transform: translateY(0px) rotate(0deg); }
        }

        .sdt-inner {
          position: relative; z-index: 1;
          max-width: 960px;
          margin: 0 auto;
        }

        /* Topbar */
        .sdt-topbar {
          display: flex; align-items: center;
          justify-content: space-between;
          margin-bottom: clamp(18px, 3vw, 30px);
          flex-wrap: wrap; gap: 12px;
        }
        .sdt-topbar-left { display: flex; align-items: center; gap: 12px; flex-wrap: wrap; }

        .sdt-btn-back {
          display: flex; align-items: center; gap: 7px;
          padding: clamp(9px, 1.5vw, 11px) clamp(14px, 2vw, 20px);
          border-radius: clamp(16px, 2.5vw, 22px);
          border: 1.5px solid rgba(56,189,248,0.4);
          background: rgba(240,249,255,0.5);
          color: #0369a1;
          font-family: 'DM Sans', sans-serif;
          font-size: clamp(12px, 1.5vw, 14px); font-weight: 700;
          cursor: pointer; transition: all 0.2s;
          backdrop-filter: blur(8px);
          min-height: 44px;
        }
        .sdt-btn-back:hover {
          background: rgba(240,249,255,0.85);
          border-color: rgba(56,189,248,0.7);
          transform: translateY(-1px);
        }

        .sdt-page-title {
          font-family: 'Kameron', serif;
          font-size: clamp(18px, 3.5vw, 28px);
          font-weight: 700;
          color: #0c2340;
        }
        .sdt-page-title span { color: #0284c7; }

        .sdt-btn-finalizar {
          display: flex; align-items: center; gap: 7px;
          padding: clamp(9px, 1.5vw, 11px) clamp(14px, 2vw, 20px);
          border-radius: clamp(16px, 2.5vw, 22px);
          border: 1.5px solid rgba(220,38,38,0.3);
          background: rgba(254,242,242,0.6);
          color: #dc2626;
          font-family: 'DM Sans', sans-serif;
          font-size: clamp(12px, 1.5vw, 14px); font-weight: 700;
          cursor: pointer; transition: all 0.2s;
          min-height: 44px;
        }
        .sdt-btn-finalizar:hover {
          background: rgba(254,226,226,0.85);
          border-color: rgba(220,38,38,0.5);
        }

        .sdt-divider {
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(56,189,248,0.3), transparent);
          margin-bottom: clamp(16px, 2.5vw, 26px);
        }

        /* Grid principal */
        .sdt-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: clamp(12px, 2vw, 18px);
        }
        @media (min-width: 640px) {
          .sdt-grid { grid-template-columns: 1fr 1fr; }
        }

        /* Card base */
        .sdt-card {
          background: rgba(255,255,255,0.88);
          backdrop-filter: blur(28px);
          border: 1.5px solid rgba(255,255,255,0.9);
          box-shadow: 0 8px 32px rgba(14,120,180,0.14), 0 2px 8px rgba(14,120,180,0.08), inset 0 1px 0 rgba(255,255,255,1);
          border-radius: clamp(18px, 3vw, 28px);
          overflow: hidden;
          position: relative;
          animation: sdtFadeUp 0.38s ease both;
        }
        .sdt-card:nth-child(2) { animation-delay: 0.06s; }
        .sdt-card:nth-child(3) { animation-delay: 0.12s; }
        .sdt-card:nth-child(4) { animation-delay: 0.18s; }
        @keyframes sdtFadeUp {
          from { transform: translateY(12px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }

        .sdt-card-bar {
          position: absolute; top: 0; left: 0; right: 0; height: 4px;
          background: linear-gradient(90deg, #38bdf8, #7dd3fc, #38bdf8);
          background-size: 200% 100%;
          animation: sdtShimmer 2s linear infinite;
        }
        .sdt-card-bar.gold { background: linear-gradient(90deg, #c17f0a, #f59e0b, #fcd34d, #c17f0a); background-size: 200% 100%; }
        .sdt-card-bar.green { background: linear-gradient(90deg, #16a34a, #22c55e, #86efac, #16a34a); background-size: 200% 100%; }
        @keyframes sdtShimmer {
          0% { background-position: 0% 50%; }
          100% { background-position: 200% 50%; }
        }

        .sdt-card-body { padding: clamp(16px, 2.5vw, 24px); }

        .sdt-card-label {
          font-size: clamp(9px, 1vw, 11px);
          font-weight: 700;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: #0369a1;
          margin-bottom: 14px;
          display: flex; align-items: center; gap: 8px;
        }

        /* Stats grid dentro de card */
        .sdt-stats-grid {
          display: grid; grid-template-columns: 1fr 1fr; gap: 10px;
        }
        .sdt-stat-item {
          background: rgba(240,249,255,0.7);
          border: 1.5px solid rgba(147,197,253,0.35);
          border-radius: clamp(12px, 2vw, 18px);
          padding: 12px; text-align: center;
        }
        .sdt-stat-lbl {
          font-size: 10px; font-weight: 700;
          letter-spacing: 0.12em; text-transform: uppercase;
          color: #0369a1; margin-bottom: 6px;
        }
        .sdt-stat-val {
          font-family: 'Kameron', serif;
          font-size: clamp(22px, 4vw, 30px);
          font-weight: 700; color: #0c2340;
        }
        .sdt-stat-val.blue { color: #0284c7; }
        .sdt-stat-val.gold { color: #c17f0a; }

        .sdt-badge-estado {
          display: inline-flex; align-items: center; gap: 5px;
          padding: 5px 14px; border-radius: 50px;
          font-size: 12px; font-weight: 700;
          letter-spacing: 0.04em;
        }
        .sdt-badge-activo {
          background: rgba(22,163,74,0.1);
          border: 1.5px solid rgba(22,163,74,0.3);
          color: #16a34a;
        }
        .sdt-badge-finalizado {
          background: rgba(100,116,139,0.1);
          border: 1.5px solid rgba(100,116,139,0.3);
          color: #475569;
        }
        .sdt-badge-nivel {
          display: inline-flex; padding: 5px 14px; border-radius: 50px;
          font-family: 'Kameron', serif; font-size: 14px; font-weight: 700;
          background: rgba(14,165,233,0.1);
          border: 1.5px solid rgba(56,189,248,0.35);
          color: #0284c7;
        }

        /* Números elegibles */
        .sdt-chips-wrap {
          display: flex; flex-wrap: wrap; gap: 6px;
          max-height: 130px; overflow-y: auto;
          scrollbar-width: thin;
          scrollbar-color: rgba(56,189,248,0.3) transparent;
        }
        .sdt-chip {
          padding: 4px 12px; border-radius: 50px;
          background: rgba(240,249,255,0.8);
          border: 1.5px solid rgba(147,197,253,0.5);
          color: #0284c7;
          font-family: 'Kameron', serif;
          font-size: 12px; font-weight: 700;
          letter-spacing: 0.04em;
        }
        .sdt-chips-empty {
          font-size: 13px; color: #475569; padding: 8px 0;
        }

        /* Card ruleta (full width) */
        .sdt-card-full { grid-column: 1 / -1; }
        .sdt-ruleta-wrap {
          display: flex; flex-direction: column;
          align-items: center; padding: 8px 0 4px;
        }

        /* Card ganador */
        .sdt-ganador-card {
          grid-column: 1 / -1;
          background: rgba(255,255,255,0.92);
          backdrop-filter: blur(28px);
          border: 1.5px solid rgba(193,127,10,0.3);
          box-shadow: 0 16px 64px rgba(193,127,10,0.18), 0 4px 16px rgba(14,120,180,0.1), inset 0 1px 0 rgba(255,255,255,1);
          border-radius: clamp(20px, 3.5vw, 32px);
          padding: clamp(24px, 4vw, 40px) clamp(20px, 3vw, 32px);
          text-align: center;
          position: relative; overflow: hidden;
          animation: sdtGanadorIn 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
        @keyframes sdtGanadorIn {
          from { opacity: 0; transform: scale(0.88) translateY(14px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
        .sdt-ganador-bar {
          position: absolute; top: 0; left: 0; right: 0; height: 4px;
          background: linear-gradient(90deg, #c17f0a, #f59e0b, #38bdf8, #c17f0a);
          background-size: 200% 100%;
          animation: sdtShimmer 2s linear infinite;
        }
        .sdt-ganador-glow {
          position: absolute; top: 50%; left: 50%;
          transform: translate(-50%, -50%);
          width: 240px; height: 240px;
          background: radial-gradient(ellipse, rgba(193,127,10,0.06) 0%, transparent 70%);
          pointer-events: none;
        }

        .sdt-trophy { color: #c17f0a; margin: 0 auto 12px; display: flex; align-items: center; justify-content: center; }
        .sdt-ganador-pretitle {
          font-size: clamp(9px, 1vw, 11px);
          font-weight: 700; letter-spacing: 0.2em;
          text-transform: uppercase; color: #0369a1;
          margin-bottom: 10px;
        }
        .sdt-ganador-numero {
          font-family: 'Kameron', serif;
          font-size: clamp(64px, 18vw, 100px);
          font-weight: 700; line-height: 1;
          color: #0c2340;
          animation: sdtNumPop 0.7s cubic-bezier(0.34,1.56,0.64,1) 0.1s both;
          position: relative; z-index: 1;
        }
        @keyframes sdtNumPop {
          from { transform: scale(0.4) rotate(-8deg); opacity: 0; }
          60% { transform: scale(1.08) rotate(1deg); }
          to { transform: scale(1) rotate(0deg); opacity: 1; }
        }
        .sdt-ganador-line {
          width: 48px; height: 3px;
          background: linear-gradient(90deg, #c17f0a, #38bdf8);
          border-radius: 2px; margin: 14px auto 18px;
        }
        .sdt-ganador-nombre {
          font-family: 'Kameron', serif;
          font-size: clamp(18px, 3vw, 24px); font-weight: 700;
          color: #0c2340; margin-bottom: 4px;
        }
        .sdt-ganador-tel {
          font-size: clamp(12px, 1.5vw, 14px);
          color: #475569; margin-bottom: 24px;
        }
        .sdt-ganador-actions {
          display: flex; gap: 12px; justify-content: center; flex-wrap: wrap;
        }

        .sdt-btn-confirmar {
          display: flex; align-items: center; gap: 8px;
          padding: clamp(11px, 1.8vw, 14px) clamp(20px, 3vw, 28px);
          border-radius: clamp(16px, 2.5vw, 22px); border: none;
          background: linear-gradient(135deg, #16a34a 0%, #22c55e 100%);
          color: #fff;
          font-family: 'Kameron', serif; font-size: clamp(13px, 1.6vw, 15px); font-weight: 700;
          cursor: pointer; transition: all 0.2s;
          box-shadow: 0 6px 24px rgba(22,163,74,0.35);
          min-height: 44px;
        }
        .sdt-btn-confirmar:hover { transform: translateY(-2px); box-shadow: 0 10px 32px rgba(22,163,74,0.45); }

        .sdt-btn-repetir {
          display: flex; align-items: center; gap: 8px;
          padding: clamp(11px, 1.8vw, 14px) clamp(20px, 3vw, 28px);
          border-radius: clamp(16px, 2.5vw, 22px);
          border: 1.5px solid rgba(193,127,10,0.4);
          background: rgba(254,243,199,0.5);
          color: #c17f0a;
          font-family: 'Kameron', serif; font-size: clamp(13px, 1.6vw, 15px); font-weight: 700;
          cursor: pointer; transition: all 0.2s;
          min-height: 44px;
        }
        .sdt-btn-repetir:hover { background: rgba(254,243,199,0.85); border-color: rgba(193,127,10,0.65); }

        .zeno-modal-overlay {
          position: fixed; top: 0; left: 0; right: 0; bottom: 0;
          background: rgba(12, 35, 64, 0.4);
          backdrop-filter: blur(12px);
          z-index: 1000;
          display: flex; align-items: center; justify-content: center;
          padding: 20px;
          animation: modalFadeIn 0.3s ease-out;
        }
        @keyframes modalFadeIn { from { opacity: 0; } to { opacity: 1; } }

        .zeno-modal {
          background: white;
          width: 100%; max-width: 420px;
          border-radius: 28px;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
          overflow: hidden;
          position: relative;
          animation: modalScaleUp 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
        @keyframes modalScaleUp { from { transform: scale(0.9); opacity: 0; } to { transform: scale(1); opacity: 1; } }

        .zeno-modal-header {
          padding: 24px 24px 16px;
          text-align: center;
        }
        .zeno-modal-icon {
          width: 56px; height: 56px; border-radius: 18px;
          background: rgba(14, 165, 233, 0.1);
          color: #0284c7;
          display: flex; align-items: center; justify-content: center;
          margin: 0 auto 16px;
        }
        .zeno-modal-title {
          font-family: 'Kameron', serif;
          font-size: 22px; font-weight: 700; color: #0c2340;
        }

        .zeno-modal-body { padding: 0 24px 24px; }
        .zeno-modal-input-label {
          display: block; font-size: 11px; font-weight: 700;
          text-transform: uppercase; letter-spacing: 0.1em;
          color: #64748b; margin-bottom: 8px; padding-left: 4px;
        }
        .zeno-modal-input {
          width: 100%; padding: 14px 18px;
          border-radius: 16px; border: 2px solid #e2e8f0;
          font-family: 'DM Sans', sans-serif; font-size: 15px;
          transition: all 0.2s; outline: none;
          background: #f8fafc;
        }
        .zeno-modal-input:focus {
          border-color: #38bdf8; background: white;
          box-shadow: 0 0 0 4px rgba(56, 189, 248, 0.15);
        }

        .zeno-modal-footer {
          padding: 16px 24px 24px;
          display: grid; grid-template-columns: 1fr 1fr; gap: 12px;
        }
        .zeno-btn-cancel {
          padding: 12px; border-radius: 14px; border: 1.5px solid #e2e8f0;
          background: white; color: #64748b; font-weight: 600;
          cursor: pointer; transition: all 0.2s;
        }
        .zeno-btn-cancel:hover { background: #f1f5f9; color: #0f172a; }

        /* Historial table */
        .sdt-table-wrap {
          overflow-x: auto;
          border-radius: clamp(12px, 2vw, 18px);
          border: 1.5px solid rgba(147,197,253,0.35);
        }
        .sdt-table {
          width: 100%; border-collapse: collapse;
          font-size: clamp(12px, 1.4vw, 14px);
          font-family: 'DM Sans', sans-serif;
          min-width: 380px;
        }
        .sdt-table thead {
          background: rgba(240,249,255,0.8);
        }
        .sdt-table th {
          text-align: left;
          padding: 11px 14px;
          font-size: clamp(9px, 1vw, 11px); font-weight: 700;
          letter-spacing: 0.16em; text-transform: uppercase;
          color: #0369a1;
          border-bottom: 1.5px solid rgba(147,197,253,0.35);
        }
        .sdt-table td {
          padding: 12px 14px;
          border-bottom: 1px solid rgba(147,197,253,0.2);
          color: #0c2340;
          vertical-align: middle;
        }
        .sdt-table tr:last-child td { border-bottom: none; }
        .sdt-table tr:hover td { background: rgba(240,249,255,0.6); }

        .sdt-num-badge {
          display: inline-flex; align-items: center; justify-content: center;
          width: 36px; height: 36px; border-radius: 50%;
          background: linear-gradient(135deg, #38bdf8, #0284c7);
          font-family: 'Kameron', serif;
          font-size: 13px; font-weight: 700; color: #fff;
          flex-shrink: 0;
          box-shadow: 0 2px 8px rgba(14,165,233,0.35);
        }
        .sdt-premio-tag {
          padding: 3px 10px; border-radius: 50px;
          background: rgba(193,127,10,0.1);
          border: 1px solid rgba(193,127,10,0.3);
          color: #c17f0a; font-size: 12px; font-weight: 600;
        }
        .sdt-table-empty {
          text-align: center; padding: clamp(24px, 4vw, 40px);
          color: #475569; font-size: 13px;
        }

        /* Footer */
        .sdt-footer {
          text-align: center;
          margin-top: clamp(24px, 4vw, 40px);
          padding-top: clamp(12px, 2vw, 18px);
          border-top: 1px solid rgba(147,197,253,0.3);
          font-size: clamp(10px, 1.2vw, 12px);
          color: #475569; font-weight: 500;
        }
      `}</style>

      {showModalPremio && (
        <div className="zeno-modal-overlay">
          <div className="zeno-modal">
            <div className="sdt-card-bar gold" />
            <div className="zeno-modal-header">
              <div className="zeno-modal-icon">
                <Gift size={28} />
              </div>
              <h3 className="zeno-modal-title">Asignar Premio</h3>
            </div>
            <div className="zeno-modal-body">
              <label className="zeno-modal-input-label">Descripción del premio</label>
              <input 
                autoFocus
                type="text" 
                className="zeno-modal-input"
                placeholder="Ej: Televisor 50', Bono $100..."
                value={premioTexto}
                onChange={(e) => setPremioTexto(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && confirmarGanadorFinal()}
              />
            </div>
            <div className="zeno-modal-footer">
              <button className="zeno-btn-cancel" onClick={() => setShowModalPremio(false)}>
                Cancelar
              </button>
              <button className="sdt-btn-confirmar" style={{ boxShadow: 'none' }} onClick={confirmarGanadorFinal}>
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="sdt-page">
        <div className="sdt-bubble sdt-bubble-1" />
        <div className="sdt-bubble sdt-bubble-2" />
        <div className="sdt-bubble sdt-bubble-3" />
        <div className="sdt-bubble sdt-bubble-4" />

        <div className="sdt-inner">

          <div className="sdt-topbar">
            <div className="sdt-topbar-left">
              <button onClick={() => navigate(-1)} className="sdt-btn-back">
                <ArrowLeft size={14} /> Dashboard
              </button>
              <h1 className="sdt-page-title">
                Sorteo · <span>{sorteo.nombre}</span>
              </h1>
            </div>
            {!finalizado && (
              <button onClick={finalizarSorteo} className="sdt-btn-finalizar">
                <XCircle size={14} /> Finalizar sorteo
              </button>
            )}
          </div>

          <div className="sdt-divider" />

          <div className="sdt-grid">

            <div className="sdt-card">
              <div className="sdt-card-bar" />
              <div className="sdt-card-body">
                <div className="sdt-card-label">📊 Estado del sorteo</div>
                <div className="sdt-stats-grid">
                  <div className="sdt-stat-item">
                    <div className="sdt-stat-lbl">Estado</div>
                    <span className={`sdt-badge-estado ${finalizado ? 'sdt-badge-finalizado' : 'sdt-badge-activo'}`}>
                      {finalizado ? '● Finalizado' : '● Activo'}
                    </span>
                  </div>
                  <div className="sdt-stat-item">
                    <div className="sdt-stat-lbl">Nivel</div>
                    <span className="sdt-badge-nivel">{sorteo.nivel_filtro}</span>
                  </div>
                  <div className="sdt-stat-item">
                    <div className="sdt-stat-lbl">Elegibles</div>
                    <div className="sdt-stat-val blue">{numerosElegibles.length}</div>
                  </div>
                  <div className="sdt-stat-item">
                    <div className="sdt-stat-lbl">Ganadores</div>
                    <div className="sdt-stat-val gold">{sorteo.ganadores?.length || 0}</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="sdt-card">
              <div className="sdt-card-bar" />
              <div className="sdt-card-body">
                <div className="sdt-card-label">🎫 Números elegibles</div>
                <div className="sdt-chips-wrap">
                  {numerosElegibles.length === 0
                    ? <p className="sdt-chips-empty">Sin números elegibles</p>
                    : numerosElegibles.map(n => (
                        <span key={n.numero} className="sdt-chip">{n.numero}</span>
                      ))
                  }
                </div>
              </div>
            </div>

            <div className="sdt-card sdt-card-full">
              <div className="sdt-card-bar gold" />
              <div className="sdt-card-body">
                <div className="sdt-card-label" style={{ justifyContent: 'center' }}>🎡 Ruleta de sorteo</div>
                <div className="sdt-ruleta-wrap">
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
              <div className="sdt-ganador-card">
                <div className="sdt-ganador-bar" />
                <div className="sdt-ganador-glow" />
                <div className="sdt-trophy"><Trophy size={36} /></div>
                <div className="sdt-ganador-pretitle">¡Tenemos un ganador!</div>
                <div className="sdt-ganador-numero">{ultimoGanador.numero}</div>
                <div className="sdt-ganador-line" />
                <div className="sdt-ganador-nombre">{ultimoGanador.nombre}</div>
                <div className="sdt-ganador-tel">{ultimoGanador.telefono}</div>
                <div className="sdt-ganador-actions">
                  <button onClick={abrirModalConfirmar} className="sdt-btn-confirmar">
                    <CheckCircle size={16} /> Confirmar ganador
                  </button>
                  <button onClick={repetir} className="sdt-btn-repetir">
                    <RotateCcw size={16} /> Repetir (excluir)
                  </button>
                </div>
              </div>
            )}

            <div className="sdt-card sdt-card-full" style={{ animationDelay: '0.22s' }}>
              <div className="sdt-card-bar green" />
              <div className="sdt-card-body">
                <div className="sdt-card-label">
                  <Trophy size={14} style={{ color: '#c17f0a' }} />
                  Historial de ganadores
                </div>
                {(!sorteo.ganadores || sorteo.ganadores.length === 0) ? (
                  <div className="sdt-table-empty">Aún no hay ganadores en este sorteo.</div>
                ) : (
                  <div className="sdt-table-wrap">
                    <table className="sdt-table">
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
                            <td><span className="sdt-num-badge">{g.numero_ganador}</span></td>
                            <td style={{ fontWeight: 600 }}>{g.participante?.nombre_completo || 'N/A'}</td>
                            <td style={{ color: '#475569' }}>{g.participante?.telefono || 'N/A'}</td>
                            <td><span className="sdt-premio-tag">{g.premio_descripcion || g.premio?.descripcion || 'Sin especificar'}</span></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>

          </div>

          <div className="sdt-footer">
            Zeno Marketing Platform · Sorteos en tiempo real
          </div>
        </div>
      </div>
    </>
  )
}