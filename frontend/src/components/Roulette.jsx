import { useState } from 'react'

export default function Roulette({ onSpin, isSpinning, disabled }) {
  const [animando, setAnimando] = useState(false)

  const handleSpin = () => {
    if (disabled) return
    setAnimando(true)
    onSpin()
    // La animación dura 5 segundos (igual que el setTimeout en el padre)
    setTimeout(() => {
      setAnimando(false)
    }, 5000)
  }

  return (
    <div className="flex flex-col items-center gap-8 py-10">
      <div className="relative w-64 h-64 md:w-80 md:h-80">
        <div
          className={`absolute inset-0 rounded-full border-8 border-slate-800 shadow-2xl transition-transform duration-[5000ms] cubic-bezier(0.15, 0, 0.15, 1) ${
            animando || isSpinning ? 'rotate-[1440deg]' : 'rotate-0'
          }`}
        >
          <div className="w-full h-full rounded-full overflow-hidden flex items-center justify-center">
            <div className="w-full h-full bg-[conic-gradient(#1e6fff_0deg_120deg,#ff8c00_120deg_240deg,#1e6fff_240deg_360deg)] opacity-60" />
            <span className="text-4xl font-black text-white z-10 absolute">🎲</span>
          </div>
        </div>
        <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-8 h-8 bg-red-500 rotate-45 shadow-lg" />
      </div>

      <button
        onClick={handleSpin}
        disabled={disabled || isSpinning || animando}
        className="px-8 py-4 bg-gradient-to-r from-zeno-blue to-zeno-orange text-white rounded-full font-bold text-xl shadow-xl hover:opacity-90 disabled:opacity-50 transition-all active:scale-95"
      >
        {isSpinning || animando ? '🎰 GIRANDO...' : '🎡 GIRAR RULETA'}
      </button>
    </div>
  )
}