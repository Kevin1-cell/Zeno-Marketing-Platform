import { useState, useEffect } from 'react'
import axios from 'axios'
import toast, { Toaster } from 'react-hot-toast'
import { useNavigate } from 'react-router-dom'

export default function Registro() {
  const navigate = useNavigate()
  const [eventosActivos, setEventosActivos] = useState([])
  const [eventoSeleccionado, setEventoSeleccionado] = useState(null)
  const [modoConsulta, setModoConsulta] = useState(false)
  const [telefonoConsulta, setTelefonoConsulta] = useState('')
  const [datosRegistrado, setDatosRegistrado] = useState(null)
  const [form, setForm] = useState({
    nombre_completo: '',
    telefon: '',
    tipo: 'EMPLEADO',   // EMPLEADO o INVITADO
    nivel: 'C1',
    evento_id: '',
  })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    axios.get('/eventos/activos')
      .then(res => {
        setEventosActivos(res.data)
        if (res.data.length > 0) {
          setEventoSeleccionado(res.data[0])
          setForm(prev => ({ ...prev, evento_id: res.data[0].id }))
        }
      })
      .catch(err => {
        console.error(err)
        toast.error('Error al cargar eventos')
      })
  }, [])

  const handleSubmitRegistro = async (e) => {
    e.preventDefault()
    if (!eventoSeleccionado) return toast.error('Selecciona un evento')
    if (!/^\d{10}$/.test(form.telefon)) {
      toast.error('El número de teléfono debe tener exactamente 10 dígitos')
      return
    }
    if (form.tipo === 'EMPLEADO' && !form.nivel) {
      toast.error('Debes seleccionar un nivel para empleados')
      return
    }
    setLoading(true)
    try {
      const payload = {
        nombre_completo: form.nombre_completo,
        telefon: form.telefon,
        tipo: form.tipo,
        evento_id: eventoSeleccionado.id,
      }
      if (form.tipo === 'EMPLEADO') {
        payload.nivel = form.nivel
      }
      await axios.post('/participantes/registro', payload)
      const msg = form.tipo === 'EMPLEADO'
        ? 'Registro exitoso. Ahora puedes consultar tus datos.'
        : 'Invitado registrado correctamente.'
      toast.success(msg)
      setTelefonoConsulta(form.telefon)
      setModoConsulta(true)
      setForm({
        nombre_completo: '',
        telefon: '',
        tipo: 'EMPLEADO',
        nivel: 'C1',
        evento_id: eventoSeleccionado.id,
      })
    } catch (err) {
      const msg = err.response?.data?.message
      if (msg && msg.includes('Ya existe')) {
        toast.error('Este teléfono ya está registrado. Usa "Consultar mis datos".')
        setModoConsulta(true)
        setTelefonoConsulta(form.telefon)
      } else {
        toast.error(msg || 'Error al registrar')
      }
    } finally {
      setLoading(false)
    }
  }

  const consultarRegistro = async () => {
    if (!eventoSeleccionado) return toast.error('Selecciona un evento válido')
    if (!telefonoConsulta.trim()) return toast.error('Ingresa tu número de teléfono')
    if (!/^\d{10}$/.test(telefonoConsulta)) {
      toast.error('El número debe tener 10 dígitos')
      return
    }
    try {
      const res = await axios.get('/participantes/consulta', {
        params: { telefon: telefonoConsulta, evento_id: eventoSeleccionado.id }
      })
      setDatosRegistrado(res.data)
      toast.success('Datos encontrados')
    } catch (err) {
      if (err.response?.status === 404) {
        toast.error('No estás registrado en este evento.')
      } else {
        toast.error('Error al consultar')
      }
    }
  }

  const abrirWhatsApp = () => {
    const link = eventoSeleccionado?.whatsapp_link
    if (link) window.open(link, '_blank')
    else toast.error('El administrador aún no ha configurado el enlace de WhatsApp')
  }

  const hayEventos = eventosActivos.length > 0

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500&family=Bebas+Neue&family=Oswald:wght@700&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        html, body, #root {
          height: 100%;
          overflow: hidden;
        }

        .zr-root {
          height: 100dvh;
          background: #030b18;
          display: flex;
          align-items: stretch;
          justify-content: center;
          font-family: 'DM Sans', sans-serif;
          position: relative;
          overflow: hidden;
        }

        .zr-bg-glow {
          position: fixed; inset: 0;
          z-index: 0; pointer-events: none;
        }
        .zr-bg-glow::before {
          content: '';
          position: absolute;
          top: -100px; left: 50%;
          transform: translateX(-50%);
          width: 500px; height: 350px;
          background: radial-gradient(ellipse, rgba(30,111,255,0.18) 0%, transparent 70%);
        }
        .zr-bg-glow::after {
          content: '';
          position: absolute;
          bottom: -60px; right: -80px;
          width: 350px; height: 350px;
          background: radial-gradient(ellipse, rgba(255,140,0,0.10) 0%, transparent 70%);
        }

        .zr-card {
          position: relative; z-index: 1;
          width: 100%; max-width: 430px;
          height: 100dvh;
          background: linear-gradient(180deg, #0a1628 0%, #060e1c 100%);
          display: flex; flex-direction: column;
          border-left: 1px solid rgba(30,111,255,0.08);
          border-right: 1px solid rgba(30,111,255,0.08);
        }

        .zr-topbar {
          flex-shrink: 0;
          display: flex; justify-content: flex-end;
          padding: 12px 16px 0;
        }
        .zr-btn-ingresar {
          background: rgba(30,111,255,0.15);
          border: 1px solid rgba(30,111,255,0.4);
          color: #7eb8ff;
          font-family: 'DM Sans', sans-serif;
          font-size: 12px; font-weight: 500;
          padding: 6px 16px; border-radius: 50px;
          cursor: pointer; transition: all 0.2s;
        }
        .zr-btn-ingresar:hover { background: rgba(30,111,255,0.28); color: #aed4ff; }

        .zr-logo-wrap {
          flex-shrink: 0;
          display: flex; flex-direction: column; align-items: center;
          padding: 4px 16px 4px;
        }
        .zr-logo-img {
          width: clamp(110px, 35vw, 150px);
          height: auto;
          filter: drop-shadow(0 0 18px rgba(30,111,255,0.35)) drop-shadow(0 0 7px rgba(255,140,0,0.2));
          animation: logoFloat 4s ease-in-out infinite;
        }
        @keyframes logoFloat {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-5px); }
        }
        .zr-badge {
          margin-top: 2px;
          font-family: 'Syne', sans-serif;
          font-size: clamp(15px, 4.5vw, 19px);
          font-weight: 700;
          background: linear-gradient(90deg, #1e6fff, #ff8c00);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          letter-spacing: 0.04em;
        }

        .zr-divider {
          flex-shrink: 0;
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(30,111,255,0.2), transparent);
          margin: 5px 16px;
        }

        .zr-body {
          flex: 1;
          overflow-y: auto;
          overflow-x: hidden;
          padding: 8px 16px 24px;
          display: flex; flex-direction: column; gap: 11px;
          -webkit-overflow-scrolling: touch;
          scrollbar-width: none;
        }
        .zr-body::-webkit-scrollbar { display: none; }

        .zr-label {
          display: block;
          font-size: 10px; font-weight: 500;
          letter-spacing: 0.08em; text-transform: uppercase;
          color: rgba(148,180,220,0.65);
          margin-bottom: 5px; padding-left: 2px;
        }
        .zr-select {
          width: 100%;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(30,111,255,0.2);
          border-radius: 12px;
          padding: 11px 36px 11px 14px;
          color: #e0eeff;
          font-family: 'DM Sans', sans-serif;
          font-size: 13px; outline: none; appearance: none;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6' viewBox='0 0 10 6'%3E%3Cpath d='M1 1l4 4 4-4' stroke='%231e6fff' stroke-width='1.5' fill='none' stroke-linecap='round'/%3E%3C/svg%3E");
          background-repeat: no-repeat;
          background-position: right 12px center;
          cursor: pointer; transition: border-color 0.2s, box-shadow 0.2s;
        }
        .zr-select:focus {
          border-color: rgba(30,111,255,0.6);
          box-shadow: 0 0 0 3px rgba(30,111,255,0.1);
        }
        .zr-select option { background: #0a1628; color: #e0eeff; }

        .zr-input {
          width: 100%;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(30,111,255,0.2);
          border-radius: 12px;
          padding: 11px 14px;
          color: #e0eeff;
          font-family: 'DM Sans', sans-serif;
          font-size: 15px; outline: none;
          transition: border-color 0.2s, box-shadow 0.2s;
        }
        .zr-input::placeholder { color: rgba(148,180,220,0.3); }
        .zr-input:focus {
          border-color: rgba(30,111,255,0.6);
          box-shadow: 0 0 0 3px rgba(30,111,255,0.1);
        }

        .zr-tipo-wrap {
          display: flex; gap: 12px;
          margin-bottom: 8px;
        }
        .zr-tipo-btn {
          flex: 1; padding: 11px 0;
          border-radius: 12px;
          font-family: 'Syne', sans-serif;
          font-size: 14px; font-weight: 700;
          letter-spacing: 0.05em; cursor: pointer;
          border: 1px solid rgba(30,111,255,0.2);
          background: rgba(255,255,255,0.03);
          color: rgba(148,180,220,0.5);
          transition: all 0.2s;
        }
        .zr-tipo-btn:hover { border-color: rgba(30,111,255,0.4); color: #aed4ff; }
        .zr-tipo-btn.active {
          background: linear-gradient(135deg, rgba(30,111,255,0.25), rgba(30,111,255,0.1));
          border-color: #1e6fff; color: #fff;
          box-shadow: 0 0 14px rgba(30,111,255,0.22), inset 0 1px 0 rgba(255,255,255,0.1);
        }

        .zr-nivel-wrap { display: flex; gap: 8px; margin-top: 6px; }
        .zr-nivel-btn {
          flex: 1; padding: 11px 0;
          border-radius: 12px;
          font-family: 'Syne', sans-serif;
          font-size: 14px; font-weight: 700;
          letter-spacing: 0.05em; cursor: pointer;
          border: 1px solid rgba(30,111,255,0.2);
          background: rgba(255,255,255,0.03);
          color: rgba(148,180,220,0.5);
          transition: all 0.2s;
        }
        .zr-nivel-btn:hover { border-color: rgba(30,111,255,0.4); color: #aed4ff; }
        .zr-nivel-btn.active {
          background: linear-gradient(135deg, rgba(30,111,255,0.25), rgba(30,111,255,0.1));
          border-color: #1e6fff; color: #fff;
          box-shadow: 0 0 14px rgba(30,111,255,0.22), inset 0 1px 0 rgba(255,255,255,0.1);
        }

        .zr-btn-primary {
          width: 100%; padding: 14px; border-radius: 50px; border: none;
          background: linear-gradient(90deg, #1e6fff 0%, #ff8c00 100%);
          color: #fff;
          font-family: 'Syne', sans-serif;
          font-size: 15px; font-weight: 700; letter-spacing: 0.04em;
          cursor: pointer; position: relative; overflow: hidden;
          transition: opacity 0.2s, transform 0.15s;
          box-shadow: 0 4px 20px rgba(30,111,255,0.28);
        }
        .zr-btn-primary::before {
          content: ''; position: absolute; inset: 0;
          background: linear-gradient(90deg, rgba(255,255,255,0.12) 0%, transparent 60%);
          pointer-events: none;
        }
        .zr-btn-primary:hover:not(:disabled) { opacity: 0.9; transform: translateY(-1px); }
        .zr-btn-primary:disabled { opacity: 0.45; cursor: not-allowed; }

        .zr-btn-outline {
          width: 100%; padding: 12px; border-radius: 50px;
          border: 1px solid rgba(30,111,255,0.22);
          background: transparent;
          color: rgba(148,180,220,0.55);
          font-family: 'DM Sans', sans-serif;
          font-size: 13px; font-weight: 500;
          cursor: pointer; transition: all 0.2s;
        }
        .zr-btn-outline:hover { border-color: rgba(30,111,255,0.45); color: #aed4ff; }

        .zr-link {
          background: none; border: none;
          color: rgba(100,160,255,0.65);
          font-family: 'DM Sans', sans-serif;
          font-size: 13px; cursor: pointer;
          transition: color 0.2s; padding: 0;
        }
        .zr-link:hover { color: #ff8c00; }

        .zr-result-card {
          background: rgba(30,111,255,0.06);
          border: 1px solid rgba(30,111,255,0.22);
          border-radius: 18px; overflow: hidden;
        }
        .zr-result-top-bar {
          height: 2px;
          background: linear-gradient(90deg, #1e6fff, #ff8c00);
        }
        .zr-result-body { padding: 14px; }
        .zr-result-event-name {
          font-family: 'Syne', sans-serif;
          font-size: 12px; font-weight: 700;
          color: #ff8c00; letter-spacing: 0.03em;
        }
        .zr-result-event-meta {
          font-size: 11px;
          color: rgba(148,180,220,0.5);
          margin-bottom: 10px;
        }
        .zr-result-title {
          font-family: 'Syne', sans-serif;
          font-size: 17px; font-weight: 700;
          color: #7eb8ff; margin-bottom: 8px;
        }
        .zr-result-row {
          display: flex; justify-content: space-between; align-items: center;
          padding: 7px 0;
          border-bottom: 1px solid rgba(30,111,255,0.09);
          font-size: 13px;
        }
        .zr-result-row:last-of-type { border-bottom: none; }
        .zr-result-key {
          color: rgba(148,180,220,0.5);
          font-size: 10px; text-transform: uppercase; letter-spacing: 0.06em;
        }
        .zr-result-val { color: #e0eeff; font-weight: 500; }

        .zr-estado-pill {
          display: inline-flex; align-items: center; gap: 4px;
          padding: 3px 10px; border-radius: 50px;
          font-size: 11px; font-weight: 500;
        }
        .zr-estado-pill.confirmado {
          background: rgba(34,197,94,0.1);
          border: 1px solid rgba(34,197,94,0.28); color: #4ade80;
        }
        .zr-estado-pill.pendiente {
          background: rgba(234,179,8,0.09);
          border: 1px solid rgba(234,179,8,0.22); color: #facc15;
        }

        .zr-numero-hero {
          margin: 10px 0 4px;
          display: flex; flex-direction: column; align-items: center;
          padding: 20px 16px 16px;
          background: rgba(0,0,0,0.3);
          border-radius: 16px;
          border: 1px solid rgba(30,111,255,0.18);
          position: relative;
        }
        .zr-numero-hero::after {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0; height: 1px;
          background: linear-gradient(90deg, transparent, rgba(30,111,255,0.5), rgba(255,140,0,0.4), transparent);
        }
        .zr-numero-hero-label {
          font-size: 9px; font-weight: 600;
          letter-spacing: 0.16em; text-transform: uppercase;
          color: rgba(148,180,220,0.45);
          margin-bottom: 12px;
        }
        .zr-numero-value {
          font-family: 'Oswald', sans-serif;
          font-size: clamp(78px, 23vw, 100px);
          font-weight: 700;
          line-height: 1;
          color: #ffffff;
          -webkit-text-stroke: 2.5px rgba(30,111,255,0.85);
          letter-spacing: 0.06em;
          text-align: center;
        }
        .zr-numero-underline {
          width: 60px; height: 3px;
          background: linear-gradient(90deg, #1e6fff, #ff8c00);
          border-radius: 2px;
          margin-top: 10px;
        }
        .zr-numero-sub {
          font-size: 11px;
          color: rgba(148,180,220,0.38);
          margin-top: 8px; letter-spacing: 0.05em;
        }

        .zr-btn-whatsapp {
          width: 100%; padding: 13px; border-radius: 50px; border: none;
          background: linear-gradient(90deg, #16a34a, #22c55e);
          color: #fff;
          font-family: 'Syne', sans-serif;
          font-size: 14px; font-weight: 700;
          cursor: pointer;
          display: flex; align-items: center; justify-content: center; gap: 7px;
          transition: opacity 0.2s, transform 0.15s;
          box-shadow: 0 4px 18px rgba(34,197,94,0.2);
        }
        .zr-btn-whatsapp:hover { opacity: 0.9; transform: translateY(-1px); }

        .zr-empty {
          text-align: center; padding: 30px 16px;
          color: rgba(148,180,220,0.45);
          font-size: 14px; line-height: 1.7;
        }
      `}</style>

      <Toaster
        position="top-center"
        toastOptions={{
          style: {
            background: '#0d1e38', color: '#e0eeff',
            border: '1px solid rgba(30,111,255,0.25)',
            borderRadius: '12px', fontSize: '13px',
            fontFamily: 'DM Sans, sans-serif',
          },
        }}
      />

      <div className="zr-root">
        <div className="zr-bg-glow" />
        <div className="zr-card">

          <div className="zr-topbar">
            <button onClick={() => navigate('/login')} className="zr-btn-ingresar">
              Ingresar
            </button>
          </div>

          <div className="zr-logo-wrap">
            <img src="/zeno-logo.png" alt="Zeno Marketing" className="zr-logo-img" />
            <span className="zr-badge">Registro</span>
          </div>

          <div className="zr-divider" />

          <div className="zr-body">
            {!hayEventos ? (
              <div className="zr-empty">
                <p>No hay eventos activos en este momento.</p>
                <p style={{ marginTop: 6, fontSize: 12 }}>Vuelve más tarde o contacta al administrador.</p>
              </div>
            ) : (
              <>
                <div>
                  <label className="zr-label">Evento</label>
                  <select
                    className="zr-select"
                    value={eventoSeleccionado?.id || ''}
                    onChange={(e) => {
                      const ev = eventosActivos.find(ev => ev.id === e.target.value)
                      setEventoSeleccionado(ev)
                      setForm(prev => ({ ...prev, evento_id: ev.id }))
                    }}
                  >
                    {eventosActivos.map(ev => (
                      <option key={ev.id} value={ev.id}>
                        {ev.nombre} {ev.lugar ? `- ${ev.lugar}` : ''} {ev.hora ? `(${ev.hora})` : ''}
                      </option>
                    ))}
                  </select>
                </div>

                {!modoConsulta ? (
                  <>
                    <div>
                      <label className="zr-label">Tipo de registro</label>
                      <div className="zr-tipo-wrap">
                        <button
                          type="button"
                          onClick={() => setForm(prev => ({ ...prev, tipo: 'EMPLEADO' }))}
                          className={`zr-tipo-btn${form.tipo === 'EMPLEADO' ? ' active' : ''}`}
                        >
                          Empleado
                        </button>
                        <button
                          type="button"
                          onClick={() => setForm(prev => ({ ...prev, tipo: 'INVITADO' }))}
                          className={`zr-tipo-btn${form.tipo === 'INVITADO' ? ' active' : ''}`}
                        >
                          Invitado
                        </button>
                      </div>
                    </div>

                    <form onSubmit={handleSubmitRegistro} style={{ display: 'flex', flexDirection: 'column', gap: 11 }}>
                      <div>
                        <label className="zr-label">Nombre Completo</label>
                        <input
                          type="text" required
                          placeholder="Tu nombre completo"
                          className="zr-input"
                          value={form.nombre_completo}
                          onChange={e => setForm({ ...form, nombre_completo: e.target.value })}
                        />
                      </div>
                      <div>
                        <label className="zr-label">Número de teléfono</label>
                        <input
                          type="tel" required
                          pattern="\d{10}" placeholder="10 dígitos"
                          title="Debe tener exactamente 10 dígitos"
                          className="zr-input"
                          value={form.telefon}
                          onChange={e => setForm({ ...form, telefon: e.target.value })}
                        />
                      </div>

                      {form.tipo === 'EMPLEADO' && (
                        <div>
                          <label className="zr-label">Nivel</label>
                          <div className="zr-nivel-wrap">
                            {['C1', 'C2', 'C3'].map(n => (
                              <button
                                key={n} type="button"
                                onClick={() => setForm({ ...form, nivel: n })}
                                className={`zr-nivel-btn${form.nivel === n ? ' active' : ''}`}
                              >
                                {n}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      <button type="submit" disabled={loading} className="zr-btn-primary">
                        {loading ? 'Registrando...' : (form.tipo === 'EMPLEADO' ? 'Registrarse' : 'Registrar invitado')}
                      </button>
                    </form>

                    <div style={{ textAlign: 'center' }}>
                      <button onClick={() => setModoConsulta(true)} className="zr-link">
                        ¿Ya te registraste? Consulta tus datos
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    {!datosRegistrado ? (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 11 }}>
                        <p style={{ textAlign: 'center', color: 'rgba(148,180,220,0.55)', fontSize: 13 }}>
                          Ingresa tu número para consultar tus datos
                        </p>
                        <input
                          type="tel" placeholder="Número de teléfono"
                          className="zr-input"
                          value={telefonoConsulta}
                          onChange={e => setTelefonoConsulta(e.target.value)}
                        />
                        <button onClick={consultarRegistro} className="zr-btn-primary">
                          Consultar
                        </button>
                        <button onClick={() => setModoConsulta(false)} className="zr-btn-outline">
                          Volver al registro
                        </button>
                      </div>
                    ) : (
                      <div className="zr-result-card">
                        <div className="zr-result-top-bar" />
                        <div className="zr-result-body">
                          <p className="zr-result-event-name">{eventoSeleccionado?.nombre}</p>
                          <div className="zr-result-event-meta">
                            {eventoSeleccionado?.lugar && <span>📍 {eventoSeleccionado.lugar}</span>}
                            {eventoSeleccionado?.hora && <span style={{ marginLeft: 6 }}>🕒 {eventoSeleccionado.hora}</span>}
                          </div>

                          <p className="zr-result-title">¡Ya estás registrado!</p>

                          <div className="zr-result-row">
                            <span className="zr-result-key">Nombre</span>
                            <span className="zr-result-val">{datosRegistrado.nombre_completo}</span>
                          </div>
                          <div className="zr-result-row">
                            <span className="zr-result-key">Teléfono</span>
                            <span className="zr-result-val">{datosRegistrado.telefon}</span>
                          </div>
                          <div className="zr-result-row">
                            <span className="zr-result-key">Tipo</span>
                            <span className="zr-result-val">{datosRegistrado.tipo === 'INVITADO' ? 'Invitado' : 'Empleado'}</span>
                          </div>
                          {datosRegistrado.nivel && (
                            <div className="zr-result-row">
                              <span className="zr-result-key">Nivel</span>
                              <span className="zr-result-val">{datosRegistrado.nivel}</span>
                            </div>
                          )}
                          <div className="zr-result-row">
                            <span className="zr-result-key">Estado</span>
                            <span className={`zr-estado-pill${datosRegistrado.confirmado ? ' confirmado' : ' pendiente'}`}>
                              {datosRegistrado.confirmado ? '✓ Confirmado' : '⏳ Pendiente'}
                            </span>
                          </div>

                          {datosRegistrado.numero_asignado && (
                            <div className="zr-numero-hero">
                              <span className="zr-numero-hero-label">Tu número de sorteo</span>
                              <span className="zr-numero-value">{datosRegistrado.numero_asignado}</span>
                              <div className="zr-numero-underline" />
                              <span className="zr-numero-sub">Guárdalo bien 🎯</span>
                            </div>
                          )}

                          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 12 }}>
                            <button onClick={abrirWhatsApp} className="zr-btn-whatsapp">
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                              </svg>
                              Unirse al grupo de WhatsApp
                            </button>
                            <button
                              onClick={() => {
                                setModoConsulta(false)
                                setDatosRegistrado(null)
                                setTelefonoConsulta('')
                              }}
                              className="zr-btn-outline"
                            >
                              Registrar otra persona
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </>
  )
}