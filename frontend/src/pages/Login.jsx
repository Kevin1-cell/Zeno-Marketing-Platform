import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import toast, { Toaster } from 'react-hot-toast'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const login = useAuthStore((s) => s.login)
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    const ok = await login(email, password)
    setLoading(false)
    if (ok) {
      toast.success('Bienvenido')
      navigate('/dashboard')
    } else {
      toast.error('Credenciales incorrectas')
    }
  }

  return (
    <div className="min-h-screen bg-zeno-dark flex items-center justify-center p-4">
      <Toaster />
      <div className="bg-zeno-card rounded-xl shadow-2xl p-8 w-full max-w-md border border-zeno-border">
        <h1 className="text-2xl font-bold text-center text-zeno-blue mb-6">Administrador Zeno</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            placeholder="Email"
            className="w-full bg-zeno-dark border border-zeno-border rounded-lg px-4 py-2 text-zeno-text"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Contraseña"
            className="w-full bg-zeno-dark border border-zeno-border rounded-lg px-4 py-2 text-zeno-text"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-zeno-blue py-2 rounded-lg font-bold text-white hover:bg-blue-700 transition"
          >
            {loading ? 'Ingresando...' : 'Ingresar'}
          </button>
        </form>
      </div>
    </div>
  )
}