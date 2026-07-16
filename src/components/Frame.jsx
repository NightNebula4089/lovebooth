import { useRef, useState ,useEffect} from 'react'
import Booth from './Booth.jsx'
import { db, servers } from '../Firebase.js'
import { doc, getDoc, setDoc, collection, addDoc, onSnapshot, updateDoc } from 'firebase/firestore'
import CountdownButton from './CountdownButton'

const SLOT_WIDTH = 953;
const SLOT_HEIGHT = 599;

const frameOptions = [
    `${import.meta.env.BASE_URL}assets/frames/heart-frame.png`,
    `${import.meta.env.BASE_URL}assets/frames/heart-frame-2.png`,
    `${import.meta.env.BASE_URL}assets/frames/heart-frame-3.png`,
    `${import.meta.env.BASE_URL}assets/frames/heart-frame-4.png`,
]

function Frame({selectedFrame, onSelectFrame}){

    const booth1Ref = useRef(null);
    const [joineeStream, setJoineeStream] = useState(null);
    const [hostStream, setHostStream] = useState(null);
    const booth2Ref = useRef(null);
    const [roomId, setRoomId] = useState(null);
    const [mode,setMode] = useState("selection"); // selection, host, join

    const pc = useRef(null);

    const generateRoomId = () => {
        const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // avoids confusing chars
        const array = new Uint32Array(10);
        crypto.getRandomValues(array);

        return Array.from(array, (x) => chars[x % chars.length]).join("");
    }

    const createRoom = async () =>{
        while(true){
            const roomId = generateRoomId();
            const roomRef = doc(db, "rooms", roomId);
            const roomSnapshot = await getDoc(roomRef);

            if(!roomSnapshot.exists()){
                setRoomId(roomId);
                return roomId;
            }
        }
    }


    const setupMediaStreams = async (role) => {
        if(!pc.current) return
        if(role == "host") {
            // get local media stream 
            const hostMediaStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false })
            setHostStream(hostMediaStream)
            const joineeMediaStream = new MediaStream()
            setJoineeStream(joineeMediaStream)

            //push tracks from local stream to peer connection
            hostMediaStream.getTracks().forEach(track => {
                pc.current.addTrack(track,hostMediaStream)
            })

            //pull tracks from remote stream, add to video stream 
            pc.current.ontrack = (event) => {
                event.streams[0].getTracks().forEach(track => {
                    joineeMediaStream.addTrack(track)
                })
            }
        } else if (role == "join") {
            // get local media stream
            const joineeMediaStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false })
            setJoineeStream(joineeMediaStream)
            const hostMediaStream = new MediaStream()
            setHostStream(hostMediaStream)

            //push tracks from local stream to peer connection
            joineeMediaStream.getTracks().forEach(track => {
                pc.current.addTrack(track,joineeMediaStream)
            })

            //pull tracks from remote stream, add to video stream 
            pc.current.ontrack = (event) => {
                event.streams[0].getTracks().forEach(track => {
                    hostMediaStream.addTrack(track)
                })
            }
        } else {
            return
        }
    }

    useEffect(() => {
        if(!selectedFrame) return
        if(mode !== "host") return

        async function setupConnection() {
            if(pc.current) pc.current.close()
            pc.current = new RTCPeerConnection(servers)

            // log connection state changes
            pc.current.onconnectionstatechange = () => {
                console.log('Connection state:', pc.current.connectionState)
            }

            pc.current.oniceconnectionstatechange = () => {
                console.log('ICE connection state:', pc.current.iceConnectionState)
            }

            pc.current.onicegatheringstatechange = () => {
                console.log('ICE gathering state:', pc.current.iceGatheringState)
            }

            pc.current.onsignalingstatechange = () => {
                console.log('Signaling state:', pc.current.signalingState)
            }

            // create a new roomkey 
            const roomId = await createRoom();
            console.log(`New room created with ID: ${roomId}`);

            pc.current.onicecandidate =  event =>  {
                if(event.candidate){
                    const candidate = event.candidate.toJSON();
                    const candidateRef = collection(db, "rooms", roomId, "offer_candidates");
                    addDoc(candidateRef, candidate);
                    console.log('Adding offer ICE candidate:', candidate);
                }
            }

            pc.current.getStats().then(stats => {
                stats.forEach(report => {
                if (report.type === 'candidate-pair' && report.state === 'succeeded') {
                    console.log('Connected via:', report)
                }
                })
            })

            pc.current.createDataChannel('rtc')

            // get local media stream 
            // hostStream.current = await navigator.mediaDevices.getUserMedia({ video: true, audio: false })
            // joineeStream.current = new MediaStream()

            // hostStream.current.getTracks().forEach(track => {
            //     pc.current.addTrack(track,hostStream.current)
            // })

            // pc.current.ontrack = event => {
            //     event.streams[0].getTracks().forEach(track => {
            //         joineeStream.current.addTrack(track)
            //     })
            // }
            // Apply streams to video elements : inside the frames

            await setupMediaStreams("host")

            // create a offer and set local description
            const offerDescription = await pc.current.createOffer()
            await pc.current.setLocalDescription(offerDescription)

            // Save the offer description + room key to firestore 
            const offer = {
                offer : {
                    sdp : offerDescription.sdp,
                    type : offerDescription.type}
                ,
                roomKey : roomId,
                selectedFrame : selectedFrame
            }

            await setDoc(doc(db,"rooms",roomId),offer,{merge:true})
            console.log(`Offer saved to Firestore with room ID: ${roomId}`);

            // Listen for remote answer
            const roomRef = doc(db,"rooms",roomId)
            onSnapshot(roomRef, async snapshot => {
                const data = snapshot.data()
                if(!pc.current.currentRemoteDescription && data?.answer){
                    const answerDescription = new RTCSessionDescription(data.answer)
                    await pc.current.setRemoteDescription(answerDescription)
                }
            })

            const answerCandidatesRef = collection(db,"rooms",roomId,"answer_candidates")
            onSnapshot(answerCandidatesRef, snapshot => {
                snapshot.docChanges().forEach(change => {
                    if(change.type === "added"){
                        const candidate = new RTCIceCandidate(change.doc.data())
                        pc.current.addIceCandidate(candidate)
                    }
                })
            })

        }
        setupConnection()

        // clean up the peer connection 
        return () => {
            pc.current?.close()
            pc.current = null
        }
    },[selectedFrame])

    const handleCapture = () => {
        booth1Ref.current?.capturePhoto();
        booth2Ref.current?.capturePhoto();
    }

    const handleJoinRoom = async() => {
        const roomIdInput = document.getElementById("key").value.trim();
        if(!roomIdInput){
            alert("Please enter a valid room key.");
            return;
        }
        setMode("join")
        if(pc.current) pc.current.close()
        pc.current = new RTCPeerConnection(servers)

        // log connection state changes
        pc.current.onconnectionstatechange = () => {
            console.log('Connection state:', pc.current.connectionState)
        }

        pc.current.oniceconnectionstatechange = () => {
            console.log('ICE connection state:', pc.current.iceConnectionState)
        }

        pc.current.onicegatheringstatechange = () => {
            console.log('ICE gathering state:', pc.current.iceGatheringState)
        }

        pc.current.onsignalingstatechange = () => {
            console.log('Signaling state:', pc.current.signalingState)
        }

        pc.current.getStats().then(stats => {
            stats.forEach(report => {
                if (report.type === 'candidate-pair' && report.state === 'succeeded') {
                    console.log('Connected via:', report)
                }
            })
        })

        const roomRef = doc(db, "rooms",roomIdInput);
        const roomSnapshot = await getDoc(roomRef);

        if(!roomSnapshot.exists()){
            console.error(`Room with ID ${roomIdInput} does not exist.`);
            pc.current?.close()
            pc.current = null
            return;
        }

        await setupMediaStreams("join")

        setRoomId(roomIdInput)

        const answerCandidatesRef = collection(db, "rooms", roomIdInput, "answer_candidates");
        pc.current.onicecandidate = event => {
            if(event.candidate){
                const candidate = event.candidate.toJSON();
                addDoc(answerCandidatesRef, candidate);
                console.log('Adding answer ICE candidate:', candidate);
            }
        }

        const roomData = roomSnapshot.data();
        console.log(`Joining room with ID: ${roomIdInput}`, roomData);

        const offerDescription = new RTCSessionDescription(roomData.offer);
        await pc.current.setRemoteDescription(offerDescription);

        const answerDescription = await pc.current.createAnswer();
        await pc.current.setLocalDescription(answerDescription);
    
        const answer = {
            type: answerDescription.type,
            sdp: answerDescription.sdp
        };

        await updateDoc(roomRef,{answer : answer});
        console.log(`Answer saved to Firestore for room ID: ${roomIdInput}`);

        onSnapshot(collection(db, "rooms", roomIdInput, "offer_candidates"), snapshot => {
            if(!pc.current) return
            snapshot.docChanges().forEach(change => {
                if(change.type === "added"){
                    const candidate = new RTCIceCandidate(change.doc.data());
                    pc.current.addIceCandidate(candidate);
                }
            })
        })

        onSelectFrame(roomData.selectedFrame);

    }

    // handle frame selection 
    const handleFrameSelect = (frame) => {
        setMode("host")
        onSelectFrame(frame)
    }
   
    if(!selectedFrame){
        return(
            <div className = "selection_screen">
                <div className='frame_options'>
                    {frameOptions.map(frame => {
                        return <img src={frame} key={frame} onClick={() => handleFrameSelect(frame)}></img>
                    })}
                </div>
                <div className= "join-form">
                    <form >
                        <label htmlFor="host"> Session Key </label>
                        <input type="text" id="key" name="key"/>
                    </form>
                    <button type="button" onClick={handleJoinRoom}>Join</button>
                </div>
            </div>
        )
    }
    return (
        <div className='frame_selected'>
            <div className="frame_stage">
                <Booth ref={booth1Ref} selectedFrame={selectedFrame} stream = {hostStream} label="Frame_you" />
                <Booth ref={booth2Ref} selectedFrame={selectedFrame} stream = {joineeStream} label="Frame_friend" />
            </div>
            <CountdownButton onCapture ={handleCapture} duration= {5} />
            <h2 className='room_key'>Room key: {roomId}</h2>
        </div>
    )

}

export default Frame