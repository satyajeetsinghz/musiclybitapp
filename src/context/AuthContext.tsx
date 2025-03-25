import { createContext, useContext, useEffect, useState, useRef, ReactNode } from "react";
import {  
  auth, db, doc, getDoc, setDoc, onSnapshot, signInWithPopup, provider, signOut, updateDoc
} from "../firebaseConfig";
import { arrayUnion, arrayRemove } from "firebase/firestore";
import { User } from "firebase/auth"; // ✅ Import Firebase User type

// ✅ Define Album Type
interface Album {
  id: string;
  name: string;
  artist: string;
  image: string;
}

// ✅ Define Auth Context Type
interface AuthContextType {
  user: User | null;
  favoriteAlbums: Album[];
  setFavoriteAlbums: (albums: Album[]) => void;
  signInWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  popupMessage: string;
  setPopupMessage: (message: string) => void;
  addFavoriteAlbum: (album: Album) => Promise<void>;
  removeFavoriteAlbum: (album: Album) => Promise<void>;
  loading: boolean;
}

// ✅ Provide a default value for context
const AuthContext = createContext<AuthContextType | null>(null);

// ✅ Create AuthProvider with TypeScript
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [favoriteAlbums, setFavoriteAlbums] = useState<Album[]>([]);
  const [popupMessage, setPopupMessage] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const unsubscribeRef = useRef<(() => void) | null>(null); // ✅ Ensure unsubscribe function is typed

  useEffect(() => {
    const unsubscribeAuth = auth.onAuthStateChanged(async (authUser) => {
      if (authUser) {
        setUser(authUser);
        const userRef = doc(db, "users", authUser.uid);

        try {
          const docSnap = await getDoc(userRef);
          if (!docSnap.exists()) {
            await setDoc(userRef, { favorites: [] }, { merge: true });
          } else {
            setFavoriteAlbums(docSnap.data().favorites || []);
          }

          // ✅ Cleanup previous Firestore listener before adding a new one
          if (unsubscribeRef.current) {
            unsubscribeRef.current();
          }

          unsubscribeRef.current = onSnapshot(userRef, (snapshot) => {
            if (snapshot.exists()) {
              setFavoriteAlbums(snapshot.data().favorites || []);
            }
          });

        } catch (error) {
          console.error("Error fetching user favorites:", error);
        }
      } else {
        setUser(null);
        setFavoriteAlbums([]);
        if (unsubscribeRef.current) {
          unsubscribeRef.current();
          unsubscribeRef.current = null;
        }
      }

      setLoading(false);
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
      }
    };
  }, []);

  // ✅ Add Favorite Album
  const addFavoriteAlbum = async (album: Album) => {
    if (!user) return;

    try {
      const userRef = doc(db, "users", user.uid);
      await updateDoc(userRef, {
        favorites: arrayUnion(album),
      });

      const updatedSnap = await getDoc(userRef);
      if (updatedSnap.exists()) {
        setFavoriteAlbums(updatedSnap.data().favorites || []);
      }

      setPopupMessage("Added to your library");
      setTimeout(() => setPopupMessage(""), 3000);
    } catch (error) {
      console.error("Error adding album: ", error);
    }
  };

  // ✅ Remove Favorite Album
  const removeFavoriteAlbum = async (album: Album) => {
    if (!user) return;

    try {
      const userRef = doc(db, "users", user.uid);
      await updateDoc(userRef, {
        favorites: arrayRemove(album),
      });

      setFavoriteAlbums((prevAlbums) => prevAlbums.filter((fav) => fav.id !== album.id));

      setPopupMessage("Removed Album Successfully");
      setTimeout(() => setPopupMessage(""), 3000);
    } catch (error) {
      console.error("Error removing album:", error);
    }
  };

  // ✅ Google Sign-In
  const signInWithGoogle = async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      setUser(result.user);
    } catch (error) {
      console.error("Google Sign-In Error:", error);
    }
  };

  // ✅ Logout
  const logout = async () => {
    try {
      await signOut(auth);
      setUser(null);
      setFavoriteAlbums([]);
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
        unsubscribeRef.current = null;
      }
    } catch (error) {
      console.error("Logout Error:", error);
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      favoriteAlbums, 
      setFavoriteAlbums, 
      signInWithGoogle, 
      logout, 
      popupMessage, 
      setPopupMessage, 
      addFavoriteAlbum, 
      removeFavoriteAlbum, 
      loading 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

// ✅ Hook for accessing auth context safely
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
