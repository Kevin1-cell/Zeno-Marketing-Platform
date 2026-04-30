import { useState } from 'react'
import axios from 'axios'
import toast from 'react-hot-toast'

export default function ParticipantesList({ participantes, token, eventoId, onParticipanteRegistrado }) {
  const [confirmandoId, setConfirmandoId] = useState(null)
  const [filtro, setFiltro] = useState('')
  const [formManual, setFormManual] = useState({
    nombre_completo: '',
    telefon: '',
    nivel: 'C1'
  })
  const [registrando, setRegistrando] = useState(false)

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
      // Notificar al padre que hubo un nuevo registro manual (por si WebSocket no responde)
      if (onParticipanteRegistrado) onParticipanteRegistrado()
    } catch (err) {
      const msg = err.response?.data?.message || 'Error al registrar'
      toast.error(msg)
    } finally {
      setRegistrando(false)
    }
  }

  const filtrarParticipantes = (lista) => {
    if (!filtro) return lista
    const term = filtro.toLowerCase()
    return lista.filter(p =>
      p.nombre_completo.toLowerCase().includes(term) ||
      p.telefon.toLowerCase().includes(term)
    )
  }

  const todosRegistrados = participantes.filter(p => !p.confirmado)
  const todosConfirmados = participantes.filter(p => p.confirmado)
  const registradosFiltrados = filtrarParticipantes(todosRegistrados)
  const confirmadosFiltrados = filtrarParticipantes(todosConfirmados)

  return (
    <div className="bg-zeno-card rounded-lg p-4 border border-zeno-border mt-6">
      <h2 className="text-xl font-bold text-zeno-blue mb-4">Participantes</h2>

      <div className="mb-4">
        <input
          type="text"
          placeholder="Buscar por nombre o teléfono..."
          className="w-full bg-zeno-dark border border-zeno-border rounded-lg px-4 py-2 text-zeno-text focus:outline-none focus:border-zeno-blue"
          value={filtro}
          onChange={(e) => setFiltro(e.target.value)}
        />
      </div>

      <div className="mb-6 p-3 bg-zeno-dark rounded-lg border border-zeno-blue">
        <h3 className="text-md font-semibold text-zeno-orange mb-2">Registro manual de participante</h3>
        <form onSubmit={registrarManual} className="flex flex-wrap gap-3 items-end">
          <div className="flex-1 min-w-[150px]">
            <label className="block text-xs text-zeno-text-sec mb-1">Nombre</label>
            <input
              type="text"
              required
              className="w-full bg-zeno-card border border-zeno-border rounded px-3 py-1 text-zeno-text"
              value={formManual.nombre_completo}
              onChange={e => setFormManual({ ...formManual, nombre_completo: e.target.value })}
            />
          </div>
          <div className="flex-1 min-w-[130px]">
            <label className="block text-xs text-zeno-text-sec mb-1">Teléfono (10 dígitos)</label>
            <input
              type="tel"
              required
              pattern="\d{10}"
              title="Debe tener exactamente 10 dígitos"
              className="w-full bg-zeno-card border border-zeno-border rounded px-3 py-1 text-zeno-text"
              value={formManual.telefon}
              onChange={e => setFormManual({ ...formManual, telefon: e.target.value })}
            />
          </div>
          <div className="w-[100px]">
            <label className="block text-xs text-zeno-text-sec mb-1">Nivel</label>
            <select
              className="w-full bg-zeno-card border border-zeno-border rounded px-2 py-1 text-zeno-text"
              value={formManual.nivel}
              onChange={e => setFormManual({ ...formManual, nivel: e.target.value })}
            >
              <option>C1</option>
              <option>C2</option>
              <option>C3</option>
            </select>
          </div>
          <div>
            <button
              type="submit"
              disabled={registrando}
              className="bg-zeno-blue px-4 py-1 rounded-lg text-sm font-semibold disabled:opacity-50"
            >
              {registrando ? '...' : 'Registrar manual'}
            </button>
          </div>
        </form>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <h3 className="text-lg font-semibold text-zeno-orange mb-2">
            Pendientes ({registradosFiltrados.length})
          </h3>
          {registradosFiltrados.length === 0 && <p className="text-zeno-text-sec">No hay pendientes</p>}
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {registradosFiltrados.map(p => (
              <div key={p.id} className="bg-zeno-dark p-3 rounded-lg border border-zeno-border">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-semibold">{p.nombre_completo}</p>
                    <p className="text-sm text-zeno-text-sec">
                      📞 {p.telefon} | 🎚️ {p.nivel} | 🎲 N° {p.numero_asignado}
                    </p>
                  </div>
                  <button
                    onClick={() => confirmarParticipante(p.id)}
                    disabled={confirmandoId === p.id}
                    className="bg-zeno-success px-3 py-1 rounded-lg text-sm disabled:opacity-50"
                  >
                    {confirmandoId === p.id ? '...' : 'Confirmar'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold text-zeno-blue mb-2">
            Confirmados ({confirmadosFiltrados.length})
          </h3>
          {confirmadosFiltrados.length === 0 && <p className="text-zeno-text-sec">Aún no hay confirmados</p>}
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {confirmadosFiltrados.map(p => (
              <div key={p.id} className="bg-zeno-dark p-3 rounded-lg border border-zeno-border">
                <div>
                  <p className="font-semibold">{p.nombre_completo}</p>
                  <p className="text-sm text-zeno-text-sec">
                    📞 {p.telefon} | 🎚️ {p.nivel} | 🎲 N° {p.numero_asignado}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}