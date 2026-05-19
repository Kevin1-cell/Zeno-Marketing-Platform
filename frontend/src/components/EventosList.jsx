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
    // Añadimos un toast de carga para mejor feedback
    const loadingToast = toast.loading('Creando evento...')
    try {
      const payload = { ...nuevoEvento }
      if (payload.aforo_maximo === '') delete payload.aforo_maximo
      else payload.aforo_maximo = parseInt(payload.aforo_maximo, 10)
      
      await axios.post('/eventos', payload, { headers: { Authorization: `Bearer ${token}` } })
      
      toast.success('¡Evento creado con éxito!', { id: loadingToast })
      setNuevoEvento({ nombre: '', fecha: '', lugar: '', hora: '', whatsapp_link: '', aforo_maximo: '' })
      setCreando(false)
      window.location.reload()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error al crear evento', { id: loadingToast })
    }
  }

  const eliminarEvento = async (id) => {
    if (!confirm('¿Eliminar este evento? (Se conservará por 7 días, puede restaurarse)')) return
    try {
      await axios.delete(`/eventos/${id}`, { headers: { Authorization: `Bearer ${token}` } })
      toast.success('Evento enviado a la papelera')
      window.location.reload()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error al eliminar')
    }
  }

  const restaurarEvento = async (id) => {
    try {
      await axios.patch(`/eventos/${id}/restaurar`, {}, { headers: { Authorization: `Bearer ${token}` } })
      toast.success('Evento restaurado correctamente')
      window.location.reload()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error al restaurar')
    }
  }

  const actualizarEvento = async (id) => {
    // Verificación visual previa (Frontend friendly)
    const fechaEvento = new Date(editData.fecha)
    const ahora = new Date()
    
    if (fechaEvento < ahora) {
      // Si el usuario intenta poner una fecha pasada manualmente o el evento ya pasó
      // El backend lo rebotará, pero aquí le damos el aviso inmediato
      // toast.error('No se pueden programar o editar eventos con fechas pasadas')
    }

    const loadingToast = toast.loading('Guardando cambios...')
    
    try {
      const payload = { ...editData }
      if (payload.aforo_maximo === '' || payload.aforo_maximo === null || payload.aforo_maximo === undefined) {
        delete payload.aforo_maximo
      } else if (typeof payload.aforo_maximo === 'string') {
        payload.aforo_maximo = parseInt(payload.aforo_maximo, 10)
      }
      
      if (!payload.fecha || payload.fecha.trim() === '') {
        delete payload.fecha
      }
      
      if (payload.lugar === '') delete payload.lugar
      if (payload.hora === '') delete payload.hora
      if (payload.whatsapp_link === '') delete payload.whatsapp_link

      await axios.put(`/eventos/${id}`, payload, { headers: { Authorization: `Bearer ${token}` } })
      
      toast.success('Evento actualizado correctamente', { id: loadingToast })
      setEditandoEvento(null)
      window.location.reload()
    } catch (err) {
      // AQUÍ ESTÁ LA CLAVE: Capturamos el mensaje del backend ("No puedes editar un evento pasado", etc)
      const errorMsg = err.response?.data?.message || 'Error al actualizar'
      toast.error(`Atención: ${errorMsg}`, { 
        id: loadingToast,
        duration: 5000 // Le damos más tiempo para que el usuario lea por qué falló
      })
    }
  }

  const eventosArray = Array.isArray(eventos) ? eventos : []

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Kameron:wght@400;700&family=DM+Sans:wght@400;500;600;700&display=swap');

        .el-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: clamp(14px,2vw,20px);
          flex-wrap: wrap;
          gap: 12px;
        }

        .el-title {
          font-family: 'Kameron', serif;
          font-size: clamp(16px,2.5vw,20px);
          font-weight: 700;
          color: #0c2340;
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .el-count-badge {
          background: rgba(14,165,233,0.12);
          border: 1px solid rgba(56,189,248,0.3);
          color: #0284c7;
          font-family: 'DM Sans', sans-serif;
          font-size: 12px; font-weight: 700;
          padding: 3px 10px;
          border-radius: 50px;
        }

        .el-btn-nuevo {
          display: flex; align-items: center; gap: 7px;
          padding: clamp(10px,1.5vw,12px) clamp(16px,2.5vw,22px);
          border-radius: clamp(16px,2.5vw,22px);
          background: linear-gradient(135deg,#38bdf8 0%,#0ea5e9 50%,#0284c7 100%);
          border: none; color: #fff;
          font-family: 'Kameron', serif; font-weight: 700;
          font-size: clamp(12px,1.5vw,14px);
          cursor: pointer;
          box-shadow: 0 6px 24px rgba(14,165,233,0.4);
          transition: all 0.2s; min-height: 44px; white-space: nowrap;
        }
        .el-btn-nuevo:hover { transform: translateY(-2px); box-shadow: 0 10px 32px rgba(14,165,233,0.5); }

        .el-btn-cancel {
          display: flex; align-items: center; gap: 7px;
          padding: clamp(10px,1.5vw,12px) clamp(16px,2.5vw,22px);
          border-radius: clamp(16px,2.5vw,22px);
          border: 1.5px solid rgba(56,189,248,0.4);
          background: rgba(240,249,255,0.5); color: #0369a1;
          font-family: 'Kameron', serif; font-weight: 700;
          font-size: clamp(12px,1.5vw,14px);
          cursor: pointer; transition: all 0.2s; min-height: 44px; white-space: nowrap;
        }
        .el-btn-cancel:hover { background: rgba(240,249,255,0.85); border-color: rgba(56,189,248,0.7); }

        .el-form-wrap {
          margin: 0 0 clamp(14px,2vw,20px);
          padding: clamp(16px,2.5vw,22px) clamp(18px,3vw,24px);
          background: rgba(240,249,255,0.5);
          border: 1.5px solid rgba(147,197,253,0.4);
          border-radius: clamp(16px,2.5vw,22px);
          animation: elFadeUp 0.32s ease both;
        }
        @keyframes elFadeUp { from{transform:translateY(-8px);opacity:0} to{transform:translateY(0);opacity:1} }

        .el-form-title {
          font-size: clamp(9px,1vw,11px); font-weight: 700;
          letter-spacing: 0.18em; text-transform: uppercase;
          color: #0369a1; margin-bottom: 14px;
        }

        .el-form-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit,minmax(150px,1fr));
          gap: 10px; margin-bottom: 12px;
        }

        .el-input {
          width: 100%;
          background: rgba(240,249,255,0.8);
          border: 2px solid rgba(147,197,253,0.5);
          border-radius: clamp(12px,2vw,16px);
          color: #0c2340; font-weight: 600;
          font-family: 'DM Sans', sans-serif;
          font-size: clamp(13px,1.5vw,14px);
          padding: clamp(10px,1.5vw,13px) clamp(12px,2vw,16px);
          transition: all 0.2s; outline: none; min-height: 44px;
        }
        .el-input::placeholder { color: #93c5fd; }
        .el-input:focus { border-color: #38bdf8; box-shadow: 0 0 0 3px rgba(56,189,248,0.12); }

        .el-form-actions { display: flex; justify-content: flex-end; gap: 10px; }

        .el-btn-submit {
          display: flex; align-items: center; gap: 7px;
          padding: clamp(10px,1.5vw,12px) clamp(20px,3vw,28px);
          border-radius: clamp(16px,2.5vw,22px);
          background: linear-gradient(135deg,#38bdf8 0%,#0ea5e9 50%,#0284c7 100%);
          border: none; color: #fff;
          font-family: 'Kameron', serif; font-weight: 700;
          font-size: clamp(13px,1.5vw,15px);
          cursor: pointer; box-shadow: 0 6px 24px rgba(14,165,233,0.4);
          transition: all 0.2s; min-height: 44px;
        }
        .el-btn-submit:hover { transform: translateY(-2px); box-shadow: 0 10px 32px rgba(14,165,233,0.5); }

        .el-list {
          display: grid;
          grid-template-columns: 1fr;
          gap: clamp(10px,2vw,16px);
        }
        @media (min-width: 640px) {
          .el-list { grid-template-columns: repeat(2,1fr); }
        }
        @media (min-width: 1024px) {
          .el-list { grid-template-columns: repeat(3,1fr); }
        }

        .el-empty {
          text-align: center;
          padding: clamp(32px,5vw,56px) 20px;
          color: #475569;
        }
        .el-empty-icon { font-size: 40px; margin-bottom: 12px; display: block; opacity: 0.5; }
        .el-empty-text {
          font-family: 'Kameron', serif;
          font-size: clamp(16px,2.5vw,20px); font-weight: 700;
          color: #0c2340; margin-bottom: 6px;
        }
        .el-empty-sub { font-size: clamp(12px,1.5vw,14px); color: #475569; }
      `}</style>

      {/* Header con botón nuevo */}
      <div className="el-header">
        <div className="el-title">
          Eventos
          <span className="el-count-badge">{eventosArray.length}</span>
        </div>
        <button onClick={() => setCreando(!creando)} className={creando ? 'el-btn-cancel' : 'el-btn-nuevo'}>
          {creando ? '✕ Cancelar' : '+ Nuevo evento'}
        </button>
      </div>

      {/* Formulario de creación */}
      {creando && (
        <div className="el-form-wrap">
          <div className="el-form-title">Crear nuevo evento</div>
          <form onSubmit={crearEvento}>
            <div className="el-form-grid">
              <input type="text" placeholder="Nombre del evento *" className="el-input"
                style={{ gridColumn: 'span 2' }}
                value={nuevoEvento.nombre}
                onChange={(e) => setNuevoEvento({ ...nuevoEvento, nombre: e.target.value })}
                required />
              <input type="text" placeholder="Lugar" className="el-input"
                value={nuevoEvento.lugar}
                onChange={(e) => setNuevoEvento({ ...nuevoEvento, lugar: e.target.value })} />
              <input type="text" placeholder="Hora (ej. 3:00 PM)" className="el-input"
                value={nuevoEvento.hora}
                onChange={(e) => setNuevoEvento({ ...nuevoEvento, hora: e.target.value })} />
              <input type="datetime-local" className="el-input"
                value={nuevoEvento.fecha}
                onChange={(e) => setNuevoEvento({ ...nuevoEvento, fecha: e.target.value })}
                required />
              <input type="number" min="1" placeholder="Aforo máximo (opcional)" className="el-input"
                value={nuevoEvento.aforo_maximo}
                onChange={(e) => setNuevoEvento({ ...nuevoEvento, aforo_maximo: e.target.value })} />
              <input type="url" placeholder="Enlace WhatsApp (opcional)" className="el-input"
                style={{ gridColumn: 'span 2' }}
                value={nuevoEvento.whatsapp_link}
                onChange={(e) => setNuevoEvento({ ...nuevoEvento, whatsapp_link: e.target.value })} />
            </div>
            <div className="el-form-actions">
              <button type="button" className="el-btn-cancel" onClick={() => setCreando(false)}>Cancelar</button>
              <button type="submit" className="el-btn-submit">✓ Guardar evento</button>
            </div>
          </form>
        </div>
      )}

      {/* Lista / grid de eventos */}
      {eventosArray.length === 0 ? (
        <div className="el-empty">
          <span className="el-empty-icon">📅</span>
          <div className="el-empty-text">No hay eventos creados</div>
          <div className="el-empty-sub">Haz clic en "+ Nuevo evento" para empezar</div>
        </div>
      ) : (
        <div className="el-list">
          {eventosArray.map((ev, idx) => (
            <EventCard
              key={ev.id}
              event={ev}
              index={idx}
              onSelect={() => onSelectEvento(ev)}
              onEdit={(event) => {
                // Validación rápida al hacer clic en editar
                const fechaE = new Date(event.fecha)
                if (fechaE < new Date() && !event.deleted_at) {
                  toast.error('Este evento ya pasó y no se puede editar')
                  return
                }
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
          ))}
        </div>
      )}
    </>
  )
}