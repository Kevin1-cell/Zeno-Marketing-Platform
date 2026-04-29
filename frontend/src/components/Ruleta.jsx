import { useState, useEffect } from 'react'
import axios from 'axios'
import { io } from 'socket.io-client'
import toast from 'react-hot-toast'

const WS_SORTEOS = import.meta.env.VITE_WS_SORTEOS || 'ws://localhost:3004'

export default function Ruleta({ eventoId, token }) {
  const [sorteos, setSorteos] = useState([])
  const [sorteoActivo, setSorteoActivo] = useState(null)
  const [girando, setGirando] = useState(false)
  const [ultimoGanador, setUltimoGanador] = useState(null)
  const [numerosElegibles, setNumerosElegibles] = useState([])

  // Cargar sorteos del evento
  useEffect(() => {
    if (!eventoId) return
    const fetchSorteos = async () => {
      try {
        const res = await axios.get(`/sorteos?evento_id=${eventoId}`, {
          headers: { Authorization: `Bearer ${token}` }
        })
        // Asegurar que sea un array
        const sorteosData = Array.isArray(res.data) ? res.data : [res.data].filter(Boolean)
        setSorteos(sorteosData)
      } catch (err) {
        console.error('Error cargando sorteos:', err)
        setSorteos([])
      }
    }
    fetchSorteos()
  }, [eventoId, token])

  // WebSocket para sorteos
  useEffect(() => {
    if (!sorteoActivo) return
    const socket = io(WS_SORTEOS, { transports: ['websocket'] })
    socket.on('connect', () => console.log('WebSocket ruleta conectado'))
    socket.on(`sorteo:${sorteoActivo.id}:ganador_seleccionado`, (data) => {
      setUltimoGanador(data)
      toast.info(`Número ${data.numero} seleccionado`)
    })
    socket.on(`sorteo:${sorteoActivo.id}:ganador_confirmado`, () => {
      toast.success('Ganador confirmado')
      cargarNumerosElegibles()
      // Refrescar sorteos para actualizar estado
      axios.get(`/sorteos?evento_id=${eventoId}`, { headers: { Authorization: `Bearer ${token}` } })
        .then(res => setSorteos(Array.isArray(res.data) ? res.data : [res.data].filter(Boolean)))
        .catch(console.error)
    })
    return () => socket.disconnect()
  }, [sorteoActivo, eventoId, token])

  const cargarNumerosElegibles = async () => {
    if (!sorteoActivo) return
    try {
      const res = await axios.get(`/sorteos/${sorteoActivo.id}/numeros-elegibles`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setNumerosElegibles(Array.isArray(res.data) ? res.data : [])
    } catch (err) {
      console.error('Error cargando números elegibles:', err)
      setNumerosElegibles([])
    }
  }

  const girarRuleta = async () => {
    if (!sorteoActivo) return toast.error('Selecciona un sorteo')
    setGirando(true)
    try {
      await axios.post(`/sorteos/girar`, { sorteo_id: sorteoActivo.id }, {
        headers: { Authorization: `Bearer ${token}` }
      })
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error al girar')
    } finally {
      setGirando(false)
    }
  }

  const confirmarGanador = async () => {
    if (!ultimoGanador) return
    try {
      await axios.post(`/sorteos/confirmar-ganador`, {
        sorteo_id: sorteoActivo.id,
        numero_ganador: ultimoGanador.numero,
        participante_id: ultimoGanador.participante_id,
        premio_descripcion: 'Premio manual'
      }, { headers: { Authorization: `Bearer ${token}` } })
      setUltimoGanador(null)
      cargarNumerosElegibles()
    } catch (err) {
      toast.error('Error al confirmar ganador')
    }
  }

  const repetir = async () => {
    if (!ultimoGanador) return
    try {
      await axios.post(`/sorteos/repetir`, {
        sorteo_id: sorteoActivo.id,
        numero: ultimoGanador.numero
      }, { headers: { Authorization: `Bearer ${token}` } })
      setUltimoGanador(null)
      toast.info('Número excluido temporalmente')
      cargarNumerosElegibles()
    } catch (err) {
      toast.error('Error al excluir número')
    }
  }

  useEffect(() => {
    if (sorteoActivo) cargarNumerosElegibles()
  }, [sorteoActivo])

  return (
    <div className="bg-zeno-card rounded-lg p-4 border border-zeno-border mt-6">
      <h2 className="text-xl font-bold text-zeno-orange mb-4">Sorteo en vivo</h2>
      <div className="flex gap-4 mb-4">
        <select
          className="bg-zeno-dark border border-zeno-border rounded px-3 py-2"
          onChange={(e) => {
            const selected = sorteos.find(s => s.id === e.target.value)
            setSorteoActivo(selected || null)
          }}
          value={sorteoActivo?.id || ''}
        >
          <option value="">Seleccionar sorteo</option>
          {sorteos.map(s => (
            <option key={s.id} value={s.id}>{s.nombre} ({s.estado})</option>
          ))}
        </select>
        {sorteoActivo && (
          <button
            onClick={girarRuleta}
            disabled={girando}
            className="bg-zeno-blue px-4 py-2 rounded-lg disabled:opacity-50"
          >
            {girando ? 'Girando...' : '🎡 Girar ruleta'}
          </button>
        )}
      </div>

      {ultimoGanador && (
        <div className="bg-zeno-dark p-4 rounded-lg border border-zeno-orange my-4">
          <p className="text-2xl font-bold text-zeno-orange text-center animate-pulse">
            ¡Número {ultimoGanador.numero}!
          </p>
          <p className="text-center">{ultimoGanador.nombre} - {ultimoGanador.telefono}</p>
          <div className="flex gap-3 justify-center mt-3">
            <button onClick={confirmarGanador} className="bg-zeno-success px-4 py-1 rounded">✅ Confirmar ganador</button>
            <button onClick={repetir} className="bg-zeno-alert px-4 py-1 rounded">🔄 Repetir (excluir)</button>
          </div>
        </div>
      )}

      <div>
        <p className="text-zeno-text-sec">Números elegibles: {Array.isArray(numerosElegibles) ? numerosElegibles.length : 0}</p>
        {Array.isArray(numerosElegibles) && numerosElegibles.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1 max-h-32 overflow-y-auto">
            {numerosElegibles.slice(0, 30).map(n => (
              <span key={n.numero} className="bg-zeno-dark px-2 py-0.5 rounded text-xs">{n.numero}</span>
            ))}
            {numerosElegibles.length > 30 && <span className="text-xs">...</span>}
          </div>
        )}
      </div>
    </div>
  )
}