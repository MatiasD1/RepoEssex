// src/firebase.js
import { initializeApp } from 'firebase/app';
import { getAuth, onAuthStateChanged } from 'firebase/auth'; // Import onAuthStateChanged
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
    apiKey: "AIzaSyDJrWaEobA6jyCRovPVUsdtOxGG2WFO5mk",
    authDomain: "essex-40828.firebaseapp.com",
    projectId: "essex-40828",
    storageBucket: "essex-40828.firebasestorage.app",
    messagingSenderId: "250585294801",
    appId: "1:250585294801:web:2286252f9ffa01d900e2f0"
};

const app = initializeApp(firebaseConfig);

// Servicios
const auth = getAuth(app);
const db = getFirestore(app); // <-- inicializa Firestore

export { app, auth, db, onAuthStateChanged }; // <-- exporta db también
