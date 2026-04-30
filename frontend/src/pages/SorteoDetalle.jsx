import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import axios from 'axios'
import toast from 'react-hot-toast'

export default function SorteoDetalle() {
  const { id } = useParams()
  const navigate = useNavigate()
  const token = localStorage.getItem('token')
  const [sorteo, setSorteo] = useState(null)
  const [girando, setGirando] = useState(false)
  const [ultimoGanador, setUltimoGanador] = useState(null)
  const [numerosElegibles, setNumerosElegibles] = useState([])

  const cargarSorteo = async () => {
    try {
      const res = await axios.get(`/sorteos/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
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
    if (numerosElegibles.length === 0) return toast.error('No hay números elegibles. Finaliza el sorteo.')

    setGirando(true)
    setUltimoGanador(null)
    const loadingToast = toast.loading('🎰 La ruleta está girando...')

    setTimeout(async () => {
      try {
        const res = await axios.post(`/sorteos/girar`, { sorteo_id: id }, {
          headers: { Authorization: `Bearer ${token}` }
        })
        toast.dismiss(loadingToast)
        setUltimoGanador(res.data)
        toast.success(`🎉 Número ${res.data.numero} seleccionado!`)
      } catch (err) {
        toast.dismiss(loadingToast)
        toast.error(err.response?.data?.message || 'Error al girar la ruleta')
      } finally {
        setGirando(false)
      }
    }, 5000)
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
      await axios.post(`/sorteos/${id}/finalizar`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      })
      toast.success('Sorteo finalizado')
      cargarSorteo()
    } catch (err) {
      toast.error('Error al finalizar sorteo')
    }
  }

  if (!sorteo) return <div className="p-6 text-white">Cargando sorteo...</div>

  return (
    <div className="min-h-screen bg-zeno-dark p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-zeno-orange">Ruleta - {sorteo.nombre}</h1>
          <div className="flex gap-3">
            {sorteo.estado !== 'FINALIZADO' && (
              <button
                onClick={finalizarSorteo}
                className="bg-red-600 px-4 py-2 rounded-lg hover:bg-red-700"
              >
                Finalizar sorteo
              </button>
            )}
            <button
              onClick={() => navigate('/dashboard')}
              className="bg-zeno-blue px-4 py-2 rounded-lg hover:bg-zeno-blue/80 transition"
            >
              ← Volver al Dashboard
            </button>
          </div>
        </div>

        <div className="bg-zeno-card rounded-lg p-6 border border-zeno-border">
          <div className="flex justify-between items-center mb-6">
            <div>
              <p className="text-zeno-text-sec">Estado: <span className="text-zeno-blue">{sorteo.estado}</span></p>
              <p className="text-zeno-text-sec">Filtro de nivel: {sorteo.nivel_filtro}</p>
              <p className="text-zeno-text-sec">Números elegibles: {numerosElegibles.length}</p>
            </div>
            <button
              onClick={girarRuleta}
              disabled={girando || sorteo.estado === 'FINALIZADO' || numerosElegibles.length === 0}
              className={`bg-gradient-to-r from-zeno-blue to-zeno-orange px-8 py-3 rounded-lg text-xl font-bold transition disabled:opacity-50 ${girando ? 'animate-spin' : ''}`}
            >
              {girando ? '🎰 GIRANDO...' : '🎡 GIRAR RULETA'}
            </button>
          </div>

          {ultimoGanador && (
            <div className="mt-6 bg-zeno-dark p-6 rounded-lg border border-zeno-orange text-center">
              <p className="text-4xl font-bold text-zeno-orange animate-pulse">¡Número {ultimoGanador.numero}!</p>
              <p className="text-xl mt-2">{ultimoGanador.nombre}</p>
              <p className="text-zeno-text-sec">{ultimoGanador.telefono}</p>
              <div className="flex gap-4 justify-center mt-4">
                <button
                  onClick={confirmarGanador}
                  className="bg-green-600 px-6 py-2 rounded-lg hover:bg-green-700 transition"
                >
                  ✅ Confirmar ganador
                </button>
                <button
                  onClick={repetir}
                  className="bg-yellow-600 px-6 py-2 rounded-lg hover:bg-yellow-700 transition"
                >
                  🔄 Repetir (excluir)
                </button>
              </div>
            </div>
          )}

          {/* Historial de ganadores */}
          <div className="mt-8">
            <h3 className="text-xl font-semibold text-zeno-blue mb-3">🏆 Historial de ganadores</h3>
            {(!sorteo.ganadores || sorteo.ganadores.length === 0) && (
              <p className="text-zeno-text-sec">Aún no hay ganadores en este sorteo.</p>
            )}
            {sorteo.ganadores && sorteo.ganadores.length > 0 && (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="border-b border-zeno-border">
                    <tr>
                      <th className="text-left py-2">Nombre</th>
                      <th className="text-left">Teléfono</th>
                      <th className="text-left">N° sorteo</th>
                      <th className="text-left">Premio</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sorteo.ganadores.map(g => (
                      <tr key={g.id} className="border-b border-zeno-border/50">
                        <td className="py-2">{g.participante?.nombre_completo || 'N/A'}</td>
                        <td>{g.participante?.telefon || 'N/A'}</td>
                        <td>{g.numero_ganador}</td>
                        <td>{g.premio_descripcion || (g.premio?.descripcion) || 'Manual'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <div className="mt-6">
            <p className="text-zeno-text-sec mb-2">Números elegibles restantes</p>
            <div className="flex flex-wrap gap-2 max-h-60 overflow-y-auto p-2 bg-zeno-dark rounded-lg">
              {numerosElegibles.map(n => (
                <span
                  key={n.numero}
                  className="bg-zeno-card px-3 py-1 rounded-full text-sm border border-zeno-border"
                >
                  {n.numero}
                </span>
              ))}
              {numerosElegibles.length === 0 && (
                <p className="text-zeno-text-sec">No hay números elegibles para este sorteo.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}