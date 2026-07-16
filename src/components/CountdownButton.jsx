import {forwardRef, useImperativeHandle,useState, useRef } from 'react'

const RADIUS = 36
const CIRCUMFERENCE = 2 * Math.PI * RADIUS

const CountdownButton = forwardRef(({ onCapture, duration = 5,mode, onClickOverride}, ref) => {
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

  // function to display text "Countdown button disable, sit back and relax: when mode is joinee and joinee clicks on the button
  const handlejoineeClick = () => {
    if(mode != "joinee") return 
    const countdownDisabledText = document.getElementById('countdown_disabled_text');

  }

  useImperativeHandle(ref, () => ({
    startCountdown
  }))

  if (mode == 'host') {
    return (
      <button
        type="button"
        className="countdown_button"
        onClick={mode == "host" ? (onClickOverride ?? startCoundown): undefined}
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
  } else if (mode == "joinee"){
        return (
      <div className="countdown_button" aria-label="Countdown and capture disabled for host">
      <button
        type="button"
        className="countdown_button"
        onClick={() => {}}
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
      <h3 className="countdown_disabled_text" display= "none">Countdown disabled for you : sit back and relax ;</h3>
      </div>
    )
  }
})

export default CountdownButton