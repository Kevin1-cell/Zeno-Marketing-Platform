import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import axios from 'axios'
import toast from 'react-hot-toast'
import { Trophy, RotateCcw, CheckCircle, XCircle } from 'lucide-react'
import Roulette from '../components/Roulette'

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
    }, 5000) // 5 segundos
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

  if (!sorteo) return <div className="p-6 text-white">Cargando sorteo...</div>

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-slate-800">🎲 Ruleta: {sorteo.nombre}</h1>
          <div className="flex gap-3">
            {sorteo.estado !== 'FINALIZADO' && (
              <button
                onClick={finalizarSorteo}
                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-xl flex items-center gap-2 transition"
              >
                <XCircle size={18} /> Finalizar sorteo
              </button>
            )}
            <button
              onClick={() => navigate('/dashboard')}
              className="bg-slate-600 hover:bg-slate-700 text-white px-4 py-2 rounded-xl flex items-center gap-2 transition"
            >
              ← Volver al Dashboard
            </button>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-6 border border-slate-100">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="bg-slate-50 p-4 rounded-xl w-full md:w-64 text-center">
              <p className="text-sm text-slate-500">Estado</p>
              <p className={`text-lg font-bold ${sorteo.estado === 'ACTIVO' ? 'text-green-600' : 'text-red-600'}`}>
                {sorteo.estado}
              </p>
              <p className="text-sm text-slate-500 mt-2">Filtro</p>
              <p className="font-mono">{sorteo.nivel_filtro}</p>
              <p className="text-sm text-slate-500 mt-2">Números elegibles</p>
              <p className="text-2xl font-bold text-indigo-600">{numerosElegibles.length}</p>
            </div>

            <Roulette
              onSpin={girarRuleta}
              isSpinning={girando}
              disabled={sorteo.estado === 'FINALIZADO' || numerosElegibles.length === 0}
            />
          </div>

          {ultimoGanador && (
            <div className="mt-8 bg-gradient-to-r from-amber-50 to-orange-50 p-6 rounded-2xl border border-amber-200 text-center">
              <Trophy className="text-amber-500 mx-auto mb-2" size={40} />
              <p className="text-4xl font-bold text-amber-700 animate-pulse">¡Número {ultimoGanador.numero}!</p>
              <p className="text-xl mt-2 font-semibold">{ultimoGanador.nombre}</p>
              <p className="text-slate-600">{ultimoGanador.telefono}</p>
              <div className="flex gap-4 justify-center mt-4">
                <button onClick={confirmarGanador} className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-xl flex items-center gap-2 transition">
                  <CheckCircle size={18} /> Confirmar ganador
                </button>
                <button onClick={repetir} className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 rounded-xl flex items-center gap-2 transition">
                  <RotateCcw size={18} /> Repetir (excluir)
                </button>
              </div>
            </div>
          )}

          <div className="mt-8">
            <h3 className="text-xl font-bold text-slate-800 mb-3 flex items-center gap-2">
              <Trophy size={20} className="text-amber-500" /> Historial de ganadores
            </h3>
            {(!sorteo.ganadores || sorteo.ganadores.length === 0) && (
              <p className="text-slate-500">Aún no hay ganadores en este sorteo.</p>
            )}
            {sorteo.ganadores && sorteo.ganadores.length > 0 && (
              <div className="overflow-x-auto">
                <table className="w-full text-sm border-collapse">
                  <thead className="bg-slate-50 border-b">
                    <tr>
                      <th className="text-left py-2 px-3">Nombre</th>
                      <th className="text-left py-2 px-3">Teléfono</th>
                      <th className="text-left py-2 px-3">N° sorteo</th>
                      <th className="text-left py-2 px-3">Premio</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sorteo.ganadores.map(g => (
                      <tr key={g.id} className="border-b">
                        <td className="py-2 px-3">{g.participante?.nombre_completo || 'N/A'}</td>
                        <td className="py-2 px-3">{g.participante?.telefon || 'N/A'}</td>
                        <td className="py-2 px-3 font-mono">{g.numero_ganador}</td>
                        <td className="py-2 px-3">{g.premio_descripcion || (g.premio?.descripcion) || 'Manual'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <div className="mt-6">
            <p className="text-slate-500 mb-2">Números elegibles restantes</p>
            <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto p-2 bg-slate-50 rounded-xl">
              {numerosElegibles.map(n => (
                <span key={n.numero} className="bg-white px-3 py-1 rounded-full text-sm border border-slate-200 shadow-sm">
                  {n.numero}
                </span>
              ))}
              {numerosElegibles.length === 0 && (
                <p className="text-slate-400">No hay números elegibles para este sorteo.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}