import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyChPS_1_hJd-dZ0dDBIqjBw1P4xS3iT0mM",
  authDomain: "serviciosapp-lite.firebaseapp.com",
  projectId: "serviciosapp-lite",
  storageBucket: "serviciosapp-lite.appspot.com",
  messagingSenderId: "326287510871",
  appId: "1:326287510871:web:80825bd1210a6977234212"
};


// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const db = getFirestore(app);
