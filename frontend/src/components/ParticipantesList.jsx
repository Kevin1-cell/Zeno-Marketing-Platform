import { useState } from 'react'
import axios from 'axios'
import toast from 'react-hot-toast'
import { Search, CheckCircle2, UserPlus, XCircle } from 'lucide-react'

export default function ParticipantesList({ participantes, token, eventoId, onParticipanteRegistrado }) {
  const [confirmandoId, setConfirmandoId] = useState(null)
  const [filtro, setFiltro] = useState('')
  const [mostrarFormManual, setMostrarFormManual] = useState(false)
  const [formManual, setFormManual] = useState({
    nombre_completo: '',
    telefon: '',
    nivel: 'C1'
  })
  const [registrando, setRegistrando] = useState(false)

  // Colores por nivel (usando estilo de Gemini pero adaptados)
  const nivelColor = {
    C1: 'bg-amber-100 text-amber-700 border-amber-200',
    C2: 'bg-blue-100 text-blue-700 border-blue-200',
    C3: 'bg-purple-100 text-purple-700 border-purple-200'
  }

  const confirmarParticipante = async (id) => {
    setConfirmandoId(id)
    try {
      await axios.patch('/participantes/confirmar', { id }, { headers: { Authorization: `Bearer ${token}` } })
      toast.success('Participante confirmado')
    } catch (err) {
      toast.error('Error al confirmar')
    } finally {
      setConfirmandoId(null)
    }
  }

  const registrarManual = async (e) => {
    e.preventDefault()
    if (!eventoId) {
      toast.error('No hay evento seleccionado')
      return
    }
    if (!/^\d{10}$/.test(formManual.telefon)) {
      toast.error('El número de teléfono debe tener exactamente 10 dígitos')
      return
    }
    setRegistrando(true)
    try {
      const res = await axios.post('/participantes/manual', {
        ...formManual,
        evento_id: eventoId
      }, { headers: { Authorization: `Bearer ${token}` } })
      const p = res.data
      toast.success(
        `✅ Registrado:\n${p.nombre_completo}\n📞 ${p.telefon}\n🎚️ ${p.nivel}\n🎲 Número: ${p.numero_asignado}`,
        { duration: 5000 }
      )
      setFormManual({ nombre_completo: '', telefon: '', nivel: 'C1' })
      setMostrarFormManual(false)
      if (onParticipanteRegistrado) onParticipanteRegistrado()
    } catch (err) {
      const msg = err.response?.data?.message || 'Error al registrar'
      toast.error(msg)
    } finally {
      setRegistrando(false)
    }
  }

  // Filtrar participantes
  const filtrarParticipantes = () => {
    if (!filtro.trim()) return participantes
    const term = filtro.toLowerCase()
    return participantes.filter(p =>
      p.nombre_completo.toLowerCase().includes(term) ||
      p.telefon.toLowerCase().includes(term)
    )
  }

  const participantesFiltrados = filtrarParticipantes()

  return (
    <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm">
      <div className="p-4 border-b border-slate-100">
        <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              value={filtro}
              onChange={(e) => setFiltro(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-zeno-blue"
              placeholder="Buscar por nombre o teléfono..."
            />
          </div>
          <button
            onClick={() => setMostrarFormManual(!mostrarFormManual)}
            className="flex items-center gap-2 bg-zeno-blue text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <UserPlus size={18} /> Registro Manual
          </button>
        </div>

        {mostrarFormManual && (
          <form onSubmit={registrarManual} className="mt-4 p-4 bg-slate-50 rounded-xl flex flex-wrap gap-3 items-end">
            <div className="flex-1">
              <label className="block text-xs font-medium text-slate-600 mb-1">Nombre</label>
              <input
                type="text"
                required
                className="w-full px-3 py-2 border rounded-lg"
                value={formManual.nombre_completo}
                onChange={e => setFormManual({ ...formManual, nombre_completo: e.target.value })}
              />
            </div>
            <div className="flex-1">
              <label className="block text-xs font-medium text-slate-600 mb-1">Teléfono (10 dígitos)</label>
              <input
                type="tel"
                required
                pattern="\d{10}"
                className="w-full px-3 py-2 border rounded-lg"
                value={formManual.telefon}
                onChange={e => setFormManual({ ...formManual, telefon: e.target.value })}
              />
            </div>
            <div className="w-32">
              <label className="block text-xs font-medium text-slate-600 mb-1">Nivel</label>
              <select
                className="w-full px-3 py-2 border rounded-lg"
                value={formManual.nivel}
                onChange={e => setFormManual({ ...formManual, nivel: e.target.value })}
              >
                <option>C1</option>
                <option>C2</option>
                <option>C3</option>
              </select>
            </div>
            <div className="flex gap-2">
              <button type="submit" disabled={registrando} className="bg-green-600 text-white px-4 py-2 rounded-lg">
                {registrando ? 'Guardando...' : 'Registrar'}
              </button>
              <button type="button" onClick={() => setMostrarFormManual(false)} className="bg-gray-300 px-4 py-2 rounded-lg">
                Cancelar
              </button>
            </div>
          </form>
        )}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead className="bg-slate-50 border-b border-slate-100 text-slate-600 text-sm">
            <tr>
              <th className="p-4 font-semibold">Participante</th>
              <th className="p-4 font-semibold">Nivel</th>
              <th className="p-4 font-semibold">N° Sorteo</th>
              <th className="p-4 font-semibold">Estado</th>
              <th className="p-4 font-semibold text-right">Acción</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {participantesFiltrados.length === 0 ? (
              <tr>
                <td colSpan="5" className="p-6 text-center text-slate-500">
                  No hay participantes que coincidan con la búsqueda.
                </td>
              </tr>
            ) : (
              participantesFiltrados.map(p => (
                <tr key={p.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="p-4">
                    <div className="font-bold text-slate-800">{p.nombre_completo}</div>
                    <div className="text-xs text-slate-500">📞 {p.telefon}</div>
                  </td>
                  <td className="p-4">
                    <span className={`text-xs font-bold px-2 py-1 rounded-md border ${nivelColor[p.nivel]}`}>
                      Nivel {p.nivel}
                    </span>
                  </td>
                  <td className="p-4 font-mono text-sm">
                    {p.numero_asignado || '—'}
                  </td>
                  <td className="p-4">
                    {p.confirmado ? (
                      <span className="flex items-center gap-1 text-sm text-green-600">
                        <CheckCircle2 size={16} /> Confirmado
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-sm text-slate-500">
                        <div className="w-2 h-2 rounded-full bg-slate-300" /> Pendiente
                      </span>
                    )}
                  </td>
                  <td className="p-4 text-right">
                    {!p.confirmado && (
                      <button
                        onClick={() => confirmarParticipante(p.id)}
                        disabled={confirmandoId === p.id}
                        className="p-2 text-green-600 hover:bg-green-50 rounded-full transition-colors disabled:opacity-50"
                        title="Confirmar"
                      >
                        <CheckCircle2 size={24} />
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}