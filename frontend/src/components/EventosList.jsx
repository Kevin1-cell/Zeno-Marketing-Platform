import { useState } from 'react'
import axios from 'axios'
import { useAuthStore } from '../store/authStore'
import toast from 'react-hot-toast'
import EventCard from './EventCard'

export default function EventosList({ eventos, onSelect }) {
  const { token } = useAuthStore()
  const [creando, setCreando] = useState(false)
  const [nuevoEvento, setNuevoEvento] = useState({ nombre: '', fecha: '', lugar: '', hora: '', whatsapp_link: '' })
  const [editandoEvento, setEditandoEvento] = useState(null)
  const [editData, setEditData] = useState({})

  const crearEvento = async (e) => {
    e.preventDefault()
    try {
      await axios.post('/eventos', nuevoEvento, { headers: { Authorization: `Bearer ${token}` } })
      toast.success('Evento creado')
      setNuevoEvento({ nombre: '', fecha: '', lugar: '', hora: '', whatsapp_link: '' })
      setCreando(false)
      window.location.reload()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error al crear evento')
    }
  }

  const eliminarEvento = async (id) => {
    if (!confirm('¿Eliminar este evento? (Se conservará por 7 días, puede restaurarse)')) return
    try {
      await axios.delete(`/eventos/${id}`, { headers: { Authorization: `Bearer ${token}` } })
      toast.success('Evento eliminado (puede restaurarse)')
      window.location.reload()
    } catch (err) {
      toast.error('Error al eliminar')
    }
  }

  const restaurarEvento = async (id) => {
    try {
      await axios.patch(`/eventos/${id}/restaurar`, {}, { headers: { Authorization: `Bearer ${token}` } })
      toast.success('Evento restaurado')
      window.location.reload()
    } catch (err) {
      toast.error('Error al restaurar')
    }
  }

  const actualizarEvento = async (id) => {
    try {
      await axios.put(`/eventos/${id}`, editData, { headers: { Authorization: `Bearer ${token}` } })
      toast.success('Evento actualizado')
      setEditandoEvento(null)
      window.location.reload()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error al actualizar')
    }
  }

  const eventosArray = Array.isArray(eventos) ? eventos : []

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-slate-800">Eventos</h2>
        <button
          onClick={() => setCreando(!creando)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl text-sm font-medium shadow-sm transition"
        >
          + Nuevo evento
        </button>
      </div>

      {creando && (
        <form onSubmit={crearEvento} className="mb-6 p-4 bg-slate-50 rounded-xl flex flex-wrap gap-3">
          <input
            type="text"
            placeholder="Nombre *"
            className="flex-1 min-w-[120px] border rounded-lg px-3 py-2"
            value={nuevoEvento.nombre}
            onChange={(e) => setNuevoEvento({ ...nuevoEvento, nombre: e.target.value })}
            required
          />
          <input
            type="text"
            placeholder="Lugar"
            className="flex-1 min-w-[120px] border rounded-lg px-3 py-2"
            value={nuevoEvento.lugar}
            onChange={(e) => setNuevoEvento({ ...nuevoEvento, lugar: e.target.value })}
          />
          <input
            type="text"
            placeholder="Hora (ej. 3:00 PM)"
            className="w-32 border rounded-lg px-3 py-2"
            value={nuevoEvento.hora}
            onChange={(e) => setNuevoEvento({ ...nuevoEvento, hora: e.target.value })}
          />
          <input
            type="datetime-local"
            className="border rounded-lg px-3 py-2"
            value={nuevoEvento.fecha}
            onChange={(e) => setNuevoEvento({ ...nuevoEvento, fecha: e.target.value })}
            required
          />
          <input
            type="url"
            placeholder="Enlace WhatsApp (opcional)"
            className="flex-1 min-w-[150px] border rounded-lg px-3 py-2"
            value={nuevoEvento.whatsapp_link}
            onChange={(e) => setNuevoEvento({ ...nuevoEvento, whatsapp_link: e.target.value })}
          />
          <button type="submit" className="bg-indigo-600 text-white px-4 py-2 rounded-lg">Guardar</button>
        </form>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {eventosArray.map(ev => (
          <EventCard
            key={ev.id}
            event={ev}
            onSelect={onSelect}
            onEdit={(event) => {
              setEditandoEvento(event.id)
              setEditData({
                nombre: event.nombre,
                lugar: event.lugar || '',
                hora: event.hora || '',
                fecha: event.fecha.slice(0, 16),
                whatsapp_link: event.whatsapp_link || ''
              })
            }}
            onDelete={eliminarEvento}
            onRestore={restaurarEvento}
            isEditing={editandoEvento === ev.id}
            editData={editData}
            setEditData={setEditData}
            onSaveEdit={actualizarEvento}
            onCancelEdit={() => setEditandoEvento(null)}
          />
        ))}
        {eventosArray.length === 0 && (
          <div className="col-span-full text-center py-8 text-slate-500">No hay eventos</div>
        )}
      </div>
    </div>
  )
}