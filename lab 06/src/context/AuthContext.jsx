import { createContext, useContext, useState, useEffect } from "react";
import { watchAuth, signUp, logIn, logInWithGoogle, logOut, NOT_CONFIGURED } from "../services/authService";
import { isFirebaseConfigured } from "../firebase";

const AuthContext = createContext(null);

// Wraps the app and shares who is logged in with every component below it.
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null); // the Firebase user, or null
  const [loading, setLoading] = useState(true); // true until Firebase has told us the first answer
  const [error, setError] = useState(isFirebaseConfigured ? "" : NOT_CONFIGURED);

  useEffect(() => {
    // Firebase restores a saved session after a refresh and then calls this function.
    const stopWatching = watchAuth(
      (firebaseUser) => {
        setUser(firebaseUser);
        setLoading(false);
      },
      (err) => {
        setError(err.message);
        setLoading(false);
      }
    );
    return stopWatching; // cleanup: stop listening when the provider is removed
  }, []);

  // The actions only talk to Firebase. When they succeed, the listener above updates `user`.
  const value = { user, loading, error, signup: signUp, login: logIn, loginWithGoogle: logInWithGoogle, logout: logOut };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// The hook components use: const { user, loading, login } = useAuth();
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used inside <AuthProvider>");
  return context;
}
