import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import axios from 'axios'
import { io } from 'socket.io-client'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import toast from 'react-hot-toast'
import EventosList from '../components/EventosList'
import CrearSorteo from '../components/CrearSorteo'

const WS_PARTICIPANTES = import.meta.env.VITE_WS_PARTICIPANTES || 'ws://localhost:3003/participants'

export default function Dashboard() {
  const navigate = useNavigate()
  const { token } = useAuthStore()
  const [eventos, setEventos] = useState([])
  const [eventoSeleccionado, setEventoSeleccionado] = useState(null)
  const [participantes, setParticipantes] = useState([])
  const [stats, setStats] = useState({ total: 0, confirmados: 0, porNivel: { C1: 0, C2: 0, C3: 0 } })
  const [sorteos, setSorteos] = useState([])
  const [generandoReporte, setGenerandoReporte] = useState(false)

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

  const refreshEventData = async () => {
    if (!eventoSeleccionado) return
    try {
      const [participantesRes, statsRes, sorteosRes] = await Promise.all([
        axios.get(`/participantes?evento_id=${eventoSeleccionado.id}`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`/eventos/${eventoSeleccionado.id}/estadisticas`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`/sorteos?evento_id=${eventoSeleccionado.id}`, { headers: { Authorization: `Bearer ${token}` } })
      ])
      setParticipantes(participantesRes.data)
      setStats(statsRes.data)
      setSorteos(Array.isArray(sorteosRes.data) ? sorteosRes.data : [])
    } catch (err) {
      console.error('Error refrescando datos:', err)
    }
  }

  useEffect(() => {
    if (!eventoSeleccionado) return
    refreshEventData()

    const socket = io(WS_PARTICIPANTES, { transports: ['websocket'] })
    console.log('🔌 Conectando WebSocket en dashboard')

    socket.on('connect', () => console.log('✅ WebSocket conectado (dashboard)'))
    socket.on('participante:nuevo', (nuevoParticipante) => {
      if (nuevoParticipante.evento_id === eventoSeleccionado.id) {
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
      if (participanteConfirmado.evento_id === eventoSeleccionado.id) {
        setParticipantes(prev =>
          prev.map(p => p.id === participanteConfirmado.id ? { ...p, confirmado: true } : p)
        )
        setStats(prev => ({
          ...prev,
          confirmados: prev.confirmados + 1
        }))
        toast.success(`Confirmado: ${participanteConfirmado.nombre_completo}`)
      }
    })
    socket.on('disconnect', () => console.log('❌ WebSocket desconectado (dashboard)'))
    return () => socket.disconnect()
  }, [eventoSeleccionado, token])

  const handleSorteoCreado = () => {
    if (!eventoSeleccionado) return
    refreshEventData()
  }

  const confirmadosPorNivel = {
    C1: participantes.filter(p => p.confirmado && p.nivel === 'C1').length,
    C2: participantes.filter(p => p.confirmado && p.nivel === 'C2').length,
    C3: participantes.filter(p => p.confirmado && p.nivel === 'C3').length,
  }
  const totalConfirmados = participantes.filter(p => p.confirmado).length

  const generarReportePDF = async () => {
    if (!eventoSeleccionado) {
      toast.error('Selecciona un evento primero')
      return
    }
    setGenerandoReporte(true)
    try {
      const participantesConfirmados = participantes.filter(p => p.confirmado)
      const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
      const pageWidth = doc.internal.pageSize.getWidth()
      const margin = 15
      let y = margin

      const colorZenoBlue = [30, 111, 255]
      const colorZenoOrange = [255, 140, 0]

      doc.setFontSize(22)
      doc.setTextColor(...colorZenoBlue)
      doc.text('ZENO MARKETING', pageWidth / 2, y, { align: 'center' })
      y += 10
      doc.setFontSize(16)
      doc.setTextColor(...colorZenoOrange)
      doc.text(`Reporte del evento: ${eventoSeleccionado.nombre}`, pageWidth / 2, y, { align: 'center' })
      y += 8
      doc.setFontSize(10)
      doc.setTextColor(100, 100, 100)
      doc.text(`Fecha de generación: ${new Date().toLocaleString()}`, margin, y)
      y += 12

      doc.setFontSize(14)
      doc.setTextColor(...colorZenoBlue)
      doc.text('Estadísticas generales', margin, y)
      y += 6
      doc.setFontSize(11)
      doc.setTextColor(0, 0, 0)
      doc.text(`• Total de registrados: ${stats.total}`, margin, y)
      y += 6
      doc.text(`  Desglose por nivel: C1: ${stats.porNivel?.C1 || 0} | C2: ${stats.porNivel?.C2 || 0} | C3: ${stats.porNivel?.C3 || 0}`, margin, y)
      y += 8
      doc.text(`• Total de confirmados: ${totalConfirmados}`, margin, y)
      y += 6
      doc.text(`  Desglose por nivel: C1: ${confirmadosPorNivel.C1} | C2: ${confirmadosPorNivel.C2} | C3: ${confirmadosPorNivel.C3}`, margin, y)
      y += 12

      if (participantesConfirmados.length > 0) {
        doc.setFontSize(14)
        doc.setTextColor(...colorZenoBlue)
        doc.text('Participantes confirmados', margin, y)
        y += 6
        const participantesData = participantesConfirmados.map(p => [
          p.nombre_completo,
          p.telefon,
          p.nivel,
          p.numero_asignado?.toString() || 'N/A'
        ])
        autoTable(doc, {
          startY: y,
          head: [['Nombre', 'Teléfono', 'Nivel', 'N° Sorteo']],
          body: participantesData,
          theme: 'striped',
          headStyles: { fillColor: colorZenoBlue, textColor: 255, fontSize: 10 },
          bodyStyles: { fontSize: 9 },
          margin: { left: margin, right: margin }
        })
        y = doc.lastAutoTable.finalY + 8
      } else {
        doc.setFontSize(11)
        doc.text('No hay participantes confirmados.', margin, y)
        y += 8
      }

      doc.setFontSize(14)
      doc.setTextColor(...colorZenoBlue)
      doc.text('Sorteos realizados', margin, y)
      y += 6

      if (sorteos.length === 0) {
        doc.setFontSize(11)
        doc.text('No se ha realizado ningún sorteo para este evento.', margin, y)
        y += 8
      } else {
        for (const sorteo of sorteos) {
          doc.setFontSize(12)
          doc.setTextColor(...colorZenoOrange)
          doc.text(`${sorteo.nombre} (${sorteo.estado})`, margin, y)
          y += 5
          doc.setFontSize(10)
          doc.setTextColor(0, 0, 0)
          doc.text(`Filtro de nivel: ${sorteo.nivel_filtro}`, margin + 5, y)
          y += 5

          const ganadores = sorteo.ganadores || []
          if (ganadores.length === 0) {
            doc.text('Sin ganadores registrados.', margin + 5, y)
            y += 6
          } else {
            const ganadoresData = ganadores.map(g => [
              g.participante?.nombre_completo || 'N/A',
              g.participante?.telefon || 'N/A',
              g.numero_ganador?.toString() || 'N/A',
              g.premio_descripcion || (g.premio?.descripcion) || 'Manual'
            ])
            autoTable(doc, {
              startY: y,
              head: [['Ganador', 'Teléfono', 'N° Sorteo', 'Premio']],
              body: ganadoresData,
              theme: 'plain',
              headStyles: { fillColor: colorZenoOrange, textColor: 255, fontSize: 9 },
              bodyStyles: { fontSize: 8 },
              margin: { left: margin + 5, right: margin }
            })
            y = doc.lastAutoTable.finalY + 5
          }
          y += 3
          if (y > doc.internal.pageSize.getHeight() - 30) {
            doc.addPage()
            y = margin
          }
        }
      }

      const pageCount = doc.internal.getNumberOfPages()
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i)
        doc.setFontSize(8)
        doc.setTextColor(150, 150, 150)
        doc.text(`Generado por Zeno Marketing Platform - Página ${i} de ${pageCount}`, pageWidth / 2, doc.internal.pageSize.getHeight() - 10, { align: 'center' })
      }

      doc.save(`reporte_${eventoSeleccionado.nombre.replace(/\s+/g, '_')}.pdf`)
      toast.success('Reporte generado exitosamente')
    } catch (error) {
      console.error('Error generando reporte:', error)
      toast.error('Error al generar el reporte')
    } finally {
      setGenerandoReporte(false)
    }
  }

  return (
    <div className="min-h-screen bg-zeno-dark p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-zeno-blue">Panel Zeno</h1>
          <button
              onClick={() => {
                useAuthStore.getState().logout()
                window.location.href = '/'
              }}
              className="bg-zeno-orange px-4 py-2 rounded-lg"
           >
            Cerrar sesión
          </button>
        </div>

        <EventosList eventos={eventos} onSelect={setEventoSeleccionado} />

        {eventoSeleccionado && (
          <>
            <div className="flex justify-end gap-3 mb-4">
              <button
                onClick={() => navigate(`/participantes/${eventoSeleccionado.id}`)}
                className="bg-zeno-blue px-4 py-2 rounded-lg text-sm font-semibold"
              >
                📋 Gestionar participantes
              </button>
              <button
                onClick={generarReportePDF}
                disabled={generandoReporte}
                className="bg-green-700 px-4 py-2 rounded-lg text-sm font-semibold disabled:opacity-50 flex items-center gap-2"
              >
                {generandoReporte ? 'Generando...' : '📄 Generar reporte'}
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4 my-6">
              <div className="bg-zeno-card p-4 rounded-lg text-center border border-zeno-border">
                <p className="text-zeno-text-sec text-sm">Total registrados</p>
                <p className="text-3xl font-bold text-zeno-blue">{stats.total}</p>
                <p className="text-sm text-zeno-text-sec mt-1">
                  C1: {stats.porNivel?.C1 || 0} | C2: {stats.porNivel?.C2 || 0} | C3: {stats.porNivel?.C3 || 0}
                </p>
              </div>

              <div className="bg-zeno-card p-4 rounded-lg text-center border border-zeno-border">
                <p className="text-zeno-text-sec text-sm">Confirmados</p>
                <p className="text-3xl font-bold text-zeno-success">{totalConfirmados}</p>
                <p className="text-sm text-zeno-text-sec mt-1">
                  C1: {confirmadosPorNivel.C1} | C2: {confirmadosPorNivel.C2} | C3: {confirmadosPorNivel.C3}
                </p>
              </div>
            </div>

            <CrearSorteo
              eventoId={eventoSeleccionado.id}
              token={token}
              onSorteoCreado={handleSorteoCreado}
            />

            <div className="mt-6 bg-zeno-card rounded-lg p-4 border border-zeno-border">
              <h2 className="text-xl font-bold text-zeno-orange mb-4">Sorteos del evento</h2>
              {sorteos.length === 0 && (
                <p className="text-zeno-text-sec">No hay sorteos creados. Usa el botón "+ Nuevo sorteo" para crear uno.</p>
              )}
              <div className="space-y-2">
                {sorteos.map(s => (
                  <div key={s.id} className="flex justify-between items-center p-3 bg-zeno-dark rounded-lg border border-zeno-border">
                    <div>
                      <p className="font-semibold">{s.nombre}</p>
                      <p className="text-sm text-zeno-text-sec">Estado: {s.estado} | Filtro: {s.nivel_filtro}</p>
                    </div>
                    <button
                      onClick={() => navigate(`/sorteos/${s.id}`)}
                      className="bg-zeno-blue px-4 py-1 rounded text-sm hover:bg-blue-700 transition"
                    >
                      Administrar sorteo
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}