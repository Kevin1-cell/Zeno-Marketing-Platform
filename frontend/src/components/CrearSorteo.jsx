import { useState } from 'react'
import axios from 'axios'
import toast from 'react-hot-toast'

export default function CrearSorteo({ eventoId, token, onSorteoCreado }) {
  const [mostrarForm, setMostrarForm] = useState(false)
  const [nombre, setNombre] = useState('')
  const [nivelFiltro, setNivelFiltro] = useState('TODOS')
  const [cargando, setCargando] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!eventoId) return toast.error('Selecciona un evento primero')
    setCargando(true)
    try {
      await axios.post('/sorteos', {
        evento_id: eventoId,
        nombre,
        nivel_filtro: nivelFiltro,
        modo_premios: 'MANUAL'
      }, { headers: { Authorization: `Bearer ${token}` } })
      toast.success('Sorteo creado')
      setNombre('')
      setMostrarForm(false)
      if (onSorteoCreado) onSorteoCreado()
    } catch (err) {
      toast.error('Error al crear sorteo')
    } finally {
      setCargando(false)
    }
  }

  return (
    <div className="mt-4">
      <button
        onClick={() => setMostrarForm(!mostrarForm)}
        className="bg-zeno-orange px-3 py-1 rounded text-sm"
      >
        + Nuevo sorteo
      </button>
      {mostrarForm && (
        <form onSubmit={handleSubmit} className="mt-2 p-3 bg-zeno-dark rounded-lg flex flex-wrap gap-2 items-end">
          <div>
            <label className="block text-xs text-zeno-text-sec">Nombre</label>
            <input
              type="text"
              required
              className="bg-zeno-card border border-zeno-border rounded px-2 py-1 w-40"
              value={nombre}
              onChange={e => setNombre(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-xs text-zeno-text-sec">Filtrar por nivel</label>
            <select
              className="bg-zeno-card border border-zeno-border rounded px-2 py-1"
              value={nivelFiltro}
              onChange={e => setNivelFiltro(e.target.value)}
            >
              <option>TODOS</option>
              <option>C1</option>
              <option>C2</option>
              <option>C3</option>
            </select>
          </div>
          <button type="submit" disabled={cargando} className="bg-zeno-blue px-3 py-1 rounded text-sm">
            {cargando ? '...' : 'Guardar'}
          </button>
        </form>
      )}
    </div>
  )
}