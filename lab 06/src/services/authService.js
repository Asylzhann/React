import {
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
} from "firebase/auth";
import { auth, googleProvider, isFirebaseConfigured } from "../firebase";

// All Firebase calls are here. Components and the context never import "firebase/auth".

export const NOT_CONFIGURED =
  "Firebase is not configured. Copy .env.example to .env.local, fill in your Firebase settings and restart the app.";

// Firebase errors have a technical `code`. These are the messages shown to the user.
const MESSAGES = {
  "auth/invalid-email": "That email address is not valid.",
  "auth/missing-password": "Enter your password.",
  "auth/invalid-credential": "Wrong email or password.",
  "auth/user-not-found": "Wrong email or password.",
  "auth/wrong-password": "Wrong email or password.",
  "auth/email-already-in-use": "An account with this email already exists. Try logging in.",
  "auth/weak-password": "The password is too weak. Use at least 6 characters.",
  "auth/too-many-requests": "Too many attempts. Wait a little and try again.",
  "auth/network-request-failed": "Network problem. Check your connection and try again.",
  "auth/popup-closed-by-user": "The Google window was closed before signing in.",
  "auth/cancelled-popup-request": "The Google window was closed before signing in.",
  "auth/popup-blocked": "Your browser blocked the Google window. Allow pop-ups and try again.",
  "auth/unauthorized-domain": "This website is not allowed to use Google sign-in. Add it in Firebase: Authentication > Settings > Authorized domains.",
  "auth/operation-not-allowed": "This sign-in method is not enabled in the Firebase console.",
};

const friendly = (err) => MESSAGES[err?.code] || "Something went wrong. Please try again.";

// Runs a Firebase call and turns any Firebase error into an Error with a readable message.
async function run(action) {
  if (!isFirebaseConfigured) throw new Error(NOT_CONFIGURED);
  try {
    return await action();
  } catch (err) {
    throw new Error(friendly(err));
  }
}

export const signUp = (email, password) => run(async () => (await createUserWithEmailAndPassword(auth, email, password)).user);
export const logIn = (email, password) => run(async () => (await signInWithEmailAndPassword(auth, email, password)).user);
export const logInWithGoogle = () => run(async () => (await signInWithPopup(auth, googleProvider)).user);
export const logOut = () => run(() => signOut(auth));

// Calls onUser(user) now (after Firebase has restored the saved session) and every time the user
// logs in or out. user is null when nobody is signed in. Returns a function that stops listening.
export function watchAuth(onUser, onError) {
  if (!isFirebaseConfigured) {
    onUser(null);
    return () => {};
  }
  return onAuthStateChanged(auth, onUser, (err) => onError(new Error(friendly(err))));
}
