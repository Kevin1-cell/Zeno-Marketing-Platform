import { Calendar, Users, ArrowRight, Edit, Trash2, RefreshCw } from 'lucide-react'

export default function EventCard({ event, onSelect, onEdit, onDelete, onRestore, isEditing, editData, setEditData, onSaveEdit, onCancelEdit }) {
  const isDeleted = event.eliminado === true

  if (isEditing) {
    return (
      <>
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Kameron:wght@400;700&family=DM+Sans:wght@400;500;600;700&display=swap');
          .ec-edit-wrap {
            background: rgba(255,255,255,0.95);
            backdrop-filter: blur(20px);
            border: 1.5px solid rgba(56,189,248,0.5);
            border-radius: clamp(18px,3vw,24px);
            overflow: hidden;
            box-shadow: 0 8px 32px rgba(14,120,180,0.18);
          }
          .ec-edit-bar {
            height: 3px;
            background: linear-gradient(90deg, #38bdf8, #7dd3fc, #38bdf8);
            background-size: 200%;
            animation: shimmerEC 2s linear infinite;
          }
          @keyframes shimmerEC { 0%{background-position:0%} 100%{background-position:200%} }
          .ec-edit-body { padding: clamp(16px,2.5vw,22px) clamp(18px,3vw,26px); }
          .ec-edit-title {
            font-family: 'Kameron', serif;
            font-size: clamp(14px,1.8vw,16px);
            font-weight: 700;
            color: #0c2340;
            margin-bottom: 14px;
            display: flex;
            align-items: center;
            gap: 8px;
          }
          .ec-inp {
            width: 100%;
            background: rgba(240,249,255,0.8);
            border: 2px solid rgba(147,197,253,0.5);
            border-radius: clamp(10px,1.5vw,14px);
            padding: clamp(9px,1.2vw,12px) 14px;
            color: #0c2340;
            font-family: 'DM Sans', sans-serif;
            font-size: clamp(12px,1.3vw,14px);
            font-weight: 600;
            outline: none;
            transition: all 0.2s;
            margin-bottom: 8px;
            display: block;
          }
          .ec-inp::placeholder { color: #93c5fd; font-weight: 400; }
          .ec-inp:focus {
            border-color: #38bdf8;
            background: #f0f9ff;
            box-shadow: 0 0 0 3px rgba(56,189,248,0.1);
          }
          .ec-inp-row {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 8px;
            margin-bottom: 8px;
          }
          .ec-inp-row .ec-inp { margin-bottom: 0; }
          .ec-edit-btns { display: flex; gap: 8px; margin-top: 6px; }
          .ec-btn-save {
            flex: 1;
            padding: clamp(10px,1.3vw,13px);
            border-radius: clamp(12px,2vw,16px);
            border: none;
            background: linear-gradient(135deg, #38bdf8 0%, #0ea5e9 50%, #0284c7 100%);
            color: #fff;
            font-family: 'Kameron', serif;
            font-size: clamp(14px,1.6vw,16px);
            font-weight: 700;
            cursor: pointer;
            box-shadow: 0 4px 16px rgba(14,165,233,0.35);
            transition: all 0.2s;
          }
          .ec-btn-save:hover { transform: translateY(-1px); box-shadow: 0 6px 22px rgba(14,165,233,0.45); }
          .ec-btn-cancel {
            padding: clamp(10px,1.3vw,13px) clamp(16px,2vw,22px);
            border-radius: clamp(12px,2vw,16px);
            border: 1.5px solid rgba(147,197,253,0.5);
            background: rgba(240,249,255,0.6);
            color: #0369a1;
            font-family: 'DM Sans', sans-serif;
            font-size: clamp(12px,1.3vw,14px);
            font-weight: 700;
            cursor: pointer;
            transition: all 0.2s;
          }
          .ec-btn-cancel:hover { border-color: #38bdf8; background: #f0f9ff; }
        `}</style>
        <div className="ec-edit-wrap">
          <div className="ec-edit-bar" />
          <div className="ec-edit-body">
            <div className="ec-edit-title">
              <Edit size={16} color="#0ea5e9" />
              Editando evento
            </div>
            <input
              type="text"
              className="ec-inp"
              value={editData.nombre ?? event.nombre}
              onChange={(e) => setEditData({ ...editData, nombre: e.target.value })}
              placeholder="Nombre del evento"
            />
            <input
              type="text"
              className="ec-inp"
              value={editData.lugar ?? event.lugar}
              onChange={(e) => setEditData({ ...editData, lugar: e.target.value })}
              placeholder="Lugar"
            />
            <div className="ec-inp-row">
              <input
                type="text"
                className="ec-inp"
                value={editData.hora ?? event.hora}
                onChange={(e) => setEditData({ ...editData, hora: e.target.value })}
                placeholder="Hora"
              />
              <input
                type="datetime-local"
                className="ec-inp"
                value={editData.fecha ?? event.fecha.slice(0, 16)}
                onChange={(e) => setEditData({ ...editData, fecha: e.target.value })}
              />
            </div>
            <div className="ec-inp-row">
              <input
                type="url"
                className="ec-inp"
                placeholder="Enlace WhatsApp (opcional)"
                value={editData.whatsapp_link ?? event.whatsapp_link ?? ''}
                onChange={(e) => setEditData({ ...editData, whatsapp_link: e.target.value })}
              />
              <input
                type="number"
                min="1"
                className="ec-inp"
                placeholder="Aforo máximo"
                value={editData.aforo_maximo ?? (event.aforo_maximo || '')}
                onChange={(e) => setEditData({ ...editData, aforo_maximo: e.target.value })}
              />
            </div>
            <div className="ec-edit-btns">
              <button className="ec-btn-save" onClick={() => onSaveEdit(event.id)}>
                Guardar cambios
              </button>
              <button className="ec-btn-cancel" onClick={onCancelEdit}>
                Cancelar
              </button>
            </div>
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Kameron:wght@400;700&family=DM+Sans:wght@400;500;600;700&display=swap');
        .ec-card {
          background: rgba(255,255,255,0.88);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border: 1.5px solid rgba(147,197,253,0.5);
          border-radius: clamp(18px,3vw,24px);
          box-shadow: 0 8px 32px rgba(14,120,180,0.13);
          overflow: hidden;
          cursor: pointer;
          transition: all 0.22s;
          position: relative;
          animation: fadeUpEC 0.38s ease both;
        }
        .ec-card:hover {
          transform: translateY(-3px);
          box-shadow: 0 16px 48px rgba(14,120,180,0.22);
          border-color: #38bdf8;
        }
        .ec-card.is-deleted { opacity: 0.55; }
        .ec-card.is-deleted:hover { transform: translateY(-1px); }
        .ec-top-bar {
          height: 3px;
          background: linear-gradient(90deg, #38bdf8, #7dd3fc, #38bdf8);
          background-size: 200%;
          animation: shimmerEC 2s linear infinite;
        }
        @keyframes shimmerEC { 0%{background-position:0%} 100%{background-position:200%} }
        @keyframes fadeUpEC { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }

        .ec-body { padding: clamp(14px,2.5vw,20px) clamp(16px,2.8vw,22px) clamp(12px,2vw,18px); }

        .ec-top {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 12px;
        }
        .ec-icon {
          width: clamp(38px,5vw,46px);
          height: clamp(38px,5vw,46px);
          border-radius: 12px;
          background: linear-gradient(135deg, #e0f2fe, #bae6fd);
          border: 1px solid rgba(56,189,248,0.3);
          display: flex; align-items: center; justify-content: center;
          color: #0284c7;
          flex-shrink: 0;
          transition: all 0.22s;
        }
        .ec-card:hover .ec-icon {
          background: linear-gradient(135deg, #38bdf8, #0284c7);
          color: #fff;
          border-color: transparent;
        }
        .ec-actions { display: flex; gap: 6px; }
        .ec-action-btn {
          width: 32px; height: 32px;
          border-radius: 9px;
          border: 1.5px solid rgba(147,197,253,0.5);
          background: rgba(240,249,255,0.7);
          display: flex; align-items: center; justify-content: center;
          cursor: pointer;
          color: #93c5fd;
          transition: all 0.18s;
        }
        .ec-action-btn.edit:hover { border-color: #0ea5e9; color: #0ea5e9; background: #e0f2fe; }
        .ec-action-btn.del:hover  { border-color: #fca5a5; color: #ef4444; background: #fff1f2; }
        .ec-action-btn.rest:hover { border-color: #86efac; color: #16a34a; background: #f0fdf4; }

        .ec-name {
          font-family: 'Kameron', serif;
          font-size: clamp(15px,2vw,18px);
          font-weight: 700;
          color: #0c2340;
          margin-bottom: 4px;
          line-height: 1.2;
        }
        .ec-date {
          font-size: clamp(9px,1vw,11px);
          font-weight: 700;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: #0369a1;
          margin-bottom: 10px;
        }
        .ec-divider {
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(56,189,248,0.25), transparent);
          margin: 10px 0;
        }
        .ec-meta { display: flex; flex-direction: column; gap: 5px; }
        .ec-meta-row {
          display: flex; align-items: center; gap: 7px;
          font-size: clamp(11px,1.2vw,13px);
          color: #475569;
        }
        .ec-meta-row svg { color: #7dd3fc; flex-shrink: 0; }

        .ec-whatsapp {
          display: flex; align-items: center; gap: 6px;
          font-size: clamp(10px,1.1vw,12px);
          color: #0369a1; font-weight: 600;
          background: rgba(219,234,254,0.4);
          border: 1px solid rgba(147,197,253,0.3);
          border-radius: 8px;
          padding: 5px 10px;
          margin-top: 6px;
          overflow: hidden;
          white-space: nowrap;
          text-overflow: ellipsis;
        }

        .ec-footer {
          display: flex; align-items: center; justify-content: space-between;
          margin-top: 12px;
          padding-top: 10px;
          border-top: 1px solid rgba(147,197,253,0.2);
        }
        .ec-participants {
          display: flex; align-items: center; gap: 5px;
          background: rgba(219,234,254,0.5);
          border: 1px solid rgba(147,197,253,0.4);
          border-radius: 50px;
          padding: 4px 10px;
          font-size: clamp(10px,1.1vw,12px);
          font-weight: 700;
          color: #0369a1;
        }
        .ec-link {
          display: flex; align-items: center; gap: 4px;
          font-size: clamp(11px,1.2vw,13px);
          font-weight: 700;
          color: #0ea5e9;
          transition: gap 0.2s;
        }
        .ec-card:hover .ec-link { gap: 7px; }

        .ec-deleted-badge {
          display: flex; align-items: center; gap: 5px;
          background: rgba(241,245,249,0.7);
          border: 1px solid rgba(203,213,225,0.5);
          border-radius: 50px;
          padding: 4px 10px;
          font-size: 11px; font-weight: 700; color: #94a3b8;
        }
      `}</style>

      <div
        className={`ec-card${isDeleted ? ' is-deleted' : ''}`}
        onClick={() => !isDeleted && onSelect(event)}
      >
        <div className="ec-top-bar" />
        <div className="ec-body">
          <div className="ec-top">
            <div className="ec-icon">
              <Calendar size={20} />
            </div>
            <div className="ec-actions">
              {!isDeleted && (
                <button
                  className="ec-action-btn edit"
                  onClick={(e) => { e.stopPropagation(); onEdit(event) }}
                  title="Editar"
                >
                  <Edit size={14} />
                </button>
              )}
              {!isDeleted ? (
                <button
                  className="ec-action-btn del"
                  onClick={(e) => { e.stopPropagation(); onDelete(event.id) }}
                  title="Eliminar"
                >
                  <Trash2 size={14} />
                </button>
              ) : (
                <button
                  className="ec-action-btn rest"
                  onClick={(e) => { e.stopPropagation(); onRestore(event.id) }}
                  title="Restaurar"
                >
                  <RefreshCw size={14} />
                </button>
              )}
            </div>
          </div>

          <div className="ec-name">{event.nombre}</div>
          <div className="ec-date">
            {new Date(event.fecha).toLocaleDateString('es-CO', { day: '2-digit', month: 'long', year: 'numeric' })}
          </div>

          <div className="ec-divider" />

          <div className="ec-meta">
            {event.lugar && (
              <div className="ec-meta-row">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/><circle cx="12" cy="9" r="2.5"/></svg>
                {event.lugar}
              </div>
            )}
            {event.hora && (
              <div className="ec-meta-row">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                {event.hora}
              </div>
            )}
            {event.aforo_maximo && (
              <div className="ec-meta-row">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><rect x="3" y="3" width="18" height="18" rx="3"/><path d="M3 9h18M9 21V9"/></svg>
                Aforo máximo: {event.aforo_maximo}
              </div>
            )}
          </div>

          {event.whatsapp_link && (
            <div className="ec-whatsapp">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>
              {event.whatsapp_link.length > 32 ? event.whatsapp_link.substring(0, 32) + '…' : event.whatsapp_link}
            </div>
          )}

          <div className="ec-footer">
            {isDeleted ? (
              <div className="ec-deleted-badge">
                <Trash2 size={11} /> Eliminado
              </div>
            ) : (
              <div className="ec-participants">
                <Users size={12} /> 0 participantes
              </div>
            )}
            <div className="ec-link">
              {isDeleted ? 'Restaurar' : 'Ver detalles'}
              <ArrowRight size={14} />
            </div>
          </div>
        </div>
      </div>
    </>
  )
}