import { useState, useEffect } from 'react'
import axios from 'axios'
import toast, { Toaster } from 'react-hot-toast'
import { useNavigate } from 'react-router-dom'

export default function Registro() {
  const navigate = useNavigate()
  const [eventoActivo, setEventoActivo] = useState(null)
  const [modoConsulta, setModoConsulta] = useState(false)
  const [telefonoConsulta, setTelefonoConsulta] = useState('')
  const [datosRegistrado, setDatosRegistrado] = useState(null)
  const [form, setForm] = useState({ nombre_completo: '', telefon: '', nivel: 'C1' })
  const [loading, setLoading] = useState(false)
  const [numeroAsignado, setNumeroAsignado] = useState(null)

  // Obtener evento activo (endpoint público)
  useEffect(() => {
    axios.get('/eventos/activo')
      .then(res => {
        setEventoActivo(res.data)
      })
      .catch(err => {
        console.error(err)
        toast.error('No hay evento activo en este momento')
      })
  }, [])

  const handleSubmitRegistro = async (e) => {
    e.preventDefault()
    if (!eventoActivo) return toast.error('No hay evento activo')
    setLoading(true)
    try {
      const res = await axios.post('/participantes/registro', {
        ...form,
        evento_id: eventoActivo.id
      })
      setNumeroAsignado(res.data.participante.numero_asignado)
      toast.success('Registro exitoso. Espera confirmación del administrador.')
      setForm({ nombre_completo: '', telefon: '', nivel: 'C1' })
    } catch (err) {
      const msg = err.response?.data?.message
      if (msg && msg.includes('Ya existe')) {
        toast.error('Este teléfono ya está registrado. Usa "Consultar mis datos".')
        setModoConsulta(true)
      } else {
        toast.error(msg || 'Error al registrar')
      }
    } finally {
      setLoading(false)
    }
  }

  const consultarRegistro = async () => {
    if (!eventoActivo) return toast.error('No hay evento activo')
    if (!telefonoConsulta.trim()) return toast.error('Ingresa tu número de teléfono')
    try {
      const res = await axios.get('/participantes/consulta', {
        params: { telefon: telefonoConsulta, evento_id: eventoActivo.id }
      })
      setDatosRegistrado(res.data)
      toast.success('Datos encontrados')
    } catch (err) {
      if (err.response?.status === 404) {
        toast.error('No estás registrado. Completa el formulario.')
        setModoConsulta(false)
      } else {
        toast.error('Error al consultar')
      }
    }
  }

  const abrirWhatsApp = () => {
    const link = eventoActivo?.whatsapp_link
    if (link) window.open(link, '_blank')
    else toast.error('El administrador aún no ha configurado el enlace de WhatsApp')
  }

  if (!eventoActivo) {
    return (
      <div className="min-h-screen bg-zeno-dark flex items-center justify-center">
        <div className="text-zeno-text">Cargando evento activo...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-zeno-dark flex items-center justify-center p-4 relative">
      <Toaster position="top-right" />
      <div className="bg-zeno-card rounded-xl shadow-2xl p-8 w-full max-w-md border border-zeno-border relative">
        {/* Botón Ingresar (admin) */}
        <button
          onClick={() => navigate('/login')}
          className="absolute top-4 right-4 bg-zeno-orange text-white px-3 py-1 rounded-lg text-sm hover:opacity-90 transition"
        >
          Ingresar
        </button>

        <h1 className="text-3xl font-bold text-center bg-gradient-to-r from-zeno-blue to-zeno-orange bg-clip-text text-transparent mb-6">
          Zeno Marketing
        </h1>
        <p className="text-center text-zeno-text-sec mb-6">Evento: {eventoActivo.nombre}</p>

        {numeroAsignado && (
          <div className="bg-zeno-blue/20 border border-zeno-blue rounded-lg p-3 mb-4 text-center">
            <p className="text-zeno-text">Tu número de sorteo es:</p>
            <p className="text-3xl font-bold text-zeno-orange">{numeroAsignado}</p>
            <p className="text-sm mt-2">Espera confirmación del administrador.</p>
          </div>
        )}

        {!modoConsulta ? (
          <>
            <form onSubmit={handleSubmitRegistro} className="space-y-4">
              <div>
                <label className="block text-zeno-text-sec mb-1">Nombre Completo</label>
                <input
                  type="text"
                  required
                  className="w-full bg-zeno-dark border border-zeno-border rounded-lg px-4 py-2 text-zeno-text focus:outline-none focus:border-zeno-blue"
                  value={form.nombre_completo}
                  onChange={e => setForm({ ...form, nombre_completo: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-zeno-text-sec mb-1">Número teléfono</label>
                <input
                  type="tel"
                  required
                  className="w-full bg-zeno-dark border border-zeno-border rounded-lg px-4 py-2 text-zeno-text focus:outline-none focus:border-zeno-blue"
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
                          : 'bg-zeno-dark border border-zeno-border text-zeno-text-sec hover:bg-zeno-blue/20'
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
                  className="w-full bg-zeno-blue py-2 rounded-lg font-bold hover:bg-blue-700 transition"
                >
                  Consultar
                </button>
                <button
                  onClick={() => setModoConsulta(false)}
                  className="w-full text-zeno-text-sec underline text-sm hover:text-zeno-blue transition"
                >
                  Volver al registro
                </button>
              </div>
            ) : (
              <div className="bg-zeno-dark rounded-lg p-4 border border-zeno-blue">
                <h3 className="text-xl font-semibold text-zeno-blue mb-2">¡Ya estás registrado!</h3>
                <p><span className="text-zeno-text-sec">Nombre:</span> {datosRegistrado.nombre_completo}</p>
                <p><span className="text-zeno-text-sec">Teléfono:</span> {datosRegistrado.telefon}</p>
                <p><span className="text-zeno-text-sec">Nivel:</span> {datosRegistrado.nivel}</p>
                <p><span className="text-zeno-text-sec">Número de sorteo:</span> <strong className="text-zeno-orange">{datosRegistrado.numero_asignado}</strong></p>
                <p className="text-sm mt-2">Estado: {datosRegistrado.confirmado ? '✅ Confirmado' : '⏳ Pendiente de confirmación'}</p>
                <button
                  onClick={abrirWhatsApp}
                  className="mt-4 w-full bg-green-600 py-2 rounded-lg font-bold flex items-center justify-center gap-2 hover:bg-green-700 transition"
                >
                  📱 Unirse al grupo de WhatsApp
                </button>
                <button
                  onClick={() => {
                    setModoConsulta(false)
                    setDatosRegistrado(null)
                    setTelefonoConsulta('')
                  }}
                  className="w-full text-zeno-text-sec underline text-sm mt-3 hover:text-zeno-blue transition"
                >
                  Registrar otra persona
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}