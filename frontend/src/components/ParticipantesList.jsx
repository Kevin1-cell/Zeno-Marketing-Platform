import { useState } from 'react'
import axios from 'axios'
import toast from 'react-hot-toast'
import { Search, CheckCircle2, UserPlus, Edit, Trash2, RefreshCw } from 'lucide-react'

export default function ParticipantesList({ participantes, token, eventoId, onParticipanteRegistrado }) {
  const [filtro, setFiltro] = useState('')
  const [mostrarFormManual, setMostrarFormManual] = useState(false)
  const [formManual, setFormManual] = useState({
    nombre_completo: '',
    telefon: '',
    tipo: 'EMPLEADO',
    nivel: 'C1',
    recompensa: ''
  })
  const [registrando, setRegistrando] = useState(false)
  const [editModal, setEditModal] = useState(null)
  const [editData, setEditData] = useState({})
  const [convirtiendo, setConvirtiendo] = useState(null)
  const [confirmandoId, setConfirmandoId] = useState(null)

  const registrarManual = async (e) => {
    e.preventDefault()
    if (!eventoId) { toast.error('No hay evento seleccionado'); return }
    if (!/^\d{10}$/.test(formManual.telefon)) {
      toast.error('El número de teléfono debe tener exactamente 10 dígitos')
      return
    }
    setRegistrando(true)
    try {
      const payload = {
        nombre_completo: formManual.nombre_completo,
        telefon: formManual.telefon,
        tipo: formManual.tipo,
        evento_id: eventoId
      }
      if (formManual.tipo === 'EMPLEADO') {
        payload.nivel = formManual.nivel
      } else {
        payload.recompensa = formManual.recompensa
      }
      const res = await axios.post('/participantes/manual', payload, {
        headers: { Authorization: `Bearer ${token}` }
      })
      toast.success(`✅ Registrado: ${res.data.nombre_completo}${res.data.numero_asignado ? ` (N°${res.data.numero_asignado})` : ''}`)
      setFormManual({ nombre_completo: '', telefon: '', tipo: 'EMPLEADO', nivel: 'C1', recompensa: '' })
      setMostrarFormManual(false)
      if (onParticipanteRegistrado) onParticipanteRegistrado()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error al registrar')
    } finally {
      setRegistrando(false)
    }
  }

  const confirmarParticipante = async (id) => {
    setConfirmandoId(id)
    try {
      await axios.patch('/participantes/confirmar', { id }, { headers: { Authorization: `Bearer ${token}` } })
      toast.success('Participante confirmado')
      if (onParticipanteRegistrado) onParticipanteRegistrado()
    } catch (err) {
      toast.error('Error al confirmar')
    } finally {
      setConfirmandoId(null)
    }
  }

  const editarParticipante = async (id, data) => {
    try {
      const res = await axios.patch(`/participantes/${id}`, data, {
        headers: { Authorization: `Bearer ${token}` }
      })
      toast.success('Participante actualizado')
      setEditModal(null)
      if (onParticipanteRegistrado) onParticipanteRegistrado()
      return res.data
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error al actualizar')
      throw err
    }
  }

  const convertirInvitado = async (id, nivel) => {
    if (!nivel) return
    setConvirtiendo(id)
    try {
      await axios.post(`/participantes/convertir`, { id, nivel }, {
        headers: { Authorization: `Bearer ${token}` }
      })
      toast.success('Invitado convertido a participante confirmado')
      if (onParticipanteRegistrado) onParticipanteRegistrado()
    } catch (err) {
      toast.error('Error al convertir')
    } finally {
      setConvirtiendo(null)
    }
  }

  const eliminarParticipante = async (id) => {
    if (!confirm('¿Eliminar este participante? Esta acción no se puede deshacer.')) return
    try {
      await axios.delete(`/participantes/${id}`, { headers: { Authorization: `Bearer ${token}` } })
      toast.success('Participante eliminado')
      if (onParticipanteRegistrado) onParticipanteRegistrado()
    } catch (err) {
      toast.error('Error al eliminar')
    }
  }

  const filtrar = () => {
    const term = filtro.trim().toLowerCase()
    if (!term) return participantes
    return participantes.filter(p =>
      p.nombre_completo.toLowerCase().includes(term) ||
      p.telefon.toLowerCase().includes(term)
    )
  }

  const pendientes = filtrar().filter(p => p.tipo === 'EMPLEADO' && !p.confirmado)
  const confirmados = filtrar().filter(p => p.confirmado === true)
  const invitados = filtrar().filter(p => p.tipo === 'INVITADO')

  const totalPendientes = pendientes.length
  const totalConfirmados = confirmados.length
  const totalInvitados = invitados.length

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500&display=swap');

        .zpl-topbar {
          display: flex; gap: 8px; align-items: center; margin-bottom: 16px;
        }
        .zpl-search-wrap {
          flex: 1; position: relative;
        }
        .zpl-search-icon {
          position: absolute; left: 12px; top: 50%; transform: translateY(-50%);
          color: rgba(100,160,255,0.4);
        }
        .zpl-search {
          width: 100%;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(30,111,255,0.2);
          border-radius: 50px;
          padding: 10px 14px 10px 38px;
          color: #e0eeff;
          font-family: 'DM Sans', sans-serif;
          font-size: 13px;
          outline: none;
        }
        .zpl-search:focus {
          border-color: rgba(30,111,255,0.5);
          box-shadow: 0 0 0 3px rgba(30,111,255,0.08);
        }
        .zpl-btn-manual {
          display: flex; align-items: center; gap: 5px;
          background: linear-gradient(90deg, rgba(30,111,255,0.2), rgba(30,111,255,0.1));
          border: 1px solid rgba(30,111,255,0.38);
          color: #7eb8ff;
          font-family: 'Syne', sans-serif;
          font-size: 11px; font-weight: 700;
          padding: 9px 14px;
          border-radius: 50px;
          cursor: pointer;
          white-space: nowrap;
        }
        .zpl-btn-manual.open { background: rgba(255,80,80,0.1); border-color: rgba(255,80,80,0.25); color: rgba(255,140,140,0.8); }
        .zpl-counters {
          display: flex; gap: 8px; margin-bottom: 20px;
        }
        .zpl-counter {
          flex: 1; padding: 10px 12px; border-radius: 14px; text-align: center;
        }
        .zpl-counter.pending { background: rgba(250,204,21,0.06); border: 1px solid rgba(250,204,21,0.15); }
        .zpl-counter.confirmed { background: rgba(34,197,94,0.06); border: 1px solid rgba(34,197,94,0.15); }
        .zpl-counter.invitados { background: rgba(255,140,0,0.06); border: 1px solid rgba(255,140,0,0.15); }
        .zpl-counter-num { font-family: 'Syne', sans-serif; font-size: 22px; font-weight: 800; line-height: 1; }
        .zpl-counter.pending .zpl-counter-num { color: #fde047; }
        .zpl-counter.confirmed .zpl-counter-num { color: #4ade80; }
        .zpl-counter.invitados .zpl-counter-num { color: #ff8c00; }
        .zpl-counter-label { font-size: 9px; text-transform: uppercase; letter-spacing: 0.07em; color: rgba(148,180,220,0.45); margin-top: 3px; }
        .zpl-section-label {
          font-family: 'Syne', sans-serif;
          font-size: 10px; font-weight: 700;
          text-transform: uppercase; letter-spacing: 0.1em;
          display: flex; align-items: center; gap: 8px;
          margin: 14px 0 8px;
        }
        .zpl-section-label::after {
          content: ''; flex: 1; height: 1px;
        }
        .zpl-section-label.pending { color: rgba(250,204,21,0.6); }
        .zpl-section-label.pending::after { background: linear-gradient(90deg, rgba(250,204,21,0.2), transparent); }
        .zpl-section-label.confirmed { color: rgba(34,197,94,0.5); }
        .zpl-section-label.confirmed::after { background: linear-gradient(90deg, rgba(34,197,94,0.15), transparent); }
        .zpl-section-label.invitados { color: rgba(255,140,0,0.5); }
        .zpl-section-label.invitados::after { background: linear-gradient(90deg, rgba(255,140,0,0.15), transparent); }
        .zpl-card {
          border-radius: 16px; padding: 12px 14px;
          display: flex; align-items: center; gap: 12px;
          margin-bottom: 8px;
          background: rgba(255,255,255,0.02);
          border: 1px solid rgba(30,111,255,0.08);
          transition: all 0.2s;
        }
        .zpl-card:hover { background: rgba(30,111,255,0.04); }
        .zpl-nivel-badge {
          width: 36px; height: 36px; border-radius: 10px;
          display: flex; align-items: center; justify-content: center;
          font-family: 'Syne', sans-serif; font-size: 12px; font-weight: 800;
          flex-shrink: 0;
        }
        .zpl-nivel-badge.c1 { background: rgba(56,189,248,0.15); color: #7dd3fc; }
        .zpl-nivel-badge.c2 { background: rgba(250,204,21,0.13); color: #fde047; }
        .zpl-nivel-badge.c3 { background: rgba(244,114,182,0.13); color: #f9a8d4; }
        .zpl-nivel-badge.invitado { background: rgba(255,140,0,0.12); color: #ffa74d; }
        .zpl-info { flex: 1; min-width: 0; }
        .zpl-name { font-family: 'Syne', sans-serif; font-size: 13px; font-weight: 700; color: #e0eeff; }
        .zpl-meta { font-size: 11px; color: rgba(148,180,220,0.45); margin-top: 2px; display: flex; gap: 8px; flex-wrap: wrap; }
        .zpl-actions {
          display: flex; gap: 6px; align-items: center;
        }
        .zpl-btn-icon {
          background: none; border: none; cursor: pointer;
          padding: 6px; border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          transition: background 0.2s;
        }
        .zpl-btn-icon.edit { color: #7eb8ff; }
        .zpl-btn-icon.edit:hover { background: rgba(30,111,255,0.15); }
        .zpl-btn-icon.delete { color: #ff8a8a; }
        .zpl-btn-icon.delete:hover { background: rgba(255,80,80,0.1); }
        .zpl-btn-icon.confirm { color: #4ade80; }
        .zpl-btn-icon.confirm:hover { background: rgba(34,197,94,0.1); }
        .zpl-btn-icon.convert { color: #ff8c00; }
        .zpl-btn-icon.convert:hover { background: rgba(255,140,0,0.1); }
        .zpl-empty { text-align: center; padding: 32px 16px; color: rgba(148,180,220,0.35); font-size: 13px; }

        .zpl-modal-overlay {
          position: fixed; inset: 0; background: rgba(0,0,0,0.7);
          display: flex; align-items: center; justify-content: center;
          z-index: 1000;
        }
        .zpl-modal {
          max-width: 450px; width: 90%; background: #0a1628;
          border-radius: 24px; padding: 24px;
          border: 1px solid rgba(30,111,255,0.2);
        }
        .zpl-modal-title { font-family: 'Syne', sans-serif; font-size: 18px; font-weight: 700; margin-bottom: 16px; color: #fff; }
      `}</style>

      <div className="zpl-topbar">
        <div className="zpl-search-wrap">
          <span className="zpl-search-icon"><Search size={15} /></span>
          <input type="text" value={filtro} onChange={e => setFiltro(e.target.value)} className="zpl-search" placeholder="Buscar nombre o teléfono..." />
        </div>
        <button onClick={() => setMostrarFormManual(!mostrarFormManual)} className={`zpl-btn-manual${mostrarFormManual ? ' open' : ''}`}>
          <UserPlus size={13} /> {mostrarFormManual ? 'Cerrar' : 'Manual'}
        </button>
      </div>

      {mostrarFormManual && (
        <form onSubmit={registrarManual} className="zpl-form" style={{ marginBottom: 20, background: 'rgba(30,111,255,0.04)', borderRadius: 18, padding: 16 }}>
          <span style={{ fontFamily: 'Syne', fontSize: 12, fontWeight: 700 }}>Registro manual</span>
          <div>
            <label className="zpl-label">Nombre completo</label>
            <input type="text" required className="zpl-input" value={formManual.nombre_completo} onChange={e => setFormManual({ ...formManual, nombre_completo: e.target.value })} />
          </div>
          <div>
            <label className="zpl-label">Teléfono (10 dígitos)</label>
            <input type="tel" required pattern="\d{10}" className="zpl-input" value={formManual.telefon} onChange={e => setFormManual({ ...formManual, telefon: e.target.value })} />
          </div>
          <div>
            <label className="zpl-label">Tipo</label>
            <div style={{ display: 'flex', gap: 8 }}>
              {['EMPLEADO', 'INVITADO'].map(t => (
                <button key={t} type="button" onClick={() => setFormManual({ ...formManual, tipo: t, nivel: t === 'EMPLEADO' ? 'C1' : undefined })} className={`zpl-nivel-btn${formManual.tipo === t ? ' active' : ''}`} style={{ flex: 1 }}>{t}</button>
              ))}
            </div>
          </div>
          {formManual.tipo === 'EMPLEADO' && (
            <div>
              <label className="zpl-label">Nivel</label>
              <div className="zpl-nivel-wrap">
                {['C1', 'C2', 'C3'].map(n => (
                  <button key={n} type="button" onClick={() => setFormManual({ ...formManual, nivel: n })} className={`zpl-nivel-btn${formManual.nivel === n ? ` active-${n.toLowerCase()}` : ''}`}>{n}</button>
                ))}
              </div>
            </div>
          )}
          {formManual.tipo === 'INVITADO' && (
            <div>
              <label className="zpl-label">Recompensa (opcional)</label>
              <input type="text" className="zpl-input" value={formManual.recompensa} onChange={e => setFormManual({ ...formManual, recompensa: e.target.value })} placeholder="Ej. Entrada gratis, Merchandising" />
            </div>
          )}
          <button type="submit" disabled={registrando} className="zpl-btn-submit" style={{ background: 'linear-gradient(90deg, #1e6fff, #ff8c00)', borderRadius: 50, padding: 12, width: '100%' }}>{registrando ? 'Registrando...' : 'Registrar'}</button>
        </form>
      )}

      <div className="zpl-counters">
        <div className="zpl-counter pending"><p className="zpl-counter-num">{totalPendientes}</p><p className="zpl-counter-label">Pendientes</p></div>
        <div className="zpl-counter confirmed"><p className="zpl-counter-num">{totalConfirmados}</p><p className="zpl-counter-label">Confirmados</p></div>
        <div className="zpl-counter invitados"><p className="zpl-counter-num">{totalInvitados}</p><p className="zpl-counter-label">Invitados</p></div>
      </div>

      {editModal && (
        <div className="zpl-modal-overlay" onClick={() => setEditModal(null)}>
          <div className="zpl-modal" onClick={e => e.stopPropagation()}>
            <h3 className="zpl-modal-title">Editar participante</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div><label>Nombre</label><input type="text" className="zpl-input" value={editData.nombre_completo || ''} onChange={e => setEditData({ ...editData, nombre_completo: e.target.value })} /></div>
              <div><label>Teléfono</label><input type="tel" className="zpl-input" value={editData.telefon || ''} onChange={e => setEditData({ ...editData, telefon: e.target.value })} /></div>
              {editData.tipo === 'EMPLEADO' && (
                <div><label>Nivel</label><select className="zpl-input" value={editData.nivel || 'C1'} onChange={e => setEditData({ ...editData, nivel: e.target.value })}><option>C1</option><option>C2</option><option>C3</option></select></div>
              )}
              {editData.tipo === 'INVITADO' && (
                <div><label>Recompensa</label><input type="text" className="zpl-input" value={editData.recompensa || ''} onChange={e => setEditData({ ...editData, recompensa: e.target.value })} /></div>
              )}
              <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                <button onClick={async () => { await editarParticipante(editModal, editData); setEditModal(null); }} className="zpl-btn-submit" style={{ flex: 1 }}>Guardar</button>
                <button onClick={() => setEditModal(null)} className="zpl-btn-submit" style={{ background: '#333', flex: 1 }}>Cancelar</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {pendientes.length > 0 && (
        <>
          <p className="zpl-section-label pending">⏳ Pendientes ({pendientes.length})</p>
          {pendientes.map(p => (
            <ParticipanteCard
              key={p.id}
              p={p}
              onEdit={() => { setEditModal(p.id); setEditData(p); }}
              onConfirmar={() => confirmarParticipante(p.id)}
              confirmando={confirmandoId === p.id}
              onConvertirInvitado={null}
            />
          ))}
        </>
      )}
      {confirmados.length > 0 && (
        <>
          <p className="zpl-section-label confirmed">✓ Confirmados ({confirmados.length})</p>
          {confirmados.map(p => (
            <ParticipanteCard
              key={p.id}
              p={p}
              onEdit={() => { setEditModal(p.id); setEditData(p); }}
              onConfirmar={null}
              confirmando={false}
              onConvertirInvitado={null}
            />
          ))}
        </>
      )}
      {invitados.length > 0 && (
        <>
          <p className="zpl-section-label invitados">🎟️ Invitados ({invitados.length})</p>
          {invitados.map(p => (
            <ParticipanteCard
              key={p.id}
              p={p}
              onEdit={() => { setEditModal(p.id); setEditData(p); }}
              onConfirmar={null}
              confirmando={false}
              onConvertirInvitado={() => {
                const nivel = prompt('Selecciona el nivel del participante:', 'C1');
                if (nivel === 'C1' || nivel === 'C2' || nivel === 'C3') {
                  convertirInvitado(p.id, nivel);
                } else {
                  toast.error('Nivel no válido');
                }
              }}
            />
          ))}
        </>
      )}
      {pendientes.length === 0 && confirmados.length === 0 && invitados.length === 0 && (
        <div className="zpl-empty">{filtro ? 'Sin resultados' : 'No hay participantes'}</div>
      )}
    </>
  )
}

function ParticipanteCard({ p, onEdit, onConfirmar, confirmando, onConvertirInvitado }) {
  const nivelClase = p.tipo === 'INVITADO' ? 'invitado' : (p.nivel?.toLowerCase() || 'invitado')
  return (
    <div className="zpl-card">
      <div className={`zpl-nivel-badge ${nivelClase}`}>{p.tipo === 'INVITADO' ? '🎟️' : p.nivel}</div>
      <div className="zpl-info">
        <p className="zpl-name">{p.nombre_completo}</p>
        <div className="zpl-meta">
          <span>📞 {p.telefon}</span>
          {p.numero_asignado && <span>🎲 N° {p.numero_asignado}</span>}
          {p.tipo === 'INVITADO' && p.recompensa && <span>🏆 {p.recompensa}</span>}
        </div>
      </div>
      <div className="zpl-actions">
        <button onClick={onEdit} className="zpl-btn-icon edit" title="Editar"><Edit size={16} /></button>
        {onConfirmar && (
          <button onClick={onConfirmar} disabled={confirmando} className="zpl-btn-icon confirm" title="Confirmar">
            {confirmando ? <RefreshCw size={14} className="animate-spin" /> : <CheckCircle2 size={16} />}
          </button>
        )}
        {p.tipo === 'INVITADO' && onConvertirInvitado && (
          <button onClick={onConvertirInvitado} className="zpl-btn-icon convert" title="Convertir a participante"><RefreshCw size={14} /></button>
        )}
      </div>
    </div>
  )
}