// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_API_KEY,
  authDomain: "reactchat-fb3d4.firebaseapp.com",
  projectId: "reactchat-fb3d4",
  storageBucket: "reactchat-fb3d4.firebasestorage.app",
  messagingSenderId: "434491181745",
  appId: "1:434491181745:web:9aa5c1a6f00ae3632bb090"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const auth = getAuth()
export const db = getFirestore()
export const storage = getStorage()