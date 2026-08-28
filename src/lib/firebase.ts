import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, initializeRecaptchaConfig } from "firebase/auth";

export const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyCIxWysMHoXCq3z2DxakmR3_cwqPU6-eRs",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "aurex-india.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "aurex-india",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "aurex-india.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "160970121318",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:160970121318:web:f94bac42c7d2dadd3c4da7",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-9P9N46TTFG",
};

export const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
export const auth = getAuth(app);

// Initialize Enterprise reCAPTCHA config so Firebase SDK uses
// the project's reCAPTCHA Enterprise key automatically for Phone Auth.
initializeRecaptchaConfig(auth).then(() => {
  console.log("[Firebase] reCAPTCHA Enterprise config initialized successfully.");
}).catch((err) => {
  console.error("[Firebase] initializeRecaptchaConfig failed:", err?.message || err);
});
