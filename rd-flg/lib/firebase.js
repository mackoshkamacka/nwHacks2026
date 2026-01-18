// Import the functions you need from the SDKs you need
import { initializeApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';


// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDzHuUnUm7avXAzsyeLOtAzHBOcRHw9LSU",
  authDomain: "rd-flg.firebaseapp.com",
  projectId: "rd-flg",
  storageBucket: "rd-flg.firebasestorage.app",
  messagingSenderId: "88097682399",
  appId: "1:88097682399:web:cfc5ff8ed012ebcdb48a6a",
  measurementId: "G-MX3M81K7PK"
};

// Initialize Firebase
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

export const auth = getAuth(app);
export const db = getFirestore(app);