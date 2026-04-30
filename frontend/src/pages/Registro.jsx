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
  const [form, setForm] = useState({ nombre_completo: '', telefon: '', nivel: 'C1', evento_id: '' })
  const [loading, setLoading] = useState(false)

  // Obtener eventos activos
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
    setLoading(true)
    try {
      await axios.post('/participantes/registro', {
        nombre_completo: form.nombre_completo,
        telefon: form.telefon,
        nivel: form.nivel,
        evento_id: eventoSeleccionado.id
      })
      toast.success('Registro exitoso. Ahora puedes consultar tus datos.')
      setTelefonoConsulta(form.telefon)
      setModoConsulta(true)
      setForm({ nombre_completo: '', telefon: '', nivel: 'C1', evento_id: eventoSeleccionado.id })
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
    <div className="min-h-screen bg-zeno-dark flex items-center justify-center p-4 relative">
      <Toaster position="top-right" />
      <div className="bg-zeno-card rounded-xl shadow-2xl p-8 w-full max-w-md border border-zeno-border relative">
        {/* Botón Ingresar SIEMPRE visible */}
        <button
          onClick={() => navigate('/login')}
          className="absolute top-4 right-4 bg-zeno-orange text-white px-3 py-1 rounded-lg text-sm hover:opacity-90 transition"
        >
          Ingresar
        </button>

        <h1 className="text-3xl font-bold text-center bg-gradient-to-r from-zeno-blue to-zeno-orange bg-clip-text text-transparent mb-6">
          Zeno Marketing
        </h1>

        {!hayEventos ? (
          <div className="text-center py-8">
            <p className="text-zeno-text-sec mb-4">No hay eventos activos en este momento.</p>
            <p className="text-sm text-zeno-text-sec">Por favor, vuelve más tarde o contacta al administrador.</p>
          </div>
        ) : (
          <>
            {/* Selector de evento */}
            <div className="mb-4">
              <label className="block text-zeno-text-sec mb-1">Evento</label>
              <select
                className="w-full bg-zeno-dark border border-zeno-border rounded-lg px-4 py-2 text-zeno-text"
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
                <form onSubmit={handleSubmitRegistro} className="space-y-4">
                  <div>
                    <label className="block text-zeno-text-sec mb-1">Nombre Completo</label>
                    <input
                      type="text"
                      required
                      className="w-full bg-zeno-dark border border-zeno-border rounded-lg px-4 py-2 text-zeno-text"
                      value={form.nombre_completo}
                      onChange={e => setForm({ ...form, nombre_completo: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-zeno-text-sec mb-1">Número teléfono (10 dígitos)</label>
                    <input
                      type="tel"
                      required
                      pattern="\d{10}"
                      title="Debe tener exactamente 10 dígitos"
                      className="w-full bg-zeno-dark border border-zeno-border rounded-lg px-4 py-2 text-zeno-text"
                      value={form.telefon}
                      onChange={e => setForm({ ...form, telefon: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-zeno-text-sec mb-1">Nivel</label>
                    <div className="flex gap-3">
                      {['C1', 'C2', 'C3'].map(n => (
                        <button
                          key={n}
                          type="button"
                          onClick={() => setForm({ ...form, nivel: n })}
                          className={`px-4 py-2 rounded-lg font-semibold transition ${
                            form.nivel === n
                              ? 'bg-zeno-blue text-white'
                              : 'bg-zeno-dark border border-zeno-border text-zeno-text-sec'
                          }`}
                        >
                          {n}
                        </button>
                      ))}
                    </div>
                  </div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-zeno-blue to-zeno-orange py-2 rounded-lg font-bold text-white transition hover:opacity-90 disabled:opacity-50"
                  >
                    {loading ? 'Registrando...' : 'Registrarse'}
                  </button>
                </form>
                <div className="text-center mt-4">
                  <button
                    onClick={() => setModoConsulta(true)}
                    className="text-zeno-blue underline text-sm hover:text-zeno-orange transition"
                  >
                    ¿Ya te registraste? Consulta tus datos
                  </button>
                </div>
              </>
            ) : (
              <div>
                {!datosRegistrado ? (
                  <div className="space-y-4">
                    <p className="text-center text-zeno-text-sec">Ingresa tu número de teléfono para consultar tus datos</p>
                    <input
                      type="tel"
                      placeholder="Número de teléfono"
                      className="w-full bg-zeno-dark border border-zeno-border rounded-lg px-4 py-2 text-zeno-text"
                      value={telefonoConsulta}
                      onChange={e => setTelefonoConsulta(e.target.value)}
                    />
                    <button
                      onClick={consultarRegistro}
                      className="w-full bg-zeno-blue py-2 rounded-lg font-bold"
                    >
                      Consultar
                    </button>
                    <button
                      onClick={() => setModoConsulta(false)}
                      className="w-full text-zeno-text-sec underline text-sm"
                    >
                      Volver al registro
                    </button>
                  </div>
                ) : (
                  <div className="bg-zeno-dark rounded-lg p-4 border border-zeno-blue">
                    <div className="border-b border-zeno-border pb-2 mb-2">
                      <p className="text-sm font-bold text-zeno-orange">{eventoSeleccionado?.nombre}</p>
                      {eventoSeleccionado?.lugar && <p className="text-xs text-zeno-text-sec">📍 {eventoSeleccionado.lugar}</p>}
                      {eventoSeleccionado?.hora && <p className="text-xs text-zeno-text-sec">🕒 {eventoSeleccionado.hora}</p>}
                    </div>
                    <h3 className="text-xl font-semibold text-zeno-blue mb-2">¡Ya estás registrado!</h3>
                    <p><span className="text-zeno-text-sec">Nombre:</span> {datosRegistrado.nombre_completo}</p>
                    <p><span className="text-zeno-text-sec">Teléfono:</span> {datosRegistrado.telefon}</p>
                    <p><span className="text-zeno-text-sec">Nivel:</span> {datosRegistrado.nivel}</p>
                    <p><span className="text-zeno-text-sec">Número de sorteo:</span> <strong className="text-zeno-orange text-xl block">{datosRegistrado.numero_asignado}</strong></p>
                    <p className="text-sm mt-2">Estado: {datosRegistrado.confirmado ? '✅ Confirmado' : '⏳ Pendiente'}</p>
                    <button
                      onClick={abrirWhatsApp}
                      className="mt-4 w-full bg-green-600 py-2 rounded-lg font-bold flex items-center justify-center gap-2"
                    >
                      📱 Unirse al grupo de WhatsApp
                    </button>
                    <button
                      onClick={() => {
                        setModoConsulta(false)
                        setDatosRegistrado(null)
                        setTelefonoConsulta('')
                      }}
                      className="w-full text-zeno-text-sec underline text-sm mt-3"
                    >
                      Registrar otra persona
                    </button>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}