// src/context/AuthContext.tsx
"use client";
import { createContext, useContext, useEffect, useState } from "react";
import { 
  onAuthStateChanged, 
  signInWithPopup, 
  GoogleAuthProvider, 
  signOut,
  AuthError 
} from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import toast from "react-hot-toast";

interface User {
  uid: string;
  email: string | null;
  role: 'requester' | 'volunteer' | 'admin';
  location?: { lat: number; lng: number };
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  login: async () => {},
  logout: async () => {},
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const userRef = doc(db, "users", firebaseUser.uid);
        const userSnap = await getDoc(userRef);
        const userData = userSnap.exists() ? userSnap.data() : { role: 'requester' };
        
        setUser({ 
          uid: firebaseUser.uid, 
          email: firebaseUser.email, 
          ...userData 
        } as User);
        
        // Update user location
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition((pos) => {
            setDoc(userRef, { 
              location: { lat: pos.coords.latitude, lng: pos.coords.longitude } 
            }, { merge: true });
          }, (error) => {
            console.log("Location permission denied");
          });
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const login = async () => {
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      toast.success("Welcome back!");
    } catch (error: any) {
      // Handle specific Firebase auth errors gracefully
      if (error.code === 'auth/cancelled-popup-request') {
        // User closed popup - not a real error, just inform them
        toast.error("Sign-in cancelled");
      } else if (error.code === 'auth/popup-blocked') {
        toast.error("Popup blocked. Please allow popups for this site.");
      } else if (error.code === 'auth/network-request-failed') {
        toast.error("Network error. Please check your connection.");
      } else if (error.code === 'auth/unauthorized-domain') {
        toast.error("This domain is not authorized. Contact support.");
      } else {
        console.error("Login error:", error);
        toast.error("Sign-in failed. Please try again.");
      }
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      toast.success("Logged out successfully");
    } catch (error) {
      console.error("Logout error:", error);
      toast.error("Logout failed");
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);