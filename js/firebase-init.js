// Firebase Web SDK - Initialization
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-firestore.js";

// Your Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCfBhcVRV2t0dqipVsFYcHvuOgcvDc3XKo",
  authDomain: "nextqueststudios-ec835.firebaseapp.com",
  projectId: "nextqueststudios-ec835",
  storageBucket: "nextqueststudios-ec835.appspot.com",
  messagingSenderId: "6293171808",
  appId: "1:6293171808:web:6899385c793cdf5526dd05"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Export auth and Firestore instances
export const auth = getAuth(app);
export const db = getFirestore(app);