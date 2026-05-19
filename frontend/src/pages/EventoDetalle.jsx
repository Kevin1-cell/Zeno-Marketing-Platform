import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import axios from 'axios'
import { io } from 'socket.io-client'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import toast from 'react-hot-toast'
import CrearSorteo from '../components/CrearSorteo'

const WS_PARTICIPANTES = import.meta.env.VITE_WS_PARTICIPANTES || 'ws://localhost:3003/participants'

export default function EventoDetalle() {
  const { eventoId } = useParams()
  const navigate = useNavigate()
  const { token } = useAuthStore()
  const [evento, setEvento] = useState(null)
  const [participantes, setParticipantes] = useState([])
  const [stats, setStats] = useState({ total: 0, confirmados: 0, porNivel: { C1: 0, C2: 0, C3: 0, B1: 0 } })
  const [sorteos, setSorteos] = useState([])
  const [generandoReporte, setGenerandoReporte] = useState(false)

  const fetchData = async () => {
    if (!eventoId) return
    try {
      const [eventoRes, participantesRes, statsRes, sorteosRes] = await Promise.all([
        axios.get(`/eventos/${eventoId}`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`/participantes?evento_id=${eventoId}`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`/eventos/${eventoId}/estadisticas`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`/sorteos?evento_id=${eventoId}`, { headers: { Authorization: `Bearer ${token}` } })
      ])
      setEvento(eventoRes.data)
      setParticipantes(participantesRes.data)
      setStats(statsRes.data)
      setSorteos(Array.isArray(sorteosRes.data) ? sorteosRes.data : [])
    } catch (err) {
      toast.error('Error al cargar datos del evento')
    }
  }

  useEffect(() => {
    if (!eventoId || !token) return
    fetchData()

    const socket = io('/participants', {
      path: '/socket.io',
      transports: ['websocket']
    })
    
    socket.on('participante:nuevo', (nuevoParticipante) => {
      if (nuevoParticipante.evento_id === eventoId) {
        setParticipantes(prev => [...prev, nuevoParticipante])
        setStats(prev => ({
          total: prev.total + 1,
          confirmados: prev.confirmados,
          porNivel: {
            ...prev.porNivel,
            [nuevoParticipante.nivel]: (prev.porNivel[nuevoParticipante.nivel] || 0) + 1
          }
        }))
        toast.success(`Nuevo participante: ${nuevoParticipante.nombre_completo}`)
      }
    })
    socket.on('participante:confirmado', (participanteConfirmado) => {
      if (participanteConfirmado.evento_id === eventoId) {
        setParticipantes(prev =>
          prev.map(p => p.id === participanteConfirmado.id ? { ...p, confirmado: true } : p)
        )
        setStats(prev => ({ ...prev, confirmados: prev.confirmados + 1 }))
        toast.success(`Confirmado: ${participanteConfirmado.nombre_completo}`)
      }
    })
    return () => socket.disconnect()
  }, [eventoId, token])

  const handleSorteoCreado = () => {
    fetchData()
  }

  // Cálculo de estadísticas locales (incluye B1)
  const totalEmpleados = participantes.filter(p => p.tipo === 'EMPLEADO' && p.confirmado).length
  const totalInvitados = participantes.filter(p => p.tipo === 'INVITADO').length
  const invitadosUnidos = participantes.filter(p => p.tipo === 'INVITADO' && p.se_unio === true).length

  const confirmadosPorNivel = {
    C1: participantes.filter(p => p.confirmado && p.nivel === 'C1').length,
    C2: participantes.filter(p => p.confirmado && p.nivel === 'C2').length,
    C3: participantes.filter(p => p.confirmado && p.nivel === 'C3').length,
    B1: participantes.filter(p => p.confirmado && p.nivel === 'B1').length,
  }
  const totalConfirmados = participantes.filter(p => p.confirmado).length

  const generarReportePDF = async () => {
    setGenerandoReporte(true)
    try {
      const participantesConfirmados = participantes.filter(p => p.confirmado)
      const invitadosList = participantes.filter(p => p.tipo === 'INVITADO')
      const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
      const pageWidth = doc.internal.pageSize.getWidth()
      const margin = 15
      let y = margin
      const colorZenoBlue = [30, 111, 255]
      const colorZenoOrange = [255, 140, 0]

      doc.setFontSize(22); doc.setTextColor(...colorZenoBlue)
      doc.text('ZENO MARKETING', pageWidth / 2, y, { align: 'center' }); y += 10
      doc.setFontSize(16); doc.setTextColor(...colorZenoOrange)
      doc.text(`Reporte del evento: ${evento.nombre}`, pageWidth / 2, y, { align: 'center' }); y += 8
      doc.setFontSize(10); doc.setTextColor(100, 100, 100)
      doc.text(`Fecha de generación: ${new Date().toLocaleString()}`, margin, y); y += 12

      doc.setFontSize(14); doc.setTextColor(...colorZenoBlue)
      doc.text('Estadísticas generales', margin, y); y += 6
      doc.setFontSize(11); doc.setTextColor(0, 0, 0)
      doc.text(`• Total de registrados (empleados + invitados): ${stats.total}`, margin, y); y += 6
      doc.text(`  Empleados: ${totalEmpleados} | Invitados: ${totalInvitados}`, margin, y); y += 6
      doc.text(`  Invitados que se unieron: ${invitadosUnidos}`, margin, y); y += 6
      doc.text(`• Total de confirmados (empleados + invitados convertidos): ${totalConfirmados}`, margin, y); y += 6
      doc.text(`  Desglose por nivel: C1: ${confirmadosPorNivel.C1} | C2: ${confirmadosPorNivel.C2} | C3: ${confirmadosPorNivel.C3} | B1: ${confirmadosPorNivel.B1}`, margin, y); y += 12

      if (participantesConfirmados.length > 0) {
        doc.setFontSize(14); doc.setTextColor(...colorZenoBlue)
        doc.text('Participantes confirmados', margin, y); y += 6
        autoTable(doc, {
          startY: y,
          head: [['Nombre', 'Teléfono', 'Nivel', 'N° Sorteo']],
          body: participantesConfirmados.map(p => [p.nombre_completo, p.telefon, p.nivel, p.numero_asignado?.toString() || 'N/A']),
          theme: 'striped',
          headStyles: { fillColor: colorZenoBlue, textColor: 255, fontSize: 10 },
          bodyStyles: { fontSize: 9 },
          margin: { left: margin, right: margin }
        })
        y = doc.lastAutoTable.finalY + 8
      }

      if (invitadosList.length > 0) {
        doc.setFontSize(14); doc.setTextColor(...colorZenoBlue)
        doc.text('Invitados', margin, y); y += 6
        autoTable(doc, {
          startY: y,
          head: [['Nombre', 'Teléfono', 'Se unió', 'Recompensa']],
          body: invitadosList.map(p => [p.nombre_completo, p.telefon, p.se_unio ? 'Sí' : 'No', p.recompensa || '—']),
          theme: 'striped',
          headStyles: { fillColor: colorZenoOrange, textColor: 255, fontSize: 10 },
          bodyStyles: { fontSize: 9 },
          margin: { left: margin, right: margin }
        })
        y = doc.lastAutoTable.finalY + 8
      }

      doc.setFontSize(14); doc.setTextColor(...colorZenoBlue)
      doc.text('Sorteos realizados', margin, y); y += 6
      if (sorteos.length === 0) {
        doc.setFontSize(11); doc.text('No se ha realizado ningún sorteo para este evento.', margin, y); y += 8
      } else {
        for (const sorteo of sorteos) {
          doc.setFontSize(12); doc.setTextColor(...colorZenoOrange)
          doc.text(`${sorteo.nombre} (${sorteo.estado})`, margin, y); y += 5
          doc.setFontSize(10); doc.setTextColor(0, 0, 0)
          doc.text(`Filtro de nivel: ${sorteo.nivel_filtro}`, margin + 5, y); y += 5
          const ganadores = sorteo.ganadores || []
          if (ganadores.length === 0) { doc.text('Sin ganadores registrados.', margin + 5, y); y += 6 }
          else {
            autoTable(doc, {
              startY: y,
              head: [['Ganador', 'Teléfono', 'N° Sorteo', 'Premio']],
              body: ganadores.map(g => [g.participante?.nombre_completo || 'N/A', g.participante?.telefon || 'N/A', g.numero_ganador?.toString() || 'N/A', g.premio_descripcion || g.premio?.descripcion || 'Manual']),
              theme: 'plain',
              headStyles: { fillColor: colorZenoOrange, textColor: 255, fontSize: 9 },
              bodyStyles: { fontSize: 8 },
              margin: { left: margin + 5, right: margin }
            })
            y = doc.lastAutoTable.finalY + 5
          }
          y += 3
          if (y > doc.internal.pageSize.getHeight() - 30) { doc.addPage(); y = margin }
        }
      }

      const pageCount = doc.internal.getNumberOfPages()
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i); doc.setFontSize(8); doc.setTextColor(150, 150, 150)
        doc.text(`Generado por Zeno Marketing Platform - Página ${i} de ${pageCount}`, pageWidth / 2, doc.internal.pageSize.getHeight() - 10, { align: 'center' })
      }
      doc.save(`reporte_${evento.nombre.replace(/\s+/g, '_')}.pdf`)
      toast.success('Reporte generado exitosamente')
    } catch (error) {
      toast.error('Error al generar el reporte')
    } finally {
      setGenerandoReporte(false)
    }
  }

  if (!evento) return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Kameron:wght@400;700&family=DM+Sans:wght@400;500;600;700&display=swap');
      `}</style>
      <div style={{
        minHeight: '100vh',
        background: 'radial-gradient(ellipse at 30% 20%, #e0f7ff 0%, transparent 60%), radial-gradient(ellipse at 80% 80%, #cde8f5 0%, transparent 55%), radial-gradient(ellipse at 60% 50%, #93c5fd55 0%, transparent 50%), #e8f4fd',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontFamily: "'Kameron', serif", color: '#0369a1', fontSize: 20,
      }}>
        Cargando evento...
      </div>
    </>
  )

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Kameron:wght@400;700&family=DM+Sans:wght@400;500;600;700&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        .ed-page {
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

        /* Burbujas animadas */
        .ed-bubble {
          position: fixed;
          border-radius: 50%;
          pointer-events: none;
          z-index: 0;
          animation: edFloat linear infinite;
        }
        .ed-bubble-1 {
          width: clamp(200px, 30vw, 420px);
          height: clamp(200px, 30vw, 420px);
          top: -80px; left: -80px;
          background: radial-gradient(circle at 35% 35%, #bae6fd 0%, #7dd3fc55 50%, transparent 70%);
          animation-duration: 9s;
        }
        .ed-bubble-2 {
          width: clamp(140px, 20vw, 280px);
          height: clamp(140px, 20vw, 280px);
          top: 30%; right: -60px;
          background: radial-gradient(circle at 40% 40%, #e0f2fe 0%, #93c5fd44 50%, transparent 70%);
          animation-duration: 12s; animation-delay: -3s;
        }
        .ed-bubble-3 {
          width: clamp(100px, 15vw, 200px);
          height: clamp(100px, 15vw, 200px);
          bottom: 10%; left: 15%;
          background: radial-gradient(circle at 40% 40%, #bfdbfe 0%, #60a5fa33 50%, transparent 70%);
          animation-duration: 10s; animation-delay: -5s;
        }
        .ed-bubble-4 {
          width: clamp(160px, 22vw, 320px);
          height: clamp(160px, 22vw, 320px);
          bottom: -60px; right: 10%;
          background: radial-gradient(circle at 40% 35%, #e0f7ff 0%, #7dd3fc33 50%, transparent 70%);
          animation-duration: 14s; animation-delay: -7s;
        }
        @keyframes edFloat {
          0% { transform: translateY(0px) rotate(0deg); }
          33% { transform: translateY(-18px) rotate(2deg); }
          66% { transform: translateY(-8px) rotate(-1deg); }
          100% { transform: translateY(0px) rotate(0deg); }
        }

        .ed-inner {
          position: relative; z-index: 1;
          max-width: 900px;
          margin: 0 auto;
        }

        /* Header */
        .ed-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 14px;
          margin-bottom: clamp(20px, 3vw, 32px);
        }
        .ed-header-left { display: flex; flex-direction: column; gap: 6px; }
        .ed-breadcrumb {
          font-size: clamp(9px, 1vw, 11px);
          font-weight: 700;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: #0369a1;
        }
        .ed-title {
          font-family: 'Kameron', serif;
          font-size: clamp(22px, 5vw, 36px);
          font-weight: 700;
          color: #0c2340;
          line-height: 1.15;
        }

        .ed-btn-back {
          display: flex; align-items: center; gap: 7px;
          padding: clamp(10px, 1.5vw, 12px) clamp(16px, 2.5vw, 22px);
          border-radius: clamp(16px, 2.5vw, 22px);
          border: 1.5px solid rgba(56,189,248,0.4);
          background: rgba(240,249,255,0.5);
          color: #0369a1; font-weight: 700;
          font-family: 'DM Sans', sans-serif;
          font-size: clamp(12px, 1.5vw, 14px);
          cursor: pointer; transition: all 0.2s;
          backdrop-filter: blur(8px);
          white-space: nowrap;
        }
        .ed-btn-back:hover {
          background: rgba(240,249,255,0.85);
          border-color: rgba(56,189,248,0.7);
          transform: translateY(-1px);
        }

        /* Divider */
        .ed-divider {
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(56,189,248,0.3), transparent);
          margin-bottom: clamp(16px, 2.5vw, 28px);
        }

        /* Stats grid */
        .ed-stats-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: clamp(10px, 2vw, 18px);
          margin-bottom: clamp(16px, 2.5vw, 26px);
        }
        @media (max-width: 520px) {
          .ed-stats-grid { grid-template-columns: 1fr; }
        }

        .ed-stat-card {
          background: rgba(255,255,255,0.88);
          backdrop-filter: blur(28px);
          border: 1.5px solid rgba(255,255,255,0.9);
          box-shadow: 0 8px 32px rgba(14,120,180,0.14), inset 0 1px 0 rgba(255,255,255,1);
          border-radius: clamp(18px, 3vw, 28px);
          padding: clamp(16px, 2.5vw, 24px);
          text-align: center;
          position: relative;
          overflow: hidden;
          animation: edFadeUp 0.38s ease both;
        }
        .ed-stat-card:nth-child(2) { animation-delay: 0.06s; }
        .ed-stat-card:nth-child(3) { animation-delay: 0.12s; }
        @keyframes edFadeUp {
          from { transform: translateY(12px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }

        .ed-stat-bar {
          position: absolute;
          top: 0; left: 0; right: 0; height: 4px;
          background: linear-gradient(90deg, #38bdf8, #7dd3fc);
          background-size: 200% 100%;
          animation: edShimmer 2s linear infinite;
        }
        .ed-stat-bar.green { background: linear-gradient(90deg, #16a34a, #22c55e, #86efac); background-size: 200% 100%; }
        .ed-stat-bar.orange { background: linear-gradient(90deg, #c17f0a, #f59e0b, #fcd34d); background-size: 200% 100%; }
        @keyframes edShimmer {
          0% { background-position: 0% 50%; }
          100% { background-position: 200% 50%; }
        }

        .ed-stat-label {
          font-size: clamp(9px, 1vw, 11px);
          font-weight: 700;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: #0369a1;
          margin-bottom: 8px;
        }
        .ed-stat-number {
          font-family: 'Kameron', serif;
          font-size: clamp(32px, 6vw, 48px);
          font-weight: 700;
          line-height: 1;
          margin-bottom: 6px;
        }
        .ed-stat-number.blue { color: #0284c7; }
        .ed-stat-number.green { color: #16a34a; }
        .ed-stat-number.orange { color: #c17f0a; }
        .ed-stat-sub {
          font-size: clamp(10px, 1.2vw, 12px);
          color: #475569;
          font-weight: 500;
        }

        /* Acciones */
        .ed-actions {
          display: flex;
          justify-content: flex-end;
          gap: clamp(8px, 1.5vw, 12px);
          margin-bottom: clamp(14px, 2vw, 22px);
          flex-wrap: wrap;
        }

        /* Iconos SVG inline */
        .ed-icon {
          display: inline-block;
          width: 15px;
          height: 15px;
          vertical-align: middle;
          flex-shrink: 0;
        }

        .ed-btn-primary {
          display: flex; align-items: center; gap: 8px;
          padding: clamp(10px, 1.5vw, 13px) clamp(16px, 2.5vw, 22px);
          border-radius: clamp(16px, 2.5vw, 22px);
          background: linear-gradient(135deg, #38bdf8 0%, #0ea5e9 50%, #0284c7 100%);
          border: none;
          color: #fff;
          font-family: 'Kameron', serif; font-weight: 700;
          font-size: clamp(12px, 1.5vw, 14px);
          cursor: pointer;
          box-shadow: 0 6px 24px rgba(14,165,233,0.4);
          transition: all 0.2s;
          white-space: nowrap;
          min-height: 44px;
        }
        .ed-btn-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 32px rgba(14,165,233,0.5);
        }

        .ed-btn-success {
          display: flex; align-items: center; gap: 8px;
          padding: clamp(10px, 1.5vw, 13px) clamp(16px, 2.5vw, 22px);
          border-radius: clamp(16px, 2.5vw, 22px);
          background: linear-gradient(135deg, #16a34a 0%, #22c55e 100%);
          border: none;
          color: #fff;
          font-family: 'Kameron', serif; font-weight: 700;
          font-size: clamp(12px, 1.5vw, 14px);
          cursor: pointer;
          box-shadow: 0 6px 24px rgba(22,163,74,0.35);
          transition: all 0.2s;
          white-space: nowrap;
          min-height: 44px;
        }
        .ed-btn-success:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 32px rgba(22,163,74,0.45);
        }
        .ed-btn-success:disabled {
          opacity: 0.6; cursor: not-allowed; transform: none;
        }

        /* Card principal */
        .ed-card {
          background: rgba(255,255,255,0.88);
          backdrop-filter: blur(28px);
          border: 1.5px solid rgba(255,255,255,0.9);
          box-shadow: 0 40px 100px rgba(14,120,180,0.22), 0 16px 40px rgba(14,120,180,0.12), inset 0 1px 0 rgba(255,255,255,1);
          border-radius: clamp(24px, 4vw, 36px);
          overflow: hidden;
          margin-bottom: clamp(14px, 2vw, 22px);
          animation: edFadeUp 0.38s 0.18s ease both;
        }

        .ed-card-header {
          display: flex; align-items: center;
          justify-content: space-between;
          padding: clamp(16px, 2.5vw, 24px) clamp(20px, 3vw, 32px);
          border-bottom: 1px solid rgba(147,197,253,0.25);
        }
        .ed-card-title {
          display: flex;
          align-items: center;
          gap: 10px;
          font-family: 'Kameron', serif;
          font-size: clamp(15px, 2.5vw, 20px);
          font-weight: 700;
          color: #0c2340;
        }
        .ed-card-title-icon {
          width: 32px;
          height: 32px;
          border-radius: 9px;
          background: linear-gradient(135deg, rgba(56,189,248,0.18), rgba(14,165,233,0.08));
          border: 1.5px solid rgba(56,189,248,0.25);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .ed-card-body {
          padding: clamp(16px, 2.5vw, 24px) clamp(20px, 3vw, 32px);
        }

        /* Sorteos lista */
        .ed-sorteos-list { display: flex; flex-direction: column; gap: 10px; }
        .ed-sorteo-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          padding: clamp(12px, 2vw, 18px) clamp(14px, 2.5vw, 22px);
          background: rgba(240,249,255,0.6);
          border: 1.5px solid rgba(147,197,253,0.35);
          border-radius: clamp(14px, 2vw, 20px);
          transition: all 0.2s;
          flex-wrap: wrap;
        }
        .ed-sorteo-item:hover {
          background: rgba(240,249,255,0.9);
          border-color: rgba(56,189,248,0.5);
          transform: translateY(-1px);
          box-shadow: 0 4px 16px rgba(14,120,180,0.1);
        }
        .ed-sorteo-nombre {
          font-family: 'Kameron', serif;
          font-weight: 700;
          font-size: clamp(14px, 2vw, 17px);
          color: #0c2340;
        }
        .ed-sorteo-meta {
          font-size: clamp(10px, 1.2vw, 12px);
          color: #475569;
          margin-top: 3px;
        }
        .ed-badge {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          padding: 5px 12px;
          border-radius: 50px;
          font-size: 11px; font-weight: 700;
          letter-spacing: 0.06em;
        }
        .ed-badge-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          flex-shrink: 0;
        }
        .ed-badge-activo {
          background: rgba(22,163,74,0.1);
          border: 1px solid rgba(22,163,74,0.3);
          color: #16a34a;
        }
        .ed-badge-activo .ed-badge-dot { background: #16a34a; }
        .ed-badge-finalizado {
          background: rgba(100,116,139,0.1);
          border: 1px solid rgba(100,116,139,0.3);
          color: #475569;
        }
        .ed-badge-finalizado .ed-badge-dot { background: #64748b; }

        .ed-empty {
          text-align: center;
          padding: clamp(24px, 4vw, 40px);
          color: #475569;
          font-size: clamp(13px, 1.5vw, 15px);
        }
        .ed-empty-icon {
          width: 48px;
          height: 48px;
          margin: 0 auto 14px;
          border-radius: 14px;
          background: linear-gradient(135deg, rgba(56,189,248,0.12), rgba(14,165,233,0.05));
          border: 1.5px solid rgba(56,189,248,0.2);
          display: flex;
          align-items: center;
          justify-content: center;
        }

        /* Footer */
        .ed-footer {
          text-align: center;
          margin-top: clamp(24px, 4vw, 40px);
          padding-top: clamp(12px, 2vw, 18px);
          border-top: 1px solid rgba(147,197,253,0.3);
          font-size: clamp(10px, 1.2vw, 12px);
          color: #475569;
          font-weight: 500;
        }
      `}</style>

      <div className="ed-page">
        <div className="ed-bubble ed-bubble-1" />
        <div className="ed-bubble ed-bubble-2" />
        <div className="ed-bubble ed-bubble-3" />
        <div className="ed-bubble ed-bubble-4" />

        <div className="ed-inner">
          {/* Header */}
          <div className="ed-header">
            <div className="ed-header-left">
              <span className="ed-breadcrumb">Zeno Marketing · Evento</span>
              <h1 className="ed-title">{evento.nombre}</h1>
            </div>
            <button onClick={() => navigate('/dashboard')} className="ed-btn-back">
              <svg className="ed-icon" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M10 12L6 8L10 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Volver al Dashboard
            </button>
          </div>

          <div className="ed-divider" />

          {/* Stats */}
          <div className="ed-stats-grid">
            <div className="ed-stat-card">
              <div className="ed-stat-bar" />
              <div className="ed-stat-label">Total registrados</div>
              <div className="ed-stat-number blue">{stats.total}</div>
              <div className="ed-stat-sub">Empleados: {totalEmpleados} · Invitados: {totalInvitados}</div>
            </div>
            <div className="ed-stat-card">
              <div className="ed-stat-bar green" />
              <div className="ed-stat-label">Confirmados</div>
              <div className="ed-stat-number green">{totalConfirmados}</div>
              <div className="ed-stat-sub">C1: {confirmadosPorNivel.C1} · C2: {confirmadosPorNivel.C2} · C3: {confirmadosPorNivel.C3} · B1: {confirmadosPorNivel.B1}</div>
            </div>
            <div className="ed-stat-card">
              <div className="ed-stat-bar orange" />
              <div className="ed-stat-label">Invitados</div>
              <div className="ed-stat-number orange">{totalInvitados}</div>
              <div className="ed-stat-sub">Se unieron: {invitadosUnidos}</div>
            </div>
          </div>

          {/* Acciones */}
          <div className="ed-actions">
            <button onClick={() => navigate(`/participantes/${evento.id}`)} className="ed-btn-primary">
              <svg className="ed-icon" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M2 4h12M2 8h12M2 12h7" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
              </svg>
              Gestionar participantes
            </button>
            <button onClick={generarReportePDF} disabled={generandoReporte} className="ed-btn-success">
              <svg className="ed-icon" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M4 2h6l3 3v9H4V2z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M9 2v4h3M8 8v4M6 10l2 2 2-2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              {generandoReporte ? 'Generando...' : 'Generar reporte'}
            </button>
          </div>

          {/* Crear Sorteo */}
          <CrearSorteo
            eventoId={evento.id}
            token={token}
            onSorteoCreado={handleSorteoCreado}
          />

          {/* Sorteos del evento */}
          <div className="ed-card" style={{ animationDelay: '0.22s' }}>
            <div className="ed-card-header">
              <div className="ed-card-title">
                <div className="ed-card-title-icon">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="8" cy="8" r="6" stroke="#0ea5e9" strokeWidth="1.5"/>
                    <path d="M5 8l2 2 4-4" stroke="#0ea5e9" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                Sorteos del evento
              </div>
              <span style={{ fontSize: 12, color: '#475569', fontWeight: 600 }}>
                {sorteos.length} sorteo{sorteos.length !== 1 ? 's' : ''}
              </span>
            </div>
            <div className="ed-card-body">
              {sorteos.length === 0 ? (
                <div className="ed-empty">
                  <div className="ed-empty-icon">
                    <svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <rect x="3" y="3" width="16" height="16" rx="4" stroke="#38bdf8" strokeWidth="1.5"/>
                      <path d="M11 7v4M11 13v1" stroke="#38bdf8" strokeWidth="1.5" strokeLinecap="round"/>
                    </svg>
                  </div>
                  No hay sorteos creados aún.<br />
                  <span style={{ color: '#0369a1', fontWeight: 700 }}>Usa el formulario de arriba para crear uno.</span>
                </div>
              ) : (
                <div className="ed-sorteos-list">
                  {sorteos.map(s => (
                    <div key={s.id} className="ed-sorteo-item">
                      <div>
                        <div className="ed-sorteo-nombre">{s.nombre}</div>
                        <div className="ed-sorteo-meta">Filtro de nivel: <strong style={{ color: '#0369a1' }}>{s.nivel_filtro}</strong></div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                        <span className={`ed-badge ${s.estado === 'FINALIZADO' ? 'ed-badge-finalizado' : 'ed-badge-activo'}`}>
                          <span className="ed-badge-dot" />
                          {s.estado === 'FINALIZADO' ? 'Finalizado' : 'Activo'}
                        </span>
                        <button
                          onClick={() => navigate(`/sorteos/${s.id}`)}
                          className="ed-btn-primary"
                          style={{ padding: '8px 18px', fontSize: 12, minHeight: 36 }}
                        >
                          Administrar
                          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ marginLeft: 2 }}>
                            <path d="M4 2l4 4-4 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="ed-footer">
            Zeno Marketing Platform · Gestión de eventos y sorteos en tiempo real
          </div>
        </div>
      </div>
    </>
  )
}