// ✅ Import Firebase SDK
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from "firebase/auth";
import { getFirestore, doc, setDoc, getDoc, updateDoc, arrayUnion, onSnapshot } from "firebase/firestore";

// ✅ Your Firebase configuration (Replace with your actual values)
const firebaseConfig = {
  apiKey: "AIzaSyAGfnXMlEfnz70xYULNznPNcQX1JPvxxps",
  authDomain: "musiclybit.firebaseapp.com",
  projectId: "musiclybit",
  storageBucket: "musiclybit.appspot.com", // ✅ Corrected storageBucket
  messagingSenderId: "538610638730",
  appId: "1:538610638730:web:da9dbcbf4f4fe18917b273"
};

// ✅ Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app); // ✅ Only ONE instance of Firestore
const provider = new GoogleAuthProvider();

// ✅ Export Firebase services
export { auth, provider, signInWithPopup, signOut, db, doc, setDoc, getDoc, updateDoc, arrayUnion, onSnapshot };
