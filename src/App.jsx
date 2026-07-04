import { useState, useRef, useEffect } from 'react'
import './App.css'
import Frame from './components/Frame'

function App() {
  const videoRef = useRef(null)
  const frameOptions = ["blue", "green", "red", "yellow"]
  const [selectedFrame, setSelectedFrame] = useState(null)

  // useEffect(() => {
  //   if (!selectedFrame) return   // guard INSIDE the effect, not around it

  //   const canvas = document.createElement('canvas')
  //   canvas.width = 640
  //   canvas.height = 480
  //   const ctx = canvas.getContext('2d')

  //   let hue = 0
  //   let animationId
  //   const draw = () => {
  //     hue = (hue + 1) % 360
  //     ctx.fillStyle = `hsl(${hue}, 70%, 50%)`
  //     ctx.fillRect(0, 0, canvas.width, canvas.height)
  //     ctx.fillStyle = 'white'
  //     ctx.font = '30px sans-serif'
  //     ctx.fillText(new Date().toLocaleTimeString(), 50, 240)
  //     animationId = requestAnimationFrame(draw)
  //   }
  //   draw()

  //   const stream = canvas.captureStream(30)
  //   videoRef.current.srcObject = stream

  //   return () => cancelAnimationFrame(animationId)  // cleanup
  // }, [selectedFrame])

  // if (!selectedFrame) {
  //   return (
  //     <div className="app">
  //       <h1>Pick a frame</h1>
  //       <div className="frame-picker">
  //         {frameOptions.map((color) => (
  //           <div
  //             key={color}
  //             className="frame-swatch"
  //             style={{ backgroundColor: color }}
  //             onClick={() => setSelectedFrame(color)}
  //           />
  //         ))}
  //       </div>
  //     </div>
  //   )
  // }

  return (
    <div className="app">
      <h1>Love booth </h1>
      {/* <video ref={videoRef} autoPlay playsInline /> */}
      <Frame selectedFrame = {selectedFrame} onSelectFrame={setSelectedFrame}/>
    </div>
  )
}

export default App