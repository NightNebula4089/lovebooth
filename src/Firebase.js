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
  iceServers: [
      {urls : "stun:stun.l.google.com:19302"},
      {
        urls: "stun:stun.relay.metered.ca:80",
      },
      {
        urls: "turn:global.relay.metered.ca:80",
        username: "7528ad85749681a62f0b1694",
        credential: "tGa2oxvVT7X/AcpG",
      },
      {
        urls: "turn:global.relay.metered.ca:80?transport=tcp",
        username: "7528ad85749681a62f0b1694",
        credential: "tGa2oxvVT7X/AcpG",
      },
      {
        urls: "turn:global.relay.metered.ca:443",
        username: "7528ad85749681a62f0b1694",
        credential: "tGa2oxvVT7X/AcpG",
      },
      {
        urls: "turns:global.relay.metered.ca:443?transport=tcp",
        username: "7528ad85749681a62f0b1694",
        credential: "tGa2oxvVT7X/AcpG",
      },
  ],
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
export const db = getFirestore(app);
export { servers }