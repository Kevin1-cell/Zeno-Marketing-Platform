import { useState } from 'react'
import axios from 'axios'
import { useAuthStore } from '../store/authStore'
import toast from 'react-hot-toast'

export default function EventosList({ eventos, onSelect }) {
  const { token } = useAuthStore()
  const [creando, setCreando] = useState(false)
  const [nuevoEvento, setNuevoEvento] = useState({ nombre: '', fecha: '' })
  const [editandoWhatsApp, setEditandoWhatsApp] = useState(null)
  const [nuevoLink, setNuevoLink] = useState('')

  const crearEvento = async (e) => {
    e.preventDefault()
    try {
      await axios.post('/eventos', nuevoEvento, { headers: { Authorization: `Bearer ${token}` } })
      toast.success('Evento creado')
      setNuevoEvento({ nombre: '', fecha: '' })
      setCreando(false)
      window.location.reload()
    } catch (err) {
      toast.error('Error al crear evento')
    }
  }

  const actualizarWhatsApp = async (id, link) => {
    try {
      await axios.put(`/eventos/${id}`, { whatsapp_link: link }, {
        headers: { Authorization: `Bearer ${token}` }
      })
      toast.success('Enlace de WhatsApp actualizado')
      setEditandoWhatsApp(null)
      window.location.reload()
    } catch (err) {
      toast.error('Error al actualizar')
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
        <form onSubmit={crearEvento} className="mb-4 p-3 bg-zeno-dark rounded-lg flex gap-2">
          <input
            type="text"
            placeholder="Nombre del evento"
            className="flex-1 bg-zeno-card border border-zeno-border rounded px-2 py-1"
            value={nuevoEvento.nombre}
            onChange={(e) => setNuevoEvento({ ...nuevoEvento, nombre: e.target.value })}
            required
          />
          <input
            type="datetime-local"
            className="bg-zeno-card border border-zeno-border rounded px-2 py-1"
            value={nuevoEvento.fecha}
            onChange={(e) => setNuevoEvento({ ...nuevoEvento, fecha: e.target.value })}
            required
          />
          <button type="submit" className="bg-zeno-blue px-3 py-1 rounded">Guardar</button>
        </form>
      )}

      <div className="space-y-2">
        {eventosArray.map((ev) => (
          <div key={ev.id} className="p-3 rounded-lg bg-zeno-dark border border-zeno-border hover:border-zeno-blue transition">
            <div className="flex justify-between items-start">
              <div className="flex-1 cursor-pointer" onClick={() => onSelect(ev)}>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-semibold">{ev.nombre}</span>
                  <span className={`text-xs px-2 py-0.5 rounded ${ev.estado === 'ACTIVO' ? 'bg-green-800' : 'bg-red-800'}`}>
                    {ev.estado}
                  </span>
                </div>
                <p className="text-sm text-zeno-text-sec">{new Date(ev.fecha).toLocaleDateString()}</p>
                {ev.whatsapp_link && (
                  <p className="text-xs text-zeno-blue truncate mt-1">📱 WhatsApp: {ev.whatsapp_link}</p>
                )}
              </div>
              <button
                onClick={() => {
                  setEditandoWhatsApp(ev.id)
                  setNuevoLink(ev.whatsapp_link || '')
                }}
                className="ml-2 text-zeno-orange hover:text-zeno-blue text-sm"
                title="Editar enlace de WhatsApp"
              >
                ✏️
              </button>
            </div>

            {editandoWhatsApp === ev.id && (
              <div className="mt-2 flex gap-2 items-center">
                <input
                  type="url"
                  placeholder="https://chat.whatsapp.com/..."
                  className="flex-1 bg-zeno-card border border-zeno-border rounded px-2 py-1 text-sm text-zeno-text"
                  value={nuevoLink}
                  onChange={(e) => setNuevoLink(e.target.value)}
                />
                <button
                  onClick={() => actualizarWhatsApp(ev.id, nuevoLink)}
                  className="bg-zeno-blue px-2 py-1 rounded text-sm"
                >
                  Guardar
                </button>
                <button
                  onClick={() => setEditandoWhatsApp(null)}
                  className="bg-gray-600 px-2 py-1 rounded text-sm"
                >
                  Cancelar
                </button>
              </div>
            )}
          </div>
        ))}
        {eventosArray.length === 0 && (
          <p className="text-zeno-text-sec text-center">No hay eventos</p>
        )}
      </div>
    </div>
  )
}