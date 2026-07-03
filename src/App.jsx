import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from './assets/vite.svg'
import heroImg from './assets/hero.png'
import './App.css'
import {useRef, useEffect} from 'react'


function App() {
  const videoRef = useRef(null);

  useEffect(() => {
    navigator.mediaDevices.getUserMedia({video : true}).then((stream) => videoRef.current.srcObject = stream).catch((err)=>{
      console.error("Camera access denied",err);
    })
  }, [])

  return (
    <div classsname = "App">
      <h1>Love booth</h1>
      <video ref={videoRef} autoPlay playsInline />
    </div>
  )
}

export default App
