// src/firebaseConfig.js
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getMessaging } from 'firebase/messaging';

const firebaseConfig = {
  apiKey: "AIzaSyC7j7czB53kl4BtB501n7Sz1uOM-tuTJGI",
  authDomain: "family-6849f.firebaseapp.com",
  projectId: "family-6849f",
  storageBucket: "family-6849f.firebasestorage.app",
  messagingSenderId: "1067290851989",
  appId: "1:1067290851989:web:07d809bbdf8284dbeff99c"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const messaging = getMessaging(app);
