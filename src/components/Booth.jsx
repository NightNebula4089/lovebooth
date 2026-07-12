import { forwardRef, useImperativeHandle,useEffect, useRef, useState } from 'react'

const SLOT_WIDTH = 953
const SLOT_HEIGHT = 599

const Booth = forwardRef(({stream, selectedFrame, label }, ref) => {

    const canvasRef = useRef(null)
    const frameImgRef = useRef(null)
    const videoRef = useRef(null)
    const photosRef = useRef([null,null,null,null])
    const photoCountRef = useRef(0)

    const slots = [{ x: 123, y: 60 },
        { x: 123, y: 679 },
        { x: 123, y: 1286 },
        { x: 123, y: 1885 }]

    const [frameLoaded,setFrameLoaded] = useState(false);

    useEffect(() => {
        if(!videoRef.current || !stream) return
        if(videoRef.current.srcObject !== stream) {
            videoRef.current.srcObject = stream
        }
    }, [stream])

    // useEffect(() => {
    //     if(!selectedFrame) return;

    //     const camCanvas = document.createElement('canvas')
    //     camCanvas.width = 640
    //     camCanvas.height = 480
    //     const ctx = camCanvas.getContext('2d')

    //     let hue = 0
    //     let animationId
    //     const draw = () => {
    //     hue = (hue + 1) % 360
    //     ctx.fillStyle = `hsl(${hue}, 70%, 50%)`
    //     ctx.fillRect(0, 0, camCanvas.width, camCanvas.height)
    //     ctx.fillStyle = 'white'
    //     ctx.font = '30px sans-serif'
    //     ctx.fillText(new Date().toLocaleTimeString(), 50, 240)
    //     animationId = requestAnimationFrame(draw)
    //     }
    //     draw()

    //     videoRef.current.srcObject = camCanvas.captureStream(30)

    //     return () => cancelAnimationFrame(animationId)
    // },[selectedFrame])

   
    useEffect(()=>{
        if(!selectedFrame) return
        const img = new Image();
        img.src = selectedFrame;
        img.onload = () =>{
            frameImgRef.current = img;
            setFrameLoaded(true);
        }
    },[selectedFrame])

    useEffect(()=>{
        if(!frameLoaded) return
        let animId 

        const drawsourceInSlot = (ctx,source,slot,sw,sh) => {
            const scale = Math.max(SLOT_WIDTH / sw, SLOT_HEIGHT / sh)
            const drawW = sw*scale
            const drawH = sh*scale
            const offsetX = (SLOT_WIDTH - drawW) / 2
            const offsetY = (SLOT_HEIGHT - drawH) / 2

            ctx.save()
            ctx.beginPath()
            ctx.rect(slot.x,slot.y,SLOT_WIDTH,SLOT_HEIGHT)
            ctx.clip()
            ctx.drawImage(source,slot.x + offsetX,slot.y+offsetY,drawW,drawH)
            ctx.restore()
        }

        const loop = () =>{
            const canvas = canvasRef.current
            const video = videoRef.current
            const frameImg =frameImgRef.current
            if(!frameImg || !video || !canvas){
                animId = requestAnimationFrame(loop)
                return
            }

            canvas.width = frameImg.width
            canvas.height = frameImg.height
            const ctx = canvas.getContext('2d')
            ctx.clearRect(0,0,canvas.width,canvas.height)

            if(photoCountRef.current == 0){
                slots.forEach((slot,i) => {
                    drawsourceInSlot(ctx,video,slot,video.videoWidth,video.videoHeight)
                })

                ctx.drawImage(frameImg,0,0,canvas.width,canvas.height)
            } else {
                slots.forEach((slot,i) => {
                    if(i <  photoCountRef.current && photosRef.current[i]){ 
                        drawsourceInSlot(ctx,photosRef.current[i],slot,SLOT_WIDTH,SLOT_HEIGHT)
                    } else {
                        drawsourceInSlot(ctx,video,slot,video.videoWidth,video.videoHeight)
                    }
                })
                ctx.drawImage(frameImg,0,0,canvas.width,canvas.height)
            }
            animId = requestAnimationFrame(loop)
        }

        loop()
        return () => cancelAnimationFrame(animId)

    },[frameLoaded])


    const capturePhoto = () => {

        if(photoCountRef.current >= 4 || !videoRef.current) return
        const tempCanvas = document.createElement('canvas')
        tempCanvas.width = SLOT_WIDTH
        tempCanvas.height = SLOT_HEIGHT
        tempCanvas.getContext('2d').drawImage(videoRef.current,0,0,tempCanvas.width,tempCanvas.height)

        const img = new Image()
        img.src = tempCanvas.toDataURL('image/png')
        img.onload = () => {
            photosRef.current[photoCountRef.current] = img
            photoCountRef.current += 1
        }
        console.log('Photo captured:', img.src)
    }

    useImperativeHandle(ref, () => ({
        capturePhoto
    }))

    return (
        <div className="booth">
            <video ref={videoRef} autoPlay playsInline style={{ display: 'none' }} />
            <canvas ref={canvasRef} className="frame_canvas" aria-label={label} />
        </div>
    )
})

export default Booth
