import { useState } from 'react'
import axios from 'axios'
import { useAuthStore } from '../store/authStore'
import toast from 'react-hot-toast'
import EventCard from './EventCard'

export default function EventosList({ eventos, onSelectEvento }) {
  const { token } = useAuthStore()
  const [creando, setCreando] = useState(false)
  const [nuevoEvento, setNuevoEvento] = useState({ nombre: '', fecha: '', lugar: '', hora: '', whatsapp_link: '', aforo_maximo: '' })
  const [editandoEvento, setEditandoEvento] = useState(null)
  const [editData, setEditData] = useState({})

  const crearEvento = async (e) => {
    e.preventDefault()
    try {
      const payload = { ...nuevoEvento }
      if (payload.aforo_maximo === '') delete payload.aforo_maximo
      else payload.aforo_maximo = parseInt(payload.aforo_maximo, 10)
      await axios.post('/eventos', payload, { headers: { Authorization: `Bearer ${token}` } })
      toast.success('Evento creado')
      setNuevoEvento({ nombre: '', fecha: '', lugar: '', hora: '', whatsapp_link: '', aforo_maximo: '' })
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
      const payload = { ...editData }
      if (payload.aforo_maximo === '' || payload.aforo_maximo === null) delete payload.aforo_maximo
      else if (typeof payload.aforo_maximo === 'string') payload.aforo_maximo = parseInt(payload.aforo_maximo, 10)
      await axios.put(`/eventos/${id}`, payload, { headers: { Authorization: `Bearer ${token}` } })
      toast.success('Evento actualizado')
      setEditandoEvento(null)
      window.location.reload()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error al actualizar')
    }
  }

  const eventosArray = Array.isArray(eventos) ? eventos : []

  return (
    <div className="bg-zeno-card rounded-lg p-4 border border-zeno-border">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-zeno-blue">Eventos</h2>
        <button
          onClick={() => setCreando(!creando)}
          className="bg-zeno-orange px-3 py-1 rounded-lg text-sm"
        >
          {creando ? 'Cancelar' : '+ Nuevo evento'}
        </button>
      </div>

      {creando && (
        <form onSubmit={crearEvento} className="mb-4 p-3 bg-zeno-dark rounded-lg flex flex-wrap gap-2">
          <input
            type="text"
            placeholder="Nombre *"
            className="flex-1 min-w-[120px] bg-zeno-card border border-zeno-border rounded px-2 py-1 text-zeno-text"
            value={nuevoEvento.nombre}
            onChange={(e) => setNuevoEvento({ ...nuevoEvento, nombre: e.target.value })}
            required
          />
          <input
            type="text"
            placeholder="Lugar"
            className="flex-1 min-w-[120px] bg-zeno-card border border-zeno-border rounded px-2 py-1"
            value={nuevoEvento.lugar}
            onChange={(e) => setNuevoEvento({ ...nuevoEvento, lugar: e.target.value })}
          />
          <input
            type="text"
            placeholder="Hora (ej. 3:00 PM)"
            className="w-32 bg-zeno-card border border-zeno-border rounded px-2 py-1"
            value={nuevoEvento.hora}
            onChange={(e) => setNuevoEvento({ ...nuevoEvento, hora: e.target.value })}
          />
          <input
            type="datetime-local"
            className="bg-zeno-card border border-zeno-border rounded px-2 py-1"
            value={nuevoEvento.fecha}
            onChange={(e) => setNuevoEvento({ ...nuevoEvento, fecha: e.target.value })}
            required
          />
          <input
            type="url"
            placeholder="Enlace WhatsApp (opcional)"
            className="flex-1 min-w-[150px] bg-zeno-card border border-zeno-border rounded px-2 py-1"
            value={nuevoEvento.whatsapp_link}
            onChange={(e) => setNuevoEvento({ ...nuevoEvento, whatsapp_link: e.target.value })}
          />
          <input
            type="number"
            min="1"
            placeholder="Aforo máximo (opcional)"
            className="w-40 bg-zeno-card border border-zeno-border rounded px-2 py-1"
            value={nuevoEvento.aforo_maximo}
            onChange={(e) => setNuevoEvento({ ...nuevoEvento, aforo_maximo: e.target.value })}
          />
          <button type="submit" className="bg-zeno-blue px-3 py-1 rounded">Guardar</button>
        </form>
      )}

      <div className="space-y-2">
        {eventosArray.length === 0 ? (
          <p className="text-zeno-text-sec text-center">No hay eventos</p>
        ) : (
          eventosArray.map(ev => (
            <EventCard
              key={ev.id}
              event={ev}
              onSelect={() => onSelectEvento(ev)}
              onEdit={(event) => {
                setEditandoEvento(event.id)
                setEditData({
                  nombre: event.nombre,
                  lugar: event.lugar || '',
                  hora: event.hora || '',
                  fecha: event.fecha.slice(0, 16),
                  whatsapp_link: event.whatsapp_link || '',
                  aforo_maximo: event.aforo_maximo ?? ''
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
          ))
        )}
      </div>
    </div>
  )
}