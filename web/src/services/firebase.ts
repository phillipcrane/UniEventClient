import { getApp, getApps, initializeApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';

const requiredFirebaseEnv = {
  VITE_FIREBASE_API_KEY: import.meta.env.VITE_FIREBASE_API_KEY,
  VITE_FIREBASE_AUTH_DOMAIN: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  VITE_FIREBASE_PROJECT_ID: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  VITE_FIREBASE_STORAGE_BUCKET: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  VITE_FIREBASE_MESSAGING_SENDER_ID: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  VITE_FIREBASE_APP_ID: import.meta.env.VITE_FIREBASE_APP_ID,
} as const;

const missingFirebaseEnvKeys = Object.entries(requiredFirebaseEnv)
  .filter(([, value]) => !value || String(value).startsWith('your_'))
  .map(([key]) => key);

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

export const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
export const db = getFirestore(app);

let authInstance: Auth | null = null;

export function assertFirebaseAuthConfig(): void {
  if (missingFirebaseEnvKeys.length > 0) {
    throw new Error(`Missing Firebase env variables: ${missingFirebaseEnvKeys.join(', ')}`);
  }
}

export function getAuthInstance(): Auth {
  assertFirebaseAuthConfig();
  if (!authInstance) {
    authInstance = getAuth(app);
  }
  return authInstance;
}

// If enabled, point the web app at the local Firestore emulator
// Set VITE_FIRESTORE_EMULATOR=true in web/.env while running `firebase emulators:start`
if (import.meta.env.VITE_FIRESTORE_EMULATOR === 'true') {
  console.log('🔥 Connecting to local Firestore emulator');
  connectFirestoreEmulator(db, 'localhost', 8080);
}
