// app/firebase-client.js — Firebase Web SDK init + shared auth helpers.
//
// This file is the ONLY place the Firebase SDK version lives. Pages must import
// Auth and Firestore functions from here, never from the CDN. If two versions
// load, Firestore throws "Type does not match the expected instance".
// ES module imports cannot use a variable URL, so to bump the SDK, change the
// version in all three URLs below. tests/sdk-version.test.js enforces this.
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import {
  getAuth, signInWithEmailAndPassword, signOut as fbSignOut,
  onAuthStateChanged, sendPasswordResetEmail, setPersistence, browserLocalPersistence,
  verifyPasswordResetCode, confirmPasswordReset,
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import {
  getFirestore, initializeFirestore, persistentLocalCache, persistentMultipleTabManager,
  memoryLocalCache, collection, query, where, orderBy, getDocs, doc, getDoc, setDoc,
  getDocFromCache, getDocsFromCache, getDocFromServer, onSnapshot,
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import { firebaseConfig } from "./firebase-config.js";
import { clearVideoUrls } from "./video-url-cache.js";

// Re-exported for the pages, so they all share this one SDK copy.
export { verifyPasswordResetCode, confirmPasswordReset }; // used by app/auth-action.html
export { onAuthStateChanged, collection, query, where, orderBy, getDocs, doc, getDoc, setDoc };
// Cache reads, for switching lessons in place: draw from the local cache
// first, then refresh from the server.
export { getDocFromCache, getDocsFromCache, getDocFromServer, onSnapshot };

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

// Firestore keeps a copy of what it read in IndexedDB, shared by all open tabs.
// Cache reads (getDocFromCache, onSnapshot) then answer without the network.
// Where IndexedDB is missing or throws (old browsers, some private modes), it
// uses the memory cache instead. The SDK also falls back by itself on errors
// that happen later, while it opens the database.
function initDb() {
  try {
    if (typeof indexedDB === "undefined") throw new Error("no IndexedDB");
    return initializeFirestore(app, {
      localCache: persistentLocalCache({ tabManager: persistentMultipleTabManager() }),
    });
  } catch (e) {
    console.warn("Firestore: using the memory cache", e);
    try {
      return initializeFirestore(app, { localCache: memoryLocalCache() });
    } catch {
      return getFirestore(app);
    }
  }
}
export const db = initDb();

// Keep users logged in across visits on the same device.
setPersistence(auth, browserLocalPersistence);

export function signIn(email, password) {
  return signInWithEmailAndPassword(auth, email, password);
}
// Also forgets the signed video URLs of this tab, so the next user on this
// device never gets them.
export function signOut() {
  clearVideoUrls();
  return fbSignOut(auth);
}
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
