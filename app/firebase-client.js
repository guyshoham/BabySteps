// app/firebase-client.js — Firebase Web SDK init + shared auth helpers.
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import {
  getAuth, signInWithEmailAndPassword, signOut as fbSignOut,
  onAuthStateChanged, sendPasswordResetEmail, setPersistence, browserLocalPersistence,
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import { firebaseConfig } from "./firebase-config.js";

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

// Keep users logged in across visits on the same device.
setPersistence(auth, browserLocalPersistence);

export function signIn(email, password) {
  return signInWithEmailAndPassword(auth, email, password);
}
export function signOut() { return fbSignOut(auth); }
export function resetPassword(email) { return sendPasswordResetEmail(auth, email); }

// Resolves with the signed-in user, or redirects to login and never resolves.
export function requireAuth() {
  return new Promise((resolve) => {
    const unsub = onAuthStateChanged(auth, (user) => {
      unsub();
      if (user) {
        resolve(user);
      } else {
        const next = encodeURIComponent(location.pathname + location.search);
        location.replace(`/app/login?next=${next}`);
      }
    });
  });
}
