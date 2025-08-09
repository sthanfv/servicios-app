import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  "projectId": "serviciosapp-lite",
  "appId": "1:326287510871:web:80825bd1210a6977234212",
  "storageBucket": "serviciosapp-lite.firebasestorage.app",
  "apiKey": "AIzaSyBQmnOqzboypU6o5vQUmNFnujo37o3XFo8",
  "authDomain": "serviciosapp-lite.firebaseapp.com",
  "messagingSenderId": "326287510871"
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const db = getFirestore(app);
