import { useRef, useEffect, useState, useCallback } from 'react'

const SEGMENT_COLORS = [
  '#1e6fff', '#ff8c00', '#1456cc', '#e67a00',
  '#2979ff', '#ff9d1a', '#0d47d9', '#cc7200',
  '#3d8bff', '#ffaa33', '#1a5ce8', '#f58800',
  '#5b9bff', '#ffc04d', '#0a3dbf', '#b36200',
]

export default function Roulette({ onSpin, isSpinning, disabled, numeros = [], numeroGanador = null, onSpinEnd }) {
  const canvasRef = useRef(null)
  const rotationRef = useRef(0)
  const animFrameRef = useRef(null)
  const targetRotRef = useRef(null)
  const baseSpinsRef = useRef(0)
  const winnerRotRef = useRef(null)
  const [girando, setGirando] = useState(false)

  const segments = numeros.length > 0 ? numeros : []
  const total = segments.length

  const drawWheel = useCallback((rotation) => {
    const canvas = canvasRef.current
    if (!canvas || total === 0) return
    const ctx = canvas.getContext('2d')
    const W = canvas.width
    const H = canvas.height
    const cx = W / 2
    const cy = H / 2
    const R = Math.min(cx, cy) - 8

    ctx.clearRect(0, 0, W, H)

    const arc = (2 * Math.PI) / total

    ctx.save()
    ctx.shadowColor = 'rgba(30,111,255,0.5)'
    ctx.shadowBlur = 32
    ctx.beginPath()
    ctx.arc(cx, cy, R + 4, 0, 2 * Math.PI)
    ctx.fillStyle = '#050d1a'
    ctx.fill()
    ctx.restore()

    for (let i = 0; i < total; i++) {
      const startAngle = rotation + i * arc - Math.PI / 2
      const endAngle = startAngle + arc

      ctx.beginPath()
      ctx.moveTo(cx, cy)
      ctx.arc(cx, cy, R, startAngle, endAngle)
      ctx.closePath()
      ctx.fillStyle = SEGMENT_COLORS[i % SEGMENT_COLORS.length]
      ctx.fill()

      ctx.beginPath()
      ctx.moveTo(cx, cy)
      ctx.arc(cx, cy, R, startAngle, endAngle)
      ctx.closePath()
      ctx.strokeStyle = 'rgba(5,13,26,0.5)'
      ctx.lineWidth = 1.2
      ctx.stroke()

      ctx.save()
      ctx.translate(cx, cy)
      ctx.rotate(startAngle + arc / 2)
      ctx.textAlign = 'right'
      ctx.fillStyle = '#ffffff'
      const fontSize = total <= 12 ? 16 : total <= 24 ? 13 : total <= 40 ? 10 : 8
      ctx.font = `700 ${fontSize}px 'Kameron', Georgia, serif`
      ctx.shadowColor = 'rgba(0,0,0,0.8)'
      ctx.shadowBlur = 4
      ctx.fillText(String(segments[i].numero ?? segments[i]), R * 0.8, fontSize / 3)
      ctx.restore()
    }

    ctx.beginPath()
    ctx.arc(cx, cy, R * 0.11, 0, 2 * Math.PI)
    const hubGrad = ctx.createRadialGradient(cx - 2, cy - 2, 1, cx, cy, R * 0.11)
    hubGrad.addColorStop(0, '#ffffff')
    hubGrad.addColorStop(1, '#aac8f0')
    ctx.fillStyle = hubGrad
    ctx.shadowColor = 'rgba(255,255,255,0.6)'
    ctx.shadowBlur = 8
    ctx.fill()

    ctx.beginPath()
    ctx.arc(cx, cy, R, 0, 2 * Math.PI)
    ctx.strokeStyle = 'rgba(30,111,255,0.7)'
    ctx.lineWidth = 3
    ctx.shadowColor = '#1e6fff'
    ctx.shadowBlur = 14
    ctx.stroke()

    ctx.beginPath()
    ctx.arc(cx, cy, R + 5, 0, 2 * Math.PI)
    ctx.strokeStyle = 'rgba(255,140,0,0.2)'
    ctx.lineWidth = 2
    ctx.shadowBlur = 0
    ctx.stroke()
  }, [total, segments])

  useEffect(() => {
    if (total > 0) {
      const t = setTimeout(() => drawWheel(rotationRef.current), 50)
      return () => clearTimeout(t)
    }
  }, [numeros, drawWheel])

  // Cuando llega el número ganador, calculamos el ángulo exacto donde debe frenar
  useEffect(() => {
    if (numeroGanador === null || total === 0) return
    const idx = segments.findIndex(s => (s.numero ?? s) === numeroGanador)
    if (idx === -1) return
    const arc = (2 * Math.PI) / total
    const segMid = idx * arc + arc / 2
    // Queremos que el centro del segmento quede bajo el puntero (arriba, offset -π/2)
    const adjust = -segMid + (arc * 0.1)
    winnerRotRef.current = adjust
  }, [numeroGanador, total])

  const handleSpin = () => {
    if (disabled || girando || total === 0) return
    setGirando(true)

    const startRot = rotationRef.current
    const baseSpins = (8 + Math.random() * 4) * 2 * Math.PI
    targetRotRef.current = null
    baseSpinsRef.current = baseSpins
    winnerRotRef.current = null

    const duration = 5000
    const startTime = performance.now()
    const easeOut = (t) => 1 - Math.pow(1 - t, 3)

    const animate = (now) => {
      // En cuanto tengamos el ganador, fijamos el endRot definitivo
      if (targetRotRef.current === null && winnerRotRef.current !== null) {
        targetRotRef.current = startRot + baseSpins + winnerRotRef.current
      }

      const endRot = targetRotRef.current ?? (startRot + baseSpins)
      const elapsed = now - startTime
      const progress = Math.min(elapsed / duration, 1)
      const currentRot = startRot + (endRot - startRot) * easeOut(progress)
      rotationRef.current = currentRot
      drawWheel(currentRot)

      if (progress < 1) {
        animFrameRef.current = requestAnimationFrame(animate)
      } else {
        rotationRef.current = endRot
        winnerRotRef.current = null
        setGirando(false)
        onSpinEnd?.()
      }
    }

    animFrameRef.current = requestAnimationFrame(animate)
    onSpin()
  }

  useEffect(() => {
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current)
    }
  }, [])

  const size = 300

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Kameron:wght@400;700&display=swap');
        @keyframes ringPulse {
          0%, 100% { opacity: 0.15; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(1.04); }
        }
        @keyframes spinDot {
          to { transform: rotate(360deg); }
        }
      `}</style>

      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 28, padding: '8px 0' }}>

        <div style={{ position: 'relative', width: size, height: size }}>

          {girando && (
            <div style={{
              position: 'absolute', inset: -12,
              borderRadius: '50%',
              border: '2px solid rgba(30,111,255,0.4)',
              animation: 'ringPulse 0.9s ease-in-out infinite',
              pointerEvents: 'none',
            }} />
          )}

          {total === 0 ? (
            <div style={{
              width: size, height: size,
              borderRadius: '50%',
              background: 'rgba(30,111,255,0.06)',
              border: '2px dashed rgba(30,111,255,0.2)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'rgba(148,180,220,0.4)',
              fontSize: 13, textAlign: 'center', padding: 20,
              fontFamily: "'Kameron', serif",
            }}>
              Cargando participantes...
            </div>
          ) : (
            <canvas
              ref={canvasRef}
              width={size}
              height={size}
              style={{ borderRadius: '50%', display: 'block' }}
            />
          )}
        </div>

        <button
          onClick={handleSpin}
          disabled={disabled || girando || total === 0}
          style={{
            padding: '14px 52px',
            borderRadius: 50, border: 'none',
            background: girando
              ? 'rgba(30,111,255,0.2)'
              : 'linear-gradient(90deg, #1e6fff 0%, #ff8c00 100%)',
            color: '#fff',
            fontFamily: "'Kameron', serif",
            fontSize: 17, fontWeight: 700,
            letterSpacing: '0.06em',
            cursor: disabled || girando || total === 0 ? 'not-allowed' : 'pointer',
            opacity: (disabled || total === 0) && !girando ? 0.4 : 1,
            boxShadow: girando ? 'none' : '0 4px 28px rgba(30,111,255,0.38)',
            transition: 'all 0.2s',
            display: 'flex', alignItems: 'center', gap: 10,
            border: girando ? '1px solid rgba(30,111,255,0.3)' : 'none',
          }}
        >
          {girando ? (
            <>
              <span style={{
                width: 16, height: 16,
                border: '2px solid rgba(255,255,255,0.25)',
                borderTop: '2px solid #fff',
                borderRadius: '50%',
                display: 'inline-block',
                animation: 'spinDot 0.7s linear infinite',
              }} />
              GIRANDO...
            </>
          ) : (
            <>🎡 GIRAR RULETA</>
          )}
        </button>

      </div>
    </>
  )
}