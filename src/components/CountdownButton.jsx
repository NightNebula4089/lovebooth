import { useState, useRef } from 'react'

const RADIUS = 36
const CIRCUMFERENCE = 2 * Math.PI * RADIUS

function CountdownButton({ onCapture, duration = 5 }) {
  const [counting, setCounting] = useState(false)
  const [countValue, setCountValue] = useState(duration)
  const intervalRef = useRef(null)

  const startCountdown = () => {
    if (counting) return
    setCounting(true)
    setCountValue(duration)

    let remaining = duration
    intervalRef.current = setInterval(() => {
      remaining -= 1
      setCountValue(remaining)
      if (remaining <= 0) {
        clearInterval(intervalRef.current)
        setCounting(false)
        onCapture()
      }
    }, 1000)
  }

  // dashoffset goes from 0 (full ring, at count=duration) to CIRCUMFERENCE (empty ring, at count=0)
  const progress = counting ? (duration - countValue) / duration : 0
  const dashOffset = CIRCUMFERENCE * progress

  return (
    <button
      type="button"
      className="countdown_button"
      onClick={startCountdown}
      disabled={counting}
      aria-label="Start countdown and capture"
    >
      <svg viewBox="0 0 80 80" className="countdown_ring">
        <circle
          cx="40" cy="40" r={RADIUS}
          className="countdown_ring_bg"
        />
        {counting && (
          <circle
            cx="40" cy="40" r={RADIUS}
            className="countdown_ring_progress"
            style={{
              strokeDasharray: CIRCUMFERENCE,
              strokeDashoffset: dashOffset,
            }}
          />
        )}
      </svg>
      <span className="countdown_number">
        {counting ? countValue : '◎'}
      </span>
    </button>
  )
}

export default CountdownButton