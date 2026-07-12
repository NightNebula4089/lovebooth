import { useState, useRef, useEffect } from 'react'
import './App.css'
import Frame from './components/Frame'

function App() {
  const videoRef = useRef(null)
  const frameOptions = ["blue", "green", "red", "yellow"]
  const [selectedFrame, setSelectedFrame] = useState(null)

  // navigator.mediaDevices.getUserMedia({ video: true, audio: false }).then(stream => console.log('SUCCESS:', stream)).catch(err => console.error('FAILED:', err.name, err.message))

  return (
    <div className="app">
      <h1>Love booth </h1>
      {/* <video ref={videoRef} autoPlay playsInline /> */}
      <Frame selectedFrame = {selectedFrame} onSelectFrame={setSelectedFrame}/>
    </div>
  )
}

export default App