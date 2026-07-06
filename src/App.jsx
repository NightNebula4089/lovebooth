import { useState, useRef, useEffect } from 'react'
import './App.css'
import Frame from './components/Frame'

function App() {
  const videoRef = useRef(null)
  const frameOptions = ["blue", "green", "red", "yellow"]
  const [selectedFrame, setSelectedFrame] = useState(null)


  return (
    <div className="app">
      <h1>Love booth </h1>
      {/* <video ref={videoRef} autoPlay playsInline /> */}
      <Frame selectedFrame = {selectedFrame} onSelectFrame={setSelectedFrame}/>
    </div>
  )
}

export default App