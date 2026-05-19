import { Calendar, Users, ArrowRight, Edit, Trash2, RefreshCw } from 'lucide-react'

/* ── Paleta de 6 tonos, uno por evento (rotativa) ── */
const PALETTES = [
  // azul cielo (original)
  {
    bar: 'linear-gradient(90deg,#38bdf8,#7dd3fc,#38bdf8)',
    iconBg: 'linear-gradient(135deg,#e0f2fe,#bae6fd)',
    iconBorder: 'rgba(56,189,248,0.3)',
    iconColor: '#0284c7',
    iconHoverBg: 'linear-gradient(135deg,#38bdf8,#0284c7)',
    accent: '#0369a1',
    accentLight: 'rgba(219,234,254,0.5)',
    accentBorder: 'rgba(147,197,253,0.4)',
    linkColor: '#0ea5e9',
    cardBorder: 'rgba(147,197,253,0.5)',
  },
  // violeta / índigo
  {
    bar: 'linear-gradient(90deg,#a78bfa,#c4b5fd,#a78bfa)',
    iconBg: 'linear-gradient(135deg,#ede9fe,#ddd6fe)',
    iconBorder: 'rgba(167,139,250,0.35)',
    iconColor: '#7c3aed',
    iconHoverBg: 'linear-gradient(135deg,#a78bfa,#7c3aed)',
    accent: '#6d28d9',
    accentLight: 'rgba(237,233,254,0.55)',
    accentBorder: 'rgba(196,181,253,0.45)',
    linkColor: '#8b5cf6',
    cardBorder: 'rgba(196,181,253,0.55)',
  },
  // verde esmeralda
  {
    bar: 'linear-gradient(90deg,#34d399,#6ee7b7,#34d399)',
    iconBg: 'linear-gradient(135deg,#d1fae5,#a7f3d0)',
    iconBorder: 'rgba(52,211,153,0.35)',
    iconColor: '#059669',
    iconHoverBg: 'linear-gradient(135deg,#34d399,#059669)',
    accent: '#047857',
    accentLight: 'rgba(209,250,229,0.55)',
    accentBorder: 'rgba(110,231,183,0.45)',
    linkColor: '#10b981',
    cardBorder: 'rgba(110,231,183,0.55)',
  },
  // naranja ámbar
  {
    bar: 'linear-gradient(90deg,#fb923c,#fcd34d,#fb923c)',
    iconBg: 'linear-gradient(135deg,#ffedd5,#fed7aa)',
    iconBorder: 'rgba(251,146,60,0.35)',
    iconColor: '#c2410c',
    iconHoverBg: 'linear-gradient(135deg,#fb923c,#c2410c)',
    accent: '#9a3412',
    accentLight: 'rgba(255,237,213,0.55)',
    accentBorder: 'rgba(253,186,116,0.45)',
    linkColor: '#f97316',
    cardBorder: 'rgba(253,186,116,0.55)',
  },
  // rosa / fucsia
  {
    bar: 'linear-gradient(90deg,#f472b6,#f9a8d4,#f472b6)',
    iconBg: 'linear-gradient(135deg,#fce7f3,#fbcfe8)',
    iconBorder: 'rgba(244,114,182,0.35)',
    iconColor: '#be185d',
    iconHoverBg: 'linear-gradient(135deg,#f472b6,#be185d)',
    accent: '#9d174d',
    accentLight: 'rgba(252,231,243,0.55)',
    accentBorder: 'rgba(249,168,212,0.45)',
    linkColor: '#ec4899',
    cardBorder: 'rgba(249,168,212,0.55)',
  },
  // teal / cian
  {
    bar: 'linear-gradient(90deg,#2dd4bf,#5eead4,#2dd4bf)',
    iconBg: 'linear-gradient(135deg,#ccfbf1,#99f6e4)',
    iconBorder: 'rgba(45,212,191,0.35)',
    iconColor: '#0f766e',
    iconHoverBg: 'linear-gradient(135deg,#2dd4bf,#0f766e)',
    accent: '#0d6f68',
    accentLight: 'rgba(204,251,241,0.55)',
    accentBorder: 'rgba(94,234,212,0.45)',
    linkColor: '#14b8a6',
    cardBorder: 'rgba(94,234,212,0.55)',
  },
]

