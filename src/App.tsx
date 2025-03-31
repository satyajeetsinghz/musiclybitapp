import MainContent from "./screens/MainContent";
import Sidebar from "./screens/Sidebar";
import MusicPlayer from "./utils/MusicPlayer";
import { MusicProvider } from "./context/MusicContext";
import { useEffect, useState } from "react";
import Navbar from "./components/Navbar";
import Login from "./components/Login";
import { useAuth } from "./context/AuthContext";
import { doc, getDoc } from "firebase/firestore";
import { db } from "./firebaseConfig";
import { Album } from "./types"; // ✅ Ensure all files use the same Album type


function App() {
  const [favoriteAlbums, setFavoriteAlbums] = useState<Album[]>([]);
  const { user, loading } = useAuth() ?? {};

  useEffect(() => {
    const fetchFavorites = async () => {
        if (!user) return;
        const userRef = doc(db, "users", user.uid);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
            setFavoriteAlbums(userSnap.data().favorites || []);
        }
    };
    fetchFavorites();
}, [user]);

  if (loading) {
    return (
      <div className="w-full h-screen flex justify-center items-center bg-neutral-950 text-white">
        <h2 className="text-base font-semibold">Loading...</h2>
      </div>
    );
  }

  return (
    <MusicProvider>
      <div className="w-full min-h-screen md:h-screen flex flex-col bg-neutral-950 relative">
  <div className="relative z-50">
    <Navbar />
  </div>

  {user ? (
    <>
      {/* Allow middle content to grow properly */}
      <div className="flex flex-1 gap-3 px-2 pb-4 py-16 overflow-y-auto relative z-10">
        <Sidebar favoriteAlbums={favoriteAlbums} setFavoriteAlbums={setFavoriteAlbums} />
        <MainContent setFavoriteAlbums={setFavoriteAlbums} favoriteAlbums={favoriteAlbums} />
      </div>

      {/* Fix MusicPlayer Position */}
      <div className="relative z-20 w-full">
        <MusicPlayer />
      </div>
    </>
  ) : (
    <Login />
  )}
</div>

    </MusicProvider>
  );
}

export default App;