import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app";
import { getFirestore, type Firestore } from "firebase/firestore";
import { getAuth, type Auth } from "firebase/auth";

// NOTE: This project uses the same Firebase project as KharchaMate
// (kharchamate-cce0d). Replace apiKey, messagingSenderId, and appId with
// your real values from Firebase Console > Project Settings > General >
// Your apps > (add a new Web app if you haven't already), OR put them in
// .env.local (see .env.local.example).
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "kharchamate-cce0d.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "kharchamate-cce0d",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "kharchamate-cce0d.firebasestorage.app",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "",
};

const app: FirebaseApp = getApps().length ? getApp() : initializeApp(firebaseConfig);

export const db: Firestore = getFirestore(app);
export const auth: Auth | null = firebaseConfig.apiKey ? getAuth(app) : null;

export function requireFirebaseAuth(): Auth {
  if (!auth) {
    throw new Error("Configure NEXT_PUBLIC_FIREBASE_API_KEY in .env.local to use Firebase Authentication.");
  }
  return auth;
}

export default app;