export default function EventCard({
  event, onSelect, onEdit, onDelete, onRestore,
  isEditing, editData, setEditData, onSaveEdit, onCancelEdit,
  index = 0,
}) {
  const isDeleted = event.eliminado === true
  const p = PALETTES[index % PALETTES.length]

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
            display: flex; align-items: center; gap: 8px;
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
          .ec-inp:focus { border-color: #38bdf8; background: #f0f9ff; box-shadow: 0 0 0 3px rgba(56,189,248,0.1); }
          .ec-inp-row {
            display: grid; grid-template-columns: 1fr 1fr;
            gap: 8px; margin-bottom: 8px;
          }
          .ec-inp-row .ec-inp { margin-bottom: 0; }
          .ec-edit-btns { display: flex; gap: 8px; margin-top: 6px; }
          .ec-btn-save {
            flex: 1; padding: clamp(10px,1.3vw,13px);
            border-radius: clamp(12px,2vw,16px); border: none;
            background: linear-gradient(135deg,#38bdf8 0%,#0ea5e9 50%,#0284c7 100%);
            color: #fff; font-family: 'Kameron', serif;
            font-size: clamp(14px,1.6vw,16px); font-weight: 700;
            cursor: pointer; box-shadow: 0 4px 16px rgba(14,165,233,0.35); transition: all 0.2s;
          }
          .ec-btn-save:hover { transform: translateY(-1px); box-shadow: 0 6px 22px rgba(14,165,233,0.45); }
          .ec-btn-cancel-edit {
            padding: clamp(10px,1.3vw,13px) clamp(16px,2vw,22px);
            border-radius: clamp(12px,2vw,16px);
            border: 1.5px solid rgba(147,197,253,0.5);
            background: rgba(240,249,255,0.6);
            color: #0369a1; font-family: 'DM Sans', sans-serif;
            font-size: clamp(12px,1.3vw,14px); font-weight: 700;
            cursor: pointer; transition: all 0.2s;
          }
          .ec-btn-cancel-edit:hover { border-color: #38bdf8; background: #f0f9ff; }
        `}</style>
        <div className="ec-edit-wrap">
          <div className="ec-edit-bar" style={{ background: p.bar }} />
          <div className="ec-edit-body">
            <div className="ec-edit-title">
              <Edit size={16} color={p.linkColor} />
              Editando evento
            </div>
            <input type="text" className="ec-inp" value={editData.nombre ?? event.nombre}
              onChange={(e) => setEditData({ ...editData, nombre: e.target.value })} placeholder="Nombre del evento" />
            <input type="text" className="ec-inp" value={editData.lugar ?? event.lugar}
              onChange={(e) => setEditData({ ...editData, lugar: e.target.value })} placeholder="Lugar" />
            <div className="ec-inp-row">
              <input type="text" className="ec-inp" value={editData.hora ?? event.hora}
                onChange={(e) => setEditData({ ...editData, hora: e.target.value })} placeholder="Hora" />
              <input type="datetime-local" className="ec-inp" value={editData.fecha ?? event.fecha.slice(0, 16)}
                onChange={(e) => setEditData({ ...editData, fecha: e.target.value })} />
            </div>
            <div className="ec-inp-row">
              <input type="url" className="ec-inp" placeholder="Enlace WhatsApp (opcional)"
                value={editData.whatsapp_link ?? event.whatsapp_link ?? ''}
                onChange={(e) => setEditData({ ...editData, whatsapp_link: e.target.value })} />
              <input type="number" min="1" className="ec-inp" placeholder="Aforo máximo"
                value={editData.aforo_maximo ?? (event.aforo_maximo || '')}
                onChange={(e) => setEditData({ ...editData, aforo_maximo: e.target.value })} />
            </div>
            <div className="ec-edit-btns">
              <button className="ec-btn-save" onClick={() => onSaveEdit(event.id)}>Guardar cambios</button>
              <button className="ec-btn-cancel-edit" onClick={onCancelEdit}>Cancelar</button>
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
          border-radius: clamp(18px,3vw,24px);
          box-shadow: 0 6px 28px rgba(14,120,180,0.11);
          overflow: hidden;
          cursor: pointer;
          transition: all 0.22s;
          position: relative;
          animation: fadeUpEC 0.38s ease both;
        }
        .ec-card:hover {
          transform: translateY(-3px);
          box-shadow: 0 14px 44px rgba(14,120,180,0.18);
        }
        .ec-card.is-deleted { opacity: 0.55; }
        .ec-card.is-deleted:hover { transform: translateY(-1px); }

        .ec-top-bar {
          height: 3px;
          background-size: 200%;
          animation: shimmerEC 2s linear infinite;
        }
        @keyframes shimmerEC { 0%{background-position:0%} 100%{background-position:200%} }
        @keyframes fadeUpEC { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }

        .ec-body { padding: clamp(14px,2.5vw,20px) clamp(16px,2.8vw,22px) clamp(12px,2vw,18px); }

        .ec-top {
          display: flex; justify-content: space-between; align-items: flex-start;
          margin-bottom: 12px;
        }
        .ec-icon {
          width: clamp(38px,5vw,46px); height: clamp(38px,5vw,46px);
          border-radius: 12px;
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0;
          transition: all 0.22s;
        }
        .ec-actions { display: flex; gap: 6px; }
        .ec-action-btn {
          width: 32px; height: 32px; border-radius: 9px;
          border: 1.5px solid rgba(147,197,253,0.5);
          background: rgba(240,249,255,0.7);
          display: flex; align-items: center; justify-content: center;
          cursor: pointer; color: #93c5fd; transition: all 0.18s;
        }
        .ec-action-btn.edit:hover { border-color: #0ea5e9; color: #0ea5e9; background: #e0f2fe; }
        .ec-action-btn.del:hover  { border-color: #fca5a5; color: #ef4444; background: #fff1f2; }
        .ec-action-btn.rest:hover { border-color: #86efac; color: #16a34a; background: #f0fdf4; }

        .ec-name {
          font-family: 'Kameron', serif;
          font-size: clamp(15px,2vw,18px); font-weight: 700;
          color: #0c2340; margin-bottom: 4px; line-height: 1.2;
        }
        .ec-date {
          font-size: clamp(9px,1vw,11px); font-weight: 700;
          letter-spacing: 0.14em; text-transform: uppercase;
          margin-bottom: 10px;
        }
        .ec-divider {
          height: 1px; margin: 10px 0;
          background: linear-gradient(90deg,transparent,rgba(0,0,0,0.06),transparent);
        }
        .ec-meta { display: flex; flex-direction: column; gap: 5px; }
        .ec-meta-row {
          display: flex; align-items: center; gap: 7px;
          font-size: clamp(11px,1.2vw,13px); color: #475569;
        }

        .ec-whatsapp {
          display: flex; align-items: center; gap: 6px;
          font-size: clamp(10px,1.1vw,12px); font-weight: 600;
          border-radius: 8px; padding: 5px 10px; margin-top: 6px;
          overflow: hidden; white-space: nowrap; text-overflow: ellipsis;
        }
        .ec-footer {
          display: flex; align-items: center; justify-content: space-between;
          margin-top: 12px; padding-top: 10px;
          border-top: 1px solid rgba(0,0,0,0.05);
        }
        .ec-participants {
          display: flex; align-items: center; gap: 5px;
          border-radius: 50px; padding: 4px 10px;
          font-size: clamp(10px,1.1vw,12px); font-weight: 700;
        }
        .ec-link {
          display: flex; align-items: center; gap: 4px;
          font-size: clamp(11px,1.2vw,13px); font-weight: 700;
          transition: gap 0.2s;
        }
        .ec-card:hover .ec-link { gap: 7px; }
        .ec-deleted-badge {
          display: flex; align-items: center; gap: 5px;
          background: rgba(241,245,249,0.7); border: 1px solid rgba(203,213,225,0.5);
          border-radius: 50px; padding: 4px 10px;
          font-size: 11px; font-weight: 700; color: #94a3b8;
        }
      `}</style>

      <div
        className={`ec-card${isDeleted ? ' is-deleted' : ''}`}
        style={{ border: `1.5px solid ${p.cardBorder}` }}
        onClick={() => !isDeleted && onSelect(event)}
      >
        <div className="ec-top-bar" style={{ background: p.bar }} />
        <div className="ec-body">
          <div className="ec-top">
            <div
              className="ec-icon"
              style={{
                background: p.iconBg,
                border: `1px solid ${p.iconBorder}`,
                color: p.iconColor,
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background = p.iconHoverBg
                e.currentTarget.style.color = '#fff'
                e.currentTarget.style.borderColor = 'transparent'
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = p.iconBg
                e.currentTarget.style.color = p.iconColor
                e.currentTarget.style.borderColor = p.iconBorder
              }}
            >
              <Calendar size={20} />
            </div>
            <div className="ec-actions">
              {!isDeleted && (
                <button className="ec-action-btn edit"
                  onClick={(e) => { e.stopPropagation(); onEdit(event) }} title="Editar">
                  <Edit size={14} />
                </button>
              )}
              {!isDeleted ? (
                <button className="ec-action-btn del"
                  onClick={(e) => { e.stopPropagation(); onDelete(event.id) }} title="Eliminar">
                  <Trash2 size={14} />
                </button>
              ) : (
                <button className="ec-action-btn rest"
                  onClick={(e) => { e.stopPropagation(); onRestore(event.id) }} title="Restaurar">
                  <RefreshCw size={14} />
                </button>
              )}
            </div>
          </div>

          <div className="ec-name">{event.nombre}</div>
          <div className="ec-date" style={{ color: p.accent }}>
            {new Date(event.fecha).toLocaleDateString('es-CO', { day: '2-digit', month: 'long', year: 'numeric' })}
          </div>

          <div className="ec-divider" />

          <div className="ec-meta">
            {event.lugar && (
              <div className="ec-meta-row">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={p.linkColor} strokeWidth="2.2">
                  <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/>
                  <circle cx="12" cy="9" r="2.5"/>
                </svg>
                {event.lugar}
              </div>
            )}
            {event.hora && (
              <div className="ec-meta-row">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={p.linkColor} strokeWidth="2.2">
                  <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
                </svg>
                {event.hora}
              </div>
            )}
            {event.aforo_maximo && (
              <div className="ec-meta-row">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={p.linkColor} strokeWidth="2.2">
                  <rect x="3" y="3" width="18" height="18" rx="3"/><path d="M3 9h18M9 21V9"/>
                </svg>
                Aforo máximo: {event.aforo_maximo}
              </div>
            )}
          </div>

          {event.whatsapp_link && (
            <div className="ec-whatsapp" style={{ background: p.accentLight, border: `1px solid ${p.accentBorder}`, color: p.accent }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>
              </svg>
              {event.whatsapp_link.length > 32 ? event.whatsapp_link.substring(0, 32) + '…' : event.whatsapp_link}
            </div>
          )}

          <div className="ec-footer">
            {isDeleted ? (
              <div className="ec-deleted-badge">
                <Trash2 size={11} /> Eliminado
              </div>
            ) : (
              <div className="ec-participants"
                style={{ background: p.accentLight, border: `1px solid ${p.accentBorder}`, color: p.accent }}>
                <Users size={12} /> {event.participantes?.length ?? 0} participantes
              </div>
            )}
            <div className="ec-link" style={{ color: p.linkColor }}>
              {isDeleted ? 'Restaurar' : 'Ver detalles'}
              <ArrowRight size={14} />
            </div>
          </div>
        </div>
      </div>
    </>
  )
}