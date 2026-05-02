import { Calendar, Users, ArrowRight, Edit, Trash2, RefreshCw } from 'lucide-react'

export default function EventCard({ event, onSelect, onEdit, onDelete, onRestore, isEditing, editData, setEditData, onSaveEdit, onCancelEdit }) {
  const isDeleted = event.eliminado === true

  if (isEditing) {
    return (
      <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
        <div className="space-y-3">
          <input
            type="text"
            className="w-full px-3 py-2 border rounded-lg"
            value={editData.nombre ?? event.nombre}
            onChange={(e) => setEditData({ ...editData, nombre: e.target.value })}
            placeholder="Nombre"
          />
          <input
            type="text"
            className="w-full px-3 py-2 border rounded-lg"
            value={editData.lugar ?? event.lugar}
            onChange={(e) => setEditData({ ...editData, lugar: e.target.value })}
            placeholder="Lugar"
          />
          <input
            type="text"
            className="w-full px-3 py-2 border rounded-lg"
            value={editData.hora ?? event.hora}
            onChange={(e) => setEditData({ ...editData, hora: e.target.value })}
            placeholder="Hora"
          />
          <input
            type="datetime-local"
            className="w-full px-3 py-2 border rounded-lg"
            value={editData.fecha ?? event.fecha.slice(0, 16)}
            onChange={(e) => setEditData({ ...editData, fecha: e.target.value })}
          />
          <input
            type="url"
            className="w-full px-3 py-2 border rounded-lg"
            placeholder="Enlace de WhatsApp (opcional)"
            value={editData.whatsapp_link ?? event.whatsapp_link ?? ''}
            onChange={(e) => setEditData({ ...editData, whatsapp_link: e.target.value })}
          />
          <input
            type="number"
            min="1"
            className="w-full px-3 py-2 border rounded-lg"
            placeholder="Aforo máximo (opcional)"
            value={editData.aforo_maximo ?? (event.aforo_maximo || '')}
            onChange={(e) => setEditData({ ...editData, aforo_maximo: e.target.value })}
          />
          <div className="flex gap-2 mt-2">
            <button onClick={() => onSaveEdit(event.id)} className="bg-indigo-600 text-white px-3 py-1 rounded">Guardar</button>
            <button onClick={onCancelEdit} className="bg-gray-300 px-3 py-1 rounded">Cancelar</button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div
      className={`group bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all cursor-pointer relative ${isDeleted ? 'opacity-60 bg-slate-50' : ''}`}
      onClick={() => onSelect(event)}
    >
      <div className="flex justify-between items-start mb-4">
        <div className="p-3 bg-indigo-50 rounded-lg text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
          <Calendar size={24} />
        </div>
        <div className="flex gap-2">
          {!isDeleted && (
            <button
              onClick={(e) => { e.stopPropagation(); onEdit(event) }}
              className="text-slate-400 hover:text-indigo-600"
            >
              <Edit size={18} />
            </button>
          )}
          {!isDeleted ? (
            <button
              onClick={(e) => { e.stopPropagation(); onDelete(event.id) }}
              className="text-slate-400 hover:text-red-600"
            >
              <Trash2 size={18} />
            </button>
          ) : (
            <button
              onClick={(e) => { e.stopPropagation(); onRestore(event.id) }}
              className="text-slate-400 hover:text-green-600"
            >
              <RefreshCw size={18} />
            </button>
          )}
        </div>
      </div>
      <h3 className="text-lg font-bold text-slate-800 mb-1">{event.nombre}</h3>
      <div className="flex items-center text-slate-500 text-sm gap-4 mb-4">
        <span className="flex items-center gap-1"><Users size={14} /> 0</span>
        <span>{new Date(event.fecha).toLocaleDateString()}</span>
      </div>
      {event.lugar && <p className="text-sm text-slate-500 mb-1">📍 {event.lugar}</p>}
      {event.hora && <p className="text-sm text-slate-500">🕒 {event.hora}</p>}
      {event.whatsapp_link && (
        <p className="text-xs text-indigo-500 truncate mt-2">
          📱 WhatsApp: {event.whatsapp_link.length > 30 ? event.whatsapp_link.substring(0, 30) + '…' : event.whatsapp_link}
        </p>
      )}
      {event.aforo_maximo && (
        <p className="text-xs text-slate-500 mt-1">🎟️ Aforo máximo: {event.aforo_maximo}</p>
      )}
      <div className="flex items-center text-indigo-600 font-semibold text-sm mt-3 group-hover:gap-2 transition-all">
        Ver detalles <ArrowRight size={16} className="ml-1" />
      </div>
    </div>
  )
}