import { useState, useEffect } from 'react'
import axios from 'axios'
import toast, { Toaster } from 'react-hot-toast'
import { useNavigate } from 'react-router-dom'
import { User, Phone, Briefcase, Users, ChevronDown, CheckCircle2 } from 'lucide-react'

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
    tipo: 'EMPLEADO',
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
      .catch(err => { console.error(err); toast.error('Error al cargar eventos') })
  }, [])

  const handleSubmitRegistro = async (e) => {
    e.preventDefault()
    if (!eventoSeleccionado) return toast.error('Selecciona un evento')
    if (!/^\d{10}$/.test(form.telefon)) { toast.error('El número de teléfono debe tener exactamente 10 dígitos'); return }
    if (form.tipo === 'EMPLEADO' && !form.nivel) { toast.error('Debes seleccionar un nivel para empleados'); return }
    setLoading(true)
    try {
      const payload = { nombre_completo: form.nombre_completo, telefon: form.telefon, tipo: form.tipo, evento_id: eventoSeleccionado.id }
      if (form.tipo === 'EMPLEADO') payload.nivel = form.nivel
      await axios.post('/participantes/registro', payload)
      toast.success(form.tipo === 'EMPLEADO' ? 'Registro exitoso. Ahora puedes consultar tus datos.' : 'Invitado registrado correctamente.')
      setTelefonoConsulta(form.telefon)
      setModoConsulta(true)
      setForm({ nombre_completo: '', telefon: '', tipo: 'EMPLEADO', nivel: 'C1', evento_id: eventoSeleccionado.id })
    } catch (err) {
      const msg = err.response?.data?.message
      if (msg && msg.includes('Ya existe')) { toast.error('Este teléfono ya está registrado. Usa "Consultar mis datos".'); setModoConsulta(true); setTelefonoConsulta(form.telefon) }
      else toast.error(msg || 'Error al registrar')
    } finally { setLoading(false) }
  }

  const consultarRegistro = async () => {
    if (!eventoSeleccionado) return toast.error('Selecciona un evento válido')
    if (!telefonoConsulta.trim()) return toast.error('Ingresa tu número de teléfono')
    if (!/^\d{10}$/.test(telefonoConsulta)) { toast.error('El número debe tener 10 dígitos'); return }
    try {
      const res = await axios.get('/participantes/consulta', { params: { telefon: telefonoConsulta, evento_id: eventoSeleccionado.id } })
      setDatosRegistrado(res.data)
      toast.success('Datos encontrados')
    } catch (err) {
      if (err.response?.status === 404) toast.error('No estás registrado en este evento.')
      else toast.error('Error al consultar')
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
        @import url('https://fonts.googleapis.com/css2?family=Kameron:wght@400;700&family=DM+Sans:wght@400;500;600;700&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        .zr-page {
          min-height: 100vh;
          width: 100%;
          display: flex;
          align-items: flex-start;
          justify-content: center;
          padding: clamp(16px, 3vw, 48px) clamp(12px, 4vw, 24px);
          font-family: 'DM Sans', sans-serif;
          position: relative;
          overflow-x: hidden;
          background:
            radial-gradient(ellipse 70% 50% at 15% 15%, #93c5fd55 0%, transparent 60%),
            radial-gradient(ellipse 60% 60% at 85% 85%, #7dd3fc44 0%, transparent 60%),
            radial-gradient(ellipse 100% 80% at 50% 50%, #e0f7ff 0%, #cde8f5 100%);
        }

        /* Burbujas fondo */
        .zr-bubble { position: fixed; border-radius: 50%; pointer-events: none; }
        .zr-b1 { width: clamp(200px,30vw,400px); height: clamp(200px,30vw,400px); background: radial-gradient(circle, #a5d8f388 0%, transparent 70%); top: -80px; left: -80px; animation: bf1 9s ease-in-out infinite; }
        .zr-b2 { width: clamp(150px,22vw,280px); height: clamp(150px,22vw,280px); background: radial-gradient(circle, #7ec8e366 0%, transparent 70%); bottom: 5%; right: -50px; animation: bf2 11s ease-in-out infinite; }
        .zr-b3 { width: clamp(80px,12vw,160px); height: clamp(80px,12vw,160px); background: radial-gradient(circle, #93c5fd55 0%, transparent 70%); top: 35%; left: -30px; animation: bf1 14s ease-in-out infinite reverse; }
        .zr-b4 { width: clamp(60px,8vw,120px); height: clamp(60px,8vw,120px); background: radial-gradient(circle, #60a5fa44 0%, transparent 70%); top: 18%; right: 12%; animation: bf2 8s ease-in-out infinite; }
        @keyframes bf1 { 0%,100%{transform:translate(0,0) scale(1)} 33%{transform:translate(18px,-14px) scale(1.04)} 66%{transform:translate(-10px,18px) scale(0.97)} }
        @keyframes bf2 { 0%,100%{transform:translate(0,0) scale(1)} 50%{transform:translate(-16px,-20px) scale(1.06)} }

        /* Tarjeta */
        .zr-card {
          position: relative;
          z-index: 10;
          width: 100%;
          max-width: min(430px, 96vw);
          border-radius: clamp(24px, 4vw, 36px);
          overflow: hidden;
          background: rgba(255,255,255,0.88);
          backdrop-filter: blur(28px);
          -webkit-backdrop-filter: blur(28px);
          border: 1.5px solid rgba(255,255,255,0.9);
          box-shadow:
            0 clamp(16px,4vw,40px) clamp(40px,8vw,100px) rgba(14,120,180,0.22),
            0 clamp(4px,1vw,10px) clamp(16px,3vw,36px) rgba(14,120,180,0.12),
            0 2px 6px rgba(0,0,0,0.05),
            inset 0 1px 0 rgba(255,255,255,1);
          margin: 0 auto;
        }

        /* Logo hero */
        .zr-logo-hero {
          width: 100%;
          position: relative;
          overflow: hidden;
          background: linear-gradient(180deg, #daf0fb 0%, rgba(224,247,255,0) 100%);
          min-height: clamp(140px, 28vw, 240px);
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .zr-logo-hero img {
          width: 100%;
          max-width: 100%;
          height: auto;
          display: block;
          animation: logoFloat 3.5s ease-in-out infinite;
        }
        @keyframes logoFloat {
          0%,100% { transform: translateY(0px) scale(1); }
          50%      { transform: translateY(-7px) scale(1.012); }
        }

        /* Botón ingresar — esquina superior derecha, sobre el logo */
        .zr-btn-ingresar {
          position: absolute;
          top: clamp(10px, 2vw, 16px);
          right: clamp(10px, 2vw, 16px);
          z-index: 20;
          background: rgba(255,255,255,0.9);
          border: 1.5px solid rgba(14,165,233,0.35);
          color: #0369a1;
          font-family: 'DM Sans', sans-serif;
          font-size: clamp(12px, 1.4vw, 14px);
          font-weight: 700;
          padding: clamp(6px,1vw,9px) clamp(14px,2vw,22px);
          border-radius: 50px;
          cursor: pointer;
          backdrop-filter: blur(10px);
          transition: all 0.2s;
          box-shadow: 0 2px 12px rgba(14,165,233,0.18);
          white-space: nowrap;
        }
        .zr-btn-ingresar:hover { background: #fff; border-color: #0ea5e9; box-shadow: 0 4px 18px rgba(14,165,233,0.3); }

        /* Body */
        .zr-body {
          padding: clamp(10px,2vw,18px) clamp(18px,4vw,28px) clamp(18px,3vw,28px);
          display: flex;
          flex-direction: column;
          gap: clamp(12px,2vw,18px);
        }

        /* Título */
        .zr-title {
          font-family: 'Kameron', serif;
          font-size: clamp(20px, 4vw, 26px);
          font-weight: 700;
          color: #0c2340;
          letter-spacing: -0.01em;
          line-height: 1.15;
        }
        .zr-subtitle {
          font-size: clamp(9px, 1.1vw, 11px);
          font-weight: 700;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          color: #0284c7;
          margin-top: 3px;
        }
        .zr-title-block { text-align: center; padding: clamp(10px,2vw,16px) 0 0; }

        .zr-divider { height: 1px; background: linear-gradient(90deg, transparent, rgba(14,165,233,0.25), transparent); margin: 0 -4px; }

        /* Label */
        .zr-lbl {
          display: block;
          font-size: clamp(9px,1vw,11px);
          font-weight: 700;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: #0369a1;
          margin-bottom: 7px;
        }

        /* Select */
        .zr-select-wrap { position: relative; }
        .zr-select {
          width: 100%;
          background: rgba(240,249,255,0.9);
          border: 2px solid rgba(147,197,253,0.6);
          border-radius: clamp(12px,2vw,16px);
          padding: clamp(10px,1.5vw,13px) 40px clamp(10px,1.5vw,13px) clamp(12px,2vw,16px);
          color: #0c2340;
          font-family: 'DM Sans', sans-serif;
          font-size: clamp(13px,1.5vw,15px);
          font-weight: 600;
          outline: none;
          cursor: pointer;
          transition: border-color 0.2s, box-shadow 0.2s;
          -webkit-appearance: none;
          appearance: none;
        }
        .zr-select:focus { border-color: #38bdf8; box-shadow: 0 0 0 3px rgba(56,189,248,0.15); }
        .zr-select option { background: #f0f9ff; color: #0c2340; }
        .zr-select-arrow { position: absolute; right: 13px; top: 50%; transform: translateY(-50%); color: #0ea5e9; pointer-events: none; }

        /* Toggle tipo */
        .zr-toggle {
          display: flex; gap: 6px; padding: 5px;
          background: rgba(219,234,254,0.45);
          border-radius: clamp(14px,2vw,18px);
          border: 1.5px solid rgba(147,197,253,0.5);
        }
        .zr-toggle-btn {
          flex: 1; display: flex; align-items: center; justify-content: center; gap: 6px;
          padding: clamp(9px,1.2vw,12px) 8px;
          border-radius: clamp(10px,1.5vw,13px);
          font-family: 'DM Sans', sans-serif;
          font-size: clamp(13px,1.4vw,15px);
          font-weight: 700;
          border: none; cursor: pointer; transition: all 0.2s;
          background: transparent; color: #64748b;
        }
        .zr-toggle-btn:hover { color: #0284c7; }
        .zr-toggle-btn.active {
          background: #fff; color: #0369a1;
          box-shadow: 0 2px 10px rgba(14,165,233,0.18), 0 1px 3px rgba(0,0,0,0.06);
          border: 1px solid rgba(14,165,233,0.2);
        }

        /* Input */
        .zr-input-wrap { position: relative; }
        .zr-input-icon { position: absolute; left: 14px; top: 50%; transform: translateY(-50%); color: #38bdf8; pointer-events: none; }
        .zr-input {
          width: 100%;
          background: rgba(240,249,255,0.8);
          border: 2px solid rgba(147,197,253,0.5);
          border-radius: clamp(12px,2vw,16px);
          padding: clamp(10px,1.5vw,13px) 16px clamp(10px,1.5vw,13px) 44px;
          color: #0c2340;
          font-family: 'DM Sans', sans-serif;
          font-size: clamp(13px,1.5vw,15px);
          font-weight: 600;
          outline: none;
          transition: all 0.2s;
        }
        .zr-input::placeholder { color: #93c5fd; font-weight: 400; }
        .zr-input:focus { border-color: #38bdf8; background: #f0f9ff; box-shadow: 0 0 0 3px rgba(56,189,248,0.12); }

        /* Nivel */
        .zr-nivel-box {
          background: rgba(219,234,254,0.35);
          border: 1.5px solid rgba(147,197,253,0.5);
          border-radius: clamp(14px,2vw,20px);
          padding: clamp(10px,1.5vw,14px) clamp(12px,2vw,16px);
        }
        .zr-nivel-lbl { text-align: center; font-size: clamp(9px,1vw,11px); font-weight: 700; letter-spacing: 0.2em; text-transform: uppercase; color: #0369a1; margin-bottom: 8px; }
        .zr-nivel-btns { display: flex; gap: 8px; }
        .zr-nivel-btn {
          flex: 1; padding: clamp(9px,1.2vw,12px) 0;
          border-radius: clamp(10px,1.5vw,13px);
          font-family: 'Kameron', serif;
          font-size: clamp(16px,2vw,20px); font-weight: 700;
          border: 2px solid transparent; cursor: pointer; transition: all 0.2s;
          background: transparent; color: #94a3b8;
        }
        .zr-nivel-btn:hover { color: #0284c7; border-color: rgba(56,189,248,0.4); }
        .zr-nivel-btn.active { background: #fff; border-color: #38bdf8; color: #0369a1; box-shadow: 0 2px 10px rgba(14,165,233,0.2); }

        /* Botón primario */
        .zr-btn-primary {
          width: 100%; padding: clamp(12px,1.5vw,15px);
          border-radius: clamp(16px,2.5vw,22px); border: none;
          background: linear-gradient(135deg, #38bdf8 0%, #0ea5e9 50%, #0284c7 100%);
          color: #fff;
          font-family: 'Kameron', serif;
          font-size: clamp(16px,2vw,19px); font-weight: 700;
          cursor: pointer; transition: all 0.2s;
          box-shadow: 0 6px 24px rgba(14,165,233,0.4);
        }
        .zr-btn-primary:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 10px 32px rgba(14,165,233,0.5); }
        .zr-btn-primary:disabled { opacity: 0.5; cursor: not-allowed; }

        /* Botón outline */
        .zr-btn-outline {
          width: 100%; padding: clamp(10px,1.3vw,13px);
          border-radius: clamp(14px,2vw,18px);
          border: 1.5px solid rgba(56,189,248,0.4);
          background: rgba(240,249,255,0.5);
          color: #0369a1;
          font-family: 'DM Sans', sans-serif;
          font-size: clamp(13px,1.4vw,15px); font-weight: 700;
          cursor: pointer; transition: all 0.2s;
        }
        .zr-btn-outline:hover { border-color: #38bdf8; background: rgba(240,249,255,0.9); }

        /* Link */
        .zr-link {
          display: block; text-align: center;
          color: #475569; font-size: clamp(12px,1.3vw,14px); font-weight: 600;
          cursor: pointer; background: none; border: none; transition: color 0.2s; padding: 4px; width: 100%;
        }
        .zr-link:hover { color: #0284c7; }
        .zr-link span { text-decoration: underline; text-decoration-color: #7dd3fc; text-underline-offset: 3px; }

        /* Result card */
        .zr-result-card {
          border-radius: clamp(18px,3vw,28px); overflow: hidden;
          box-shadow: 0 8px 32px rgba(14,120,180,0.14);
          background: rgba(255,255,255,0.95);
          border: 1.5px solid rgba(147,197,253,0.6);
        }
        .zr-result-bar {
          height: 4px;
          background: linear-gradient(90deg, #38bdf8, #7dd3fc, #38bdf8);
          background-size: 200% 100%;
          animation: barShimmer 2s linear infinite;
        }
        @keyframes barShimmer { 0%{background-position:0% 0%} 100%{background-position:200% 0%} }
        .zr-result-body { padding: clamp(16px,2.5vw,24px); }

        /* Data rows */
        .zr-data-row { display: flex; justify-content: space-between; align-items: center; padding: clamp(8px,1.2vw,11px) 0; border-bottom: 1px solid rgba(147,197,253,0.25); }
        .zr-data-row:last-of-type { border-bottom: none; }
        .zr-data-key { font-size: clamp(9px,1vw,11px); font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase; color: #64748b; }
        .zr-data-val { font-size: clamp(13px,1.5vw,15px); font-weight: 700; color: #0c2340; }
        .zr-data-val-accent { font-size: clamp(13px,1.5vw,15px); font-weight: 700; color: #0369a1; }

        /* Pills */
        .zr-pill-ok { display: inline-flex; align-items: center; gap: 5px; background: #f0fdf4; border: 1.5px solid #86efac; color: #15803d; font-size: clamp(11px,1.2vw,13px); font-weight: 700; padding: 3px 12px; border-radius: 50px; }
        .zr-pill-pend { display: inline-flex; align-items: center; gap: 5px; background: #fffbeb; border: 1.5px solid #fcd34d; color: #b45309; font-size: clamp(11px,1.2vw,13px); font-weight: 700; padding: 3px 12px; border-radius: 50px; }

        /* Número sorteo */
        .zr-numero-hero {
          background: linear-gradient(135deg, #e0f7ff 0%, #bae6fd 100%);
          border: 2px solid rgba(56,189,248,0.3);
          border-radius: clamp(16px,2.5vw,24px);
          padding: clamp(16px,2.5vw,22px) 16px;
          text-align: center;
          position: relative;
          overflow: hidden;
          margin: 10px 0 4px;
        }
        .zr-numero-hero::before {
          content: '';
          position: absolute; inset: 0;
          background: radial-gradient(ellipse at 50% 0%, rgba(255,255,255,0.65) 0%, transparent 65%);
        }
        .zr-numero-lbl { font-size: clamp(9px,1vw,11px); font-weight: 700; letter-spacing: 0.22em; text-transform: uppercase; color: #0369a1; position: relative; z-index: 1; margin-bottom: 4px; }
        .zr-numero-val {
          font-family: 'Kameron', serif;
          font-size: clamp(72px, 18vw, 100px);
          font-weight: 700; line-height: 1;
          color: #c17f0a;
          position: relative; z-index: 1;
          -webkit-text-stroke: 2px rgba(255,255,255,0.8);
          text-shadow: 0 3px 0 rgba(140,100,0,0.28), 0 6px 22px rgba(193,127,10,0.32);
          animation: numPop 0.7s cubic-bezier(0.34,1.56,0.64,1) both;
        }
        @keyframes numPop { 0%{transform:scale(0.4) rotate(-8deg);opacity:0} 70%{transform:scale(1.08) rotate(2deg);opacity:1} 100%{transform:scale(1) rotate(0deg);opacity:1} }
        .zr-numero-sub { font-size: clamp(10px,1.2vw,12px); color: #0369a1; position: relative; z-index: 1; margin-top: 6px; font-weight: 600; }

        /* WhatsApp */
        .zr-btn-wa {
          width: 100%; padding: clamp(11px,1.5vw,14px);
          border-radius: clamp(14px,2vw,18px); border: none;
          background: linear-gradient(135deg, #22c55e, #16a34a);
          color: #fff; font-family: 'DM Sans', sans-serif;
          font-size: clamp(13px,1.5vw,15px); font-weight: 700;
          cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px;
          transition: all 0.2s;
          box-shadow: 0 4px 18px rgba(34,197,94,0.32);
        }
        .zr-btn-wa:hover { transform: translateY(-2px); box-shadow: 0 8px 26px rgba(34,197,94,0.42); }

        /* Footer */
        .zr-footer {
          text-align: center;
          padding: clamp(12px,1.5vw,16px) clamp(16px,3vw,28px);
          border-top: 1px solid rgba(147,197,253,0.35);
          font-size: clamp(10px,1.1vw,12px);
          color: #475569;
          font-weight: 500;
          line-height: 1.6;
        }

        /* Scroll suave */
        .zr-scroll { overflow-y: auto; -webkit-overflow-scrolling: touch; scrollbar-width: none; }
        .zr-scroll::-webkit-scrollbar { display: none; }

        /* Fade up */
        .zr-fade-up { animation: fadeUp 0.38s ease both; }
        @keyframes fadeUp { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }

        /* Consulta box */
        .zr-consulta-box {
          background: rgba(240,249,255,0.7);
          border: 1.5px solid rgba(147,197,253,0.5);
          border-radius: clamp(18px,3vw,24px);
          padding: clamp(16px,2.5vw,22px);
          display: flex; flex-direction: column;
          gap: clamp(10px,1.5vw,14px);
        }
        .zr-consulta-title { font-family: 'Kameron', serif; font-size: clamp(18px,2.5vw,22px); font-weight: 700; color: #0c2340; }
        .zr-consulta-sub { font-size: clamp(12px,1.3vw,14px); color: #475569; margin-top: 3px; font-weight: 500; }

        /* Evento info line */
        .zr-event-name-tag { font-size: clamp(9px,1vw,11px); font-weight: 700; letter-spacing: 0.2em; text-transform: uppercase; color: #0284c7; }
        .zr-result-heading { font-family: 'Kameron', serif; font-size: clamp(19px,3vw,24px); font-weight: 700; color: #0c2340; margin-top: 2px; }
        .zr-result-place { font-size: clamp(11px,1.2vw,13px); color: #475569; margin-top: 3px; font-weight: 500; }

        /* Empty state */
        .zr-empty { text-align: center; padding: clamp(32px,5vw,52px) 0; }
        .zr-empty-icon { width: clamp(48px,6vw,64px); height: clamp(48px,6vw,64px); background: #e0f2fe; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto clamp(12px,2vw,16px); color: #7dd3fc; }
        .zr-empty-title { font-family: 'Kameron', serif; font-size: clamp(17px,2.5vw,22px); font-weight: 700; color: #1e3a5f; }
        .zr-empty-sub { font-size: clamp(12px,1.3vw,14px); color: #64748b; margin-top: 6px; font-weight: 500; }
      `}</style>

      <Toaster
        position="top-center"
        toastOptions={{
          style: {
            background: '#fff', color: '#0c2340',
            border: '1.5px solid #bae6fd', borderRadius: '14px',
            fontSize: '13px', fontFamily: "'DM Sans', sans-serif",
            boxShadow: '0 4px 20px rgba(14,165,233,0.18)',
          },
        }}
      />

      <div className="zr-page">
        <div className="zr-bubble zr-b1" />
        <div className="zr-bubble zr-b2" />
        <div className="zr-bubble zr-b3" />
        <div className="zr-bubble zr-b4" />

        <div className="zr-card">

          {/* Hero logo — ocupa todo el ancho, botón encima esquina derecha */}
          <div className="zr-logo-hero">
            <img src="/zeno-logo.png" alt="Zeno Marketing" />
            <button onClick={() => navigate('/login')} className="zr-btn-ingresar">
              Ingresar
            </button>
          </div>

          {/* Título */}
          <div className="zr-title-block">
            <h1 className="zr-title">Zeno Marketing</h1>
            <p className="zr-subtitle">Registro Participantes</p>
          </div>

          <div style={{ margin: '12px 28px 0', height: 1, background: 'linear-gradient(90deg, transparent, rgba(56,189,248,0.3), transparent)' }} />

          {/* Body */}
          <div className="zr-scroll zr-body" style={{ maxHeight: 'calc(100vh - 320px)' }}>

            {!hayEventos ? (
              <div className="zr-empty">
                <div className="zr-empty-icon">
                  <svg width="28" height="28" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5" />
                  </svg>
                </div>
                <p className="zr-empty-title">Sin eventos activos</p>
                <p className="zr-empty-sub">Vuelve pronto para participar.</p>
              </div>
            ) : (
              <>
                {/* Selector evento */}
                <div>
                  <label className="zr-lbl">Evento</label>
                  <div className="zr-select-wrap">
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
                          {ev.nombre}{ev.lugar ? ` · ${ev.lugar}` : ''}{ev.hora ? ` (${ev.hora})` : ''}
                        </option>
                      ))}
                    </select>
                    <ChevronDown size={16} className="zr-select-arrow" />
                  </div>
                </div>

                {!modoConsulta ? (
                  <div className="zr-fade-up" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

                    {/* Toggle tipo */}
                    <div className="zr-toggle">
                      <button type="button" onClick={() => setForm(prev => ({ ...prev, tipo: 'EMPLEADO' }))} className={`zr-toggle-btn${form.tipo === 'EMPLEADO' ? ' active' : ''}`}>
                        <Briefcase size={15} /> Empleado
                      </button>
                      <button type="button" onClick={() => setForm(prev => ({ ...prev, tipo: 'INVITADO' }))} className={`zr-toggle-btn${form.tipo === 'INVITADO' ? ' active' : ''}`}>
                        <Users size={15} /> Invitado
                      </button>
                    </div>

                    <form onSubmit={handleSubmitRegistro} style={{ display: 'flex', flexDirection: 'column', gap: 11 }}>
                      <div className="zr-input-wrap">
                        <User size={17} className="zr-input-icon" />
                        <input type="text" required placeholder="Nombre completo" className="zr-input"
                          value={form.nombre_completo} onChange={e => setForm({ ...form, nombre_completo: e.target.value })} />
                      </div>
                      <div className="zr-input-wrap">
                        <Phone size={17} className="zr-input-icon" />
                        <input type="tel" required pattern="\d{10}" placeholder="Teléfono (10 dígitos)" title="Exactamente 10 dígitos" className="zr-input"
                          value={form.telefon} onChange={e => setForm({ ...form, telefon: e.target.value })} />
                      </div>

                      {form.tipo === 'EMPLEADO' && (
                        <div className="zr-nivel-box">
                          <p className="zr-nivel-lbl">Nivel</p>
                          <div className="zr-nivel-btns">
                            {['C1', 'C2', 'C3'].map(n => (
                              <button key={n} type="button" onClick={() => setForm({ ...form, nivel: n })} className={`zr-nivel-btn${form.nivel === n ? ' active' : ''}`}>{n}</button>
                            ))}
                          </div>
                        </div>
                      )}

                      <button type="submit" disabled={loading} className="zr-btn-primary" style={{ marginTop: 4 }}>
                        {loading ? 'Procesando...' : (form.tipo === 'EMPLEADO' ? 'Registrarme' : 'Registrar Invitado')}
                      </button>
                    </form>

                    <button onClick={() => setModoConsulta(true)} className="zr-link">
                      ¿Ya te registraste? <span>Consultar mis datos</span>
                    </button>
                  </div>
                ) : (
                  <div className="zr-fade-up" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                    {!datosRegistrado ? (
                      <div className="zr-consulta-box">
                        <div style={{ textAlign: 'center' }}>
                          <p className="zr-consulta-title">Consulta tu registro</p>
                          <p className="zr-consulta-sub">Ingresa el teléfono con el que te registraste</p>
                        </div>
                        <div className="zr-input-wrap">
                          <Phone size={17} className="zr-input-icon" />
                          <input type="tel" placeholder="Número de teléfono" className="zr-input"
                            value={telefonoConsulta} onChange={e => setTelefonoConsulta(e.target.value)} />
                        </div>
                        <button onClick={consultarRegistro} className="zr-btn-primary">Ver mis datos</button>
                        <button onClick={() => setModoConsulta(false)} className="zr-btn-outline">← Volver al registro</button>
                      </div>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                        <div className="zr-result-card">
                          <div className="zr-result-bar" />
                          <div className="zr-result-body">
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                              <div>
                                <p className="zr-event-name-tag">{eventoSeleccionado?.nombre}</p>
                                <p className="zr-result-heading">¡Ya estás registrado!</p>
                                {eventoSeleccionado?.lugar && <p className="zr-result-place">📍 {eventoSeleccionado.lugar}</p>}
                              </div>
                              <CheckCircle2 size={26} color="#16a34a" style={{ flexShrink: 0, marginTop: 2 }} />
                            </div>

                            <div className="zr-data-row">
                              <span className="zr-data-key">Nombre</span>
                              <span className="zr-data-val">{datosRegistrado.nombre_completo}</span>
                            </div>
                            <div className="zr-data-row">
                              <span className="zr-data-key">Teléfono</span>
                              <span className="zr-data-val">{datosRegistrado.telefon}</span>
                            </div>
                            <div className="zr-data-row">
                              <span className="zr-data-key">Categoría</span>
                              <span className="zr-data-val-accent">
                                {datosRegistrado.tipo === 'INVITADO' ? 'Invitado' : 'Empleado'}{datosRegistrado.nivel ? ` · ${datosRegistrado.nivel}` : ''}
                              </span>
                            </div>
                            <div className="zr-data-row">
                              <span className="zr-data-key">Estado</span>
                              <span className={datosRegistrado.confirmado ? 'zr-pill-ok' : 'zr-pill-pend'}>
                                {datosRegistrado.confirmado ? '✓ Confirmado' : '⏳ Pendiente'}
                              </span>
                            </div>

                            {datosRegistrado.numero_asignado && (
                              <div className="zr-numero-hero">
                                <p className="zr-numero-lbl">Tu número de sorteo</p>
                                <div className="zr-numero-val">{datosRegistrado.numero_asignado}</div>
                                <p className="zr-numero-sub">Guarda una captura 📸</p>
                              </div>
                            )}
                          </div>
                        </div>

                        <button onClick={abrirWhatsApp} className="zr-btn-wa">
                          <svg style={{ width: 20, height: 20 }} fill="currentColor" viewBox="0 0 24 24">
                            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                          </svg>
                          Unirme al grupo de WhatsApp
                        </button>
                        <button onClick={() => { setModoConsulta(false); setDatosRegistrado(null); setTelefonoConsulta('') }} className="zr-btn-outline">
                          Registrar otra persona
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </>
            )}
          </div>

          <div className="zr-footer">
            Una vez registrado no podrá registrarse más veces al mismo evento. Si tienes dudas, contáctanos al WhatsApp oficial.
          </div>
        </div>
      </div>
    </>
  )
}