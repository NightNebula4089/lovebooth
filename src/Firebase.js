import { getFirestore } from 'firebase/firestore'
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyABEvuhrXNpgnN0eG_Nky6D_t-ddQrXk34",
  authDomain: "lovebooth-f18f5.firebaseapp.com",
  projectId: "lovebooth-f18f5",
  storageBucket: "lovebooth-f18f5.firebasestorage.app",
  messagingSenderId: "590211064905",
  appId: "1:590211064905:web:ed2fec395f221a3434cb98",
  measurementId: "G-PC1P75KP4F"
};

const servers = {
  iceServers : [
    {
      urls : ["stun:stun.l.google.com:19302","stun:stun2.l.google.com:19302"]
    },
    {
      urls: 'turn:openrelay.metered.ca:80',
      username: 'openrelayproject',
      credential: 'openrelayproject',
    },
    {
      urls: 'turn:openrelay.metered.ca:443',
      username: 'openrelayproject',
      credential: 'openrelayproject',
    },
  ],
  iceCandidatePoolSize : 10
}

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
export const db = getFirestore(app);
export { servers }