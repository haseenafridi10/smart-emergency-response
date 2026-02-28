// src/lib/firebase.ts
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {

apiKey: "AIzaSyBNk3iNAKWVYs0lUQ-ddITw9hnpdbfD6Fo",

authDomain: "community-emergency.firebaseapp.com",

projectId: "community-emergency",

storageBucket: "community-emergency.firebasestorage.app",

messagingSenderId: "468181280242",

appId: "1:468181280242:web:d7a754c400c73698a3f76b"

};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);



// Initialize Firebase
