import { useState } from 'react'
import axios from 'axios'
import { useAuthStore } from '../store/authStore'
import toast from 'react-hot-toast'

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
    <div className="bg-zeno-card rounded-lg p-4 border border-zeno-border">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-zeno-blue">Eventos</h2>
        <button
          onClick={() => setCreando(!creando)}
          className="bg-zeno-orange px-3 py-1 rounded-lg text-sm"
        >
          + Nuevo evento
        </button>
      </div>

      {creando && (
        <form onSubmit={crearEvento} className="mb-4 p-3 bg-zeno-dark rounded-lg flex flex-wrap gap-2">
          <input
            type="text"
            placeholder="Nombre *"
            className="flex-1 min-w-[120px] bg-zeno-card border border-zeno-border rounded px-2 py-1"
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
            className="flex-1 min-w-[200px] bg-zeno-card border border-zeno-border rounded px-2 py-1"
            value={nuevoEvento.whatsapp_link}
            onChange={(e) => setNuevoEvento({ ...nuevoEvento, whatsapp_link: e.target.value })}
          />
          <button type="submit" className="bg-zeno-blue px-3 py-1 rounded">Guardar</button>
        </form>
      )}

      <div className="space-y-2">
        {eventosArray.map((ev) => (
          <div key={ev.id} className="p-3 rounded-lg bg-zeno-dark border border-zeno-border hover:border-zeno-blue transition">
            {editandoEvento === ev.id ? (
              <div className="space-y-2">
                <input
                  type="text"
                  className="w-full bg-zeno-card border border-zeno-border rounded px-2 py-1"
                  value={editData.nombre ?? ev.nombre}
                  onChange={(e) => setEditData({ ...editData, nombre: e.target.value })}
                  placeholder="Nombre"
                />
                <input
                  type="text"
                  className="w-full bg-zeno-card border border-zeno-border rounded px-2 py-1"
                  value={editData.lugar ?? ev.lugar}
                  onChange={(e) => setEditData({ ...editData, lugar: e.target.value })}
                  placeholder="Lugar"
                />
                <input
                  type="text"
                  className="w-full bg-zeno-card border border-zeno-border rounded px-2 py-1"
                  value={editData.hora ?? ev.hora}
                  onChange={(e) => setEditData({ ...editData, hora: e.target.value })}
                  placeholder="Hora"
                />
                <input
                  type="datetime-local"
                  className="w-full bg-zeno-card border border-zeno-border rounded px-2 py-1"
                  value={editData.fecha ?? ev.fecha.slice(0, 16)}
                  onChange={(e) => setEditData({ ...editData, fecha: e.target.value })}
                />
                <input
                  type="url"
                  placeholder="Enlace WhatsApp"
                  className="w-full bg-zeno-card border border-zeno-border rounded px-2 py-1"
                  value={editData.whatsapp_link ?? ev.whatsapp_link}
                  onChange={(e) => setEditData({ ...editData, whatsapp_link: e.target.value })}
                />
                <div className="flex gap-2">
                  <button onClick={() => actualizarEvento(ev.id)} className="bg-zeno-blue px-3 py-1 rounded">Guardar</button>
                  <button onClick={() => setEditandoEvento(null)} className="bg-gray-600 px-3 py-1 rounded">Cancelar</button>
                </div>
              </div>
            ) : (
              <>
                <div className="flex justify-between items-start">
                  <div className="flex-1 cursor-pointer" onClick={() => onSelect(ev)}>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold">{ev.nombre}</span>
                      <span className={`text-xs px-2 py-0.5 rounded ${ev.estado === 'ACTIVO' ? 'bg-green-800' : 'bg-red-800'}`}>
                        {ev.estado}
                      </span>
                      {ev.eliminado && <span className="text-xs bg-red-600 px-2 py-0.5 rounded">Eliminado</span>}
                    </div>
                    {ev.lugar && <p className="text-sm text-zeno-text-sec">📍 {ev.lugar}</p>}
                    {ev.hora && <p className="text-sm text-zeno-text-sec">🕒 {ev.hora}</p>}
                    <p className="text-sm text-zeno-text-sec">📅 {new Date(ev.fecha).toLocaleDateString()}</p>
                    {ev.whatsapp_link && <p className="text-xs text-zeno-blue truncate mt-1">📱 WhatsApp: {ev.whatsapp_link}</p>}
                  </div>
                  <div className="flex gap-1">
                    {!ev.eliminado ? (
                      <button
                        onClick={() => {
                          setEditandoEvento(ev.id)
                          setEditData({
                            nombre: ev.nombre,
                            lugar: ev.lugar || '',
                            hora: ev.hora || '',
                            fecha: ev.fecha.slice(0, 16),
                            whatsapp_link: ev.whatsapp_link || ''
                          })
                        }}
                        className="text-zeno-orange hover:text-zeno-blue text-sm px-1"
                      >
                        ✏️
                      </button>
                    ) : null}
                    {!ev.eliminado ? (
                      <button onClick={() => eliminarEvento(ev.id)} className="text-red-500 hover:text-red-700 text-sm px-1">
                        🗑️
                      </button>
                    ) : (
                      <button onClick={() => restaurarEvento(ev.id)} className="text-green-500 hover:text-green-700 text-sm px-1">
                        🔄 Restaurar
                      </button>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        ))}
        {eventosArray.length === 0 && <p className="text-zeno-text-sec text-center">No hay eventos</p>}
      </div>
    </div>
  )
}