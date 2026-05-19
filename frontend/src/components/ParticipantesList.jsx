import { useState } from 'react'
import axios from 'axios'
import toast from 'react-hot-toast'
import { Search, CheckCircle2, UserPlus, Edit, Trash2, RefreshCw, X } from 'lucide-react'

export default function ParticipantesList({ participantes, token, eventoId, onParticipanteRegistrado }) {
  const [filtro, setFiltro] = useState('')
  const [mostrarFormManual, setMostrarFormManual] = useState(false)
  const [formManual, setFormManual] = useState({
    nombre_completo: '',
    telefon: '',
    tipo: 'EMPLEADO',
    nivel: 'C1',
    recompensa: ''
  })
  const [registrando, setRegistrando] = useState(false)
  const [editModal, setEditModal] = useState(null)
  const [editData, setEditData] = useState({})
  const [convirtiendo, setConvirtiendo] = useState(null)
  const [confirmandoId, setConfirmandoId] = useState(null)
  const [convertirModal, setConvertirModal] = useState(null)
  const [nivelSeleccionado, setNivelSeleccionado] = useState('C1')

  const registrarManual = async (e) => {
    e.preventDefault()
    if (!eventoId) { toast.error('No hay evento seleccionado'); return }
    if (!/^\d{10}$/.test(formManual.telefon)) {
      toast.error('El número de teléfono debe tener exactamente 10 dígitos')
      return
    }
    setRegistrando(true)
    try {
      const payload = {
        nombre_completo: formManual.nombre_completo,
        telefon: formManual.telefon,
        tipo: formManual.tipo,
        evento_id: eventoId
      }
      if (formManual.tipo === 'EMPLEADO') {
        payload.nivel = formManual.nivel
      } else {
        payload.recompensa = formManual.recompensa
      }
      const res = await axios.post('/participantes/manual', payload, {
        headers: { Authorization: `Bearer ${token}` }
      })
      toast.success(`✅ Registrado: ${res.data.nombre_completo}${res.data.numero_asignado ? ` (N°${res.data.numero_asignado})` : ''}`)
      setFormManual({ nombre_completo: '', telefon: '', tipo: 'EMPLEADO', nivel: 'C1', recompensa: '' })
      setMostrarFormManual(false)
      if (onParticipanteRegistrado) onParticipanteRegistrado()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error al registrar')
    } finally {
      setRegistrando(false)
    }
  }

  const confirmarParticipante = async (id) => {
    setConfirmandoId(id)
    try {
      await axios.patch('/participantes/confirmar', { id }, { headers: { Authorization: `Bearer ${token}` } })
      toast.success('Participante confirmado')
      if (onParticipanteRegistrado) onParticipanteRegistrado()
    } catch (err) {
      toast.error('Error al confirmar')
    } finally {
      setConfirmandoId(null)
    }
  }

  const editarParticipante = async (id, data) => {
    try {
      const res = await axios.patch(`/participantes/${id}`, data, {
        headers: { Authorization: `Bearer ${token}` }
      })
      toast.success('Participante actualizado')
      setEditModal(null)
      if (onParticipanteRegistrado) onParticipanteRegistrado()
      return res.data
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error al actualizar')
      throw err
    }
  }

  const abrirConvertirModal = (p) => {
    setNivelSeleccionado('C1')
    setConvertirModal({ id: p.id, nombre: p.nombre_completo })
  }

  const confirmarConversion = async () => {
    if (!convertirModal) return
    setConvirtiendo(convertirModal.id)
    try {
      await axios.post(`/participantes/convertir`, { id: convertirModal.id, nivel: nivelSeleccionado }, {
        headers: { Authorization: `Bearer ${token}` }
      })
      toast.success('Invitado convertido a participante confirmado')
      setConvertirModal(null)
      if (onParticipanteRegistrado) onParticipanteRegistrado()
    } catch (err) {
      toast.error('Error al convertir')
    } finally {
      setConvirtiendo(null)
    }
  }

  const eliminarParticipante = async (id) => {
    if (!confirm('¿Eliminar este participante? Esta acción no se puede deshacer.')) return
    try {
      await axios.delete(`/participantes/${id}`, { headers: { Authorization: `Bearer ${token}` } })
      toast.success('Participante eliminado')
      if (onParticipanteRegistrado) onParticipanteRegistrado()
    } catch (err) {
      toast.error('Error al eliminar')
    }
  }

  const filtrar = () => {
    const term = filtro.trim().toLowerCase()
    if (!term) return participantes
    return participantes.filter(p =>
      p.nombre_completo.toLowerCase().includes(term) ||
      p.telefon.toLowerCase().includes(term)
    )
  }

  const pendientes = filtrar().filter(p => p.tipo === 'EMPLEADO' && !p.confirmado)
  const confirmados = filtrar().filter(p => p.confirmado === true)
  const invitados = filtrar().filter(p => p.tipo === 'INVITADO')

  const totalPendientes = pendientes.length
  const totalConfirmados = confirmados.length
  const totalInvitados = invitados.length

  // Función para obtener la clase del badge según el nivel
  const getNivelClase = (nivel) => {
    if (!nivel) return 'invitado'
    switch(nivel) {
      case 'C1': return 'c1'
      case 'C2': return 'c2'
      case 'C3': return 'c3'
      case 'B1': return 'b1'  // agregamos clase b1 (puede tener mismo color que c3)
      default: return 'invitado'
    }
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Kameron:wght@400;700&family=DM+Sans:wght@400;500;600;700&display=swap');

        /* ── TOP BAR ── */
        .zpl-topbar {
          display: flex;
          gap: clamp(6px, 1.5vw, 10px);
          align-items: center;
          margin-bottom: clamp(12px, 2vw, 18px);
        }
        .zpl-search-wrap {
          flex: 1;
          position: relative;
        }
        .zpl-search-icon {
          position: absolute;
          left: clamp(10px, 2vw, 14px);
          top: 50%;
          transform: translateY(-50%);
          color: #93c5fd;
          pointer-events: none;
          display: flex;
          align-items: center;
        }
        .zpl-search {
          width: 100%;
          background: rgba(240, 249, 255, 0.8);
          border: 2px solid rgba(147, 197, 253, 0.5);
          border-radius: clamp(12px, 2vw, 16px);
          padding: clamp(10px, 1.5vw, 12px) clamp(12px, 2vw, 16px) clamp(10px, 1.5vw, 12px) clamp(34px, 5vw, 42px);
          color: #0c2340;
          font-family: 'DM Sans', sans-serif;
          font-size: clamp(13px, 1.5vw, 14px);
          font-weight: 500;
          outline: none;
          transition: border-color 0.2s, box-shadow 0.2s;
        }
        .zpl-search::placeholder { color: #93c5fd; }
        .zpl-search:focus {
          border-color: #38bdf8;
          box-shadow: 0 0 0 3px rgba(56, 189, 248, 0.12);
        }

        .zpl-btn-manual {
          display: flex;
          align-items: center;
          gap: 5px;
          background: linear-gradient(135deg, #38bdf8 0%, #0ea5e9 50%, #0284c7 100%);
          border: none;
          color: #fff;
          font-family: 'Kameron', serif;
          font-size: clamp(11px, 1.3vw, 13px);
          font-weight: 700;
          padding: clamp(9px, 1.5vw, 11px) clamp(14px, 2vw, 18px);
          border-radius: clamp(14px, 2vw, 18px);
          cursor: pointer;
          white-space: nowrap;
          box-shadow: 0 4px 14px rgba(14, 165, 233, 0.35);
          transition: transform 0.18s, box-shadow 0.18s;
          min-height: 44px;
        }
        .zpl-btn-manual:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(14, 165, 233, 0.5);
        }
        .zpl-btn-manual.open {
          background: linear-gradient(135deg, #f87171 0%, #ef4444 100%);
          box-shadow: 0 4px 14px rgba(239, 68, 68, 0.35);
        }

        /* ── FORM MANUAL ── */
        .zpl-form-card {
          background: rgba(255, 255, 255, 0.88);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border: 1.5px solid rgba(255, 255, 255, 0.9);
          border-radius: clamp(18px, 3vw, 24px);
          box-shadow: 0 8px 32px rgba(14, 120, 180, 0.14);
          padding: clamp(16px, 3vw, 22px);
          margin-bottom: clamp(16px, 2.5vw, 20px);
          animation: fadeUp 0.35s ease both;
        }
        .zpl-form-title {
          font-family: 'Kameron', serif;
          font-size: clamp(14px, 2vw, 17px);
          font-weight: 700;
          color: #0c2340;
          margin-bottom: clamp(14px, 2vw, 18px);
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .zpl-form-title span { color: #0ea5e9; }
        .zpl-label {
          font-family: 'DM Sans', sans-serif;
          font-size: clamp(9px, 1vw, 11px);
          font-weight: 700;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: #0369a1;
          display: block;
          margin-bottom: 6px;
        }
        .zpl-input {
          width: 100%;
          background: rgba(240, 249, 255, 0.8);
          border: 2px solid rgba(147, 197, 253, 0.5);
          border-radius: clamp(10px, 1.5vw, 14px);
          padding: clamp(9px, 1.5vw, 11px) clamp(12px, 2vw, 14px);
          color: #0c2340;
          font-family: 'DM Sans', sans-serif;
          font-size: clamp(13px, 1.5vw, 14px);
          font-weight: 600;
          outline: none;
          transition: border-color 0.2s, box-shadow 0.2s;
          display: block;
        }
        .zpl-input::placeholder { color: #93c5fd; font-weight: 400; }
        .zpl-input:focus {
          border-color: #38bdf8;
          box-shadow: 0 0 0 3px rgba(56, 189, 248, 0.12);
        }
        .zpl-form-row {
          display: flex;
          flex-direction: column;
          gap: clamp(10px, 1.5vw, 14px);
          margin-bottom: clamp(10px, 1.5vw, 14px);
        }
        .zpl-pill-group {
          display: flex;
          gap: 8px;
          background: rgba(219, 234, 254, 0.45);
          border: 1.5px solid rgba(147, 197, 253, 0.5);
          border-radius: clamp(12px, 2vw, 16px);
          padding: 4px;
        }
        .zpl-pill-btn {
          flex: 1;
          padding: clamp(7px, 1.2vw, 9px);
          border: none;
          border-radius: clamp(10px, 1.5vw, 14px);
          font-family: 'DM Sans', sans-serif;
          font-size: clamp(11px, 1.3vw, 13px);
          font-weight: 600;
          cursor: pointer;
          transition: all 0.18s;
          background: transparent;
          color: #64748b;
        }
        .zpl-pill-btn.active {
          background: #fff;
          color: #0369a1;
          box-shadow: 0 2px 8px rgba(14, 120, 180, 0.12);
        }
        .zpl-nivel-group {
          display: flex;
          gap: 8px;
        }
        .zpl-nivel-btn {
          flex: 1;
          padding: clamp(7px, 1.2vw, 9px);
          border: 2px solid rgba(147, 197, 253, 0.4);
          border-radius: clamp(10px, 1.5vw, 14px);
          font-family: 'DM Sans', sans-serif;
          font-size: clamp(12px, 1.4vw, 13px);
          font-weight: 700;
          cursor: pointer;
          transition: all 0.18s;
          background: rgba(240, 249, 255, 0.6);
          color: #475569;
        }
        .zpl-nivel-btn.active-c1 {
          background: rgba(56, 189, 248, 0.15);
          border-color: #38bdf8;
          color: #0284c7;
        }
        .zpl-nivel-btn.active-c2 {
          background: rgba(251, 191, 36, 0.15);
          border-color: #fbbf24;
          color: #92400e;
        }
        .zpl-nivel-btn.active-c3 {
          background: rgba(244, 114, 182, 0.15);
          border-color: #f472b6;
          color: #9d174d;
        }
        .zpl-nivel-btn.active-b1 {
          background: rgba(139, 92, 246, 0.15);
          border-color: #a78bfa;
          color: #6d28d9;
        }
        .zpl-btn-submit {
          width: 100%;
          background: linear-gradient(135deg, #38bdf8 0%, #0ea5e9 50%, #0284c7 100%);
          border: none;
          color: #fff;
          font-family: 'Kameron', serif;
          font-size: clamp(14px, 1.8vw, 16px);
          font-weight: 700;
          padding: clamp(12px, 2vw, 14px);
          border-radius: clamp(14px, 2vw, 18px);
          cursor: pointer;
          box-shadow: 0 6px 24px rgba(14, 165, 233, 0.4);
          transition: transform 0.18s, box-shadow 0.18s;
          min-height: 48px;
          margin-top: 4px;
        }
        .zpl-btn-submit:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 10px 32px rgba(14, 165, 233, 0.55);
        }
        .zpl-btn-submit:disabled { opacity: 0.65; cursor: not-allowed; }

        /* ── COUNTERS ── */
        .zpl-counters {
          display: flex;
          gap: clamp(8px, 1.5vw, 12px);
          margin-bottom: clamp(16px, 2.5vw, 22px);
        }
        .zpl-counter {
          flex: 1;
          padding: clamp(10px, 2vw, 14px) clamp(8px, 1.5vw, 12px);
          border-radius: clamp(14px, 2.5vw, 20px);
          text-align: center;
          background: rgba(255, 255, 255, 0.88);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          border: 1.5px solid rgba(147, 197, 253, 0.5);
          box-shadow: 0 4px 16px rgba(14, 120, 180, 0.1);
          position: relative;
          overflow: hidden;
        }
        .zpl-counter::before {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 3px;
        }
        .zpl-counter.pending::before { background: linear-gradient(90deg, #fbbf24, #f59e0b); }
        .zpl-counter.confirmed::before { background: linear-gradient(90deg, #22c55e, #16a34a); }
        .zpl-counter.invitados::before { background: linear-gradient(90deg, #38bdf8, #0ea5e9); }
        .zpl-counter-num {
          font-family: 'Kameron', serif;
          font-size: clamp(22px, 4vw, 28px);
          font-weight: 700;
          line-height: 1;
          color: #0c2340;
        }
        .zpl-counter.pending .zpl-counter-num { color: #92400e; }
        .zpl-counter.confirmed .zpl-counter-num { color: #16a34a; }
        .zpl-counter.invitados .zpl-counter-num { color: #0284c7; }
        .zpl-counter-label {
          font-family: 'DM Sans', sans-serif;
          font-size: clamp(9px, 1vw, 11px);
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.12em;
          color: #475569;
          margin-top: 4px;
        }

        /* ── SECTION LABELS ── */
        .zpl-section-label {
          font-family: 'DM Sans', sans-serif;
          font-size: clamp(9px, 1vw, 11px);
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.18em;
          display: flex;
          align-items: center;
          gap: 8px;
          margin: clamp(14px, 2.5vw, 20px) 0 clamp(8px, 1.5vw, 12px);
        }
        .zpl-section-label::after {
          content: '';
          flex: 1;
          height: 1px;
        }
        .zpl-section-label.pending { color: #92400e; }
        .zpl-section-label.pending::after { background: linear-gradient(90deg, rgba(251,191,36,0.4), transparent); }
        .zpl-section-label.confirmed { color: #16a34a; }
        .zpl-section-label.confirmed::after { background: linear-gradient(90deg, rgba(34,197,94,0.35), transparent); }
        .zpl-section-label.invitados { color: #0369a1; }
        .zpl-section-label.invitados::after { background: linear-gradient(90deg, rgba(56,189,248,0.35), transparent); }

        /* ── PARTICIPANT CARD (responsive grid) ── */
        .zpl-cards-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(min(100%, 360px), 1fr));
          gap: clamp(8px, 1.5vw, 12px);
          margin-bottom: clamp(4px, 1vw, 6px);
        }

        .zpl-card {
          background: rgba(255, 255, 255, 0.92);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          border: 1.5px solid rgba(147, 197, 253, 0.5);
          border-radius: clamp(14px, 2.5vw, 20px);
          box-shadow: 0 4px 16px rgba(14, 120, 180, 0.08);
          padding: clamp(12px, 2vw, 16px);
          display: flex;
          flex-direction: column;
          gap: 10px;
          transition: transform 0.18s, box-shadow 0.18s;
          animation: fadeUp 0.35s ease both;
        }
        .zpl-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 28px rgba(14, 120, 180, 0.15);
        }

        /* card top row: badge + name + actions */
        .zpl-card-top {
          display: flex;
          align-items: center;
          gap: clamp(10px, 2vw, 14px);
        }

        .zpl-nivel-badge {
          width: clamp(40px, 6vw, 48px);
          height: clamp(40px, 6vw, 48px);
          border-radius: clamp(10px, 2vw, 14px);
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: 'Kameron', serif;
          font-size: clamp(13px, 1.8vw, 15px);
          font-weight: 700;
          flex-shrink: 0;
        }
        .zpl-nivel-badge.c1 { background: rgba(56, 189, 248, 0.15); color: #0284c7; border: 1.5px solid rgba(56,189,248,0.35); }
        .zpl-nivel-badge.c2 { background: rgba(251, 191, 36, 0.15); color: #92400e; border: 1.5px solid rgba(251,191,36,0.4); }
        .zpl-nivel-badge.c3 { background: rgba(244, 114, 182, 0.15); color: #9d174d; border: 1.5px solid rgba(244,114,182,0.35); }
        .zpl-nivel-badge.b1 { background: rgba(139, 92, 246, 0.15); color: #6d28d9; border: 1.5px solid rgba(139,92,246,0.35); }
        .zpl-nivel-badge.invitado { background: rgba(14, 165, 233, 0.12); color: #0369a1; border: 1.5px solid rgba(14,165,233,0.3); font-size: 18px; }

        .zpl-name-wrap {
          flex: 1;
          min-width: 0;
        }
        .zpl-name {
          font-family: 'Kameron', serif;
          font-size: clamp(15px, 2.2vw, 18px);
          font-weight: 700;
          color: #0c2340;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          line-height: 1.2;
        }
        .zpl-tipo-chip {
          display: inline-block;
          font-family: 'DM Sans', sans-serif;
          font-size: clamp(9px, 1vw, 10px);
          font-weight: 700;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: #64748b;
          margin-top: 2px;
        }

        /* card bottom row: phone pill + numero + recompensa */
        .zpl-card-data {
          display: flex;
          align-items: center;
          gap: 8px;
          flex-wrap: wrap;
        }

        /* phone pill – big and readable */
        .zpl-phone-pill {
          display: flex;
          align-items: center;
          gap: 7px;
          background: rgba(12, 35, 64, 0.06);
          border: 1.5px solid rgba(12, 35, 64, 0.12);
          border-radius: 999px;
          padding: 5px 14px 5px 10px;
        }
        .zpl-phone-icon {
          width: 22px;
          height: 22px;
          border-radius: 50%;
          background: #0ea5e9;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        .zpl-phone-icon svg {
          display: block;
        }
        .zpl-phone-num {
          font-family: 'Kameron', serif;
          font-size: clamp(15px, 2.2vw, 17px);
          font-weight: 700;
          color: #0c2340;
          letter-spacing: 0.04em;
        }

        /* numero asignado badge */
        .zpl-num-badge {
          display: flex;
          align-items: center;
          gap: 4px;
          background: rgba(193, 127, 10, 0.12);
          color: #92400e;
          border: 1.5px solid rgba(193, 127, 10, 0.28);
          border-radius: 999px;
          padding: 5px 12px;
          font-family: 'Kameron', serif;
          font-weight: 700;
          font-size: clamp(13px, 1.8vw, 15px);
        }

        .zpl-recompensa-chip {
          display: flex;
          align-items: center;
          gap: 5px;
          font-family: 'DM Sans', sans-serif;
          font-size: clamp(11px, 1.3vw, 12px);
          font-weight: 600;
          color: #0369a1;
          background: rgba(14, 165, 233, 0.08);
          border: 1.5px solid rgba(14, 165, 233, 0.2);
          border-radius: 999px;
          padding: 4px 11px;
        }

        .zpl-actions {
          display: flex;
          gap: clamp(4px, 1vw, 6px);
          align-items: center;
          flex-shrink: 0;
        }
        .zpl-btn-icon {
          background: transparent;
          border: none;
          cursor: pointer;
          padding: clamp(6px, 1.2vw, 8px);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: background 0.18s, transform 0.18s;
          min-width: 34px;
          min-height: 34px;
        }
        .zpl-btn-icon.edit { color: #0ea5e9; }
        .zpl-btn-icon.edit:hover { background: rgba(14, 165, 233, 0.12); transform: scale(1.1); }
        .zpl-btn-icon.confirm { color: #16a34a; }
        .zpl-btn-icon.confirm:hover { background: rgba(22, 163, 74, 0.1); transform: scale(1.1); }
        .zpl-btn-icon.convert { color: #0369a1; }
        .zpl-btn-icon.convert:hover { background: rgba(3, 105, 161, 0.1); transform: scale(1.1); }

        /* ── MODAL ── */
        .zpl-modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(12, 35, 64, 0.55);
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          padding: 16px;
          animation: fadeUp 0.2s ease both;
        }
        .zpl-modal {
          width: min(440px, 96vw);
          background: rgba(255, 255, 255, 0.97);
          border-radius: clamp(20px, 3.5vw, 28px);
          padding: clamp(20px, 3vw, 28px);
          border: 1.5px solid rgba(255, 255, 255, 0.9);
          box-shadow: 0 32px 80px rgba(14, 120, 180, 0.22), 0 8px 24px rgba(14, 120, 180, 0.12);
          animation: fadeUp 0.28s ease both;
        }
        .zpl-modal-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: clamp(16px, 2.5vw, 20px);
        }
        .zpl-modal-title {
          font-family: 'Kameron', serif;
          font-size: clamp(16px, 2.5vw, 20px);
          font-weight: 700;
          color: #0c2340;
        }
        .zpl-modal-close {
          background: rgba(14, 165, 233, 0.1);
          border: none;
          cursor: pointer;
          color: #0ea5e9;
          border-radius: 50%;
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: background 0.18s;
        }
        .zpl-modal-close:hover { background: rgba(14, 165, 233, 0.2); }
        .zpl-modal-rows { display: flex; flex-direction: column; gap: clamp(10px, 1.5vw, 14px); }
        .zpl-modal-footer {
          display: flex;
          gap: 8px;
          margin-top: clamp(14px, 2vw, 18px);
        }
        .zpl-btn-outline {
          flex: 1;
          border: 1.5px solid rgba(56, 189, 248, 0.4);
          background: rgba(240, 249, 255, 0.5);
          color: #0369a1;
          font-family: 'Kameron', serif;
          font-size: clamp(13px, 1.5vw, 15px);
          font-weight: 700;
          padding: clamp(10px, 1.5vw, 13px);
          border-radius: clamp(12px, 2vw, 16px);
          cursor: pointer;
          transition: all 0.18s;
          min-height: 44px;
        }
        .zpl-btn-outline:hover { background: rgba(56, 189, 248, 0.12); }

        /* ── CONVERTIR MODAL NIVEL SELECTOR ── */
        .zpl-convertir-subtitle {
          font-family: 'DM Sans', sans-serif;
          font-size: clamp(12px, 1.4vw, 14px);
          color: #475569;
          margin-bottom: clamp(14px, 2vw, 18px);
          margin-top: -8px;
        }
        .zpl-convertir-subtitle strong {
          color: #0c2340;
          font-weight: 700;
        }
        .zpl-nivel-select-group {
          display: flex;
          gap: 10px;
        }
        .zpl-nivel-select-btn {
          flex: 1;
          padding: clamp(14px, 2.5vw, 20px) clamp(10px, 1.5vw, 14px);
          border-radius: clamp(14px, 2.5vw, 18px);
          border: 2px solid rgba(147, 197, 253, 0.4);
          font-family: 'Kameron', serif;
          font-size: clamp(18px, 3vw, 24px);
          font-weight: 700;
          cursor: pointer;
          transition: all 0.2s;
          background: rgba(240, 249, 255, 0.6);
          color: #475569;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 4px;
          position: relative;
          overflow: hidden;
        }
        .zpl-nivel-select-btn::before {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 3px;
          border-radius: 0;
          opacity: 0;
          transition: opacity 0.2s;
        }
        .zpl-nivel-select-btn.sel-c1 {
          background: rgba(56, 189, 248, 0.12);
          border-color: #38bdf8;
          color: #0284c7;
          box-shadow: 0 4px 16px rgba(56, 189, 248, 0.25);
        }
        .zpl-nivel-select-btn.sel-c1::before { background: linear-gradient(90deg, #38bdf8, #0ea5e9); opacity: 1; }
        .zpl-nivel-select-btn.sel-c2 {
          background: rgba(251, 191, 36, 0.12);
          border-color: #fbbf24;
          color: #92400e;
          box-shadow: 0 4px 16px rgba(251, 191, 36, 0.25);
        }
        .zpl-nivel-select-btn.sel-c2::before { background: linear-gradient(90deg, #fbbf24, #f59e0b); opacity: 1; }
        .zpl-nivel-select-btn.sel-c3 {
          background: rgba(244, 114, 182, 0.12);
          border-color: #f472b6;
          color: #9d174d;
          box-shadow: 0 4px 16px rgba(244, 114, 182, 0.25);
        }
        .zpl-nivel-select-btn.sel-c3::before { background: linear-gradient(90deg, #f472b6, #ec4899); opacity: 1; }
        .zpl-nivel-select-btn.sel-b1 {
          background: rgba(139, 92, 246, 0.12);
          border-color: #a78bfa;
          color: #6d28d9;
          box-shadow: 0 4px 16px rgba(139, 92, 246, 0.25);
        }
        .zpl-nivel-select-btn.sel-b1::before { background: linear-gradient(90deg, #a78bfa, #8b5cf6); opacity: 1; }
        .zpl-nivel-select-label {
          font-family: 'DM Sans', sans-serif;
          font-size: clamp(9px, 1vw, 10px);
          font-weight: 700;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          opacity: 0.7;
        }

        /* ── EMPTY ── */
        .zpl-empty {
          text-align: center;
          padding: clamp(28px, 5vw, 40px) 16px;
          color: #475569;
          font-family: 'DM Sans', sans-serif;
          font-size: clamp(13px, 1.8vw, 15px);
        }
        .zpl-empty-icon {
          font-size: 32px;
          margin-bottom: 10px;
        }

        /* ── DIVIDER ── */
        .zpl-divider {
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(56, 189, 248, 0.3), transparent);
          margin: clamp(14px, 2.5vw, 20px) 0;
        }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        .zpl-spin { animation: spin 0.9s linear infinite; }
      `}</style>

      <div className="zpl-topbar">
        <div className="zpl-search-wrap">
          <span className="zpl-search-icon"><Search size={15} /></span>
          <input
            type="text"
            value={filtro}
            onChange={e => setFiltro(e.target.value)}
            className="zpl-search"
            placeholder="Buscar nombre o teléfono..."
          />
        </div>
        <button
          onClick={() => setMostrarFormManual(!mostrarFormManual)}
          className={`zpl-btn-manual${mostrarFormManual ? ' open' : ''}`}
        >
          {mostrarFormManual ? <X size={14} /> : <UserPlus size={14} />}
          {mostrarFormManual ? 'Cerrar' : 'Agregar'}
        </button>
      </div>

      {mostrarFormManual && (
        <div className="zpl-form-card">
          <p className="zpl-form-title">
            <UserPlus size={16} style={{ color: '#0ea5e9' }} />
            Registro manual
          </p>
          <form onSubmit={registrarManual}>
            <div className="zpl-form-row">
              <div>
                <label className="zpl-label">Nombre completo</label>
                <input
                  type="text"
                  required
                  className="zpl-input"
                  placeholder="Ej. María González"
                  value={formManual.nombre_completo}
                  onChange={e => setFormManual({ ...formManual, nombre_completo: e.target.value })}
                />
              </div>
              <div>
                <label className="zpl-label">Teléfono (10 dígitos)</label>
                <input
                  type="tel"
                  required
                  pattern="\d{10}"
                  className="zpl-input"
                  placeholder="3001234567"
                  value={formManual.telefon}
                  onChange={e => setFormManual({ ...formManual, telefon: e.target.value })}
                />
              </div>
              <div>
                <label className="zpl-label">Tipo de participante</label>
                <div className="zpl-pill-group">
                  {['EMPLEADO', 'INVITADO'].map(t => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setFormManual({ ...formManual, tipo: t, nivel: t === 'EMPLEADO' ? 'C1' : undefined })}
                      className={`zpl-pill-btn${formManual.tipo === t ? ' active' : ''}`}
                    >
                      {t === 'EMPLEADO' ? '👤 Empleado' : '🎟️ Invitado'}
                    </button>
                  ))}
                </div>
              </div>
              {formManual.tipo === 'EMPLEADO' && (
                <div>
                  <label className="zpl-label">Nivel</label>
                  <div className="zpl-nivel-group">
                    {['C1', 'C2', 'C3', 'B1'].map(n => (
                      <button
                        key={n}
                        type="button"
                        onClick={() => setFormManual({ ...formManual, nivel: n })}
                        className={`zpl-nivel-btn${formManual.nivel === n ? ` active-${n.toLowerCase()}` : ''}`}
                      >
                        {n}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              {formManual.tipo === 'INVITADO' && (
                <div>
                  <label className="zpl-label">Recompensa (opcional)</label>
                  <input
                    type="text"
                    className="zpl-input"
                    placeholder="Ej. Entrada gratis, Merchandising"
                    value={formManual.recompensa}
                    onChange={e => setFormManual({ ...formManual, recompensa: e.target.value })}
                  />
                </div>
              )}
            </div>
            <button type="submit" disabled={registrando} className="zpl-btn-submit">
              {registrando ? 'Registrando...' : 'Registrar participante'}
            </button>
          </form>
        </div>
      )}

      <div className="zpl-counters">
        <div className="zpl-counter pending">
          <p className="zpl-counter-num">{totalPendientes}</p>
          <p className="zpl-counter-label">Pendientes</p>
        </div>
        <div className="zpl-counter invitados">
          <p className="zpl-counter-num">{totalInvitados}</p>
          <p className="zpl-counter-label">Invitados</p>
        </div>
        <div className="zpl-counter confirmed">
          <p className="zpl-counter-num">{totalConfirmados}</p>
          <p className="zpl-counter-label">Confirmados</p>
        </div>
      </div>

      {editModal && (
        <div className="zpl-modal-overlay" onClick={() => setEditModal(null)}>
          <div className="zpl-modal" onClick={e => e.stopPropagation()}>
            <div className="zpl-modal-header">
              <h3 className="zpl-modal-title">Editar participante</h3>
              <button className="zpl-modal-close" onClick={() => setEditModal(null)}>
                <X size={15} />
              </button>
            </div>
            <div className="zpl-modal-rows">
              <div>
                <label className="zpl-label">Nombre</label>
                <input
                  type="text"
                  className="zpl-input"
                  value={editData.nombre_completo || ''}
                  onChange={e => setEditData({ ...editData, nombre_completo: e.target.value })}
                />
              </div>
              <div>
                <label className="zpl-label">Teléfono</label>
                <input
                  type="tel"
                  className="zpl-input"
                  value={editData.telefon || ''}
                  onChange={e => setEditData({ ...editData, telefon: e.target.value })}
                />
              </div>
              {editData.tipo === 'EMPLEADO' && (
                <div>
                  <label className="zpl-label">Nivel</label>
                  <div className="zpl-nivel-group">
                    {['C1', 'C2', 'C3', 'B1'].map(n => (
                      <button
                        key={n}
                        type="button"
                        onClick={() => setEditData({ ...editData, nivel: n })}
                        className={`zpl-nivel-btn${editData.nivel === n ? ` active-${n.toLowerCase()}` : ''}`}
                      >
                        {n}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              {editData.tipo === 'INVITADO' && (
                <div>
                  <label className="zpl-label">Recompensa</label>
                  <input
                    type="text"
                    className="zpl-input"
                    value={editData.recompensa || ''}
                    onChange={e => setEditData({ ...editData, recompensa: e.target.value })}
                  />
                </div>
              )}
            </div>
            <div className="zpl-modal-footer">
              <button
                onClick={async () => { await editarParticipante(editModal, editData) }}
                className="zpl-btn-submit"
                style={{ flex: 1 }}
              >
                Guardar cambios
              </button>
              <button onClick={() => setEditModal(null)} className="zpl-btn-outline">
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {convertirModal && (
        <div className="zpl-modal-overlay" onClick={() => setConvertirModal(null)}>
          <div className="zpl-modal" onClick={e => e.stopPropagation()}>
            <div className="zpl-modal-header">
              <h3 className="zpl-modal-title">Convertir invitado</h3>
              <button className="zpl-modal-close" onClick={() => setConvertirModal(null)}>
                <X size={15} />
              </button>
            </div>
            <p className="zpl-convertir-subtitle">
              Selecciona el nivel para <strong>{convertirModal.nombre}</strong>
            </p>
            <div>
              <label className="zpl-label" style={{ marginBottom: '10px' }}>Nivel del participante</label>
              <div className="zpl-nivel-select-group">
                {['C1', 'C2', 'C3', 'B1'].map(n => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => setNivelSeleccionado(n)}
                    className={`zpl-nivel-select-btn${nivelSeleccionado === n ? ` sel-${n.toLowerCase()}` : ''}`}
                  >
                    {n}
                    <span className="zpl-nivel-select-label">Nivel</span>
                  </button>
                ))}
              </div>
            </div>
            <div className="zpl-modal-footer">
              <button
                onClick={confirmarConversion}
                disabled={convirtiendo === convertirModal.id}
                className="zpl-btn-submit"
                style={{ flex: 1 }}
              >
                {convirtiendo === convertirModal.id
                  ? 'Convirtiendo...'
                  : `Confirmar como ${nivelSeleccionado}`
                }
              </button>
              <button onClick={() => setConvertirModal(null)} className="zpl-btn-outline">
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {pendientes.length > 0 && (
        <>
          <p className="zpl-section-label pending">⏳ Pendientes ({pendientes.length})</p>
          <div className="zpl-cards-grid">
            {pendientes.map(p => (
              <ParticipanteCard
                key={p.id}
                p={p}
                onEdit={() => { setEditModal(p.id); setEditData(p) }}
                onConfirmar={() => confirmarParticipante(p.id)}
                confirmando={confirmandoId === p.id}
                onConvertirInvitado={null}
              />
            ))}
          </div>
        </>
      )}

      {invitados.length > 0 && (
        <>
          <p className="zpl-section-label invitados">🎟️ Invitados ({invitados.length})</p>
          <div className="zpl-cards-grid">
            {invitados.map(p => (
              <ParticipanteCard
                key={p.id}
                p={p}
                onEdit={() => { setEditModal(p.id); setEditData(p) }}
                onConfirmar={null}
                confirmando={false}
                onConvertirInvitado={() => abrirConvertirModal(p)}
              />
            ))}
          </div>
        </>
      )}

      {confirmados.length > 0 && (
        <>
          <p className="zpl-section-label confirmed">✓ Confirmados ({confirmados.length})</p>
          <div className="zpl-cards-grid">
            {confirmados.map(p => (
              <ParticipanteCard
                key={p.id}
                p={p}
                onEdit={() => { setEditModal(p.id); setEditData(p) }}
                onConfirmar={null}
                confirmando={false}
                onConvertirInvitado={null}
              />
            ))}
          </div>
        </>
      )}

      {pendientes.length === 0 && confirmados.length === 0 && invitados.length === 0 && (
        <div className="zpl-empty">
          <div className="zpl-empty-icon">{filtro ? '🔍' : '👥'}</div>
          <p>{filtro ? 'Sin resultados para la búsqueda' : 'No hay participantes registrados'}</p>
        </div>
      )}
    </>
  )
}

function ParticipanteCard({ p, onEdit, onConfirmar, confirmando, onConvertirInvitado }) {
  const getNivelClase = () => {
    if (p.tipo === 'INVITADO') return 'invitado'
    switch(p.nivel) {
      case 'C1': return 'c1'
      case 'C2': return 'c2'
      case 'C3': return 'c3'
      case 'B1': return 'b1'
      default: return 'invitado'
    }
  }
  const nivelClase = getNivelClase()
  return (
    <div className="zpl-card">
      <div className="zpl-card-top">
        <div className={`zpl-nivel-badge ${nivelClase}`}>
          {p.tipo === 'INVITADO' ? '🎟️' : p.nivel}
        </div>
        <div className="zpl-name-wrap">
          <p className="zpl-name">{p.nombre_completo}</p>
          <span className="zpl-tipo-chip">{p.tipo === 'INVITADO' ? 'Invitado' : `Empleado · ${p.nivel}`}</span>
        </div>
        <div className="zpl-actions">
          <button onClick={onEdit} className="zpl-btn-icon edit" title="Editar">
            <Edit size={15} />
          </button>
          {onConfirmar && (
            <button
              onClick={onConfirmar}
              disabled={confirmando}
              className="zpl-btn-icon confirm"
              title="Confirmar"
            >
              {confirmando
                ? <RefreshCw size={14} className="zpl-spin" />
                : <CheckCircle2 size={15} />
              }
            </button>
          )}
          {p.tipo === 'INVITADO' && onConvertirInvitado && (
            <button
              onClick={onConvertirInvitado}
              className="zpl-btn-icon convert"
              title="Convertir a participante"
            >
              <RefreshCw size={14} />
            </button>
          )}
        </div>
      </div>

      <div className="zpl-card-data">
        <div className="zpl-phone-pill">
          <div className="zpl-phone-icon">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 11.9 19.79 19.79 0 0 1 1.61 3.27 2 2 0 0 1 3.6 1h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.57a16 16 0 0 0 6.29 6.29l.97-.97a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
            </svg>
          </div>
          <span className="zpl-phone-num">{p.telefon}</span>
        </div>
        {p.numero_asignado && (
          <div className="zpl-num-badge">
            N° {p.numero_asignado}
          </div>
        )}
        {p.tipo === 'INVITADO' && p.recompensa && (
          <span className="zpl-recompensa-chip">🏆 {p.recompensa}</span>
        )}
      </div>
    </div>
  )
}