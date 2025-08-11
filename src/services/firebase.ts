import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDthcJvJztbAKpI_7Aj4wBOST-JgujnDBk",
  authDomain: "servicios-app-afc3d.firebaseapp.com",
  projectId: "servicios-app-afc3d",
  storageBucket: "servicios-app-afc3d.appspot.com",
  messagingSenderId: "623262662376",
  appId: "1:623262662376:web:9eec57eef75049493d135d",
  measurementId: "G-WZFDKMZB9L"
};

// Check if Firebase config keys are provided
if (!firebaseConfig.apiKey || !firebaseConfig.projectId) {
  throw new Error('Missing Firebase configuration. Please set NEXT_PUBLIC_FIREBASE_API_KEY and other required variables in your .env.local file.');
}


// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const db = getFirestore(app);
